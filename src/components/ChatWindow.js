import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import ThinkingIndicator from './ThinkingIndicator';
import styles from '../styles/Chat.module.css';

const ChatWindow = forwardRef((props, ref) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (message) => {
    const messageToSend = message || inputMessage.trim();
    if (!messageToSend) return;

    const newUserMessage = { text: messageToSend, sender: 'user' };
    setMessages((prev) => [...prev, newUserMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      console.log('Sending message to API:', messageToSend);
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: messageToSend }),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
          console.error('API Error Response:', errorData);
        } catch (e) {
          console.error('Could not parse error response');
          errorData = { message: 'Unknown error occurred' };
        }
        
        throw new Error(errorData.message || errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Received AI response');
      
      const aiMessage = { text: data.aiResponse, sender: 'ai' };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error details:', error);
      const errorMessage = {
        text: `Sorry, I encountered an error: ${error.message}. Please check the console for details.`,
        sender: 'ai',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({
    sendMessage: handleSendMessage,
  }));

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSendMessage();
  };

  return (
    <div className={styles.chatContainer}>
      <div className={styles.messagesContainer}>
        {messages.map((message, index) => (
          <div
            key={index}
            className={`${styles.message} ${
              message.sender === 'user' ? styles.userMessage : styles.aiMessage
            }`}
          >
            {message.text}
          </div>
        ))}
        {isLoading && (
          <div className={styles.aiMessage}>
            <ThinkingIndicator />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className={styles.inputContainer}>
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Ask a question about the course..."
          className={styles.input}
          disabled={isLoading}
        />
        <button type="submit" className={styles.sendButton} disabled={isLoading}>
          Send
        </button>
      </form>
    </div>
  );
});

ChatWindow.displayName = 'ChatWindow';

export default ChatWindow;