import '../styles/globals.css';
import { GameProvider } from '../context/GameContext';
import Layout from '../components/Layout';

function MyApp({ Component, pageProps }) {
  return (
    <GameProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </GameProvider>
  );
}

export default MyApp;
