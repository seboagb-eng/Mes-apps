import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useGame } from '../context/GameContext';
import Mascotte from '../components/Mascotte';
import { getNiveau } from '../lib/niveaux';
import { getCompagnon, COMPAGNONS, totalEtoiles, estDebloque } from '../lib/compagnons';
import { niveauExplorateur } from '../lib/progression';

const PHRASES = [
  'On part explorer les tables ?',
  'Viens récolter des étoiles !',
  'On s’entraîne un peu ?',
  'Prêt pour une nouvelle expédition ?',
];

export default function Accueil() {
  const router = useRouter();
  const { state, charge, enregistrerVisite } = useGame();
  const [phrase, setPhrase] = useState(PHRASES[0]);

  useEffect(() => {
    if (charge && !state.onboarded) router.replace('/bienvenue');
  }, [charge, state.onboarded, router]);

  useEffect(() => {
    if (charge && state.onboarded) enregistrerVisite();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [charge]);

  useEffect(() => {
    setPhrase(PHRASES[Math.floor(Math.random() * PHRASES.length)]);
  }, []);

  if (!charge || !state.onboarded) {
    return <div className="ecran"><h2>Chargement…</h2></div>;
  }

  const niveau = getNiveau(state.classe);
  const prog = niveauExplorateur(state.xp);
  const compagnon = getCompagnon(state.compagnon);
  const total = totalEtoiles(state.etoiles);
  const nbDebloques = COMPAGNONS.filter((c) => estDebloque(c, state.etoiles)).length;

  return (
    <div className="ecran">
      <h1><em>L'expédition des</em>Tables</h1>

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

      {state.serieJours > 0 && (
        <div className="streak">🔥 {state.serieJours} jour{state.serieJours > 1 ? 's' : ''} d'affilée</div>
      )}

      <div className="accueil-mascotte">
        <Mascotte animalId={state.compagnon} />
        <div className="bulle">
          <b>{compagnon.nom}</b><br />
          {phrase}
        </div>
      </div>

      <button className="btn" onClick={() => router.push('/carte')}>
        <span className="rond">🗺️</span>
        <span>Explorer la jungle<small>Apprendre et s'entraîner</small></span>
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
