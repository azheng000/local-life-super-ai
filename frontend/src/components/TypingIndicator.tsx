import React from 'react'

const TypingIndicator: React.FC = () => {
  return (
    <div className="flex justify-start animate-fade-in">
      <div className="message-bubble-ai">
        <div className="typing-indicator">
          <span className="typing-dot" style={{ animationDelay: '0ms' }}></span>
          <span className="typing-dot" style={{ animationDelay: '160ms' }}></span>
          <span className="typing-dot" style={{ animationDelay: '320ms' }}></span>
        </div>
      </div>
    </div>
  )
}

export default TypingIndicator
