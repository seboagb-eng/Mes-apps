import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../../context/GameContext';
import Mascotte from '../../components/Mascotte';

const NB_QUESTIONS = 10;

function melanger(tableau) {
  const copie = [...tableau];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copie[i], copie[j]] = [copie[j], copie[i]];
  }
  return copie;
}

function genererQuestions(table) {
  return melanger([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]).slice(0, NB_QUESTIONS).map(n => {
    const bonneReponse = table * n;
    const propositions = new Set([bonneReponse]);
    const ecarts = [table, -table, table * 2, -table * 2, 1, -1, 2, -2];
    while (propositions.size < 4) {
      const candidat = bonneReponse + ecarts[Math.floor(Math.random() * ecarts.length)];
      if (candidat > 0) propositions.add(candidat);
    }
    return { n, bonneReponse, propositions: melanger([...propositions]) };
  });
}

function calculerEtoiles(score, total) {
  const ratio = score / total;
  if (ratio === 1) return 3;
  if (ratio >= 0.8) return 2;
  if (ratio >= 0.5) return 1;
  return 0;
}

export default function Jeu() {
  const router = useRouter();
  const { state, saveState } = useGame();
  const table = router.isReady ? Number(router.query.table) : null;
  const scoreRef = useRef(0);

  const [questions, setQuestions] = useState(null);
  const [index, setIndex] = useState(0);
  const [etatMascotte, setEtatMascotte] = useState('attente');
  const [verrouille, setVerrouille] = useState(false);
  const [choixSelectionne, setChoixSelectionne] = useState(null);
  const [resultat, setResultat] = useState(null);

  useEffect(() => {
    if (table) setQuestions(genererQuestions(table));
  }, [table]);

  if (!router.isReady || !table || !questions) {
    return <div className="ecran"><h2>Chargement…</h2></div>;
  }

  const rejouer = () => {
    scoreRef.current = 0;
    setQuestions(genererQuestions(table));
    setIndex(0);
    setEtatMascotte('attente');
    setVerrouille(false);
    setChoixSelectionne(null);
    setResultat(null);
  };

  if (resultat) {
    return (
      <div className="ecran">
        <h2>Table de {table} terminée !</h2>
        <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
          <Mascotte animalId={state.compagnon} etatReponse="joie" />
        </div>
        <div style={{ textAlign: 'center', fontSize: 44, margin: '6px 0 4px' }}>
          {'⭐'.repeat(resultat.etoiles)}{'☆'.repeat(3 - resultat.etoiles)}
        </div>
        <p style={{ textAlign: 'center', fontWeight: 800, fontSize: 16 }}>
          {resultat.score} / {questions.length} bonnes réponses
        </p>
        <button className="btn" onClick={rejouer} style={{ marginTop: 20 }}>Rejouer</button>
        <button className="btn pale" onClick={() => router.push('/potager')}>Retour au potager</button>
      </div>
    );
  }

  const question = questions[index];

  const repondre = (proposition) => {
    if (verrouille) return;
    setVerrouille(true);
    setChoixSelectionne(proposition);
    const correct = proposition === question.bonneReponse;
    if (correct) scoreRef.current += 1;
    setEtatMascotte(correct ? 'joie' : 'oups');

    setTimeout(() => {
      if (index + 1 < questions.length) {
        setIndex(i => i + 1);
        setChoixSelectionne(null);
        setEtatMascotte('attente');
        setVerrouille(false);
      } else {
        const etoilesGagnees = calculerEtoiles(scoreRef.current, questions.length);
        const etoilesRecord = Math.max(state.etoiles[table] || 0, etoilesGagnees);
        saveState({ ...state, etoiles: { ...state.etoiles, [table]: etoilesRecord } });
        setResultat({ score: scoreRef.current, etoiles: etoilesRecord });
      }
    }, 900);
  };

  return (
    <div className="ecran">
      <h2>Table de {table}</h2>
      <div className="progress"><div style={{ width: `${(index / questions.length) * 100}%` }} /></div>

      <div style={{ display: 'flex', justifyContent: 'center', margin: '4px 0 10px' }}>
        <Mascotte animalId={state.compagnon} etatReponse={etatMascotte} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.2 }}
        >
          <div className="question">{table} × {question.n} = ?</div>

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

      <button className="btn pale" onClick={() => router.push('/potager')} style={{ marginTop: 'auto' }}>
        Quitter
      </button>
    </div>
  );
}
