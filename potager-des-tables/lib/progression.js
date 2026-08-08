// Progression du « jardinier » : les XP gagnées en jouant font monter de niveau,
// avec un titre à chaque palier. Donne un fil rouge motivant au-delà des étoiles.

export const XP_PAR_NIVEAU = 100;

const TITRES = ['Graine', 'Pousse', 'Bourgeon', 'Fleur', 'Jardinier', 'Maître jardinier'];

export function niveauJardinier(xp = 0) {
  const niveau = Math.floor(xp / XP_PAR_NIVEAU) + 1;
  const titre = TITRES[Math.min(niveau - 1, TITRES.length - 1)];
  const dansNiveau = xp % XP_PAR_NIVEAU;
  return { niveau, titre, dansNiveau, pourMonter: XP_PAR_NIVEAU, ratio: dansNiveau / XP_PAR_NIVEAU };
}

// Gains d'XP centralisés pour rester cohérents partout.
export const XP = {
  bonneReponse: 10,
  bonusSansFaute: 50,
  bonneReponseChrono: 5,
};
