import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { AnimatePresence } from 'framer-motion';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import ThinkingIndicator from './ThinkingIndicator';
import styles from '../styles/Chat.module.css';

const ChatWindow = forwardRef((props, ref) => {
  const [messages, setMessages] = useState([
    { role: 'model', message: 'Hello! How can I help you today?' }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

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

  useImperativeHandle(ref, () => ({
    sendMessage: handleSendMessage
  }));

  return (
    <div className={styles.chatContainer}>
      <div className={styles.messageList}>
        <AnimatePresence>
          {messages.map((msg, index) => (
            <MessageBubble key={`${msg.role}-${index}`} role={msg.role} message={msg.message} />
          ))}
          {loading && <ThinkingIndicator key="thinking" />}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>
      <MessageInput onSendMessage={handleSendMessage} loading={loading} />
    </div>
  );
});

ChatWindow.displayName = 'ChatWindow';

export default ChatWindow;