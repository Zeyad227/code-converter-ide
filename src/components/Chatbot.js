import React, { useState, useRef, useEffect } from 'react';
import './Chatbot.css';

const Chatbot = ({ chatHistory, onSendMessage, currentCode, currentLanguage, targetLanguage }) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const handleSend = async () => {
    if (!message.trim()) return;
    
    setIsTyping(true);
    await onSendMessage(message);
    setMessage('');
    setIsTyping(false);
  };

  const handleQuickAction = (action) => {
    let quickMessage = '';
    switch (action) {
      case 'explain':
        quickMessage = 'Can you explain what this code does?';
        break;
      case 'optimize':
        quickMessage = 'How can I optimize this code?';
        break;
      case 'debug':
        quickMessage = 'Help me debug this code. Are there any issues?';
        break;
      case 'convert-help':
        quickMessage = `What should I know when converting from ${currentLanguage} to ${targetLanguage}?`;
        break;
      default:
        return;
    }
    setMessage(quickMessage);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chatbot">
      <div className="chat-header">
        <h3>AI Assistant</h3>
        <div className="status-indicator">
          <span className="status-dot online"></span>
          <span>Ready to help</span>
        </div>
      </div>

      <div className="chat-messages">
        {chatHistory.length === 0 && (
          <div className="welcome-message">
            <p>🤖 AI Coding Assistant</p>
            <p>I can help you with code conversion, optimization, debugging, and explanations!</p>
            <div className="quick-actions">
              <button onClick={() => handleQuickAction('explain')} className="quick-btn">
                📝 Explain Code
              </button>
              <button onClick={() => handleQuickAction('optimize')} className="quick-btn">
                ⚡ Optimize
              </button>
              <button onClick={() => handleQuickAction('debug')} className="quick-btn">
                🐛 Debug Help
              </button>
              <button onClick={() => handleQuickAction('convert-help')} className="quick-btn">
                🔄 Convert Tips
              </button>
            </div>
          </div>
        )}

        {chatHistory.map((item, index) => (
          <div key={index} className="message-group">
            {item.type === 'conversion' && (
              <div className="conversion-message">
                <div className="conversion-header">
                  <span className="conversion-badge">
                    {item.from} → {item.to}
                  </span>
                  <span className="timestamp">{item.timestamp}</span>
                </div>
                <div className="conversion-preview">
                  <div className="code-preview">
                    <pre>{item.convertedCode.substring(0, 100)}...</pre>
                  </div>
                </div>
              </div>
            )}
            {item.type === 'user' && (
              <div className="message user-message">
                <div className="message-content">{item.content}</div>
                <div className="timestamp">{item.timestamp}</div>
              </div>
            )}
            {item.type === 'assistant' && (
              <div className="message bot-message">
                <div className="message-content">{item.content}</div>
                <div className="timestamp">{item.timestamp}</div>
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="message bot-message typing">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask me anything about code conversion..."
          rows={2}
        />
        <button 
          onClick={handleSend}
          disabled={!message.trim() || isTyping}
          className="send-button"
        >
          <span>↗</span>
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
