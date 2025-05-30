import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAuthActions } from '../../hooks/useAuth';

const ChatInput = ({ 
  onSendMessage, 
  disabled = false, 
  placeholder = "Type a message...",
  maxLength = 500,
  allowEmojis = true,
  allowCommands = true
}) => {
  const { user } = useAuthActions();
  
  // Input state
  const [message, setMessage] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [mentionSuggestions, setMentionSuggestions] = useState([]);
  const [showMentions, setShowMentions] = useState(false);
  const [currentMention, setCurrentMention] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);

  // Refs
  const inputRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const mentionsRef = useRef(null);

  // Common emojis
  const commonEmojis = [
    '😀', '😂', '😍', '🥺', '😭', '😎', '🤔', '👍', '👎', '❤️',
    '🔥', '💯', '🎉', '😱', '🙄', '😴', '🤗', '😬', '🤯', '🥳',
    '👏', '🙌', '💪', '✨', '⭐', '🎯', '🚀', '💎', '👑', '🎮'
  ];

  // Chat commands
  const chatCommands = allowCommands ? [
    { command: '/me', description: 'Send an action message' },
    { command: '/shoutout', description: 'Give a shoutout to someone' },
    { command: '/timeout', description: 'Timeout a user (moderators only)' },
    { command: '/ban', description: 'Ban a user (moderators only)' },
    { command: '/clear', description: 'Clear chat (moderators only)' },
    { command: '/slow', description: 'Enable slow mode (moderators only)' },
    { command: '/slowoff', description: 'Disable slow mode (moderators only)' }
  ] : [];

  // Handle input change
  const handleInputChange = useCallback((e) => {
    const value = e.target.value;
    
    if (value.length <= maxLength) {
      setMessage(value);
      setCursorPosition(e.target.selectionStart);
      
      // Check for mentions (@username)
      const words = value.split(' ');
      const currentWord = words[words.length - 1];
      
      if (currentWord.startsWith('@') && currentWord.length > 1) {
        setCurrentMention(currentWord.slice(1));
        setShowMentions(true);
        // In a real app, you'd fetch user suggestions here
        setMentionSuggestions([]);
      } else {
        setShowMentions(false);
        setCurrentMention('');
      }
    }
  }, [maxLength]);

  // Handle key press
  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      setShowEmojiPicker(false);
      setShowMentions(false);
    } else if (e.key === 'ArrowUp' && showMentions) {
      e.preventDefault();
      // Handle mention navigation
    } else if (e.key === 'ArrowDown' && showMentions) {
      e.preventDefault();
      // Handle mention navigation
    } else if (e.key === 'Tab' && showMentions) {
      e.preventDefault();
      // Complete mention
    }
  }, [showMentions]);

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    if (!message.trim() || disabled || isComposing) return;
    
    setIsComposing(true);
    
    try {
      let messageContent = message.trim();
      let messageType = 'text';
      
      // Handle commands
      if (messageContent.startsWith('/') && allowCommands) {
        const commandMatch = messageContent.match(/^\/(\w+)(?:\s+(.*))?$/);
        if (commandMatch) {
          const [, command, args] = commandMatch;
          messageType = 'command';
          messageContent = { command, args: args || '' };
        }
      }
      
      // Handle action messages (/me)
      if (messageContent.startsWith('/me ')) {
        messageType = 'action';
        messageContent = messageContent.slice(4);
      }
      
      const success = await onSendMessage(messageContent, messageType);
      
      if (success) {
        setMessage('');
        setShowEmojiPicker(false);
        setShowMentions(false);
        
        // Focus back to input
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsComposing(false);
    }
  }, [message, disabled, isComposing, onSendMessage, allowCommands]);

  // Add emoji to message
  const addEmoji = useCallback((emoji) => {
    const newMessage = message.slice(0, cursorPosition) + emoji + message.slice(cursorPosition);
    setMessage(newMessage);
    
    // Update cursor position
    const newPosition = cursorPosition + emoji.length;
    setCursorPosition(newPosition);
    
    // Focus input and set cursor position
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.setSelectionRange(newPosition, newPosition);
      }
    }, 0);
  }, [message, cursorPosition]);

  // Complete mention
  const completeMention = useCallback((username) => {
    const words = message.split(' ');
    words[words.length - 1] = `@${username} `;
    setMessage(words.join(' '));
    setShowMentions(false);
    setCurrentMention('');
    
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [message]);

  // Handle click outside emoji picker
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
      
      if (mentionsRef.current && !mentionsRef.current.contains(event.target)) {
        setShowMentions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + 'px';
    }
  }, [message]);

  const characterCount = message.length;
  const isNearLimit = characterCount >= maxLength * 0.8;
  const isAtLimit = characterCount >= maxLength;

  return (
    <div className="chat-input">
      {/* Mention Suggestions */}
      {showMentions && mentionSuggestions.length > 0 && (
        <div className="mention-suggestions" ref={mentionsRef}>
          {mentionSuggestions.map((suggestion, index) => (
            <div
              key={suggestion.id}
              className="mention-suggestion"
              onClick={() => completeMention(suggestion.username)}
            >
              <img 
                src={suggestion.avatar} 
                alt={suggestion.username}
                className="mention-avatar"
              />
              <span className="mention-username">@{suggestion.username}</span>
            </div>
          ))}
        </div>
      )}

      {/* Emoji Picker */}
      {showEmojiPicker && allowEmojis && (
        <div className="emoji-picker" ref={emojiPickerRef}>
          <div className="emoji-grid">
            {commonEmojis.map((emoji, index) => (
              <button
                key={index}
                className="emoji-button"
                onClick={() => addEmoji(emoji)}
                type="button"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Container */}
      <div className="input-container">
        <div className="input-wrapper">
          {/* Main Input */}
          <textarea
            ref={inputRef}
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            placeholder={disabled ? "Chat is disabled" : placeholder}
            disabled={disabled || isComposing}
            className={`chat-textarea ${isAtLimit ? 'at-limit' : ''}`}
            rows={1}
            maxLength={maxLength}
          />

          {/* Input Actions */}
          <div className="input-actions">
            {/* Emoji Button */}
            {allowEmojis && (
              <button
                type="button"
                className={`emoji-toggle ${showEmojiPicker ? 'active' : ''}`}
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                disabled={disabled}
                title="Add emoji"
              >
                😀
              </button>
            )}

            {/* Send Button */}
            <button
              type="button"
              className="send-button"
              onClick={handleSubmit}
              disabled={disabled || !message.trim() || isComposing || isAtLimit}
              title="Send message (Enter)"
            >
              {isComposing ? (
                <span className="loading-spinner">⏳</span>
              ) : (
                <span className="send-icon">➤</span>
              )}
            </button>
          </div>
        </div>

        {/* Character Counter */}
        {isNearLimit && (
          <div className={`character-counter ${isAtLimit ? 'at-limit' : ''}`}>
            {characterCount}/{maxLength}
          </div>
        )}

        {/* Commands Help */}
        {message.startsWith('/') && allowCommands && (
          <div className="commands-help">
            <div className="commands-list">
              {chatCommands
                .filter(cmd => cmd.command.startsWith(message.split(' ')[0]))
                .slice(0, 5)
                .map((cmd, index) => (
                  <div key={index} className="command-suggestion">
                    <span className="command-name">{cmd.command}</span>
                    <span className="command-description">{cmd.description}</span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* User Info (if needed) */}
      {user && (
        <div className="user-info">
          <span className="username">Chatting as {user.username}</span>
        </div>
      )}
    </div>
  );
};

export default ChatInput;