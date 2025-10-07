import { motion } from 'framer-motion';
import styles from '../styles/ThinkingIndicator.module.css';

export default function ThinkingIndicator() {
  const bubbleVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
  };

  const dotVariants = {
    blinking: {
      opacity: [0.2, 1, 0.2], // Animate from dim to bright to dim
      transition: {
        duration: 1.4,
        repeat: Infinity,
        repeatType: "loop",
        ease: "easeInOut",
      }
    }
  };

  return (
    <motion.div
      className={`${styles.messageBubble} ${styles.modelBubble}`}
      variants={bubbleVariants}
      initial="hidden"
      animate="visible"
      layout
    >
      <div className={styles.author}>AI</div>
      <div className={styles.thinkingContainer}>
        Thinking
        <motion.span variants={dotVariants} animate="blinking" transition={{ delay: 0 }}>.</motion.span>
        <motion.span variants={dotVariants} animate="blinking" transition={{ delay: 0.2 }}>.</motion.span>
        <motion.span variants={dotVariants} animate="blinking" transition={{ delay: 0.4 }}>.</motion.span>
      </div>
    </motion.div>
  );
}