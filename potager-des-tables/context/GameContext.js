import { createContext, useContext, useState, useEffect } from 'react';

const GameContext = createContext();

export function GameProvider({ children }) {
  const [state, setState] = useState({
    nom: 'Lilia',
    classe: 'ce2',
    xp: 0,
    etoiles: { 2: 1, 3: 3, 5: 2 },
    compagnon: 'uno',
    amis: ['uno', 'youmi', 'jazz']
  });

  useEffect(() => {
    const saved = localStorage.getItem('potager-tables-next');
    if (saved) setState(JSON.parse(saved));
  }, []);

  const saveState = (newState) => {
    setState(newState);
    localStorage.setItem('potager-tables-next', JSON.stringify(newState));
  };

  return (
    <GameContext.Provider value={{ state, saveState }}>
      {children}
    </GameContext.Provider>
  );
}

export const useGame = () => useContext(GameContext);
