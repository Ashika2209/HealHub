import React, { useState } from 'react';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(true);
    const [messages, setMessages] = useState([
        { id: 1, text: "Hello! I am HealBot. How can I help you today?", sender: 'bot' },
        { id: 2, text: "I'd like to book an appointment.", sender: 'user' },
        { id: 3, text: "Sure, I can help with that. Which department are you looking for?", sender: 'bot' }
    ]);
    const [inputValue, setInputValue] = useState('');

    const handleSend = () => {
        if (!inputValue.trim()) return;

        const userText = inputValue;
        const newMessage = {
            id: messages.length + 1,
            text: userText,
            sender: 'user'
        };

        setMessages(prev => [...prev, newMessage]);
        setInputValue('');

        // Symptom Analysis Logic
        const analyzeSymptom = (text) => {
            const lowerText = text.toLowerCase();

            const symptomMap = [
                { keyword: 'headache', disease: 'Migraine or Tension Headache', specialist: 'Neurologist' },
                { keyword: 'fever', disease: 'Viral Infection or Flu', specialist: 'General Physician' },
                { keyword: 'chest pain', disease: 'Angina or Heart Issues', specialist: 'Cardiologist' },
                { keyword: 'stomach', disease: 'Gastritis or Indigestion', specialist: 'Gastroenterologist' },
                { keyword: 'skin', disease: 'Dermatitis or Allergy', specialist: 'Dermatologist' },
                { keyword: 'eye', disease: 'Conjunctivitis or Vision Issues', specialist: 'Ophthalmologist' },
                { keyword: 'tooth', disease: 'Dental Cavities', specialist: 'Dentist' },
                { keyword: 'bone', disease: 'Fracture or Arthritis', specialist: 'Orthopedist' }
            ];

            const found = symptomMap.find(s => lowerText.includes(s.keyword));

            if (found) {
                return `Based on your mention of "${found.keyword}", it could be an indication of ${found.disease}. You should consider visiting a ${found.specialist}.`;
            } else {
                return "I'm not sure about those symptoms. It's best to consult with a General Physician for a proper diagnosis.";
            }
        };

        // Simulate bot response
        setTimeout(() => {
            const botResponseText = analyzeSymptom(userText);
            setMessages(prev => [...prev, {
                id: prev.length + 1,
                text: botResponseText,
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