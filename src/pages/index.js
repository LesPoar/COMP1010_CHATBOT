import Head from 'next/head';
import ChatWindow from '../components/ChatWindow';

export default function HomePage() {
  return (
    <div>
      <Head>
        <title>COMP1010 Flipped Learning Chatboty</title>
        <meta name="description" content="A chatbot built for the COMP1010 class." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1>COMP1010 Chatbot</h1>
        <ChatWindow />
      </main>
    </div>
  );
}