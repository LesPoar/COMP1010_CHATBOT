import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from '../styles/TopicsPanel.module.css';

export default function TopicsPanel({ onQuestionClick }) {
  const [activeTab, setActiveTab] = useState('topics');
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [topics, setTopics] = useState([]);
  const [learningObjectives, setLearningObjectives] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourseData();
  }, []);

  const fetchCourseData = async () => {
    try {
      const response = await fetch('/api/courseData');
      const data = await response.json();
      setTopics(data.topics);
      setLearningObjectives(data.learningObjectives);
    } catch (error) {
      console.error('Error fetching course data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTopicClick = (topic) => {
    setSelectedTopic(selectedTopic?.id === topic.id ? null : topic);
  };

  const handleQuestionClick = (question) => {
    onQuestionClick(question);
    setSelectedTopic(null);
  };

  if (loading) {
    return <div className={styles.panel}>Loading...</div>;
  }

  return (
    <div className={styles.panel}>
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'topics' ? styles.activeTab : ''}`}
          onClick={() => {
            setActiveTab('topics');
            setSelectedTopic(null);
          }}
        >
          Key Topics
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'objectives' ? styles.activeTab : ''}`}
          onClick={() => {
            setActiveTab('objectives');
            setSelectedTopic(null);
          }}
        >
          Learning Objectives
        </button>
      </div>

      <div className={styles.content}>
        {activeTab === 'topics' ? (
          <div className={styles.topicsList}>
            {topics.map((topic) => (
              <div key={topic.id}>
                <motion.div
                  className={`${styles.topicItem} ${selectedTopic?.id === topic.id ? styles.activeTopic : ''}`}
                  onClick={() => handleTopicClick(topic)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {topic.title}
                  <span className={styles.arrow}>
                    {selectedTopic?.id === topic.id ? '▼' : '▶'}
                  </span>
                </motion.div>

                <AnimatePresence>
                  {selectedTopic?.id === topic.id && (
                    <motion.div
                      className={styles.questionsPanel}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className={styles.questionsHeader}>Example Questions:</div>
                      {topic.questions.map((question, idx) => (
                        <motion.div
                          key={idx}
                          className={styles.questionItem}
                          onClick={() => handleQuestionClick(question)}
                          whileHover={{ backgroundColor: '#e3f2fd' }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {question}
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.objectivesList}>
            {learningObjectives.map((objective, idx) => (
              <motion.div
                key={idx}
                className={styles.objectiveItem}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <span className={styles.bullet}>•</span>
                {objective}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}