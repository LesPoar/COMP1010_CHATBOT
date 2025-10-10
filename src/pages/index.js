import Head from 'next/head';
import Link from 'next/link';
import { useRef } from 'react';
import ChatWindow from '../components/ChatWindow';
import TopicsPanel from '../components/TopicsPanel';
import styles from '../styles/Home.module.css';

export default function HomePage() {
  const chatWindowRef = useRef(null);

  const handleQuestionClick = (question) => {
    if (chatWindowRef.current) {
      chatWindowRef.current.sendMessage(question);
    }
  };

  return (
    <>
      <Head>
        <title>COMP1010 Flipped Learning Chatbot</title>
        <meta name="description" content="A chatbot built for the COMP1010 class." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.mainContainer}>
        <h1 className={styles.pageTitle}>COMP1010 Chatbot</h1>
        
        <div className={styles.layoutContainer}>
          <div className={styles.chatSection}>
            <ChatWindow ref={chatWindowRef} />
          </div>
          
          <div className={styles.sidePanel}>
            <TopicsPanel onQuestionClick={handleQuestionClick} />
          </div>
        </div>

        <div className={styles.buttonContainer}>
          <Link href="/slides" className={styles.viewSlidesButton}>
            📄 View Course Slides
          </Link>
        </div>
      </main>
    </>
  );
}