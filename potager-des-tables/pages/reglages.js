import { useState } from 'react';
import { useRouter } from 'next/router';
import { useGame } from '../context/GameContext';
import { NIVEAUX } from '../lib/niveaux';

export default function Reglages() {
  const router = useRouter();
  const { state, setProfil } = useGame();
  const [prenom, setPrenom] = useState(state.prenom || '');
  const [classe, setClasse] = useState(state.classe || 'ce2');

  const enregistrer = () => {
    const nom = prenom.trim().slice(0, 16) || state.prenom || 'Champion';
    setProfil({ prenom: nom, classe });
    router.push('/');
  };

  return (
    <div className="ecran">
      <h2>Réglages</h2>

      <label className="champ-label" htmlFor="prenom">Prénom</label>
      <input
        id="prenom"
        className="champ"
        value={prenom}
        onChange={(e) => setPrenom(e.target.value)}
        placeholder="Ton prénom"
        maxLength={16}
        autoComplete="off"
      />

      <label className="champ-label">Classe</label>
      <div className="chips">
        {NIVEAUX.map((n) => (
          <button
            key={n.id}
            className={`chip ${classe === n.id ? 'actif' : ''}`}
            onClick={() => setClasse(n.id)}
          >
            {n.emoji} {n.label}
            <small>{n.age} · {n.tables.length} tables</small>
          </button>
        ))}
      </div>

      <label className="champ-label">Son et vibrations</label>
      <button
        className={`chip ${state.son ? 'actif' : ''}`}
        onClick={() => setProfil({ son: !state.son })}
        aria-pressed={state.son}
      >
        {state.son ? '🔊 Activés' : '🔇 Coupés'}
      </button>

      <button className="btn" onClick={enregistrer} style={{ marginTop: 16 }}>
        Enregistrer
      </button>
      <button className="btn pale" onClick={() => router.push('/')}>
        Annuler
      </button>
    </div>
  );
}
