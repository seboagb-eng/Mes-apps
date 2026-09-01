import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGame } from '../context/GameContext';
import Mascotte from '../components/Mascotte';
import { getNiveau } from '../lib/niveaux';
import { genererQuestionAleatoire } from '../lib/questions';
import { XP } from '../lib/progression';
import { sonBon, sonMauvais, sonVictoire } from '../lib/sons';

export default function Defi() {
  const router = useRouter();
  const { state, enregistrerChrono } = useGame();
  const niveau = getNiveau(state.classe);
  const DUREE = niveau.duree;

  const scoreRef = useRef(0);
  const termineRef = useRef(false);

  const [secondes, setSecondes] = useState(DUREE);
  const [score, setScore] = useState(0);
  const [serie, setSerie] = useState(0);
  const [meilleureSerie, setMeilleureSerie] = useState(0);
  const [question, setQuestion] = useState(() => genererQuestionAleatoire(niveau.tables, niveau.maxN));
  const [etatMascotte, setEtatMascotte] = useState('attente');
  const [verrouille, setVerrouille] = useState(false);
  const [choixSelectionne, setChoixSelectionne] = useState(null);
  const [resultat, setResultat] = useState(null);

  useEffect(() => { scoreRef.current = score; }, [score]);

  // Corrige la durée si la classe est chargée après le premier rendu (avant de commencer).
  useEffect(() => {
    if (!termineRef.current && scoreRef.current === 0) setSecondes(DUREE);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [DUREE]);

  useEffect(() => {
    const id = setInterval(() => setSecondes((s) => (s <= 1 ? 0 : s - 1)), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (secondes === 0 && !termineRef.current) {
      termineRef.current = true;
      const score = scoreRef.current;
      const xpGagnee = score * XP.bonneReponseChrono;
      const record = Math.max(state.meilleurChrono?.[niveau.id] || 0, score);
      enregistrerChrono(niveau.id, score, xpGagnee);
      sonVictoire(state.son);
      setResultat({ score, record, xp: xpGagnee });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondes]);

  const rejouer = () => {
    termineRef.current = false;
    scoreRef.current = 0;
    setScore(0);
    setSerie(0);
    setMeilleureSerie(0);
    setSecondes(DUREE);
    setQuestion(genererQuestionAleatoire(niveau.tables, niveau.maxN));
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
    if (correct) {
      setScore((s) => s + 1);
      setSerie((s) => {
        const suivante = s + 1;
        setMeilleureSerie((m) => Math.max(m, suivante));
        return suivante;
      });
    } else {
      setSerie(0);
    }
    setEtatMascotte(correct ? 'joie' : 'oups');
    if (correct) sonBon(state.son); else sonMauvais(state.son);

    setTimeout(() => {
      setQuestion(genererQuestionAleatoire(niveau.tables, niveau.maxN));
      setChoixSelectionne(null);
      setEtatMascotte('attente');
      setVerrouille(false);
    }, 350);
  };

  if (resultat) {
    return (
      <div className="ecran">
        <h2>Défi terminé !</h2>
        <div style={{ display: 'flex', justifyContent: 'center', margin: '16px 0' }}>
          <Mascotte animalId={state.compagnon} etatReponse="joie" />
        </div>
        <p style={{ textAlign: 'center', fontFamily: "'Fredoka',sans-serif", fontSize: 48, color: 'var(--feuille-fonce)', margin: '6px 0 0' }}>
          {resultat.score}
        </p>
        <p style={{ textAlign: 'center', fontWeight: 800, fontSize: 15, margin: '0 0 4px' }}>
          bonnes réponses en {DUREE} secondes
        </p>
        <p style={{ textAlign: 'center', fontWeight: 700, fontSize: 13, opacity: 0.7 }}>
          Meilleure série : {meilleureSerie} 🔥 · +{resultat.xp} XP
        </p>
        <p style={{ textAlign: 'center', fontWeight: 700, fontSize: 13, opacity: 0.7 }}>
          Record ({niveau.label}) : {resultat.record}
        </p>
        <button className="btn jaune" onClick={rejouer} style={{ marginTop: 16 }}>Rejouer</button>
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
          color: secondes <= 10 ? 'var(--coquelicot)' : 'var(--feuille-fonce)',
        }}>
          {secondes}s
        </span>
      </div>
      <div className="progress">
        <div style={{ width: `${(secondes / DUREE) * 100}%`, background: secondes <= 10 ? 'var(--coquelicot)' : 'var(--feuille)' }} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', margin: '4px 0 4px' }}>
        <Mascotte animalId={state.compagnon} etatReponse={etatMascotte} />
      </div>
      <div className="score-ligne">
        <span>Score : {score}</span>
        {serie >= 3 && <span className="combo">Série {serie} 🔥</span>}
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

      <button className="btn pale" onClick={() => router.push('/')} style={{ marginTop: 'auto' }}>
        Abandonner
      </button>
    </div>
  );
}
