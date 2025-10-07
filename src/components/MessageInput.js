import { useState } from 'react';
import styles from '../styles/Chat.module.css';

export default function MessageInput({ onSendMessage, loading }) {
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !loading) {
      onSendMessage(input);
      setInput('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.inputForm}>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask me anything..."
        disabled={loading}
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Thinking...' : 'Send'}
      </button>
    </form>
  );
}