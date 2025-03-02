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
    ring: 2px solid #4f46e5;
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

interface Message {
  id: string;
  body: string;
  author: string;
  timestamp: string;
}

const Messaging = () => {
  const { currentUser } = useAuth();
  const { selectedPatient } = useSelectedPatient();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!selectedPatient || !currentUser) return;

    // Initialize Twilio conversation
    const initializeChat = async () => {
      try {
        setLoading(true);
        const response = await fetch(`https://bable-be-300594224442.us-central1.run.app/api/chat/token`, {
          headers: {
            'Authorization': `Bearer ${await currentUser.getIdToken()}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to initialize chat');
        }

        const { token } = await response.json();
        
        // Initialize Twilio Client
        const client = new Client(token);

        // Get or create conversation for this patient
        const conversationResponse = await fetch(
          `https://bable-be-300594224442.us-central1.run.app/api/chat/conversation/${selectedPatient.id}`,
          {
            headers: {
              'Authorization': `Bearer ${await currentUser.getIdToken()}`,
            },
          }
        );

        if (!conversationResponse.ok) {
          throw new Error('Failed to get conversation');
        }

        const { conversationSid } = await conversationResponse.json();
        const conv = await client.getConversationBySid(conversationSid);
        setConversation(conv);

        // Load existing messages
        const messagesPaginator = await conv.getMessages();
        setMessages(
          messagesPaginator.items.map((item: TwilioMessage) => ({
            id: item.sid,
            body: item.body || '',
            author: item.author || '',
            timestamp: item.dateCreated ? item.dateCreated.toISOString() : new Date().toISOString(),
          }))
        );

        // Subscribe to new messages
        conv.on('messageAdded', (message: TwilioMessage) => {
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
        console.error('Error initializing chat:', error);
        toast.error('Failed to initialize chat. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    initializeChat();

    // Cleanup function
    return () => {
      if (conversation) {
        conversation.removeAllListeners();
      }
    };
  }, [currentUser, selectedPatient]);

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
      <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
        Please select a patient to start messaging
      </div>
    );
  }

  return (
    <Container>
      <ChatContainer>
        <ChatHeader>
          <div>
            <h2 style={{ margin: 0 }}>{selectedPatient.firstName} {selectedPatient.lastName}</h2>
            <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>
              {selectedPatient.email}
            </div>
          </div>
        </ChatHeader>

        <ChatMessages>
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