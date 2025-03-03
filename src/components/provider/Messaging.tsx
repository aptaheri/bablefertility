import React, { useEffect, useState, useRef } from 'react';
import styled from '@emotion/styled';
import { useAuth } from '../../contexts/AuthContext';
import { useSelectedPatient } from './ProviderLayout';
import { toast } from 'react-toastify';
import { Client, Conversation, Message as TwilioMessage } from '@twilio/conversations';

const Container = styled.div`
  display: flex;
  height: calc(100vh - 120px);
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin: 20px;
  overflow: hidden;
`;

const ChatContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #f9fafb;
`;

const ChatHeader = styled.div`
  padding: 1rem;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ChatMessages = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const MessageInput = styled.div`
  padding: 1rem;
  background: white;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 1rem;
`;

const Input = styled.input`
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  font-size: 0.875rem;

  &:focus {
    outline: none;
    border-color: #4f46e5;
    outline: 2px solid #4f46e5;
  }
`;

const SendButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: #4f46e5;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: #4338ca;
  }

  &:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }
`;

const Message = styled.div<{ isProvider: boolean }>`
  max-width: 70%;
  align-self: ${props => props.isProvider ? 'flex-end' : 'flex-start'};
  background: ${props => props.isProvider ? '#4f46e5' : 'white'};
  color: ${props => props.isProvider ? 'white' : '#374151'};
  padding: 0.75rem 1rem;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  border: ${props => props.isProvider ? 'none' : '1px solid #e5e7eb'};
`;

const MessageTime = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  padding: 2rem;
  color: #ef4444;
  text-align: center;
`;

interface ChatMessage {
  id: string;
  body: string;
  author: string;
  timestamp: string;
}

const Messaging = () => {
  console.log('🔥 Messaging component mounted');

  const { currentUser } = useAuth();
  const { selectedPatient } = useSelectedPatient();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Debug logging for token
  useEffect(() => {
    const getAndLogToken = async () => {
      if (currentUser) {
        const token = await currentUser.getIdToken();
        console.log('🔑 Your Firebase token (for testing API calls):\n', token);
        console.log('\nTest API endpoints with:\n');
        console.log(`curl -v "https://bable-be-300594224442.us-central1.run.app/api/messaging/token" \\
  -H "Authorization: Bearer ${token}"`);
        console.log('\nAnd for conversation endpoint:\n');
        console.log(`curl -v "https://bable-be-300594224442.us-central1.run.app/api/messaging/conversation/${selectedPatient?.id}" \\
  -H "Authorization: Bearer ${token}"`);
      }
    };
    getAndLogToken();
  }, [currentUser, selectedPatient]);

  // Debug logging
  console.log('🔑 Auth state:', {
    currentUser: currentUser ? {
      uid: currentUser.uid,
      email: currentUser.email
    } : null
  });

  console.log('👤 Selected patient:', {
    patient: selectedPatient,
    patientId: selectedPatient?.id,
    patientName: selectedPatient ? `${selectedPatient.firstName} ${selectedPatient.lastName}` : null
  });

  useEffect(() => {
    console.log('🔄 Effect triggered. Checking prerequisites:', {
      hasCurrentUser: !!currentUser,
      currentUserEmail: currentUser?.email,
      hasSelectedPatient: !!selectedPatient,
      selectedPatientId: selectedPatient?.id,
      selectedPatientFullDetails: selectedPatient
    });

    if (!selectedPatient || !currentUser) {
      const reason = !selectedPatient ? 'No patient selected' : 'No current user';
      console.log('❌ Cannot initialize chat:', reason, {
        selectedPatient,
        currentUser: currentUser ? { email: currentUser.email, uid: currentUser.uid } : null
      });
      setError(`Cannot initialize chat: ${reason}`);
      return;
    }

    // Initialize Twilio conversation
    const initializeChat = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('🚀 Initializing chat for patient:', {
          patientId: selectedPatient.id,
          patientName: `${selectedPatient.firstName} ${selectedPatient.lastName}`,
          patientFullDetails: selectedPatient
        });
        
        const token = await currentUser.getIdToken();
        console.log('🎟️ Got Firebase token');

        // First API call - Get Twilio token
        console.log('📞 Requesting Twilio token...');
        const response = await fetch(`https://bable-be-300594224442.us-central1.run.app/api/messaging/token`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        console.log('📬 Chat token response:', {
          status: response.status,
          ok: response.ok
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Failed to get chat token:', {
            status: response.status,
            error: errorText
          });
          throw new Error(`Failed to initialize chat: ${response.status} ${errorText}`);
        }

        const { token: twilioToken } = await response.json();
        console.log('✅ Successfully obtained Twilio token');
        
        // Decode and log the token contents
        const tokenParts = twilioToken.split('.');
        const tokenPayload = JSON.parse(atob(tokenParts[1]));
        console.log('🔑 Twilio Token payload:', {
          identity: tokenPayload.grants.identity,
          serviceSid: tokenPayload.grants.chat.service_sid,
          exp: new Date(tokenPayload.exp * 1000).toISOString()
        });
        
        // Initialize Twilio Client
        console.log('🔌 Initializing Twilio client...');
        const client = new Client(twilioToken);
        console.log('✅ Twilio client initialized');

        // Second API call - Get/create conversation
        console.log('💬 Getting conversation for patient:', selectedPatient.id);
        const conversationResponse = await fetch(
          `https://bable-be-300594224442.us-central1.run.app/api/conversations/provider-to-patient/${selectedPatient.id}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        console.log('📬 Conversation response:', {
          status: conversationResponse.status,
          ok: conversationResponse.ok
        });

        if (!conversationResponse.ok) {
          const errorText = await conversationResponse.text();
          console.error('❌ Failed to get conversation:', {
            status: conversationResponse.status,
            error: errorText
          });
          throw new Error(`Failed to get conversation: ${conversationResponse.status} ${errorText}`);
        }

        const responseData = await conversationResponse.json();
        const { conversationSid, uniqueName } = responseData;
        console.log('🆔 Retrieved conversation info:', { conversationSid, uniqueName });
        
        console.log('\nTest conversation retrieval with Twilio SDK:\n');
        console.log(`// Initialize Twilio client
const { Client } = require('@twilio/conversations');
const client = new Client('${twilioToken}');
        
// Try getting conversation by SID
client.getConversationBySid('${conversationSid}')
  .then(conv => console.log('Found conversation by SID:', conv))
  .catch(err => console.error('Error getting by SID:', err));

// Try getting conversation by uniqueName
client.getConversationByUniqueName('${uniqueName}')
  .then(conv => console.log('Found conversation by uniqueName:', conv))
  .catch(err => console.error('Error getting by uniqueName:', err));`);

        console.log('🔍 Verifying conversation exists in Twilio...');
        
        // Try listing all conversations first
        console.log('📋 Listing all available conversations...');
        const conversations = await client.getSubscribedConversations();
        console.log('Available conversations:', conversations.items.map(conv => ({
          sid: conv.sid,
          uniqueName: conv.uniqueName,
          friendlyName: conv.friendlyName
        })));
        
        // Try getting the client info
        console.log('🔍 Getting Twilio client info...');
        console.log('Client info:', {
          connectionState: client.connectionState,
          user: client.user?.identity
        });
        
        console.log('📱 Loading conversation...');
        let conv;
        try {
          console.log('Attempting to get conversation by SID...');
          conv = await client.getConversationBySid(conversationSid);
        } catch (error) {
          console.log('Failed to get by SID, trying uniqueName...');
          conv = await client.getConversationByUniqueName(uniqueName);
        }
        
        console.log('✅ Successfully loaded conversation');
        setConversation(conv);

        // Load existing messages
        console.log('📨 Loading messages...');
        const messagesPaginator = await conv.getMessages();
        console.log('📬 Retrieved messages:', {
          count: messagesPaginator.items.length,
          messages: messagesPaginator.items.map(m => ({
            body: m.body,
            author: m.author,
            timestamp: m.dateCreated
          }))
        });
        
        setMessages(
          messagesPaginator.items.map((item: TwilioMessage) => ({
            id: item.sid,
            body: item.body || '',
            author: item.author || '',
            timestamp: item.dateCreated ? item.dateCreated.toISOString() : new Date().toISOString(),
          }))
        );

        // Subscribe to new messages
        console.log('🎧 Setting up message listener...');
        conv.on('messageAdded', (message: TwilioMessage) => {
          console.log('📩 New message received:', {
            body: message.body,
            author: message.author,
            timestamp: message.dateCreated
          });
          setMessages((prevMessages) => [
            ...prevMessages,
            {
              id: message.sid,
              body: message.body || '',
              author: message.author || '',
              timestamp: message.dateCreated ? message.dateCreated.toISOString() : new Date().toISOString(),
            },
          ]);
        });

      } catch (error) {
        console.error('❌ Error in chat initialization:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to initialize chat';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    initializeChat();

    // Cleanup function
    return () => {
      if (conversation) {
        console.log('🧹 Cleaning up conversation listeners');
        conversation.removeAllListeners();
      }
    };
  }, [currentUser, selectedPatient, conversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentUser || !selectedPatient || !conversation) return;

    try {
      await conversation.sendMessage(newMessage.trim());
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!selectedPatient) {
    return (
      <Container>
        <ErrorContainer>
          Please select a patient to start messaging
        </ErrorContainer>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <ErrorContainer>
          <div>Error: {error}</div>
          <div style={{ marginTop: '1rem', fontSize: '0.875rem' }}>
            Please check the console for more details
          </div>
        </ErrorContainer>
      </Container>
    );
  }

  return (
    <Container>
      <ChatContainer>
        <ChatHeader>
          <div>
            <h2 style={{ margin: 0 }}>Chat with {selectedPatient.firstName} {selectedPatient.lastName}</h2>
            <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>
              {loading ? 'Connecting...' : conversation ? 'Connected' : 'Not connected'}
            </div>
          </div>
        </ChatHeader>

        <ChatMessages>
          {/* Debug info at the top */}
          <div style={{ padding: '10px', margin: '10px', background: '#f5f5f5', borderRadius: '4px', fontSize: '0.8rem' }}>
            <p><strong>Debug Info:</strong></p>
            <div>Current User: {currentUser ? `✅ ${currentUser.email}` : '❌ Not logged in'}</div>
            <div>Selected Patient: {selectedPatient ? `✅ ${selectedPatient.firstName} ${selectedPatient.lastName}` : '❌ None selected'}</div>
            <div>Connection Status: {loading ? '🔄 Connecting' : conversation ? '✅ Connected' : '❌ Not connected'}</div>
            <div>Messages Count: {messages.length}</div>
          </div>

          {/* Chat messages */}
          {messages.map((message) => (
            <div key={message.id}>
              <Message isProvider={message.author === currentUser?.uid}>
                {message.body}
                <MessageTime>
                  {new Date(message.timestamp).toLocaleTimeString()}
                </MessageTime>
              </Message>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </ChatMessages>

        <MessageInput>
          <Input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading || !conversation}
          />
          <SendButton
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || loading || !conversation}
          >
            Send
          </SendButton>
        </MessageInput>
      </ChatContainer>
    </Container>
  );
};

export default Messaging; 