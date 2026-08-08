import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CLE = 'potager-tables-next';

const ETAT_INITIAL = {
  prenom: 'Lilia',
  classe: 'ce2',
  compagnon: 'uno',
  xp: 0,
  etoiles: { 2: 1, 3: 3, 5: 2 },
  meilleurChrono: {}, // { [classeId]: meilleurScore }
  onboarded: false,
};

const GameContext = createContext();

export function GameProvider({ children }) {
  const [state, setState] = useState(ETAT_INITIAL);
  const [charge, setCharge] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CLE);
      if (saved) {
        const parse = JSON.parse(saved);
        setState((prev) => ({
          ...prev,
          ...parse,
          // Normalisations défensives (compatibilité anciennes sauvegardes).
          etoiles: parse.etoiles && typeof parse.etoiles === 'object' ? parse.etoiles : prev.etoiles,
          meilleurChrono:
            parse.meilleurChrono && typeof parse.meilleurChrono === 'object' ? parse.meilleurChrono : {},
          onboarded: parse.onboarded ?? true, // une sauvegarde existante = profil déjà configuré
        }));
      }
    } catch (e) {
      // Sauvegarde illisible : on garde l'état initial plutôt que de planter.
    }
    setCharge(true);
  }, []);

  const persister = useCallback((maj) => {
    setState((prev) => {
      const suivant = typeof maj === 'function' ? maj(prev) : maj;
      try {
        localStorage.setItem(CLE, JSON.stringify(suivant));
      } catch (e) {
        // Quota dépassé ou navigation privée : on ignore silencieusement.
      }
      return suivant;
    });
  }, []);

  const setProfil = useCallback(
    (profil) => persister((prev) => ({ ...prev, ...profil })),
    [persister]
  );

  const enregistrerEntrainement = useCallback(
    (table, etoilesGagnees, xpGagnee) =>
      persister((prev) => ({
        ...prev,
        xp: prev.xp + xpGagnee,
        etoiles: { ...prev.etoiles, [table]: Math.max(prev.etoiles[table] || 0, etoilesGagnees) },
      })),
    [persister]
  );

  const enregistrerChrono = useCallback(
    (classeId, score, xpGagnee) =>
      persister((prev) => ({
        ...prev,
        xp: prev.xp + xpGagnee,
        meilleurChrono: {
          ...prev.meilleurChrono,
          [classeId]: Math.max(prev.meilleurChrono?.[classeId] || 0, score),
        },
      })),
    [persister]
  );

  return (
    <GameContext.Provider
      value={{ state, charge, saveState: persister, setProfil, enregistrerEntrainement, enregistrerChrono }}
    >
      {children}
    </GameContext.Provider>
  );
}

export const useGame = () => useContext(GameContext);
