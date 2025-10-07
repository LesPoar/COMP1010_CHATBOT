import { motion } from 'framer-motion'; // 1. Import motion
import styles from '../styles/Chat.module.css';

export default function MessageBubble({ message, role }) {
  const bubbleClass = role === 'user' ? styles.userBubble : styles.modelBubble;
  const author = role === 'user' ? 'You' : 'AI';

  // 2. Define the animation variants
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
  };

  return (
    // 3. Replace 'div' with 'motion.div' and add animation props
    <motion.div
      className={`${styles.messageBubble} ${bubbleClass}`}
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      layout // This helps animate position changes smoothly
    >
      <div className={styles.author}>{author}</div>
      <p>{message}</p>
    </motion.div>
  );
}