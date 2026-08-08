import { useRouter } from 'next/router';
import { useGame } from '../context/GameContext';
import Mascotte from '../components/Mascotte';
import { COMPAGNONS, totalEtoiles, estDebloque } from '../lib/compagnons';

export default function Amis() {
  const router = useRouter();
  const { state, setProfil } = useGame();
  const total = totalEtoiles(state.etoiles);

  const choisir = (id) => setProfil({ compagnon: id });

  return (
    <div className="ecran">
      <h2>Mes amis</h2>
      <p className="sous-titre">Gagne des étoiles pour rallier de nouveaux compagnons d'expédition · {total} ⭐</p>

      <div className="cartes-amis">
        {COMPAGNONS.map((c) => {
          const debloque = estDebloque(c, state.etoiles);
          const actif = state.compagnon === c.id;
          return (
            <button
              key={c.id}
              className={`carte-ami ${debloque ? '' : 'verrouille'} ${actif ? 'actif' : ''}`}
              onClick={() => debloque && choisir(c.id)}
              disabled={!debloque}
            >
              <div className="carte-ami-img">
                <Mascotte animalId={c.id} etatReponse={debloque ? 'attente' : 'attente'} />
                {!debloque && <div className="cadenas">🔒</div>}
              </div>
              <b>{c.nom}</b>
              <span>{c.espece}</span>
              {debloque ? (
                actif ? <span className="etiquette">Choisi ✓</span> : <span className="etiquette pale">Choisir</span>
              ) : (
                <span className="etiquette pale">{c.seuil} ⭐ (encore {c.seuil - total})</span>
              )}
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
