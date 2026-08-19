/*
 * store.js — État de l'application, persisté dans localStorage.
 * Contient : profil utilisateur, programme généré, historique des séances,
 * charges par exercice (pour proposer la dernière charge utilisée).
 */

const CLE_STOCKAGE = "basicfit-coach-v1";

const ETAT_INITIAL = {
  profil: null,          // { prenom, objectif, niveau, jours }
  programme: null,       // { seances:[{id, nom, focus, ex:[...]}], cree }
  historique: [],        // [{date, seanceNom, exercices:[{id, series:[{poids, reps}]}], duree}]
  charges: {},           // { exId: { poids, reps } } dernière charge connue
  reglages: { son: true, vibration: true },
};

const Store = {
  data: null,

  charger() {
    try {
      const brut = localStorage.getItem(CLE_STOCKAGE);
      this.data = brut ? { ...ETAT_INITIAL, ...JSON.parse(brut) } : { ...ETAT_INITIAL };
    } catch (e) {
      this.data = { ...ETAT_INITIAL };
    }
    return this.data;
  },

  sauver() {
    try {
      localStorage.setItem(CLE_STOCKAGE, JSON.stringify(this.data));
    } catch (e) {
      console.warn("Sauvegarde impossible", e);
    }
  },

  /* --- Profil & programme --- */
  definirProfil(profil) {
    this.data.profil = profil;
    this.sauver();
  },

  definirProgramme(programme) {
    this.data.programme = programme;
    this.sauver();
  },

  /* --- Charges (mémoire des poids soulevés) --- */
  derniereCharge(exId) {
    return this.data.charges[exId] || null;
  },

  memoriserCharge(exId, poids, reps) {
    this.data.charges[exId] = { poids, reps };
    this.sauver();
  },

  /* --- Historique --- */
  ajouterSeance(seance) {
    this.data.historique.unshift(seance);
    // on garde les 200 dernières séances
    if (this.data.historique.length > 200) this.data.historique.length = 200;
    this.sauver();
  },

  /* --- Statistiques calculées --- */
  volumeTotal(seance) {
    let v = 0;
    seance.exercices.forEach((ex) =>
      ex.series.forEach((s) => { v += (s.poids || 0) * (s.reps || 0); })
    );
    return Math.round(v);
  },

  /* Série de jours d'affilée avec au moins une séance (streak) */
  streak() {
    const jours = new Set(
      this.data.historique.map((s) => (s.date || "").slice(0, 10))
    );
    if (jours.size === 0) return 0;
    let n = 0;
    const d = new Date();
    // tolère un décalage : commence aujourd'hui ou hier
    const iso = (x) => x.toISOString().slice(0, 10);
    if (!jours.has(iso(d))) d.setDate(d.getDate() - 1);
    while (jours.has(iso(d))) {
      n++;
      d.setDate(d.getDate() - 1);
    }
    return n;
  },

  /* Nombre de séances cette semaine (lundi -> dimanche) */
  seancesCetteSemaine() {
    const d = new Date();
    const jour = (d.getDay() + 6) % 7; // lundi = 0
    const lundi = new Date(d);
    lundi.setDate(d.getDate() - jour);
    lundi.setHours(0, 0, 0, 0);
    return this.data.historique.filter((s) => new Date(s.date) >= lundi).length;
  },

  /* Progression d'un exercice : liste {date, poidsMax} */
  progressionExercice(exId) {
    return this.data.historique
      .filter((s) => s.exercices.some((e) => e.id === exId))
      .map((s) => {
        const ex = s.exercices.find((e) => e.id === exId);
        const poidsMax = Math.max(0, ...ex.series.map((x) => x.poids || 0));
        return { date: s.date, poidsMax };
      })
      .reverse();
  },

  reinitialiser() {
    this.data = { ...ETAT_INITIAL };
    localStorage.removeItem(CLE_STOCKAGE);
  },
};
