import Head from 'next/head';
import Link from 'next/link';
import { useRef, useState, useEffect } from 'react';
import ChatWindow from '../components/ChatWindow';
import styles from '../styles/Slides.module.css';

export default function SlidesPage() {
  const chatWindowRef = useRef(null);
  const [pdfError, setPdfError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const iframeRef = useRef(null);

  useEffect(() => {
    // Check if PDF loads
    const checkPdfLoad = async () => {
      try {
        const response = await fetch('/api/get-pdf', { method: 'HEAD' });
        console.log('PDF check status:', response.status);
        console.log('PDF headers:', Object.fromEntries(response.headers.entries()));
      } catch (error) {
        console.error('PDF check error:', error);
      }
    };
    
    checkPdfLoad();
  }, []);

  const handleIframeLoad = () => {
    console.log('Iframe loaded');
    
    // Check if iframe has content
    try {
      const iframe = iframeRef.current;
      if (iframe) {
        console.log('Iframe contentWindow:', iframe.contentWindow);
      }
    } catch (error) {
      console.error('Iframe access error:', error);
    }
  };

  const handleIframeError = (e) => {
    console.error('Iframe error event:', e);
    setPdfError(true);
    setErrorMessage('Failed to load PDF in viewer');
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
            <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.5rem' }}>
              <a 
                href="/api/get-pdf" 
                download
                style={{ color: '#007bff', textDecoration: 'none' }}
              >
                📥 Download PDF
              </a>
              {' | '}
              <a 
                href="/api/get-pdf" 
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#007bff', textDecoration: 'none' }}
              >
                🔗 Open in New Tab
              </a>
            </div>
          </div>
          <div className={styles.pdfContainer}>
            {!pdfError ? (
              <>
                <iframe
                  ref={iframeRef}
                  src="/api/get-pdf"
                  className={styles.pdfIframe}
                  title="Course Slides"
                  onLoad={handleIframeLoad}
                  onError={handleIframeError}
                />
                <div className={styles.pdfFallback}>
                  <p>
                    PDF not displaying? Try{' '}
                    <a href="/api/get-pdf" target="_blank" rel="noopener noreferrer">
                      opening in a new tab
                    </a>
                    {' or '}
                    <a href="/api/get-pdf" download>downloading it</a>.
                  </p>
                </div>
              </>
            ) : (
              <div className={styles.pdfFallback}>
                <h2>Unable to display PDF</h2>
                <p>{errorMessage}</p>
                <p>
                  <a 
                    href="/api/get-pdf" 
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#007bff',
                      color: 'white',
                      textDecoration: 'none',
                      borderRadius: '5px',
                      display: 'inline-block',
                      marginTop: '10px',
                      marginRight: '10px'
                    }}
                  >
                    Open in New Tab
                  </a>
                  <a 
                    href="/api/get-pdf" 
                    download
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#28a745',
                      color: 'white',
                      textDecoration: 'none',
                      borderRadius: '5px',
                      display: 'inline-block',
                      marginTop: '10px'
                    }}
                  >
                    Download PDF
                  </a>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}