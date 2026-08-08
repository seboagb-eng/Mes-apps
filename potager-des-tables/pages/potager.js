import { useRouter } from 'next/router';
import { useGame } from '../context/GameContext';
import { getNiveau } from '../lib/niveaux';

const PLANTES = ['·', '🌱', '🌿', '🌻'];

export default function Potager() {
  const router = useRouter();
  const { state } = useGame();
  const niveau = getNiveau(state.classe);

  return (
    <div className="ecran">
      <h2>Mon potager</h2>
      <p className="sous-titre">Classe {niveau.label} · choisis une parcelle à cultiver</p>

      <div className="parcelles">
        {niveau.tables.map((t) => {
          const e = state.etoiles[t] || 0;
          return (
            <button key={t} className="parcelle" onClick={() => router.push(`/jeu/${t}`)}>
              <span>table de</span>
              <b>{t}</b>
              <div className="plante" aria-hidden="true">{PLANTES[e]}</div>
              <div className="mini-etoiles">
                {'★'.repeat(e)}{'☆'.repeat(3 - e)}
              </div>
            </button>
          );
        })}
      </div>

      <button className="btn pale" onClick={() => router.push('/')} style={{ marginTop: 'auto' }}>
        Retour à l'accueil
      </button>
    </div>
  );
}
