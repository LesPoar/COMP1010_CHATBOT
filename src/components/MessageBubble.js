import styles from '../styles/Chat.module.css';

export default function MessageBubble({ message, role }) {
  const bubbleClass = role === 'user' ? styles.userBubble : styles.modelBubble;
  const author = role === 'user' ? 'You' : 'AI';

  return (
    <div className={`${styles.messageBubble} ${bubbleClass}`}>
      <div className={styles.author}>{author}</div>
      <p>{message}</p>
    </div>
  );
}