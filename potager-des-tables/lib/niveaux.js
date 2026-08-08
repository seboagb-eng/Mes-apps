// Progression pédagogique par classe (Éducation nationale, tables de multiplication).
// Chaque niveau définit les tables travaillées, le multiplicande max, la durée du
// défi chrono et un emoji d'ambiance. Source unique de vérité pour tout le jeu.

export const NIVEAUX = [
  { id: 'cp',  label: 'CP',  age: '6 ans',  tables: [2, 5, 10],                          maxN: 10, duree: 45, emoji: '🌱' },
  { id: 'ce1', label: 'CE1', age: '7 ans',  tables: [2, 3, 4, 5, 10],                    maxN: 10, duree: 50, emoji: '🌿' },
  { id: 'ce2', label: 'CE2', age: '8 ans',  tables: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],     maxN: 10, duree: 60, emoji: '🌻' },
  { id: 'cm1', label: 'CM1', age: '9 ans',  tables: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], maxN: 12, duree: 60, emoji: '🌳' },
  { id: 'cm2', label: 'CM2', age: '10 ans', tables: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], maxN: 12, duree: 75, emoji: '🏆' },
];

const NIVEAU_DEFAUT = 'ce2';

export function getNiveau(id) {
  return NIVEAUX.find((n) => n.id === id) || NIVEAUX.find((n) => n.id === NIVEAU_DEFAUT);
}
