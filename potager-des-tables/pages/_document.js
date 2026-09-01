import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="fr">
      <Head>
        <meta name="theme-color" content="#2E9E5B" />
        <meta name="description" content="L'expédition des tables : un jeu d'aventure pour apprendre les tables de multiplication en s'amusant, adapté à chaque classe." />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
