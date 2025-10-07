import { useState, useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import styles from '../styles/Chat.module.css';

export default function ChatWindow() {
  const [messages, setMessages] = useState([
    { role: 'model', message: 'Hello! How can I help you today?' }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (prompt) => {
    setLoading(true);
    // Add user's message to the chat
    setMessages(prev => [...prev, { role: 'user', message: prompt }]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      // Add AI's response to the chat
      setMessages(prev => [...prev, { role: 'model', message: data.aiResponse }]);
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages(prev => [...prev, { role: 'model', message: 'Sorry, I ran into an error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.chatContainer}>
      <div className={styles.messageList}>
        {messages.map((msg, index) => (
          <MessageBubble key={index} role={msg.role} message={msg.message} />
        ))}
        {loading && <MessageBubble role="model" message="Thinking..." />}
        <div ref={messagesEndRef} />
      </div>
      <MessageInput onSendMessage={handleSendMessage} loading={loading} />
    </div>
  );
}