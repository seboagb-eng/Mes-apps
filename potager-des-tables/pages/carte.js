import { useRouter } from 'next/router';
import { useGame } from '../context/GameContext';
import { getNiveau } from '../lib/niveaux';

// Progression d'une zone : inexplorée → traces → sentier → trésor.
const TRACES = ['❔', '🐾', '🌴', '🏆'];

export default function Carte() {
  const router = useRouter();
  const { state } = useGame();
  const niveau = getNiveau(state.classe);

  return (
    <div className="ecran">
      <h2>La jungle des tables</h2>
      <p className="sous-titre">Classe {niveau.label} · choisis une zone à explorer</p>

      <div className="parcelles">
        {niveau.tables.map((t) => {
          const e = state.etoiles[t] || 0;
          return (
            <button key={t} className="parcelle" onClick={() => router.push(`/jeu/${t}`)}>
              <span>zone</span>
              <b>{t}</b>
              <div className="plante" aria-hidden="true">{TRACES[e]}</div>
              <div className="mini-etoiles">
                {'★'.repeat(e)}{'☆'.repeat(3 - e)}
              </div>
            </button>
          );
        })}
      </div>

      <button className="btn pale" onClick={() => router.push('/')} style={{ marginTop: 'auto' }}>
        Retour au campement
      </button>
    </div>
  );
}
