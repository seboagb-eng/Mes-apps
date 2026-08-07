import { useRouter } from 'next/router';
import { useGame } from '../context/GameContext';

export default function Potager() {
  const router = useRouter();
  const { state } = useGame();
  const tables = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  return (
    <div className="ecran">
      <h2>Mon potager</h2>
      <p style={{fontSize: 14, fontWeight: 600, opacity: 0.75}}>Choisis une parcelle à cultiver</p>

      <div className="parcelles">
        {tables.map(t => (
          <button key={t} className="parcelle" onClick={() => router.push(`/jeu/${t}`)}>
            <span>table de</span>
            <b style={{color: '#2E9E5B'}}>{t}</b>
            <div style={{marginTop: 6, fontSize: 10, fontWeight: 900, opacity: 0.6}}>
              Étoiles: {state.etoiles[t] || 0}/3
            </div>
          </button>
        ))}
      </div>

      <button className="btn pale" onClick={() => router.push('/')} style={{marginTop: 'auto'}}>
        Retour à l'accueil
      </button>
    </div>
  );
}
