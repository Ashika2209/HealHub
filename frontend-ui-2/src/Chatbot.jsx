import React, { useState } from 'react';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I am HealBot. How can I help you today?", sender: 'bot' },
    { id: 2, text: "I'd like to book an appointment.", sender: 'user' },
    { id: 3, text: "Sure, I can help with that. Which department are you looking for?", sender: 'bot' }
  ]);
  const [inputValue, setInputValue] = useState('');

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      text: inputValue,
      sender: 'user'
    };

    setMessages([...messages, newMessage]);
    setInputValue('');

    // Simulate bot response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        text: "Thanks for your message! Our team will get back to you shortly. I'm HealBot, your virtual assistant.",
        sender: 'bot'
      }]);
    }, 1000);
  };

  if (!isOpen) {
    return (
      <button className="chat-toggle-btn" onClick={() => setIsOpen(true)}>
        <span className="bot-icon">🏥</span>
        <span>Chat with HealBot</span>
      </button>
    );
  }

  return (
    <div className="chatbot-container">
      <div className="chat-header">
        <div className="header-info">
          <div className="bot-icon">🏥</div>
          <h2>HealBot</h2>
        </div>
        <button className="close-btn" onClick={() => setIsOpen(false)}>×</button>
      </div>
      <div className="chat-messages">
        {messages.map(msg => (
          <div key={msg.id} className={`message ${msg.sender}-message`}>
            {msg.text}
          </div>
        ))}
      </div>
      <div className="chat-input-area">
        <input
          type="text"
          className="chat-input"
          placeholder="Type your message..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        />
        <button className="send-button" onClick={handleSend} disabled={!inputValue.trim()}>
          Send
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
