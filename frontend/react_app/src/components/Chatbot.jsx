import React, { useState } from 'react';
import axios from 'axios';
import './Chatbot.css';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);

    const toggleChat = () => {
        setIsOpen(!isOpen);
        if (!isOpen && messages.length === 0) {
            setMessages([{
                type: 'bot',
                text: 'Hello! I can help you find specialists across our hospital network. Try searching for a doctor name or specialization (e.g., "Cardiology").'
            }]);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        // Add user message
        const userMsg = { type: 'user', text: query };
        setMessages(prev => [...prev, userMsg]);
        setLoading(true);
        const searchQuery = query;
        setQuery('');

        try {
            // Get selected hospital from context
            const storedBranch = localStorage.getItem('selected_hospital');
            const hospitalId = storedBranch ? JSON.parse(storedBranch).id : '';

            const response = await axios.get(`http://localhost:8000/api/doctors/chatbot/search/?q=${encodeURIComponent(searchQuery)}&hospital_id=${hospitalId}`);

            const { message, data } = response.data;

            // Add bot response
            const botMsg = {
                type: 'bot',
                text: message,
                details: data
            };
            setMessages(prev => [...prev, botMsg]);

        } catch (error) {
            console.error("Search error:", error);
            setMessages(prev => [...prev, { type: 'bot', text: 'Sorry, I encountered an error while searching. Please try again.' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`chatbot-container ${isOpen ? 'open' : ''}`}>
            {!isOpen && (
                <button className="chatbot-toggle" onClick={toggleChat}>
                    💬 Find Doctor
                </button>
            )}

            {isOpen && (
                <div className="chatbot-window">
                    <div className="chatbot-header">
                        <h3>Hospital Assistant</h3>
                        <button className="close-btn" onClick={toggleChat}>×</button>
                    </div>

                    <div className="chatbot-messages">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`message ${msg.type}`}>
                                <div className="message-text">{msg.text}</div>
                                {msg.details && (
                                    <div className="message-details">
                                        {/* Display logic for detailed matches */}
                                        {msg.details.multi_hospital && msg.details.multi_hospital.length > 0 && (
                                            <div className="detail-group highlight">
                                                <strong>Available in Multiple Hospitals:</strong>
                                                <ul>
                                                    {msg.details.multi_hospital.map(doc => (
                                                        <li key={doc.id}>{doc.name} ({doc.specialization}) - {doc.hospitals.join(", ")}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        {msg.details.current_hospital && msg.details.current_hospital.length > 0 && (
                                            <div className="detail-group">
                                                <strong>In Current Hospital:</strong>
                                                <ul>
                                                    {msg.details.current_hospital.map(doc => (
                                                        <li key={doc.id}>{doc.name} ({doc.specialization})</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        {msg.details.other_hospitals && msg.details.other_hospitals.length > 0 && (
                                            <div className="detail-group">
                                                <strong>In Other Hospitals:</strong>
                                                <ul>
                                                    {msg.details.other_hospitals.map(doc => (
                                                        <li key={doc.id}>{doc.name} ({doc.specialization}) - {doc.hospitals.join(", ")}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                        {loading && <div className="message bot">Searching...</div>}
                    </div>

                    <form className="chatbot-input" onSubmit={handleSearch}>
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search doctor or specialist..."
                        />
                        <button type="submit">Send</button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Chatbot;
