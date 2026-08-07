import { useRouter } from 'next/router';
import { useGame } from '../context/GameContext';
import Mascotte from '../components/Mascotte';

export default function Accueil() {
  const router = useRouter();
  const { state } = useGame();

  return (
    <div className="ecran">
      <h1><em>Le potager des</em>Tables</h1>

      <div style={{ display:'flex', alignItems:'center', gap:8, margin:'16px 0 24px' }}>
        <Mascotte animalId={state.compagnon} />
        <div className="bulle">
          <b>{state.compagnon.charAt(0).toUpperCase() + state.compagnon.slice(1)}</b><br />
          Prêt pour jardiner ?
        </div>
      </div>

      <button className="btn" onClick={() => router.push('/potager')}>
        <span className="rond">🌸</span>
        <span>Mon potager<small>Apprendre et s'entraîner</small></span>
      </button>

      <button className="btn jaune">
        <span className="rond">⚡</span>
        <span>Défi du chrono<small>60 secondes, toutes tes tables</small></span>
      </button>
    </div>
  );
}
