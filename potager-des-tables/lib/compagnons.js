// Les compagnons du potager. Chaque animal se débloque en récoltant des étoiles :
// une petite collection qui grandit avec l'enfant et donne envie de progresser.

export const COMPAGNONS = [
  { id: 'uno',   nom: 'Uno',   espece: 'le petit renard', seuil: 0 },
  { id: 'youmi', nom: 'Youmi', espece: 'le chat curieux',  seuil: 6 },
  { id: 'jazz',  nom: 'Jazz',  espece: 'le chien joueur',  seuil: 15 },
];

export function getCompagnon(id) {
  return COMPAGNONS.find((c) => c.id === id) || COMPAGNONS[0];
}

// Total d'étoiles récoltées, toutes tables confondues.
export function totalEtoiles(etoiles = {}) {
  return Object.values(etoiles).reduce((somme, v) => somme + (v || 0), 0);
}

export function estDebloque(compagnon, etoiles) {
  return totalEtoiles(etoiles) >= compagnon.seuil;
}
