/*
 * coach.js — Le « cerveau » du coach.
 * Génère un programme personnalisé à partir du profil (objectif, niveau,
 * jours/semaine) en piochant dans les modèles de séances, puis adapte
 * séries, répétitions et repos selon l'objectif et le niveau.
 * S'inspire des splits éprouvés (Full Body, Push/Pull/Legs, Upper/Lower).
 */

const Coach = {
  /* Choix du split selon le nombre de jours */
  splitPour(jours) {
    switch (jours) {
      case 2: return ["fullbody_a", "fullbody_b"];
      case 3: return ["fullbody_a", "fullbody_b", "fullbody_c"];
      case 4: return ["upper", "lower", "upper", "lower"];
      case 5: return ["push", "pull", "legs", "upper", "lower"];
      case 6: return ["push", "pull", "legs", "push", "pull", "legs"];
      default: return ["fullbody_a", "fullbody_b", "fullbody_c"];
    }
  },

  /* Paramètres séries/reps/repos selon objectif + niveau */
  parametres(objectif, niveau) {
    // base par objectif
    const base = {
      muscle: { series: 4, reps: "8-12", repos: 75 },
      seche:  { series: 3, reps: "12-15", repos: 45 },
      force:  { series: 5, reps: "4-6",  repos: 150 },
      forme:  { series: 3, reps: "10-12", repos: 60 },
    }[objectif] || { series: 3, reps: "10-12", repos: 60 };

    // le débutant fait moins de séries, le confirmé un peu plus
    const ajust = { 1: -1, 2: 0, 3: 1 }[niveau] || 0;
    return { ...base, series: Math.max(2, base.series + ajust) };
  },

  /* Cardio ajouté selon l'objectif */
  cardioPour(objectif) {
    if (objectif === "seche") return { id: "treadmill", minutes: "15-20 min (intervalles)" };
    if (objectif === "forme") return { id: "bike", minutes: "15 min" };
    return null;
  },

  /* Génère le programme complet */
  genererProgramme(profil) {
    const { objectif, niveau, jours } = profil;
    const split = this.splitPour(jours);
    const p = this.parametres(objectif, niveau);
    const cardio = this.cardioPour(objectif);

    const seances = split.map((cleModele, i) => {
      const modele = MODELES_SEANCES[cleModele];
      const exercices = modele.ex.map((exId) => {
        const ex = EX_PAR_ID[exId];
        return {
          id: exId,
          nom: ex.nom,
          machine: ex.machine,
          series: ex.groupe === "cardio" ? 1 : p.series,
          reps: ex.groupe === "cardio" ? ex.reps : p.reps,
          repos: ex.repos || p.repos,
        };
      });

      // finisher cardio pour sèche / forme
      if (cardio && (objectif === "seche" || (objectif === "forme" && i % 2 === 0))) {
        const c = EX_PAR_ID[cardio.id];
        exercices.push({
          id: cardio.id, nom: c.nom, machine: c.machine,
          series: 1, reps: cardio.minutes, repos: 0,
        });
      }

      return {
        jour: i + 1,
        cle: cleModele,
        nom: `Jour ${i + 1} · ${modele.nom}`,
        focus: modele.focus,
        ex: exercices,
      };
    });

    return {
      seances,
      cree: new Date().toISOString(),
      resume: this.resumeProgramme(profil, split.length),
    };
  },

  resumeProgramme(profil, nb) {
    const obj = OBJECTIFS[profil.objectif]?.nom || "";
    const niv = NIVEAUX[profil.niveau]?.nom || "";
    return `${nb} séances/semaine · ${obj} · niveau ${niv}`;
  },

  /* Prochaine séance conseillée : celle la moins récemment faite */
  prochaineSeance(programme, historique) {
    if (!programme || !programme.seances.length) return null;
    const dernieres = {};
    historique.forEach((s) => {
      if (s.cle && !dernieres[s.cle]) dernieres[s.cle] = s.date;
    });
    // celle jamais faite en priorité, sinon la plus ancienne
    let choix = programme.seances[0];
    let plusVieux = Infinity;
    for (const seance of programme.seances) {
      const d = dernieres[seance.cle];
      const t = d ? new Date(d).getTime() : -1;
      if (t < plusVieux) { plusVieux = t; choix = seance; }
    }
    return choix;
  },

  /* Petit conseil du jour (rotation) */
  conseilDuJour() {
    const conseils = [
      "Bois de l'eau régulièrement pendant ta séance 💧",
      "La régularité bat l'intensité : mieux vaut 3 séances tenues qu'une séance parfaite.",
      "Concentre-toi sur la technique avant d'ajouter du poids.",
      "Un bon échauffement de 5 min réduit fortement le risque de blessure.",
      "Le muscle grandit pendant le repos : dors suffisamment.",
      "Note tes charges : voir ta progression est ta meilleure motivation.",
      "Respire : expire pendant l'effort, inspire au retour.",
      "Mange assez de protéines (≈ 1,6 g/kg) pour construire du muscle.",
      "Progresse petit à petit : +2,5 kg quand tu réussis toutes tes séries.",
      "Ne saute pas les jambes : elles soutiennent tout le corps.",
    ];
    const jour = Math.floor(Date.now() / 86400000);
    return conseils[jour % conseils.length];
  },
};
