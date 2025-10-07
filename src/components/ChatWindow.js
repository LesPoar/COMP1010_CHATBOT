import { useState, useRef, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion'; // 1. Import AnimatePresence
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import ThinkingIndicator from './ThinkingIndicator'; // 2. Import our new component
import styles from '../styles/Chat.module.css';

export default function ChatWindow() {
  const [messages, setMessages] = useState([
    { role: 'model', message: 'Hello! How can I help you today?' }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to the latest message or loading indicator
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]); // 3. Add 'loading' to the dependency array

  const handleSendMessage = async (prompt) => {
    setLoading(true);
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
        {/* 4. Wrap the dynamic list in AnimatePresence */}
        <AnimatePresence>
          {messages.map((msg, index) => (
            // 5. Use a more robust key for better animation tracking
            <MessageBubble key={`${msg.role}-${index}`} role={msg.role} message={msg.message} />
          ))}

          {/* 6. Replace the old loading bubble with our new animated component */}
          {loading && <ThinkingIndicator key="thinking" />}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>
      <MessageInput onSendMessage={handleSendMessage} loading={loading} />
    </div>
  );
}