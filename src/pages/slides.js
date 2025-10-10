import Head from 'next/head';
import Link from 'next/link';
import { useRef, useState, useEffect } from 'react';
import ChatWindow from '../components/ChatWindow';
import styles from '../styles/Slides.module.css';

export default function SlidesPage() {
  const chatWindowRef = useRef(null);
  const [pdfUrl, setPdfUrl] = useState('/lecture9.pdf');

  useEffect(() => {
    fetchPdfFilename();
  }, []);

  const fetchPdfFilename = async () => {
    try {
      const response = await fetch('/api/courseData');
      const data = await response.json();
      setPdfUrl(`/${data.slidesFilename}`);
    } catch (error) {
      console.error('Error fetching PDF filename:', error);
    }
  };

  return (
    <>
      <Head>
        <title>Course Slides - COMP1010</title>
        <meta name="description" content="View COMP1010 course slides" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.slidesContainer}>
        <div className={styles.chatSidebar}>
          <div className={styles.backButton}>
            <Link href="/">← Back to Chat</Link>
          </div>
          <ChatWindow ref={chatWindowRef} />
        </div>

        <div className={styles.pdfViewer}>
          <div className={styles.pdfHeader}>
            <h1>COMP1010 Course Slides</h1>
          </div>
          <div className={styles.pdfContainer}>
            <iframe
              src={pdfUrl}
              className={styles.pdfIframe}
              title="Course Slides"
            />
            <div className={styles.pdfFallback}>
              <p>If the PDF doesn&apos;t load, you can <a href={pdfUrl} download>download it here</a>.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}