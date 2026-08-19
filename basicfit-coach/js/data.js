/*
 * data.js — Base de connaissances du coach
 * Muscles, exercices (machines Basic Fit) et modèles de programmes.
 * Tout est en français, sans dépendance externe.
 */

/* ------------------------------------------------------------------ *
 * Groupes musculaires (clés utilisées par la carte anatomique)
 * ------------------------------------------------------------------ */
const MUSCLES = {
  pectoraux:  { nom: "Pectoraux",   face: "avant" },
  epaules:    { nom: "Épaules",     face: "avant" },
  biceps:     { nom: "Biceps",      face: "avant" },
  triceps:    { nom: "Triceps",     face: "arriere" },
  avantbras:  { nom: "Avant-bras",  face: "avant" },
  abdominaux: { nom: "Abdominaux",  face: "avant" },
  obliques:   { nom: "Obliques",    face: "avant" },
  dorsaux:    { nom: "Dorsaux",     face: "arriere" },
  trapezes:   { nom: "Trapèzes",    face: "arriere" },
  lombaires:  { nom: "Lombaires",   face: "arriere" },
  quadriceps: { nom: "Quadriceps",  face: "avant" },
  ischios:    { nom: "Ischio-jambiers", face: "arriere" },
  fessiers:   { nom: "Fessiers",    face: "arriere" },
  mollets:    { nom: "Mollets",     face: "arriere" },
  adducteurs: { nom: "Adducteurs",  face: "avant" },
  abducteurs: { nom: "Abducteurs",  face: "avant" },
};

/* ------------------------------------------------------------------ *
 * Exercices — chaque entrée correspond à une machine / mouvement
 * disponible dans une salle Basic Fit.
 *   groupe : push | pull | jambes | epaules | core | cardio
 *   art    : clé d'illustration (voir illustrations.js)
 * ------------------------------------------------------------------ */
const EXERCICES = [
  /* ---------- POUSSÉE (pectoraux / triceps / épaules) ---------- */
  {
    id: "chest-press", nom: "Développé pectoraux (machine)",
    machine: "Chest Press", zone: "Machines guidées", groupe: "push",
    primaires: ["pectoraux"], secondaires: ["triceps", "epaules"],
    niveau: 1, series: 4, reps: "10-12", repos: 75, art: "chest-press",
    conseils: [
      "Règle le siège pour que les poignées soient à hauteur de poitrine.",
      "Pousse en expirant, contrôle le retour en 2-3 secondes.",
      "Garde les omoplates serrées et le dos plaqué au dossier.",
    ],
    erreurs: ["Verrouiller brutalement les coudes", "Décoller les fesses du siège"],
  },
  {
    id: "pec-deck", nom: "Écarté / Butterfly (Pec Deck)",
    machine: "Pec Deck", zone: "Machines guidées", groupe: "push",
    primaires: ["pectoraux"], secondaires: ["epaules"],
    niveau: 1, series: 3, reps: "12-15", repos: 60, art: "pec-deck",
    conseils: [
      "Coudes légèrement fléchis et fixes pendant tout le mouvement.",
      "Serre les pectoraux 1 seconde au centre.",
      "Amplitude complète sans forcer l'ouverture des épaules.",
    ],
    erreurs: ["Tendre complètement les bras", "Aller trop loin en arrière"],
  },
  {
    id: "incline-db-press", nom: "Développé incliné haltères",
    machine: "Bancs + haltères", zone: "Poids libres", groupe: "push",
    primaires: ["pectoraux", "epaules"], secondaires: ["triceps"],
    niveau: 2, series: 4, reps: "8-12", repos: 90, art: "dumbbell",
    conseils: [
      "Banc incliné à 30°, ni plus (sinon ça devient un exercice d'épaules).",
      "Descends les haltères au niveau du haut des pectoraux.",
      "Ne cogne pas les haltères en haut, garde de la tension.",
    ],
    erreurs: ["Cambrer excessivement", "Descendre trop bas et forcer l'épaule"],
  },
  {
    id: "shoulder-press", nom: "Développé épaules (machine)",
    machine: "Shoulder Press", zone: "Machines guidées", groupe: "epaules",
    primaires: ["epaules"], secondaires: ["triceps"],
    niveau: 1, series: 4, reps: "10-12", repos: 75, art: "shoulder-press",
    conseils: [
      "Poignées à hauteur d'épaules au départ.",
      "Pousse vers le haut sans hausser les épaules vers les oreilles.",
      "Garde les abdos gainés pour protéger le bas du dos.",
    ],
    erreurs: ["Bloquer la respiration", "Arquer le dos pour tricher"],
  },
  {
    id: "lateral-raise", nom: "Élévations latérales (haltères)",
    machine: "Haltères", zone: "Poids libres", groupe: "epaules",
    primaires: ["epaules"], secondaires: [],
    niveau: 1, series: 3, reps: "12-15", repos: 60, art: "dumbbell",
    conseils: [
      "Lève les bras jusqu'à l'horizontale, pas plus haut.",
      "Coudes légèrement fléchis, mène le mouvement avec les coudes.",
      "Charge légère : la propreté prime sur le poids.",
    ],
    erreurs: ["Balancer le corps (élan)", "Charge trop lourde"],
  },
  {
    id: "triceps-pushdown", nom: "Extension triceps à la poulie",
    machine: "Poulie haute", zone: "Poulies (câbles)", groupe: "push",
    primaires: ["triceps"], secondaires: [],
    niveau: 1, series: 3, reps: "12-15", repos: 60, art: "cable",
    conseils: [
      "Coudes collés au corps, seuls les avant-bras bougent.",
      "Tends complètement les bras et serre le triceps en bas.",
      "Contrôle la remontée, ne laisse pas la charge te tirer.",
    ],
    erreurs: ["Écarter les coudes", "Utiliser le buste pour pousser"],
  },
  {
    id: "dips-assist", nom: "Dips (machine assistée)",
    machine: "Assisted Dip/Pull-up", zone: "Machines guidées", groupe: "push",
    primaires: ["pectoraux", "triceps"], secondaires: ["epaules"],
    niveau: 2, series: 3, reps: "8-12", repos: 75, art: "pull-up",
    conseils: [
      "Choisis une assistance qui te permet 8 à 12 reps propres.",
      "Descends jusqu'à ce que les coudes soient à 90°.",
      "Penche-toi légèrement en avant pour cibler les pectoraux.",
    ],
    erreurs: ["Descendre trop bas (douleur épaule)", "Rebondir en bas"],
  },

  /* ---------- TIRAGE (dos / biceps) ---------- */
  {
    id: "lat-pulldown", nom: "Tirage vertical (Lat Pulldown)",
    machine: "Lat Pulldown", zone: "Poulies (câbles)", groupe: "pull",
    primaires: ["dorsaux"], secondaires: ["biceps", "trapezes"],
    niveau: 1, series: 4, reps: "10-12", repos: 75, art: "lat-pulldown",
    conseils: [
      "Prise un peu plus large que les épaules.",
      "Tire la barre vers le haut de la poitrine, coudes vers le bas.",
      "Pense à 'ranger les omoplates dans les poches arrière'.",
    ],
    erreurs: ["Tirer derrière la nuque", "Se balancer en arrière"],
  },
  {
    id: "seated-row", nom: "Tirage horizontal (Rowing assis)",
    machine: "Seated Row", zone: "Poulies (câbles)", groupe: "pull",
    primaires: ["dorsaux"], secondaires: ["biceps", "trapezes"],
    niveau: 1, series: 4, reps: "10-12", repos: 75, art: "seated-row",
    conseils: [
      "Dos droit, poitrine haute, tire vers le nombril.",
      "Serre les omoplates en fin de mouvement.",
      "Évite de te pencher en arrière pour tirer plus lourd.",
    ],
    erreurs: ["Arrondir le dos", "Tirer avec les bras seulement"],
  },
  {
    id: "pull-up-assist", nom: "Traction (machine assistée)",
    machine: "Assisted Dip/Pull-up", zone: "Machines guidées", groupe: "pull",
    primaires: ["dorsaux"], secondaires: ["biceps"],
    niveau: 2, series: 3, reps: "6-10", repos: 90, art: "pull-up",
    conseils: [
      "Prise pronation (paumes vers l'avant), largeur d'épaules.",
      "Monte jusqu'à ce que le menton dépasse la barre.",
      "Réduis l'assistance au fil des semaines pour progresser.",
    ],
    erreurs: ["Amplitude partielle", "Donner un coup de jambes"],
  },
  {
    id: "face-pull", nom: "Face pull (poulie)",
    machine: "Poulie", zone: "Poulies (câbles)", groupe: "pull",
    primaires: ["epaules", "trapezes"], secondaires: ["dorsaux"],
    niveau: 2, series: 3, reps: "15-20", repos: 60, art: "cable",
    conseils: [
      "Corde à hauteur du visage, tire vers le front.",
      "Écarte les mains en fin de mouvement (rotation externe).",
      "Excellent pour la santé et la posture des épaules.",
    ],
    erreurs: ["Charge trop lourde", "Tirer vers le bas au lieu du visage"],
  },
  {
    id: "biceps-curl", nom: "Curl biceps (haltères)",
    machine: "Haltères", zone: "Poids libres", groupe: "pull",
    primaires: ["biceps"], secondaires: ["avantbras"],
    niveau: 1, series: 3, reps: "10-12", repos: 60, art: "dumbbell",
    conseils: [
      "Coudes fixes le long du corps.",
      "Monte en contractant, descends en contrôlant sur 2-3 s.",
      "Ne balance pas le buste pour lancer la charge.",
    ],
    erreurs: ["Élan du dos", "Amplitude incomplète"],
  },
  {
    id: "cable-curl", nom: "Curl à la poulie basse",
    machine: "Poulie basse", zone: "Poulies (câbles)", groupe: "pull",
    primaires: ["biceps"], secondaires: ["avantbras"],
    niveau: 1, series: 3, reps: "12-15", repos: 60, art: "cable",
    conseils: [
      "Tension constante : la poulie garde le muscle sous charge.",
      "Coudes immobiles, serre en haut.",
      "Idéal en finisher de séance dos/biceps.",
    ],
    erreurs: ["Reculer les coudes", "Utiliser le dos"],
  },

  /* ---------- JAMBES ---------- */
  {
    id: "leg-press", nom: "Presse à cuisses (Leg Press)",
    machine: "Leg Press", zone: "Machines guidées", groupe: "jambes",
    primaires: ["quadriceps", "fessiers"], secondaires: ["ischios"],
    niveau: 1, series: 4, reps: "10-12", repos: 90, art: "leg-press",
    conseils: [
      "Pieds largeur d'épaules au milieu du plateau.",
      "Descends jusqu'à 90° aux genoux, ne les verrouille pas en haut.",
      "Genoux alignés avec les pointes de pieds, jamais rentrés.",
    ],
    erreurs: ["Décoller le bas du dos", "Amplitude trop courte"],
  },
  {
    id: "leg-extension", nom: "Extension des jambes (Leg Extension)",
    machine: "Leg Extension", zone: "Machines guidées", groupe: "jambes",
    primaires: ["quadriceps"], secondaires: [],
    niveau: 1, series: 3, reps: "12-15", repos: 60, art: "leg-extension",
    conseils: [
      "Règle le dossier pour que l'axe soit aligné avec le genou.",
      "Tends les jambes et serre le quadriceps 1 s en haut.",
      "Contrôle la descente, ne laisse pas retomber la charge.",
    ],
    erreurs: ["À-coups en haut", "Charge trop lourde qui casse la posture"],
  },
  {
    id: "leg-curl", nom: "Leg curl (ischio-jambiers)",
    machine: "Leg Curl", zone: "Machines guidées", groupe: "jambes",
    primaires: ["ischios"], secondaires: ["mollets"],
    niveau: 1, series: 3, reps: "10-12", repos: 75, art: "leg-curl",
    conseils: [
      "Coussin juste au-dessus du talon d'Achille.",
      "Ramène les talons vers les fesses, contrôle le retour.",
      "Ne décolle pas le bassin du support.",
    ],
    erreurs: ["Cambrer le dos", "Mouvement partiel"],
  },
  {
    id: "squat-smith", nom: "Squat (Smith machine)",
    machine: "Smith Machine", zone: "Machines guidées", groupe: "jambes",
    primaires: ["quadriceps", "fessiers"], secondaires: ["ischios", "lombaires"],
    niveau: 2, series: 4, reps: "8-12", repos: 120, art: "smith",
    conseils: [
      "Pieds légèrement avancés, barre sur le haut du dos.",
      "Descends en poussant les hanches vers l'arrière, dos droit.",
      "Vise la cuisse parallèle au sol si ta mobilité le permet.",
    ],
    erreurs: ["Genoux qui rentrent", "Talons qui décollent"],
  },
  {
    id: "hip-thrust", nom: "Hip thrust (fessiers)",
    machine: "Banc + barre / Smith", zone: "Poids libres", groupe: "jambes",
    primaires: ["fessiers"], secondaires: ["ischios"],
    niveau: 2, series: 3, reps: "10-12", repos: 90, art: "barbell",
    conseils: [
      "Haut du dos calé sur le banc, barre sur les hanches (mousse).",
      "Monte le bassin jusqu'à l'alignement épaules-hanches-genoux.",
      "Serre fort les fessiers 1 seconde en haut.",
    ],
    erreurs: ["Hyperextension du bas du dos", "Menton en arrière"],
  },
  {
    id: "abductor", nom: "Machine abducteurs (extérieur cuisses)",
    machine: "Abductor", zone: "Machines guidées", groupe: "jambes",
    primaires: ["abducteurs", "fessiers"], secondaires: [],
    niveau: 1, series: 3, reps: "15-20", repos: 45, art: "abductor",
    conseils: [
      "Ouvre les jambes en contrôlant, sans à-coup.",
      "Léger buste en avant pour cibler le moyen fessier.",
      "Tempo lent, la contraction prime sur la charge.",
    ],
    erreurs: ["Relâcher brutalement", "Charge trop lourde"],
  },
  {
    id: "adductor", nom: "Machine adducteurs (intérieur cuisses)",
    machine: "Adductor", zone: "Machines guidées", groupe: "jambes",
    primaires: ["adducteurs"], secondaires: [],
    niveau: 1, series: 3, reps: "15-20", repos: 45, art: "abductor",
    conseils: [
      "Ferme les jambes en serrant l'intérieur des cuisses.",
      "Contrôle l'ouverture pour un bon étirement.",
      "Amplitude confortable, sans forcer sur l'écartement.",
    ],
    erreurs: ["Ouvrir trop grand", "À-coups"],
  },
  {
    id: "calf-raise", nom: "Extension mollets (Calf)",
    machine: "Calf / Leg Press", zone: "Machines guidées", groupe: "jambes",
    primaires: ["mollets"], secondaires: [],
    niveau: 1, series: 4, reps: "15-20", repos: 45, art: "leg-press",
    conseils: [
      "Monte sur la pointe des pieds au maximum.",
      "Marque une pause 1 s en haut, descends en étirant.",
      "Amplitude complète : c'est la clé pour les mollets.",
    ],
    erreurs: ["Rebondir", "Amplitude courte"],
  },

  /* ---------- CORE / ABDOS ---------- */
  {
    id: "crunch-machine", nom: "Crunch abdominaux (machine)",
    machine: "Abdominal Crunch", zone: "Machines guidées", groupe: "core",
    primaires: ["abdominaux"], secondaires: [],
    niveau: 1, series: 3, reps: "15-20", repos: 45, art: "crunch",
    conseils: [
      "Enroule le buste, ne tire pas juste avec les bras.",
      "Expire en te contractant, serre les abdos.",
      "Mouvement court et contrôlé, pas d'élan.",
    ],
    erreurs: ["Tirer sur la nuque", "Aller trop vite"],
  },
  {
    id: "plank", nom: "Gainage (planche)",
    machine: "Tapis", zone: "Zone libre", groupe: "core",
    primaires: ["abdominaux"], secondaires: ["lombaires", "obliques"],
    niveau: 1, series: 3, reps: "30-45 s", repos: 45, art: "mat",
    conseils: [
      "Corps aligné : tête, dos, bassin, talons.",
      "Serre les abdos et les fessiers, respire normalement.",
      "Ne creuse pas le bas du dos.",
    ],
    erreurs: ["Bassin trop haut ou trop bas", "Bloquer la respiration"],
  },
  {
    id: "hanging-leg-raise", nom: "Relevé de jambes (abdos)",
    machine: "Chaise romaine", zone: "Machines guidées", groupe: "core",
    primaires: ["abdominaux"], secondaires: ["obliques"],
    niveau: 2, series: 3, reps: "12-15", repos: 60, art: "crunch",
    conseils: [
      "Dos plaqué au dossier, monte les genoux vers la poitrine.",
      "Enroule légèrement le bassin en fin de mouvement.",
      "Contrôle la descente, pas de balancier.",
    ],
    erreurs: ["Se balancer", "Descendre trop vite"],
  },
  {
    id: "back-extension", nom: "Extension lombaires (banc)",
    machine: "Banc à lombaires", zone: "Machines guidées", groupe: "core",
    primaires: ["lombaires"], secondaires: ["fessiers", "ischios"],
    niveau: 1, series: 3, reps: "12-15", repos: 60, art: "hyperextension",
    conseils: [
      "Descends en contrôlant, remonte jusqu'à l'alignement.",
      "Ne pars pas en hyperextension au-delà de l'horizontale.",
      "Mains sur la poitrine (débutant) ou derrière la tête (confirmé).",
    ],
    erreurs: ["Monter trop haut", "À-coups"],
  },

  /* ---------- CARDIO ---------- */
  {
    id: "treadmill", nom: "Tapis de course",
    machine: "Tapis de course", zone: "Cardio", groupe: "cardio",
    primaires: ["quadriceps", "mollets"], secondaires: ["fessiers", "ischios"],
    niveau: 1, series: 1, reps: "20-30 min", repos: 0, art: "treadmill",
    conseils: [
      "Échauffement 5 min en marche rapide puis augmente l'allure.",
      "Pour brûler : intervalles (1 min rapide / 2 min lentes).",
      "Regarde loin devant, ne t'accroche pas aux barres.",
    ],
    erreurs: ["Pente trop forte trop tôt", "S'appuyer sur la console"],
  },
  {
    id: "bike", nom: "Vélo / RPM",
    machine: "Vélo d'appartement", zone: "Cardio", groupe: "cardio",
    primaires: ["quadriceps"], secondaires: ["fessiers", "mollets"],
    niveau: 1, series: 1, reps: "20-30 min", repos: 0, art: "bike",
    conseils: [
      "Règle la selle : jambe presque tendue en bas de pédale.",
      "Cadence régulière, ajoute de la résistance progressivement.",
      "Parfait en fin de séance ou jour de récupération active.",
    ],
    erreurs: ["Selle trop basse (genoux)", "Résistance nulle"],
  },
  {
    id: "rower", nom: "Rameur",
    machine: "Rameur", zone: "Cardio", groupe: "cardio",
    primaires: ["dorsaux", "quadriceps"], secondaires: ["biceps", "fessiers"],
    niveau: 2, series: 1, reps: "10-20 min", repos: 0, art: "rower",
    conseils: [
      "Ordre : jambes → buste → bras, puis inverse au retour.",
      "Pousse d'abord avec les jambes, ce n'est pas un exercice de bras.",
      "Dos droit, mouvement fluide et puissant.",
    ],
    erreurs: ["Tirer avec les bras d'abord", "Dos arrondi"],
  },
  {
    id: "elliptical", nom: "Vélo elliptique",
    machine: "Elliptique", zone: "Cardio", groupe: "cardio",
    primaires: ["quadriceps", "fessiers"], secondaires: ["pectoraux", "dorsaux"],
    niveau: 1, series: 1, reps: "20-30 min", repos: 0, art: "elliptical",
    conseils: [
      "Mouvement complet avec les bras pour brûler plus.",
      "Buste droit, ne t'appuie pas de tout ton poids.",
      "Faible impact : idéal si tu ménages tes articulations.",
    ],
    erreurs: ["S'avachir sur les poignées fixes", "Amplitude réduite"],
  },
];

/* Index pratique par id */
const EX_PAR_ID = Object.fromEntries(EXERCICES.map((e) => [e.id, e]));

/* ------------------------------------------------------------------ *
 * Modèles de séances — briques réutilisées par le générateur.
 * On stocke des listes d'ids d'exercices par type de séance.
 * ------------------------------------------------------------------ */
const MODELES_SEANCES = {
  fullbody_a: {
    nom: "Full Body A", focus: "Corps complet",
    ex: ["leg-press", "chest-press", "lat-pulldown", "shoulder-press", "leg-curl", "crunch-machine"],
  },
  fullbody_b: {
    nom: "Full Body B", focus: "Corps complet",
    ex: ["squat-smith", "seated-row", "pec-deck", "leg-extension", "triceps-pushdown", "plank"],
  },
  fullbody_c: {
    nom: "Full Body C", focus: "Corps complet",
    ex: ["leg-press", "lat-pulldown", "incline-db-press", "abductor", "biceps-curl", "back-extension"],
  },
  push: {
    nom: "Push (Poussée)", focus: "Pectoraux · Épaules · Triceps",
    ex: ["chest-press", "shoulder-press", "incline-db-press", "pec-deck", "lateral-raise", "triceps-pushdown"],
  },
  pull: {
    nom: "Pull (Tirage)", focus: "Dos · Biceps",
    ex: ["lat-pulldown", "seated-row", "pull-up-assist", "face-pull", "biceps-curl", "cable-curl"],
  },
  legs: {
    nom: "Legs (Jambes)", focus: "Cuisses · Fessiers · Mollets",
    ex: ["leg-press", "leg-extension", "leg-curl", "hip-thrust", "abductor", "calf-raise"],
  },
  upper: {
    nom: "Haut du corps", focus: "Buste complet",
    ex: ["chest-press", "lat-pulldown", "shoulder-press", "seated-row", "biceps-curl", "triceps-pushdown"],
  },
  lower: {
    nom: "Bas du corps", focus: "Jambes · Fessiers · Abdos",
    ex: ["squat-smith", "leg-curl", "leg-extension", "hip-thrust", "calf-raise", "crunch-machine"],
  },
};

/* Objectifs proposés à l'onboarding */
const OBJECTIFS = {
  muscle:   { nom: "Prise de muscle", emoji: "💪", desc: "Développer la masse musculaire" },
  seche:    { nom: "Perte de gras",   emoji: "🔥", desc: "Brûler les graisses, se dessiner" },
  force:    { nom: "Force",           emoji: "🏋️", desc: "Devenir plus fort" },
  forme:    { nom: "Forme & santé",   emoji: "❤️", desc: "Se sentir bien, rester en forme" },
};

const NIVEAUX = {
  1: { nom: "Débutant",     desc: "0 à 6 mois de pratique" },
  2: { nom: "Intermédiaire", desc: "6 mois à 2 ans" },
  3: { nom: "Confirmé",      desc: "Plus de 2 ans" },
};
