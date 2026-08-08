import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../../context/GameContext';
import Mascotte from '../../components/Mascotte';
import { getNiveau } from '../../lib/niveaux';
import { genererSerie, calculerEtoiles } from '../../lib/questions';
import { COMPAGNONS, getCompagnon, totalEtoiles } from '../../lib/compagnons';
import { XP } from '../../lib/progression';

const NB_QUESTIONS = 10;
const BRAVOS = ['Bravo !', 'Super !', 'Génial !', 'Bien joué !', 'Parfait !'];
const ENCOURAGE = ['Presque !', 'Essaie encore !', 'Pas grave !', 'Tu vas y arriver !'];

export default function Jeu() {
  const router = useRouter();
  const { state, enregistrerEntrainement } = useGame();
  const table = router.isReady ? Number(router.query.table) : null;
  const niveau = getNiveau(state.classe);
  const scoreRef = useRef(0);

  const [questions, setQuestions] = useState(null);
  const [index, setIndex] = useState(0);
  const [etatMascotte, setEtatMascotte] = useState('attente');
  const [message, setMessage] = useState('');
  const [verrouille, setVerrouille] = useState(false);
  const [choixSelectionne, setChoixSelectionne] = useState(null);
  const [resultat, setResultat] = useState(null);

  useEffect(() => {
    if (table) setQuestions(genererSerie([table], niveau.maxN, NB_QUESTIONS));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table]);

  if (!router.isReady || !table || !questions) {
    return <div className="ecran"><h2>Chargement…</h2></div>;
  }

  const rejouer = () => {
    scoreRef.current = 0;
    setQuestions(genererSerie([table], niveau.maxN, NB_QUESTIONS));
    setIndex(0);
    setEtatMascotte('attente');
    setMessage('');
    setVerrouille(false);
    setChoixSelectionne(null);
    setResultat(null);
  };

  if (resultat) {
    return (
      <div className="ecran">
        <h2>Table de {table} terminée !</h2>
        <div style={{ display: 'flex', justifyContent: 'center', margin: '16px 0' }}>
          <Mascotte animalId={state.compagnon} etatReponse="joie" />
        </div>
        <div style={{ textAlign: 'center', fontSize: 44, margin: '4px 0' }}>
          {'⭐'.repeat(resultat.etoiles)}{'☆'.repeat(3 - resultat.etoiles)}
        </div>
        <p style={{ textAlign: 'center', fontWeight: 800, fontSize: 16 }}>
          {resultat.score} / {questions.length} bonnes réponses
        </p>
        <p style={{ textAlign: 'center', fontWeight: 700, fontSize: 13, opacity: 0.7 }}>+{resultat.xp} XP</p>
        {resultat.debloque && (
          <div className="deblocage">
            🎉 Tu as débloqué <b>{resultat.debloque.nom}</b>, {resultat.debloque.espece} !
          </div>
        )}
        <button className="btn" onClick={rejouer} style={{ marginTop: 16 }}>Rejouer</button>
        <button className="btn pale" onClick={() => router.push('/carte')}>Retour à la carte</button>
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
    setMessage(
      correct
        ? BRAVOS[Math.floor(Math.random() * BRAVOS.length)]
        : ENCOURAGE[Math.floor(Math.random() * ENCOURAGE.length)]
    );

    setTimeout(() => {
      if (index + 1 < questions.length) {
        setIndex((i) => i + 1);
        setChoixSelectionne(null);
        setEtatMascotte('attente');
        setMessage('');
        setVerrouille(false);
      } else {
        const score = scoreRef.current;
        const etoilesGagnees = calculerEtoiles(score, questions.length);
        const etoilesRecord = Math.max(state.etoiles[table] || 0, etoilesGagnees);
        const xpGagnee = score * XP.bonneReponse + (etoilesGagnees === 3 ? XP.bonusSansFaute : 0);

        const ancienTotal = totalEtoiles(state.etoiles);
        const nouveauTotal = totalEtoiles({ ...state.etoiles, [table]: etoilesRecord });
        const debloque = COMPAGNONS.find(
          (c) => c.seuil > 0 && c.seuil > ancienTotal && c.seuil <= nouveauTotal
        );

        enregistrerEntrainement(table, etoilesGagnees, xpGagnee);
        setResultat({ score, etoiles: etoilesRecord, xp: xpGagnee, debloque });
      }
    }, 900);
  };

  return (
    <div className="ecran">
      <h2>Table de {table}</h2>
      <div className="progress"><div style={{ width: `${(index / questions.length) * 100}%` }} /></div>

      <div style={{ display: 'flex', justifyContent: 'center', margin: '4px 0 2px' }}>
        <Mascotte animalId={state.compagnon} etatReponse={etatMascotte} />
      </div>
      <div className="feedback" aria-live="polite">{message || ' '}</div>

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
            {question.propositions.map((p) => {
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

      <button className="btn pale" onClick={() => router.push('/carte')} style={{ marginTop: 'auto' }}>
        Quitter
      </button>
    </div>
  );
}
