import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGame } from '../context/GameContext';
import Mascotte from '../components/Mascotte';

const DUREE = 60;

function melanger(tableau) {
  const copie = [...tableau];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copie[i], copie[j]] = [copie[j], copie[i]];
  }
  return copie;
}

function genererQuestion() {
  const table = Math.floor(Math.random() * 10) + 1;
  const n = Math.floor(Math.random() * 10) + 1;
  const bonneReponse = table * n;
  const propositions = new Set([bonneReponse]);
  const ecarts = [table, -table, table * 2, -table * 2, 1, -1, 2, -2];
  while (propositions.size < 4) {
    const candidat = bonneReponse + ecarts[Math.floor(Math.random() * ecarts.length)];
    if (candidat > 0) propositions.add(candidat);
  }
  return { table, n, bonneReponse, propositions: melanger([...propositions]) };
}

export default function Defi() {
  const router = useRouter();
  const { state, saveState } = useGame();
  const scoreRef = useRef(0);
  const termineRef = useRef(false);

  const [secondes, setSecondes] = useState(DUREE);
  const [score, setScore] = useState(0);
  const [question, setQuestion] = useState(() => genererQuestion());
  const [etatMascotte, setEtatMascotte] = useState('attente');
  const [verrouille, setVerrouille] = useState(false);
  const [choixSelectionne, setChoixSelectionne] = useState(null);
  const [resultat, setResultat] = useState(null);

  useEffect(() => { scoreRef.current = score; }, [score]);

  useEffect(() => {
    const id = setInterval(() => {
      setSecondes(s => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (secondes === 0 && !termineRef.current) {
      termineRef.current = true;
      const record = Math.max(state.meilleurChrono || 0, scoreRef.current);
      saveState({ ...state, meilleurChrono: record });
      setResultat({ score: scoreRef.current, record });
    }
  }, [secondes]);

  const rejouer = () => {
    termineRef.current = false;
    scoreRef.current = 0;
    setScore(0);
    setSecondes(DUREE);
    setQuestion(genererQuestion());
    setEtatMascotte('attente');
    setVerrouille(false);
    setChoixSelectionne(null);
    setResultat(null);
  };

  const repondre = (proposition) => {
    if (verrouille || secondes === 0) return;
    setVerrouille(true);
    setChoixSelectionne(proposition);
    const correct = proposition === question.bonneReponse;
    if (correct) setScore(s => s + 1);
    setEtatMascotte(correct ? 'joie' : 'oups');

    setTimeout(() => {
      setQuestion(genererQuestion());
      setChoixSelectionne(null);
      setEtatMascotte('attente');
      setVerrouille(false);
    }, 350);
  };

  if (resultat) {
    return (
      <div className="ecran">
        <h2>Défi terminé !</h2>
        <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
          <Mascotte animalId={state.compagnon} etatReponse="joie" />
        </div>
        <p style={{ textAlign: 'center', fontFamily: "'Fredoka',sans-serif", fontSize: 48, color: 'var(--feuille-fonce)', margin: '6px 0 0' }}>
          {resultat.score}
        </p>
        <p style={{ textAlign: 'center', fontWeight: 800, fontSize: 15, margin: '0 0 4px' }}>bonnes réponses en 60 secondes</p>
        <p style={{ textAlign: 'center', fontWeight: 700, fontSize: 13, opacity: .7 }}>
          Meilleur score : {resultat.record}
        </p>
        <button className="btn jaune" onClick={rejouer} style={{ marginTop: 20 }}>Rejouer</button>
        <button className="btn pale" onClick={() => router.push('/')}>Retour à l'accueil</button>
      </div>
    );
  }

  return (
    <div className="ecran">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <h2>Défi du chrono</h2>
        <span style={{
          fontFamily: "'Fredoka',sans-serif", fontSize: 26, fontWeight: 600,
          color: secondes <= 10 ? 'var(--coquelicot)' : 'var(--feuille-fonce)'
        }}>
          {secondes}s
        </span>
      </div>
      <div className="progress">
        <div style={{ width: `${(secondes / DUREE) * 100}%`, background: secondes <= 10 ? 'var(--coquelicot)' : 'var(--feuille)' }} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', margin: '4px 0 6px' }}>
        <Mascotte animalId={state.compagnon} etatReponse={etatMascotte} />
      </div>
      <div style={{ textAlign: 'center', fontWeight: 800, fontSize: 13, opacity: .7, marginBottom: 4 }}>
        Score : {score}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${question.table}-${question.n}-${secondes}`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.15 }}
        >
          <div className="question">{question.table} × {question.n} = ?</div>
          <div className="reponses">
            {question.propositions.map(p => {
              let classe = 'reponse';
              if (verrouille && p === question.bonneReponse) classe += ' correcte';
              else if (verrouille && p === choixSelectionne) classe += ' fausse';
              return (
                <button key={p} className={classe} onClick={() => repondre(p)} disabled={verrouille}>
                  {p}
                </button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      <button className="btn pale" onClick={() => router.push('/')} style={{ marginTop: 'auto' }}>
        Abandonner
      </button>
    </div>
  );
}
