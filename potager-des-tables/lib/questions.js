// Génération des questions de multiplication, partagée par l'entraînement et le défi.

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
  // Filet de sécurité pour les très petits produits (peu de distracteurs possibles).
  let extra = 1;
  while (propositions.size < 4) {
    if (bonneReponse - extra > 0) propositions.add(bonneReponse - extra);
    propositions.add(bonneReponse + extra);
    extra++;
  }
  // bonneReponse est inséré en premier : slice(0,4) la conserve toujours.
  return melanger([...propositions].slice(0, 4));
}

export function genererQuestion(table, n) {
  const bonneReponse = table * n;
  return { table, n, bonneReponse, propositions: propositionsPour(bonneReponse, table) };
}

// Série d'entraînement : pour une ou plusieurs tables, multiplicandes mélangés dans 1..maxN.
export function genererSerie(tables, maxN, nb) {
  const multiplicandes = melanger(Array.from({ length: maxN }, (_, i) => i + 1));
  const total = Math.min(nb, multiplicandes.length);
  return multiplicandes.slice(0, total).map((n) => {
    const table = tables[Math.floor(Math.random() * tables.length)];
    return genererQuestion(table, n);
  });
}

// Question aléatoire (défi chrono) piochée dans les tables du niveau.
export function genererQuestionAleatoire(tables, maxN) {
  const table = tables[Math.floor(Math.random() * tables.length)];
  const n = Math.floor(Math.random() * maxN) + 1;
  return genererQuestion(table, n);
}

export function calculerEtoiles(score, total) {
  const ratio = total === 0 ? 0 : score / total;
  if (ratio >= 1) return 3;
  if (ratio >= 0.8) return 2;
  if (ratio >= 0.5) return 1;
  return 0;
}
