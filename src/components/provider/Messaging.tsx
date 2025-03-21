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
  background: #ffffff;
`;

const ChatHeader = styled.div`
  padding: 1rem;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const HeaderAvatar = styled.div<{ hasImage?: boolean }>`
  width: 2.5rem;
  height: 2.5rem;
  background: ${props => props.hasImage ? 'transparent' : '#f3f4f6'};
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  color: #4b5563;
  overflow: hidden;
`;

const AvatarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const HeaderInfo = styled.div`
  flex: 1;
`;

const HeaderName = styled.h2`
  margin: 0;
  font-size: 1.125rem;
  color: #111827;
`;

const HeaderStatus = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
`;

const ChatMessages = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  background: #f8f9fa;
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
  border: 2px solid #e5e7eb;
  border-radius: 24px;
  font-size: 0.875rem;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #4f46e5;
    box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1);
  }
`;

const SendButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: #4f46e5;
  color: white;
  border: none;
  border-radius: 24px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: #4338ca;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    background: #9ca3af;
    cursor: not-allowed;
    transform: none;
  }
`;

const MessageContainer = styled.div<{ isProvider: boolean }>`
  display: flex;
  align-items: flex-end;
  gap: 0.5rem;
  max-width: 85%;
  align-self: ${props => props.isProvider ? 'flex-end' : 'flex-start'};
`;

const MessageAvatar = styled.div<{ hasImage?: boolean }>`
  width: 2rem;
  height: 2rem;
  background: ${props => props.hasImage ? 'transparent' : '#f3f4f6'};
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  color: #4b5563;
  overflow: hidden;
  flex-shrink: 0;
`;

const MessageContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const Message = styled.div<{ isProvider: boolean }>`
  max-width: 100%;
  background: ${props => props.isProvider ? '#007AFF' : '#e9e9eb'};
  color: ${props => props.isProvider ? '#FFFFFF' : '#000000'};
  padding: 0.75rem 1rem;
  border-radius: 18px;
  ${props => props.isProvider 
    ? 'border-bottom-right-radius: 4px;' 
    : 'border-bottom-left-radius: 4px;'}
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  word-wrap: break-word;
  font-size: 0.9375rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  text-align: left;
`;

const MessageTime = styled.div<{ isProvider: boolean }>`
  font-size: 0.75rem;
  color: #6b7280;
  padding: 0 0.5rem;
  text-align: ${props => props.isProvider ? 'right' : 'left'};
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

interface VideoPreviewData {
  url: string;
  thumbnailUrl: string;
  title?: string;
  provider: 'youtube' | 'vimeo';
}

interface MessageAttributes {
  videoPreview?: VideoPreviewData;
}

interface ChatMessage {
  id: string;
  body: string;
  author: string;
  timestamp: string;
  videoPreview?: VideoPreviewData;
  isVideoThumbnailLoaded?: boolean;
  displayText?: string;
}

const VideoPreview = styled.div`
  margin-top: 0.5rem;
  border-radius: 8px;
  overflow: hidden;
  max-width: 100%;
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.02);
  }
`;

const VideoThumbnail = styled.img`
  width: 100%;
  max-width: 320px;
  height: 180px;
  object-fit: cover;
  border-radius: 8px;
`;

const VideoTitle = styled.div`
  font-size: 0.875rem;
  color: #4b5563;
  margin-top: 0.25rem;
  max-width: 320px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

// Helper functions for video URL detection and parsing
const getYouTubeVideoId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/,
    /youtube\.com\/embed\/([^&\s]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
};

const getVimeoVideoId = (url: string): string | null => {
  const patterns = [
    /vimeo\.com\/([0-9]+)/,
    /player\.vimeo\.com\/video\/([0-9]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
};

const extractVideoPreview = (text: string): { preview: VideoPreviewData | null; cleanText: string } => {
  const words = text.split(/\s+/);
  for (const word of words) {
    // Check for YouTube
    const youtubeId = getYouTubeVideoId(word);
    if (youtubeId) {
      const cleanText = text.replace(word, '').trim();
      return {
        preview: {
          url: word,
          thumbnailUrl: `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`,
          provider: 'youtube' as const
        },
        cleanText
      };
    }

    // Check for Vimeo
    const vimeoId = getVimeoVideoId(word);
    if (vimeoId) {
      const cleanText = text.replace(word, '').trim();
      return {
        preview: {
          url: word,
          thumbnailUrl: `https://vumbnail.com/${vimeoId}.jpg`,
          provider: 'vimeo' as const
        },
        cleanText
      };
    }
  }
  return { preview: null, cleanText: text };
};

const handleVideoClick = (url: string) => {
  window.open(url, '_blank', 'noopener,noreferrer');
};

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

    // Don't proceed if we don't have required data
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
          `https://bable-be-300594224442.us-central1.run.app/api/messaging/conversations/provider-to-patient/${selectedPatient.id}`,
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
          const errorData = await conversationResponse.json().catch(() => null);
          const errorMessage = errorData?.message || errorData?.error || await conversationResponse.text();
          
          switch (conversationResponse.status) {
            case 401:
              console.error('❌ Authentication error:', errorMessage);
              throw new Error('Provider authentication failed. Please try logging in again.');
            
            case 400:
              console.error('❌ Invalid request:', errorMessage);
              throw new Error('Invalid request: ' + errorMessage);
            
            case 500:
              console.error('❌ Server error:', errorMessage);
              throw new Error('Server error occurred. Please try again later.');
            
            default:
              console.error('❌ Failed to get conversation:', {
                status: conversationResponse.status,
                error: errorMessage
              });
              throw new Error(`Failed to get conversation: ${conversationResponse.status} ${errorMessage}`);
          }
        }

        const responseData = await conversationResponse.json();
        if (!responseData.conversationSid || !responseData.uniqueName) {
          console.error('❌ Invalid conversation response:', responseData);
          throw new Error('Invalid conversation data received from server');
        }
        
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
          messagesPaginator.items.map((item: TwilioMessage) => {
            const { preview: extractedPreview, cleanText } = extractVideoPreview(item.body || '');
            const videoPreview = (item.attributes as MessageAttributes)?.videoPreview || extractedPreview;
            return {
              id: item.sid,
              body: item.body || '',
              author: item.author || '',
              timestamp: item.dateCreated ? item.dateCreated.toISOString() : new Date().toISOString(),
              videoPreview: videoPreview || undefined,
              isVideoThumbnailLoaded: false,
              displayText: cleanText
            };
          })
        );

        // Subscribe to new messages
        console.log('🎧 Setting up message listener...');
        conv.on('messageAdded', (message: TwilioMessage) => {
          console.log('📩 New message received:', {
            body: message.body,
            author: message.author,
            timestamp: message.dateCreated,
            attributes: message.attributes
          });
          
          setMessages((prevMessages) => {
            if (prevMessages.some(m => m.id === message.sid)) {
              console.log('📝 Message already exists, skipping:', message.sid);
              return prevMessages;
            }
            
            const { preview: extractedPreview, cleanText } = extractVideoPreview(message.body || '');
            const videoPreview = (message.attributes as MessageAttributes)?.videoPreview || extractedPreview;
            
            return [
              ...prevMessages,
              {
                id: message.sid,
                body: message.body || '',
                author: message.author || '',
                timestamp: message.dateCreated ? message.dateCreated.toISOString() : new Date().toISOString(),
                videoPreview: videoPreview || undefined,
                isVideoThumbnailLoaded: false,
                displayText: cleanText
              },
            ];
          });
        });

      } catch (error) {
        console.error('❌ Error in chat initialization:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to initialize chat';
        setError(errorMessage);
        toast.error(errorMessage, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    initializeChat();

    // Cleanup function
    return () => {
      console.log('🧹 Running cleanup');
      // Clean up any existing conversation
      if (conversation) {
        conversation.removeAllListeners();
      }
      setConversation(null);
      setMessages([]);
      setError(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, selectedPatient]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentUser || !selectedPatient || !conversation) return;

    try {
      const { preview: videoPreview } = extractVideoPreview(newMessage.trim());
      const messageOptions = videoPreview ? {
        attributes: JSON.parse(JSON.stringify({
          videoPreview: {
            url: videoPreview.url,
            thumbnailUrl: videoPreview.thumbnailUrl,
            provider: videoPreview.provider,
            ...(videoPreview.title ? { title: videoPreview.title } : {})
          }
        }))
      } : undefined;
      
      await conversation.sendMessage(newMessage.trim(), messageOptions);
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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
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
          <HeaderAvatar hasImage={!!selectedPatient?.profilePictureUrl}>
            {selectedPatient?.profilePictureUrl ? (
              <AvatarImage src={selectedPatient.profilePictureUrl} alt={`${selectedPatient.firstName} ${selectedPatient.lastName}`} />
            ) : (
              getInitials(`${selectedPatient?.firstName || ''} ${selectedPatient?.lastName || ''}`)
            )}
          </HeaderAvatar>
          <HeaderInfo>
            <HeaderName>{selectedPatient?.firstName} {selectedPatient?.lastName}</HeaderName>
            <HeaderStatus>
              {loading ? 'Connecting...' : conversation ? 'Connected' : 'Not connected'}
            </HeaderStatus>
          </HeaderInfo>
        </ChatHeader>

        <ChatMessages>
          {/* Debug info with improved styling */}
          <div style={{ 
            padding: '10px', 
            margin: '10px', 
            background: 'white', 
            borderRadius: '8px', 
            fontSize: '0.8rem',
            border: '1px solid #e5e7eb'
          }}>
            <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>Debug Info:</p>
            <div>Current User: {currentUser ? `✅ ${currentUser.email}` : '❌ Not logged in'}</div>
            <div>Selected Patient: {selectedPatient ? `✅ ${selectedPatient.firstName} ${selectedPatient.lastName}` : '❌ None selected'}</div>
            <div>Connection Status: {loading ? '🔄 Connecting' : conversation ? '✅ Connected' : '❌ Not connected'}</div>
            <div>Messages Count: {messages.length}</div>
          </div>

          {messages.map((message) => (
            <MessageContainer key={message.id} isProvider={message.author === currentUser?.uid}>
              {message.author !== currentUser?.uid && (
                <MessageAvatar hasImage={!!selectedPatient?.profilePictureUrl}>
                  {selectedPatient?.profilePictureUrl ? (
                    <AvatarImage src={selectedPatient.profilePictureUrl} alt={`${selectedPatient.firstName} ${selectedPatient.lastName}`} />
                  ) : (
                    getInitials(`${selectedPatient?.firstName || ''} ${selectedPatient?.lastName || ''}`)
                  )}
                </MessageAvatar>
              )}
              <MessageContent>
                <Message isProvider={message.author === currentUser?.uid}>
                  {message.videoPreview && !message.isVideoThumbnailLoaded ? message.body : message.displayText}
                  {message.videoPreview && (
                    <VideoPreview onClick={() => handleVideoClick(message.videoPreview!.url)}>
                      <VideoThumbnail 
                        src={message.videoPreview.thumbnailUrl} 
                        alt={message.videoPreview.title || 'Video thumbnail'} 
                        onLoad={() => {
                          setMessages(prevMessages => 
                            prevMessages.map(msg => 
                              msg.id === message.id 
                                ? { ...msg, isVideoThumbnailLoaded: true }
                                : msg
                            )
                          );
                        }}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = message.videoPreview?.provider === 'youtube' 
                            ? 'https://img.youtube.com/vi/default/maxresdefault.jpg'
                            : 'https://i.vimeocdn.com/video/default.jpg';
                          setMessages(prevMessages => 
                            prevMessages.map(msg => 
                              msg.id === message.id 
                                ? { ...msg, isVideoThumbnailLoaded: false }
                                : msg
                            )
                          );
                        }}
                      />
                      {message.videoPreview.title && (
                        <VideoTitle>{message.videoPreview.title}</VideoTitle>
                      )}
                    </VideoPreview>
                  )}
                </Message>
                <MessageTime isProvider={message.author === currentUser?.uid}>
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </MessageTime>
              </MessageContent>
            </MessageContainer>
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