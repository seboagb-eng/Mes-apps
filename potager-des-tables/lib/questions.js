// Génération des questions de multiplication, partagée par l'entraînement et le défi.
// Trois types de mini-jeux : QCM, vrai/faux, et nombre manquant.

export const TYPES = ['qcm', 'vraifaux', 'trou'];

export function melanger(tableau) {
  const copie = [...tableau];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copie[i], copie[j]] = [copie[j], copie[i]];
  }
  return copie;
}

function propositionsPour(bonneReponse, table) {
  const propositions = new Set([bonneReponse]);
  const ecarts = [table, -table, table * 2, -table * 2, 1, -1, 2, -2];
  let tentatives = 0;
  while (propositions.size < 4 && tentatives < 60) {
    tentatives++;
    const candidat = bonneReponse + ecarts[Math.floor(Math.random() * ecarts.length)];
    if (candidat > 0 && candidat !== bonneReponse) propositions.add(candidat);
  }
  let extra = 1;
  while (propositions.size < 4) {
    if (bonneReponse - extra > 0) propositions.add(bonneReponse - extra);
    propositions.add(bonneReponse + extra);
    extra++;
  }
  return melanger([...propositions].slice(0, 4));
}

function produitFaux(produit, table) {
  const ecarts = [table, -table, 1, -1, 2, -2];
  for (let k = 0; k < 20; k++) {
    const c = produit + ecarts[Math.floor(Math.random() * ecarts.length)];
    if (c > 0 && c !== produit) return c;
  }
  return produit + 1;
}

function multiplicandesFaux(n, maxN) {
  const props = new Set([n]);
  const ecarts = [1, -1, 2, -2];
  let tentatives = 0;
  while (props.size < 4 && tentatives < 40) {
    tentatives++;
    const c = n + ecarts[Math.floor(Math.random() * ecarts.length)];
    if (c > 0 && c <= Math.max(maxN, 12)) props.add(c);
  }
  let extra = 3;
  while (props.size < 4) { props.add(extra); extra++; }
  return melanger([...props].slice(0, 4));
}

export function genererQuestion(table, n, maxN = 10, typesAutorises = TYPES) {
  const type = typesAutorises[Math.floor(Math.random() * typesAutorises.length)];
  const produit = table * n;

  if (type === 'vraifaux') {
    const estVrai = Math.random() < 0.5;
    const affiche = estVrai ? produit : produitFaux(produit, table);
    return { type, table, n, produit, affiche, estVrai };
  }
  if (type === 'trou') {
    return { type, table, n, produit, bonneReponse: n, propositions: multiplicandesFaux(n, maxN) };
  }
  return { type: 'qcm', table, n, produit, bonneReponse: produit, propositions: propositionsPour(produit, table) };
}

// Série d'entraînement : une ou plusieurs tables, multiplicandes mélangés dans 1..maxN, types variés.
export function genererSerie(tables, maxN, nb, typesAutorises = TYPES) {
  const multiplicandes = melanger(Array.from({ length: maxN }, (_, i) => i + 1));
  const total = Math.min(nb, multiplicandes.length);
  return multiplicandes.slice(0, total).map((n) => {
    const table = tables[Math.floor(Math.random() * tables.length)];
    return genererQuestion(table, n, maxN, typesAutorises);
  });
}

// Question aléatoire du défi chrono : QCM uniquement (rythme rapide).
export function genererQuestionAleatoire(tables, maxN) {
  const table = tables[Math.floor(Math.random() * tables.length)];
  const n = Math.floor(Math.random() * maxN) + 1;
  return genererQuestion(table, n, maxN, ['qcm']);
}

// Vérifie une réponse quel que soit le type de question.
export function estCorrect(question, valeur) {
  if (question.type === 'vraifaux') return valeur === question.estVrai;
  return valeur === question.bonneReponse;
}

export function calculerEtoiles(score, total) {
  const ratio = total === 0 ? 0 : score / total;
  if (ratio >= 1) return 3;
  if (ratio >= 0.8) return 2;
  if (ratio >= 0.5) return 1;
  return 0;
}
