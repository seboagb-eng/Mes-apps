/*
 * app.js — Application (routeur, vues, séance guidée, statistiques).
 * PWA 100 % locale : aucune donnée ne quitte le téléphone.
 */

/* ------------------------- utilitaires ------------------------- */
const $app = document.getElementById("app");
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });

/* Séance en cours (mémoire vive) */
let SEANCE = null;   // { cle, nom, debut, exercices:[{id, nom, machine, series:[{poids,reps,fait}]}] }
let TIMER = null;    // { restant, total, ref }

/* ------------------------- routeur ------------------------- */
function route() {
  Store.charger();
  if (!Store.data.profil) return vueOnboarding();

  const h = location.hash.replace(/^#\/?/, "");
  const [vue, param] = h.split("/");

  switch (vue) {
    case "":            vueAccueil(); break;
    case "programme":   vueProgramme(); break;
    case "seance":      param ? vueSeanceActive(param) : vueChoixSeance(); break;
    case "exercices":   param ? vueExerciceDetail(param) : vueBibliotheque(); break;
    case "progres":     vueProgres(); break;
    case "reglages":    vueReglages(); break;
    default:            vueAccueil();
  }
  majNav(vue);
  window.scrollTo(0, 0);
}

function majNav(vue) {
  document.querySelectorAll(".nav-item").forEach((a) =>
    a.classList.toggle("actif", a.dataset.nav === (vue || "accueil")));
}
function aller(hash) { location.hash = hash; }

/* ============================================================ *
 *  ONBOARDING
 * ============================================================ */
function vueOnboarding() {
  document.querySelector(".nav-bas")?.setAttribute("hidden", "");
  const objs = Object.entries(OBJECTIFS).map(([k, o]) => `
    <button class="carte-choix" data-champ="objectif" data-val="${k}">
      <span class="emoji">${o.emoji}</span>
      <strong>${o.nom}</strong><span class="muted">${o.desc}</span>
    </button>`).join("");
  const nivs = Object.entries(NIVEAUX).map(([k, n]) => `
    <button class="carte-choix" data-champ="niveau" data-val="${k}">
      <strong>${n.nom}</strong><span class="muted">${n.desc}</span>
    </button>`).join("");
  const jours = [2, 3, 4, 5, 6].map((j) => `
    <button class="pilule" data-champ="jours" data-val="${j}">${j} j</button>`).join("");

  $app.innerHTML = `
  <div class="onb">
    <header class="onb-hero">
      <div class="logo-badge">BF</div>
      <h1>Ton Coach Basic Fit</h1>
      <p class="muted">Un programme sur mesure, tes machines, ton suivi. En quelques secondes.</p>
    </header>

    <section class="onb-step">
      <label class="onb-label">1 · Comment tu t'appelles ?</label>
      <input id="onb-prenom" class="champ" type="text" placeholder="Ton prénom" maxlength="20" autocomplete="given-name">
    </section>

    <section class="onb-step">
      <label class="onb-label">2 · Ton objectif principal</label>
      <div class="grille-2">${objs}</div>
    </section>

    <section class="onb-step">
      <label class="onb-label">3 · Ton niveau</label>
      <div class="grille-1">${nivs}</div>
    </section>

    <section class="onb-step">
      <label class="onb-label">4 · Combien de jours par semaine ?</label>
      <div class="pilules">${jours}</div>
    </section>

    <button id="onb-valider" class="btn-primaire btn-bloc" disabled>Créer mon programme 🚀</button>
  </div>`;

  const choix = { objectif: null, niveau: null, jours: null };
  $app.querySelectorAll(".carte-choix, .pilule").forEach((b) => {
    b.addEventListener("click", () => {
      const c = b.dataset.champ;
      $app.querySelectorAll(`[data-champ="${c}"]`).forEach((x) => x.classList.remove("choisi"));
      b.classList.add("choisi");
      choix[c] = b.dataset.val;
      verif();
    });
  });
  const prenom = $app.querySelector("#onb-prenom");
  prenom.addEventListener("input", verif);
  function verif() {
    $app.querySelector("#onb-valider").disabled =
      !(prenom.value.trim() && choix.objectif && choix.niveau && choix.jours);
  }
  $app.querySelector("#onb-valider").addEventListener("click", () => {
    const profil = {
      prenom: prenom.value.trim(),
      objectif: choix.objectif,
      niveau: Number(choix.niveau),
      jours: Number(choix.jours),
    };
    Store.definirProfil(profil);
    Store.definirProgramme(Coach.genererProgramme(profil));
    document.querySelector(".nav-bas")?.removeAttribute("hidden");
    aller("#/");
  });
}

/* ============================================================ *
 *  ACCUEIL (tableau de bord)
 * ============================================================ */
function vueAccueil() {
  document.querySelector(".nav-bas")?.removeAttribute("hidden");
  const p = Store.data.profil;
  const prog = Store.data.programme;
  const prochaine = Coach.prochaineSeance(prog, Store.data.historique);
  const streak = Store.streak();
  const semaine = Store.seancesCetteSemaine();
  const total = Store.data.historique.length;

  const heure = new Date().getHours();
  const salut = heure < 12 ? "Bonjour" : heure < 18 ? "Bon après-midi" : "Bonsoir";

  $app.innerHTML = `
    <header class="topbar">
      <div>
        <p class="muted">${salut},</p>
        <h1>${esc(p.prenom)} 👋</h1>
      </div>
      <a href="#/reglages" class="rond">⚙️</a>
    </header>

    <div class="stats-ligne">
      ${carteStat("🔥", streak, "jours d'affilée")}
      ${carteStat("📅", `${semaine}/${p.jours}`, "cette semaine")}
      ${carteStat("🏆", total, "séances au total")}
    </div>

    <section class="bloc">
      <h2 class="titre-section">Ta prochaine séance</h2>
      ${prochaine ? `
      <div class="carte-seance-hero">
        <div class="cs-head">
          <span class="badge">${esc(prochaine.focus)}</span>
          <span class="muted">${prochaine.ex.length} exercices</span>
        </div>
        <h3>${esc(prochaine.nom)}</h3>
        <div class="cs-apercu">
          ${prochaine.ex.slice(0, 4).map((e) => `<span class="chip">${esc(EX_PAR_ID[e.id]?.machine || e.nom)}</span>`).join("")}
          ${prochaine.ex.length > 4 ? `<span class="chip chip-plus">+${prochaine.ex.length - 4}</span>` : ""}
        </div>
        <button class="btn-primaire btn-bloc" data-go="#/seance/${prochaine.cle}">Démarrer la séance ▶</button>
      </div>` : `<p class="muted">Aucun programme. <a href="#/programme">En créer un</a>.</p>`}
    </section>

    <section class="bloc">
      <div class="astuce">
        <span class="astuce-ico">💡</span>
        <div><strong>Conseil du coach</strong><p class="muted">${esc(Coach.conseilDuJour())}</p></div>
      </div>
    </section>

    ${total ? `
    <section class="bloc">
      <h2 class="titre-section">Dernières séances</h2>
      <div class="liste">
        ${Store.data.historique.slice(0, 3).map((s) => `
        <div class="ligne-histo">
          <div><strong>${esc(s.seanceNom)}</strong><span class="muted"> · ${fmtDate(s.date)}</span></div>
          <span class="muted">${Store.volumeTotal(s)} kg · ${s.duree || "?"} min</span>
        </div>`).join("")}
      </div>
    </section>` : ""}
  `;
  lierBoutonsGo();
}

function carteStat(ico, val, lib) {
  return `<div class="stat"><span class="stat-ico">${ico}</span>
    <strong class="stat-val">${val}</strong><span class="stat-lib">${lib}</span></div>`;
}

/* ============================================================ *
 *  PROGRAMME
 * ============================================================ */
function vueProgramme() {
  const prog = Store.data.programme;
  const p = Store.data.profil;
  $app.innerHTML = `
    <header class="topbar"><h1>Mon programme</h1></header>
    <div class="carte-info">
      <strong>${esc(prog?.resume || "")}</strong>
      <p class="muted">Généré par ton coach selon ton objectif. Tu peux le régénérer à tout moment.</p>
    </div>
    <div class="liste">
      ${(prog?.seances || []).map((s) => `
        <div class="carte-jour">
          <div class="cj-head">
            <span class="badge">${esc(s.focus)}</span>
          </div>
          <h3>${esc(s.nom)}</h3>
          <ul class="cj-ex">
            ${s.ex.map((e) => `<li>
              <span class="cj-mach">${esc(EX_PAR_ID[e.id]?.machine || e.nom)}</span>
              <span class="muted">${e.series}× ${esc(e.reps)}</span>
            </li>`).join("")}
          </ul>
          <button class="btn-secondaire btn-bloc" data-go="#/seance/${s.cle}">Faire cette séance</button>
        </div>`).join("")}
    </div>
    <button id="regen" class="btn-fantome btn-bloc">↻ Régénérer le programme</button>
    <div class="espace-nav"></div>
  `;
  lierBoutonsGo();
  $app.querySelector("#regen").addEventListener("click", () => {
    Store.definirProgramme(Coach.genererProgramme(p));
    vueProgramme();
    toast("Nouveau programme généré ✅");
  });
}

/* ============================================================ *
 *  CHOIX DE SÉANCE
 * ============================================================ */
function vueChoixSeance() {
  const prog = Store.data.programme;
  $app.innerHTML = `
    <header class="topbar"><h1>Séance</h1></header>
    <p class="muted sous-titre">Choisis la séance du jour.</p>
    <div class="liste">
      ${(prog?.seances || []).map((s) => `
        <button class="carte-seance-choix" data-go="#/seance/${s.cle}">
          <div>
            <span class="badge">${esc(s.focus)}</span>
            <h3>${esc(s.nom)}</h3>
            <span class="muted">${s.ex.length} exercices</span>
          </div>
          <span class="fleche">▶</span>
        </button>`).join("")}
    </div>
    <div class="espace-nav"></div>
  `;
  lierBoutonsGo();
}

/* ============================================================ *
 *  SÉANCE ACTIVE (guidée)
 * ============================================================ */
function vueSeanceActive(cle) {
  const prog = Store.data.programme;
  const modele = prog.seances.find((s) => s.cle === cle) || prog.seances[0];

  // (re)démarre la séance si nécessaire
  if (!SEANCE || SEANCE.cle !== cle) {
    SEANCE = {
      cle: modele.cle,
      nom: modele.nom,
      debut: Date.now(),
      exercices: modele.ex.map((e) => {
        const last = Store.derniereCharge(e.id);
        const nb = Number(e.series) || 1;
        return {
          id: e.id, nom: e.nom, machine: e.machine, cible: `${e.series}× ${e.reps}`,
          repos: e.repos,
          series: Array.from({ length: nb }, () => ({
            poids: last?.poids ?? "", reps: last?.reps ?? "", fait: false,
          })),
        };
      }),
    };
  }
  rendreSeance();
}

function rendreSeance() {
  const totalSeries = SEANCE.exercices.reduce((n, e) => n + e.series.length, 0);
  const faites = SEANCE.exercices.reduce((n, e) => n + e.series.filter((s) => s.fait).length, 0);
  const pct = Math.round((faites / totalSeries) * 100);

  $app.innerHTML = `
    <header class="topbar seance-top">
      <button class="rond" id="quitter">✕</button>
      <div class="seance-titre"><h1>${esc(SEANCE.nom)}</h1>
        <span class="muted" id="chrono">00:00</span></div>
      <div class="rond rond-plein">${pct}%</div>
    </header>
    <div class="barre-progress"><div style="width:${pct}%"></div></div>

    <div class="liste seance-liste">
      ${SEANCE.exercices.map((ex, i) => carteExerciceSeance(ex, i)).join("")}
    </div>

    <button id="terminer" class="btn-primaire btn-bloc">Terminer la séance ✅</button>
    <div class="espace-nav espace-nav-xl"></div>
    <div id="zone-timer"></div>
  `;

  // chrono
  majChrono();
  if (window._chronoRef) clearInterval(window._chronoRef);
  window._chronoRef = setInterval(majChrono, 1000);

  // interactions séries
  $app.querySelectorAll("[data-set]").forEach((row) => {
    const [i, j] = row.dataset.set.split(":").map(Number);
    const inputs = row.querySelectorAll("input");
    inputs[0].addEventListener("input", (e) => { SEANCE.exercices[i].series[j].poids = e.target.value; });
    inputs[1].addEventListener("input", (e) => { SEANCE.exercices[i].series[j].reps = e.target.value; });
    row.querySelector(".chk").addEventListener("click", () => validerSerie(i, j));
  });
  // lien vers fiche exercice
  $app.querySelectorAll("[data-fiche]").forEach((b) =>
    b.addEventListener("click", () => aller("#/exercices/" + b.dataset.fiche)));

  $app.querySelector("#quitter").addEventListener("click", () => {
    if (confirm("Quitter la séance ? Ta progression en cours sera perdue.")) {
      arreterTimer(); clearInterval(window._chronoRef); SEANCE = null; aller("#/");
    }
  });
  $app.querySelector("#terminer").addEventListener("click", terminerSeance);
}

function carteExerciceSeance(ex, i) {
  const meta = EX_PAR_ID[ex.id];
  return `
  <div class="carte-ex-seance">
    <div class="ces-head" data-fiche="${ex.id}">
      ${artExercice(meta?.art)}
      <div class="ces-info">
        <h3>${esc(ex.nom)}</h3>
        <span class="muted">🏋️ ${esc(ex.machine)} · objectif ${esc(ex.cible)}</span>
      </div>
      <span class="fleche">›</span>
    </div>
    <div class="series">
      <div class="serie-entete"><span>Série</span><span>Poids (kg)</span><span>Reps</span><span></span></div>
      ${ex.series.map((s, j) => `
      <div class="serie-ligne ${s.fait ? "faite" : ""}" data-set="${i}:${j}">
        <span class="serie-num">${j + 1}</span>
        <input type="number" inputmode="decimal" value="${s.poids}" placeholder="—" min="0" step="0.5">
        <input type="number" inputmode="numeric" value="${s.reps}" placeholder="—" min="0">
        <button class="chk">${s.fait ? "✓" : ""}</button>
      </div>`).join("")}
    </div>
  </div>`;
}

function validerSerie(i, j) {
  const s = SEANCE.exercices[i].series[j];
  s.fait = !s.fait;
  const declenche = s.fait;
  if (s.fait && (s.poids !== "" || s.reps !== ""))
    Store.memoriserCharge(SEANCE.exercices[i].id, Number(s.poids) || 0, Number(s.reps) || 0);
  // on re-rend d'abord la liste, PUIS on (re)lance le minuteur pour qu'il
  // ne soit pas effacé par le rendu (la zone timer est recréée vide).
  rendreSeance();
  if (declenche) {
    const repos = SEANCE.exercices[i].repos || 0;
    if (repos > 0) lancerTimer(repos);
    else feedback();
  }
}

function terminerSeance() {
  const faites = SEANCE.exercices
    .map((e) => ({ id: e.id, series: e.series.filter((s) => s.fait) }))
    .filter((e) => e.series.length);
  if (!faites.length && !confirm("Aucune série validée. Enregistrer quand même ?")) return;

  const duree = Math.max(1, Math.round((Date.now() - SEANCE.debut) / 60000));
  Store.ajouterSeance({
    date: new Date().toISOString(),
    cle: SEANCE.cle,
    seanceNom: SEANCE.nom,
    exercices: faites,
    duree,
  });
  arreterTimer(); clearInterval(window._chronoRef);
  const vol = Store.volumeTotal({ exercices: faites });
  SEANCE = null;
  aller("#/");
  setTimeout(() => toast(`Séance enregistrée 💪 ${vol} kg soulevés en ${duree} min`), 100);
}

function majChrono() {
  if (!SEANCE) return;
  const s = Math.floor((Date.now() - SEANCE.debut) / 1000);
  const el = document.getElementById("chrono");
  if (el) el.textContent =
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

/* ------------------------- MINUTEUR DE REPOS ------------------------- */
function lancerTimer(sec) {
  arreterTimer();
  TIMER = { restant: sec, total: sec };
  rendreTimer();
  TIMER.ref = setInterval(() => {
    TIMER.restant--;
    if (TIMER.restant <= 0) { feedback(); arreterTimer(); return; }
    rendreTimer();
  }, 1000);
}
function arreterTimer() {
  if (TIMER?.ref) clearInterval(TIMER.ref);
  TIMER = null;
  const z = document.getElementById("zone-timer");
  if (z) z.innerHTML = "";
}
function rendreTimer() {
  const z = document.getElementById("zone-timer");
  if (!z || !TIMER) return;
  const pct = 100 - (TIMER.restant / TIMER.total) * 100;
  z.innerHTML = `
    <div class="timer-repos">
      <div class="tr-anneau" style="--pct:${pct}%">
        <span>${TIMER.restant}s</span>
      </div>
      <div class="tr-txt"><strong>Repos</strong><span class="muted">Prépare la série suivante</span></div>
      <div class="tr-actions">
        <button id="tr-plus">+15s</button>
        <button id="tr-skip">Passer</button>
      </div>
    </div>`;
  z.querySelector("#tr-plus").addEventListener("click", () => { TIMER.restant += 15; TIMER.total += 15; rendreTimer(); });
  z.querySelector("#tr-skip").addEventListener("click", arreterTimer);
}

/* Son + vibration en fin de repos */
function feedback() {
  const r = Store.data.reglages;
  if (r.vibration && navigator.vibrate) navigator.vibrate([120, 60, 120]);
  if (r.son) {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.frequency.value = 880; o.type = "sine";
      g.gain.setValueAtTime(0.001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      o.start(); o.stop(ctx.currentTime + 0.5);
    } catch (e) { /* audio indisponible */ }
  }
}

/* ============================================================ *
 *  BIBLIOTHÈQUE D'EXERCICES
 * ============================================================ */
function vueBibliotheque() {
  const groupes = {
    push: "Poussée", pull: "Tirage", jambes: "Jambes",
    epaules: "Épaules", core: "Abdos / Gainage", cardio: "Cardio",
  };
  $app.innerHTML = `
    <header class="topbar"><h1>Exercices</h1></header>
    <input id="rech" class="champ champ-rech" type="search" placeholder="🔎 Rechercher un exercice ou une machine…">
    <div class="filtres" id="filtres">
      <button class="pilule choisi" data-f="tous">Tous</button>
      ${Object.entries(groupes).map(([k, v]) => `<button class="pilule" data-f="${k}">${v}</button>`).join("")}
    </div>
    <div class="grille-ex" id="grille-ex"></div>
    <div class="espace-nav"></div>
  `;
  let filtre = "tous", recherche = "";
  const grille = $app.querySelector("#grille-ex");
  function rendre() {
    const items = EXERCICES.filter((e) =>
      (filtre === "tous" || e.groupe === filtre) &&
      (e.nom.toLowerCase().includes(recherche) || e.machine.toLowerCase().includes(recherche)));
    grille.innerHTML = items.length ? items.map((e) => `
      <button class="carte-ex-lib" data-go="#/exercices/${e.id}">
        ${artExercice(e.art)}
        <div class="cel-info">
          <strong>${esc(e.nom)}</strong>
          <span class="muted">${esc(e.machine)}</span>
          <div class="tags">${e.primaires.map((m) => `<span class="tag">${esc(MUSCLES[m]?.nom || m)}</span>`).join("")}</div>
        </div>
      </button>`).join("") : `<p class="muted">Aucun exercice trouvé.</p>`;
    lierBoutonsGo();
  }
  rendre();
  $app.querySelector("#rech").addEventListener("input", (e) => { recherche = e.target.value.toLowerCase().trim(); rendre(); });
  $app.querySelectorAll("#filtres .pilule").forEach((b) =>
    b.addEventListener("click", () => {
      $app.querySelectorAll("#filtres .pilule").forEach((x) => x.classList.remove("choisi"));
      b.classList.add("choisi"); filtre = b.dataset.f; rendre();
    }));
}

function vueExerciceDetail(id) {
  const e = EX_PAR_ID[id];
  if (!e) return aller("#/exercices");
  const muscles = (arr) => arr.map((m) => `<span class="tag">${esc(MUSCLES[m]?.nom || m)}</span>`).join("") || "—";
  $app.innerHTML = `
    <header class="topbar"><button class="rond" onclick="history.back()">‹</button><h1 class="titre-fiche">${esc(e.nom)}</h1></header>

    <div class="fiche-art">${artExercice(e.art)}</div>

    <div class="carte-info fiche-meta">
      <div class="fm-ligne"><span class="muted">Machine</span><strong>${esc(e.machine)}</strong></div>
      <div class="fm-ligne"><span class="muted">Zone</span><strong>${esc(e.zone)}</strong></div>
      <div class="fm-ligne"><span class="muted">Recommandé</span><strong>${e.series}× ${esc(e.reps)} · repos ${e.repos ? e.repos + "s" : "—"}</strong></div>
    </div>

    <section class="bloc">
      <h2 class="titre-section">Muscles travaillés</h2>
      <div class="carte-muscles">${carteMuscles(e.primaires, e.secondaires)}</div>
      <div class="legende-muscles">
        <span><i class="pt pt-p"></i> Principaux : ${muscles(e.primaires)}</span>
        <span><i class="pt pt-s"></i> Secondaires : ${e.secondaires.length ? muscles(e.secondaires) : "—"}</span>
      </div>
    </section>

    <section class="bloc">
      <h2 class="titre-section">✅ Conseils d'exécution</h2>
      <ul class="liste-puces">${e.conseils.map((c) => `<li>${esc(c)}</li>`).join("")}</ul>
    </section>

    <section class="bloc">
      <h2 class="titre-section">⚠️ Erreurs à éviter</h2>
      <ul class="liste-puces liste-erreurs">${e.erreurs.map((c) => `<li>${esc(c)}</li>`).join("")}</ul>
    </section>
    <div class="espace-nav"></div>
  `;
}

/* ============================================================ *
 *  PROGRÈS
 * ============================================================ */
function vueProgres() {
  const h = Store.data.historique;
  if (!h.length) {
    $app.innerHTML = `<header class="topbar"><h1>Progrès</h1></header>
      <div class="vide"><span class="vide-ico">📈</span>
      <p class="muted">Pas encore de données. Termine ta première séance pour voir ta progression !</p>
      <button class="btn-primaire" data-go="#/seance">Commencer une séance</button></div>`;
    lierBoutonsGo();
    return;
  }
  // volume par semaine (8 dernières)
  const semaines = volumeParSemaine(h, 8);
  // exercices suivis (ceux avec le plus d'historique)
  const exSuivis = [...new Set(h.flatMap((s) => s.exercices.map((e) => e.id)))]
    .map((id) => ({ id, n: Store.progressionExercice(id).length }))
    .sort((a, b) => b.n - a.n).slice(0, 5);

  $app.innerHTML = `
    <header class="topbar"><h1>Progrès</h1></header>

    <div class="stats-ligne">
      ${carteStat("🏋️", h.length, "séances")}
      ${carteStat("🔥", Store.streak(), "jours d'affilée")}
      ${carteStat("⚖️", totalVolume(h).toLocaleString("fr-FR"), "kg soulevés")}
    </div>

    <section class="bloc">
      <h2 class="titre-section">Volume par semaine</h2>
      <div class="carte-graph">${graphBarres(semaines)}</div>
    </section>

    <section class="bloc">
      <h2 class="titre-section">Progression par exercice</h2>
      <div class="liste">
        ${exSuivis.map((x) => {
          const data = Store.progressionExercice(x.id);
          const meta = EX_PAR_ID[x.id];
          const max = Math.max(...data.map((d) => d.poidsMax));
          const prem = data[0]?.poidsMax || 0;
          const gain = max - prem;
          return `<div class="carte-prog">
            <div class="cp-head">
              <strong>${esc(meta?.nom || x.id)}</strong>
              <span class="badge ${gain > 0 ? "badge-vert" : ""}">${gain > 0 ? "+" : ""}${gain} kg</span>
            </div>
            ${graphLigne(data)}
            <span class="muted">Record : ${max} kg</span>
          </div>`;
        }).join("")}
      </div>
    </section>
    <div class="espace-nav"></div>
  `;
  lierBoutonsGo();
}

function totalVolume(h) { return h.reduce((n, s) => n + Store.volumeTotal(s), 0); }

function volumeParSemaine(h, n) {
  const semaines = [];
  const maintenant = new Date();
  const jour = (maintenant.getDay() + 6) % 7;
  const lundiActuel = new Date(maintenant);
  lundiActuel.setDate(maintenant.getDate() - jour); lundiActuel.setHours(0, 0, 0, 0);
  for (let i = n - 1; i >= 0; i--) {
    const debut = new Date(lundiActuel); debut.setDate(lundiActuel.getDate() - i * 7);
    const fin = new Date(debut); fin.setDate(debut.getDate() + 7);
    const vol = h.filter((s) => { const d = new Date(s.date); return d >= debut && d < fin; })
      .reduce((a, s) => a + Store.volumeTotal(s), 0);
    semaines.push({ label: fmtDate(debut.toISOString()), vol });
  }
  return semaines;
}

/* Graphique en barres (SVG) */
function graphBarres(data) {
  const w = 300, hh = 130, pad = 22;
  const max = Math.max(1, ...data.map((d) => d.vol));
  const bw = (w - pad * 2) / data.length;
  const barres = data.map((d, i) => {
    const h = (d.vol / max) * (hh - pad * 2);
    const x = pad + i * bw + bw * 0.15;
    const y = hh - pad - h;
    return `<rect x="${x}" y="${y}" width="${bw * 0.7}" height="${Math.max(1, h)}" rx="3" fill="url(#grad)"/>
      <text x="${x + bw * 0.35}" y="${hh - 6}" class="g-lbl" text-anchor="middle">${d.label}</text>`;
  }).join("");
  return `<svg viewBox="0 0 ${w} ${hh}" class="graph" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ff7a3c"/><stop offset="1" stop-color="#ff5a1f"/></linearGradient></defs>
    ${barres}</svg>`;
}

/* Graphique en ligne (SVG) */
function graphLigne(data) {
  if (data.length < 2) return `<div class="mini-vide muted">Fais cet exercice plusieurs fois pour voir la courbe.</div>`;
  const w = 280, hh = 60, pad = 6;
  const vals = data.map((d) => d.poidsMax);
  const min = Math.min(...vals), max = Math.max(...vals);
  const rg = max - min || 1;
  const pts = data.map((d, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2);
    const y = hh - pad - ((d.poidsMax - min) / rg) * (hh - pad * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const aire = `${pad},${hh - pad} ${pts.join(" ")} ${w - pad},${hh - pad}`;
  return `<svg viewBox="0 0 ${w} ${hh}" class="graph-ligne" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
    <polygon points="${aire}" fill="rgba(255,90,31,.15)"/>
    <polyline points="${pts.join(" ")}" fill="none" stroke="#ff5a1f" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
    ${pts.map((p) => { const [x, y] = p.split(","); return `<circle cx="${x}" cy="${y}" r="2.6" fill="#ff5a1f"/>`; }).join("")}
  </svg>`;
}

/* ============================================================ *
 *  RÉGLAGES
 * ============================================================ */
function vueReglages() {
  const p = Store.data.profil, r = Store.data.reglages;
  $app.innerHTML = `
    <header class="topbar"><h1>Réglages</h1></header>
    <div class="carte-info">
      <div class="fm-ligne"><span class="muted">Prénom</span><strong>${esc(p.prenom)}</strong></div>
      <div class="fm-ligne"><span class="muted">Objectif</span><strong>${OBJECTIFS[p.objectif]?.emoji} ${esc(OBJECTIFS[p.objectif]?.nom)}</strong></div>
      <div class="fm-ligne"><span class="muted">Niveau</span><strong>${esc(NIVEAUX[p.niveau]?.nom)}</strong></div>
      <div class="fm-ligne"><span class="muted">Jours / semaine</span><strong>${p.jours}</strong></div>
    </div>

    <section class="bloc">
      <h2 class="titre-section">Séance</h2>
      <label class="switch-ligne"><span>🔊 Son de fin de repos</span>
        <input type="checkbox" id="r-son" ${r.son ? "checked" : ""}></label>
      <label class="switch-ligne"><span>📳 Vibration</span>
        <input type="checkbox" id="r-vib" ${r.vibration ? "checked" : ""}></label>
    </section>

    <section class="bloc">
      <button id="modif-profil" class="btn-secondaire btn-bloc">Modifier mon profil / objectif</button>
      <button id="reset" class="btn-fantome btn-bloc danger">Réinitialiser l'application</button>
    </section>
    <p class="muted note-bas">Tes données restent sur ton téléphone. L'app fonctionne 100 % hors ligne.</p>
    <div class="espace-nav"></div>
  `;
  $app.querySelector("#r-son").addEventListener("change", (e) => { Store.data.reglages.son = e.target.checked; Store.sauver(); });
  $app.querySelector("#r-vib").addEventListener("change", (e) => { Store.data.reglages.vibration = e.target.checked; Store.sauver(); });
  $app.querySelector("#modif-profil").addEventListener("click", () => {
    if (confirm("Refaire la configuration ? Ton historique sera conservé.")) {
      Store.data.profil = null; Store.sauver(); route();
    }
  });
  $app.querySelector("#reset").addEventListener("click", () => {
    if (confirm("Tout effacer (profil, programme, historique) ? Action irréversible.")) {
      Store.reinitialiser(); route();
    }
  });
}

/* ------------------------- helpers UI ------------------------- */
function lierBoutonsGo() {
  $app.querySelectorAll("[data-go]").forEach((b) =>
    b.addEventListener("click", () => aller(b.dataset.go)));
}
function toast(msg) {
  const t = document.createElement("div");
  t.className = "toast"; t.textContent = msg;
  document.body.appendChild(t);
  requestAnimationFrame(() => t.classList.add("on"));
  setTimeout(() => { t.classList.remove("on"); setTimeout(() => t.remove(), 300); }, 2600);
}

/* ------------------------- démarrage ------------------------- */
window.addEventListener("hashchange", route);
window.addEventListener("DOMContentLoaded", route);
route();

/* enregistrement du service worker */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () =>
    navigator.serviceWorker.register("./sw.js").catch(() => {}));
}
