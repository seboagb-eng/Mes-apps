# Coach Basic Fit 🏋️

**Ton coach de musculation personnel pour la salle Basic Fit.**
Une application web installable (PWA) qui génère un programme sur mesure,
te guide pendant tes séances sur les machines Basic Fit, minute tes temps
de repos, illustre les muscles travaillés et suit ta progression.

> S'inspire des meilleures applis de coaching (programmes adaptatifs façon
> **Fitbod**, journal de séance façon **Strong**, guidage façon **Freeletics**),
> mais dédiée à **ta salle Basic Fit** et **100 % hors ligne**.

## ✨ Fonctionnalités

- **Onboarding express** — prénom, objectif (muscle, perte de gras, force,
  forme), niveau, jours/semaine.
- **Programme généré automatiquement** — le coach choisit le bon découpage
  (Full Body, Push/Pull/Legs, Upper/Lower) selon tes jours dispo, et adapte
  séries / répétitions / repos à ton objectif et ton niveau.
- **Séance guidée** — chaque exercice avec sa machine Basic Fit, saisie des
  charges série par série, cases à cocher, chrono de séance et
  **minuteur de repos** (son + vibration) qui se lance tout seul.
- **Bibliothèque d'exercices** — ~30 exercices (machines guidées, poulies,
  poids libres, cardio) avec **illustration de la machine**, **carte
  anatomique des muscles travaillés**, conseils d'exécution et erreurs à
  éviter.
- **Suivi de progression** — streak, séances/semaine, volume total,
  graphique de volume hebdomadaire et courbes de charge par exercice.
- **Mémoire des charges** — la dernière charge utilisée est pré-remplie à la
  séance suivante.
- **Minuteur de repos robuste** — décompte basé sur l'horloge (juste même en
  arrière-plan ou écran verrouillé), option *garder l'écran allumé*
  (Wake Lock) et *notification de fin de repos*.
- **Photos de progression** — galerie avant/après (avec poids et date),
  stockées localement via IndexedDB, images compressées automatiquement.
- **Affluence de la salle** — estimation horaire de la fréquentation type sur
  la semaine (heatmap), meilleurs créneaux et heures à éviter.
- **Sauvegarde export / import** — exporte tes données (profil, programme,
  historique, charges) en fichier JSON et réimporte-les sur un autre téléphone.
- **100 % hors ligne & privé** — tout est stocké sur ton téléphone
  (localStorage + IndexedDB). Aucune donnée n'est envoyée nulle part.

## 📲 Installation sur le téléphone

1. Ouvre l'application dans ton navigateur (`.../basicfit-coach/`).
2. **iPhone (Safari)** : bouton *Partager* → *Sur l'écran d'accueil*.
   **Android (Chrome)** : menu ⋮ → *Ajouter à l'écran d'accueil*.
3. Lance-la depuis l'icône : elle s'ouvre en plein écran comme une vraie app,
   et fonctionne même sans réseau (pratique dans une salle en sous-sol).

## 🧱 Technique

PWA sans dépendance ni build : HTML/CSS/JavaScript vanilla.

| Fichier | Rôle |
|---|---|
| `index.html` | Structure + navigation |
| `css/styles.css` | Thème sombre, couleurs Basic Fit |
| `js/data.js` | Base d'exercices, muscles, modèles de séances |
| `js/illustrations.js` | Illustrations SVG (carte des muscles + machines) |
| `js/coach.js` | Génération du programme (le « cerveau ») |
| `js/store.js` | État & sauvegarde locale, statistiques, export/import |
| `js/photos.js` | Photos de progression (IndexedDB + compression) |
| `js/app.js` | Routeur, vues, séance guidée, minuteur, graphiques |
| `sw.js` | Service Worker (offline-first) |

## ⚠️ Avertissement

Cette application est un outil d'aide à l'entraînement. Elle ne remplace pas
l'avis d'un professionnel. Écoute ton corps, échauffe-toi, et consulte un
médecin en cas de doute avant de reprendre le sport.
