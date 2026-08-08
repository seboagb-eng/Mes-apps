import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useGame } from '../context/GameContext';
import Mascotte from '../components/Mascotte';
import { getNiveau } from '../lib/niveaux';
import { getCompagnon, COMPAGNONS, totalEtoiles, estDebloque } from '../lib/compagnons';
import { niveauJardinier } from '../lib/progression';

const PHRASES = [
  'On fait pousser des tables ?',
  'Viens récolter des étoiles !',
  'On s’entraîne un peu ?',
  'Prêt pour une belle récolte ?',
];

export default function Accueil() {
  const router = useRouter();
  const { state, charge } = useGame();
  const [phrase, setPhrase] = useState(PHRASES[0]);

  useEffect(() => {
    if (charge && !state.onboarded) router.replace('/bienvenue');
  }, [charge, state.onboarded, router]);

  useEffect(() => {
    setPhrase(PHRASES[Math.floor(Math.random() * PHRASES.length)]);
  }, []);

  if (!charge || !state.onboarded) {
    return <div className="ecran"><h2>Chargement…</h2></div>;
  }

  const niveau = getNiveau(state.classe);
  const prog = niveauJardinier(state.xp);
  const compagnon = getCompagnon(state.compagnon);
  const total = totalEtoiles(state.etoiles);
  const nbDebloques = COMPAGNONS.filter((c) => estDebloque(c, state.etoiles)).length;

  return (
    <div className="ecran">
      <h1><em>Le potager des</em>Tables</h1>

      <div className="profil">
        <div>
          <div className="salut">Bonjour {state.prenom} !</div>
          <div className="jardinier">{prog.titre} · niveau {prog.niveau}</div>
        </div>
        <button className="badge-classe" onClick={() => router.push('/reglages')}>
          {niveau.emoji} {niveau.label}
        </button>
      </div>
      <div className="xp-barre" aria-hidden="true"><div style={{ width: `${Math.round(prog.ratio * 100)}%` }} /></div>

      <div className="accueil-mascotte">
        <Mascotte animalId={state.compagnon} />
        <div className="bulle">
          <b>{compagnon.nom}</b><br />
          {phrase}
        </div>
      </div>

      <button className="btn" onClick={() => router.push('/potager')}>
        <span className="rond">🌸</span>
        <span>Mon potager<small>Apprendre et s'entraîner</small></span>
      </button>

      <button className="btn jaune" onClick={() => router.push('/defi')}>
        <span className="rond">⚡</span>
        <span>Défi du chrono<small>{niveau.duree} secondes, tes tables</small></span>
      </button>

      <button className="btn pale" onClick={() => router.push('/amis')}>
        <span className="rond">🦊</span>
        <span>Mes amis<small>{nbDebloques}/{COMPAGNONS.length} compagnons · {total} ⭐</small></span>
      </button>

      <button className="btn pale" onClick={() => router.push('/reglages')}>
        <span className="rond">⚙️</span>
        <span>Réglages<small>Prénom et classe</small></span>
      </button>
    </div>
  );
}
