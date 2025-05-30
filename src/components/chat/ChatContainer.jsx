import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuthActions } from '../../hooks/useAuth';
import { useSocket } from '../../hooks/useSocket';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';

const ChatContainer = ({ 
  streamId, 
  messages = [], 
  isSlowMode = false, 
  disabled = false,
  maxMessages = 500 
}) => {
  const { user } = useAuthActions();
  const { socket, connected } = useSocket();
  
  // Chat state
  const [chatMessages, setChatMessages] = useState(messages);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [blockedUsers, setBlockedUsers] = useState(new Set());
  const [slowModeTimer, setSlowModeTimer] = useState(0);
  const [canSendMessage, setCanSendMessage] = useState(true);
  
  // Refs
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const slowModeIntervalRef = useRef(null);
  
  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current && isAtBottom) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isAtBottom]);

  // Handle scroll events to detect if user is at bottom
  const handleScroll = useCallback(() => {
    if (!chatContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const threshold = 50; // pixels from bottom
    const atBottom = scrollHeight - scrollTop - clientHeight < threshold;
    
    setIsAtBottom(atBottom);
    
    if (atBottom) {
      setUnreadCount(0);
    }
  }, []);

  // Add new message
  const addMessage = useCallback((newMessage) => {
    setChatMessages(prev => {
      // Don't add messages from blocked users
      if (blockedUsers.has(newMessage.userId)) {
        return prev;
      }
      
      const updated = [...prev, newMessage];
      
      // Keep only the last maxMessages
      if (updated.length > maxMessages) {
        return updated.slice(-maxMessages);
      }
      
      return updated;
    });
    
    // Increment unread count if not at bottom
    if (!isAtBottom) {
      setUnreadCount(prev => prev + 1);
    }
  }, [blockedUsers, maxMessages, isAtBottom]);

  // Send message
  const sendMessage = useCallback(async (content, type = 'text') => {
    if (!socket || !connected || !user || !canSendMessage || disabled) {
      return false;
    }

    if (!content.trim()) {
      return false;
    }

    try {
      const messageData = {
        streamId,
        content: content.trim(),
        type,
        timestamp: Date.now()
      };

      socket.emit('chat:send-message', messageData);
      
      // Handle slow mode
      if (isSlowMode) {
        setCanSendMessage(false);
        setSlowModeTimer(30); // 30 second cooldown
        
        slowModeIntervalRef.current = setInterval(() => {
          setSlowModeTimer(prev => {
            if (prev <= 1) {
              setCanSendMessage(true);
              clearInterval(slowModeIntervalRef.current);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
      
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  }, [socket, connected, user, canSendMessage, disabled, streamId, isSlowMode]);

  // Block/unblock user
  const toggleBlockUser = useCallback((userId) => {
    setBlockedUsers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
    
    // Remove messages from blocked/unblocked user
    setChatMessages(prev => 
      prev.filter(msg => !blockedUsers.has(msg.userId))
    );
  }, [blockedUsers]);

  // Delete message (for moderators/streamers)
  const deleteMessage = useCallback((messageId) => {
    if (!socket || !connected) return;
    
    socket.emit('chat:delete-message', { streamId, messageId });
    
    setChatMessages(prev => 
      prev.filter(msg => msg.id !== messageId)
    );
  }, [socket, connected, streamId]);

  // Socket event handlers
  useEffect(() => {
    if (!socket || !connected) return;

    const handleNewMessage = (message) => {
      addMessage(message);
    };

    const handleMessageDeleted = (data) => {
      setChatMessages(prev => 
        prev.filter(msg => msg.id !== data.messageId)
      );
    };

    const handleUserBanned = (data) => {
      setChatMessages(prev => 
        prev.filter(msg => msg.userId !== data.userId)
      );
    };

    const handleSlowModeToggle = (data) => {
      if (data.enabled && canSendMessage) {
        setCanSendMessage(false);
        setSlowModeTimer(data.duration || 30);
      }
    };

    socket.on('chat:new-message', handleNewMessage);
    socket.on('chat:message-deleted', handleMessageDeleted);
    socket.on('chat:user-banned', handleUserBanned);
    socket.on('chat:slow-mode-toggle', handleSlowModeToggle);

    return () => {
      socket.off('chat:new-message', handleNewMessage);
      socket.off('chat:message-deleted', handleMessageDeleted);
      socket.off('chat:user-banned', handleUserBanned);
      socket.off('chat:slow-mode-toggle', handleSlowModeToggle);
    };
  }, [socket, connected, addMessage, canSendMessage]);

  // Update messages when prop changes
  useEffect(() => {
    setChatMessages(messages);
  }, [messages]);

  // Auto-scroll when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, scrollToBottom]);

  // Cleanup slow mode timer
  useEffect(() => {
    return () => {
      if (slowModeIntervalRef.current) {
        clearInterval(slowModeIntervalRef.current);
      }
    };
  }, []);

  // Jump to bottom function
  const jumpToBottom = () => {
    setIsAtBottom(true);
    setUnreadCount(0);
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="chat-container">
      {/* Chat Header */}
      <div className="chat-header">
        <h3>Stream Chat</h3>
        {isSlowMode && (
          <div className="slow-mode-indicator">
            <span className="slow-mode-icon">🐌</span>
            <span>Slow mode</span>
          </div>
        )}
      </div>

      {/* Chat Messages */}
      <div 
        className="chat-messages"
        ref={chatContainerRef}
        onScroll={handleScroll}
      >
        {chatMessages.length === 0 ? (
          <div className="chat-empty">
            <p>No messages yet. Be the first to say something!</p>
          </div>
        ) : (
          chatMessages.map((message, index) => (
            <ChatMessage
              key={message.id || `${message.userId}-${index}`}
              message={message}
              isOwnMessage={user?.id === message.userId}
              canDelete={user && (user.id === message.userId || user.role === 'moderator' || user.role === 'streamer')}
              onDelete={() => deleteMessage(message.id)}
              onBlockUser={() => toggleBlockUser(message.userId)}
              isBlocked={blockedUsers.has(message.userId)}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to bottom button */}
      {!isAtBottom && (
        <div className="chat-scroll-prompt">
          <button 
            className="scroll-to-bottom-btn"
            onClick={jumpToBottom}
          >
            {unreadCount > 0 && (
              <span className="unread-badge">{unreadCount}</span>
            )}
            <span>↓ Jump to bottom</span>
          </button>
        </div>
      )}

      {/* Chat Input */}
      <div className="chat-input-container">
        {disabled ? (
          <div className="chat-disabled">
            <p>You need to be logged in to chat</p>
          </div>
        ) : !canSendMessage && isSlowMode ? (
          <div className="slow-mode-cooldown">
            <p>Slow mode: {slowModeTimer}s remaining</p>
          </div>
        ) : (
          <ChatInput
            onSendMessage={sendMessage}
            disabled={!canSendMessage}
            placeholder={isSlowMode ? "Slow mode is enabled" : "Type a message..."}
          />
        )}
      </div>
    </div>
  );
};

export default ChatContainer;