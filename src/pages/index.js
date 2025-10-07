import Head from 'next/head';
import ChatWindow from '../components/ChatWindow';

export default function HomePage() {
  return (
    <div>
      <Head>
        <title>Next.js Chatbot</title>
        <meta name="description" content="A chatbot built with Next.js and Google Gemini" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1>My AI Chatbot</h1>
        <ChatWindow />
      </main>
    </div>
  );
}