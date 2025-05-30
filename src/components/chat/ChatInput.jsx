import React, { useState, useRef, useEffect } from 'react';

const ChatInput = ({ 
  onSendMessage, 
  disabled = false, 
  placeholder = "Type a message...",
  maxLength = 500 
}) => {
  const [message, setMessage] = useState('');
  const [isShiftPressed, setIsShiftPressed] = useState(false);
  const inputRef = useRef(null);

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    if (value.length <= maxLength) {
      setMessage(value);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!message.trim() || disabled) {
      return;
    }

    const success = await onSendMessage(message);
    
    if (success) {
      setMessage('');
      // Focus back to input after sending
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  // Handle key press events
  const handleKeyDown = (e) => {
    if (e.key === 'Shift') {
      setIsShiftPressed(true);
    }

    // Send message on Enter (without Shift)
    if (e.key === 'Enter' && !isShiftPressed && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleKeyUp = (e) => {
    if (e.key === 'Shift') {
      setIsShiftPressed(false);
    }
  };

  // Auto-focus input when component mounts
  useEffect(() => {
    if (inputRef.current && !disabled) {
      inputRef.current.focus();
    }
  }, [disabled]);

  return (
    <form className="chat-input-form" onSubmit={handleSubmit}>
      <div className="chat-input-wrapper">
        <textarea
          ref={inputRef}
          className="chat-input"
          value={message}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          style={{
            resize: 'none',
            overflow: 'hidden',
            minHeight: '40px',
            maxHeight: '120px'
          }}
          onInput={(e) => {
            // Auto-resize textarea
            e.target.style.height = 'auto';
            e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
          }}
        />
        
        {/* Character counter */}
        {message.length > maxLength * 0.8 && (
          <div className={`char-counter ${message.length === maxLength ? 'at-limit' : ''}`}>
            {message.length}/{maxLength}
          </div>
        )}
        
        {/* Send button */}
        <button
          type="submit"
          className="send-button"
          disabled={disabled || !message.trim()}
          title="Send message (Enter)"
        >
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M2 21L23 12L2 3V10L17 12L2 14V21Z" 
              fill="currentColor"
            />
          </svg>
        </button>
      </div>
      
      {/* Help text */}
      <div className="chat-input-help">
        <small>
          Press Enter to send • Shift+Enter for new line
        </small>
      </div>
    </form>
  );
};

export default ChatInput;