import { useState } from 'react';
import { useRouter } from 'next/router';
import { useGame } from '../context/GameContext';
import { NIVEAUX } from '../lib/niveaux';
import Mascotte from '../components/Mascotte';

export default function Bienvenue() {
  const router = useRouter();
  const { state, setProfil } = useGame();
  const [prenom, setPrenom] = useState(state.prenom === 'Lilia' ? '' : state.prenom || '');
  const [classe, setClasse] = useState(state.classe || 'ce2');

  const valider = () => {
    const nom = prenom.trim().slice(0, 16) || 'Champion';
    setProfil({ prenom: nom, classe, onboarded: true });
    router.push('/');
  };

  return (
    <div className="ecran">
      <h1><em>L'expédition des</em>Tables</h1>

      <div style={{ display: 'flex', justifyContent: 'center', margin: '6px 0' }}>
        <Mascotte animalId="uno" etatReponse="joie" />
      </div>

      <label className="champ-label" htmlFor="prenom">Comment tu t'appelles ?</label>
      <input
        id="prenom"
        className="champ"
        value={prenom}
        onChange={(e) => setPrenom(e.target.value)}
        placeholder="Ton prénom"
        maxLength={16}
        autoComplete="off"
      />

      <label className="champ-label">Ta classe</label>
      <div className="chips">
        {NIVEAUX.map((n) => (
          <button
            key={n.id}
            className={`chip ${classe === n.id ? 'actif' : ''}`}
            onClick={() => setClasse(n.id)}
          >
            {n.emoji} {n.label}
          </button>
        ))}
      </div>

      <button className="btn" onClick={valider} style={{ marginTop: 'auto' }}>
        C'est parti ! 🌱
      </button>
    </div>
  );
}
