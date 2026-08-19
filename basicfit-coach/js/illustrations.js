/*
 * illustrations.js — Illustrations vectorielles (SVG) 100 % locales.
 *  - carteMuscles(primaires, secondaires) : silhouette avant + arrière
 *    avec les muscles travaillés surlignés (façon « heatmap »).
 *  - artExercice(cle) : schéma stylisé de la machine / du mouvement.
 * Aucune image externe : tout fonctionne hors ligne.
 */

const COUL = {
  os: "#5b6675",          // parties structurelles (tête, os)
  repos: "#39424e",       // muscle non sollicité
  secondaire: "#ffab6b",  // muscle secondaire
  primaire: "#ff5a1f",    // muscle principal
  trait: "#1f262e",       // contour
};

/* Renvoie la couleur d'un muscle selon son implication */
function _coul(muscle, prim, sec) {
  if (!muscle) return COUL.os;
  if (prim.includes(muscle)) return COUL.primaire;
  if (sec.includes(muscle)) return COUL.secondaire;
  return COUL.repos;
}

/* Génère une forme <path>/<rect>/<ellipse> colorée selon le muscle */
function _forme(type, attrs, muscle, prim, sec) {
  const fill = _coul(muscle, prim, sec);
  const a = Object.entries(attrs).map(([k, v]) => `${k}="${v}"`).join(" ");
  return `<${type} ${a} fill="${fill}" stroke="${COUL.trait}" stroke-width="1"/>`;
}

/* --- Silhouette VUE DE FACE --- */
function _figureAvant(prim, sec) {
  const F = (t, a, m) => _forme(t, a, m, prim, sec);
  return `
  <g>
    <!-- structure -->
    ${F("circle", { cx: 60, cy: 24, r: 14 }, null)}
    ${F("rect", { x: 54, y: 36, width: 12, height: 8, rx: 3 }, null)}
    ${F("rect", { x: 41, y: 118, width: 38, height: 16, rx: 7 }, null)}
    ${F("rect", { x: 46, y: 190, width: 13, height: 56, rx: 6 }, "mollets")}
    ${F("rect", { x: 61, y: 190, width: 13, height: 56, rx: 6 }, "mollets")}
    <!-- épaules -->
    ${F("ellipse", { cx: 36, cy: 56, rx: 12, ry: 10 }, "epaules")}
    ${F("ellipse", { cx: 84, cy: 56, rx: 12, ry: 10 }, "epaules")}
    <!-- bras avant : biceps + avant-bras -->
    ${F("rect", { x: 23, y: 58, width: 13, height: 32, rx: 6 }, "biceps")}
    ${F("rect", { x: 84, y: 58, width: 13, height: 32, rx: 6 }, "biceps")}
    ${F("rect", { x: 21, y: 90, width: 12, height: 34, rx: 6 }, "avantbras")}
    ${F("rect", { x: 87, y: 90, width: 12, height: 34, rx: 6 }, "avantbras")}
    <!-- pectoraux -->
    ${F("rect", { x: 43, y: 52, width: 16, height: 22, rx: 8 }, "pectoraux")}
    ${F("rect", { x: 61, y: 52, width: 16, height: 22, rx: 8 }, "pectoraux")}
    <!-- obliques + abdos -->
    ${F("rect", { x: 42, y: 78, width: 8, height: 30, rx: 4 }, "obliques")}
    ${F("rect", { x: 70, y: 78, width: 8, height: 30, rx: 4 }, "obliques")}
    ${F("rect", { x: 50, y: 76, width: 20, height: 34, rx: 6 }, "abdominaux")}
    <!-- hanches / cuisses -->
    ${F("rect", { x: 39, y: 132, width: 7, height: 22, rx: 3 }, "abducteurs")}
    ${F("rect", { x: 74, y: 132, width: 7, height: 22, rx: 3 }, "abducteurs")}
    ${F("rect", { x: 44, y: 134, width: 15, height: 58, rx: 7 }, "quadriceps")}
    ${F("rect", { x: 61, y: 134, width: 15, height: 58, rx: 7 }, "quadriceps")}
    ${F("rect", { x: 56, y: 138, width: 4, height: 46, rx: 2 }, "adducteurs")}
    ${F("rect", { x: 60, y: 138, width: 4, height: 46, rx: 2 }, "adducteurs")}
  </g>`;
}

/* --- Silhouette VUE DE DOS --- */
function _figureArriere(prim, sec) {
  const F = (t, a, m) => _forme(t, a, m, prim, sec);
  return `
  <g>
    ${F("circle", { cx: 60, cy: 24, r: 14 }, null)}
    ${F("rect", { x: 54, y: 36, width: 12, height: 8, rx: 3 }, null)}
    <!-- trapèzes -->
    ${F("path", { d: "M44 46 L76 46 L70 66 L50 66 Z" }, "trapezes")}
    <!-- épaules (deltoïdes postérieurs) -->
    ${F("ellipse", { cx: 36, cy: 56, rx: 12, ry: 10 }, "epaules")}
    ${F("ellipse", { cx: 84, cy: 56, rx: 12, ry: 10 }, "epaules")}
    <!-- triceps + avant-bras -->
    ${F("rect", { x: 23, y: 58, width: 13, height: 32, rx: 6 }, "triceps")}
    ${F("rect", { x: 84, y: 58, width: 13, height: 32, rx: 6 }, "triceps")}
    ${F("rect", { x: 21, y: 90, width: 12, height: 34, rx: 6 }, "avantbras")}
    ${F("rect", { x: 87, y: 90, width: 12, height: 34, rx: 6 }, "avantbras")}
    <!-- dorsaux -->
    ${F("path", { d: "M46 66 L58 66 L57 98 L44 92 Z" }, "dorsaux")}
    ${F("path", { d: "M74 66 L62 66 L63 98 L76 92 Z" }, "dorsaux")}
    <!-- lombaires -->
    ${F("rect", { x: 50, y: 98, width: 20, height: 20, rx: 5 }, "lombaires")}
    <!-- fessiers -->
    ${F("ellipse", { cx: 51, cy: 130, rx: 13, ry: 12 }, "fessiers")}
    ${F("ellipse", { cx: 69, cy: 130, rx: 13, ry: 12 }, "fessiers")}
    <!-- ischio-jambiers -->
    ${F("rect", { x: 44, y: 142, width: 15, height: 50, rx: 7 }, "ischios")}
    ${F("rect", { x: 61, y: 142, width: 15, height: 50, rx: 7 }, "ischios")}
    <!-- mollets -->
    ${F("rect", { x: 46, y: 192, width: 13, height: 54, rx: 6 }, "mollets")}
    ${F("rect", { x: 61, y: 192, width: 13, height: 54, rx: 6 }, "mollets")}
  </g>`;
}

/* Carte des muscles : deux silhouettes côte à côte */
function carteMuscles(primaires = [], secondaires = []) {
  const prim = primaires || [], sec = secondaires || [];
  return `
  <svg class="muscle-map" viewBox="0 0 260 270" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Muscles travaillés">
    <g transform="translate(0,0)">${_figureAvant(prim, sec)}
      <text x="60" y="264" text-anchor="middle" class="mm-legend">Face avant</text>
    </g>
    <g transform="translate(140,0)">${_figureArriere(prim, sec)}
      <text x="60" y="264" text-anchor="middle" class="mm-legend">Face arrière</text>
    </g>
  </svg>`;
}

/* ------------------------------------------------------------------ *
 * Schémas de machines / mouvements — icônes vectorielles stylisées.
 * ------------------------------------------------------------------ */
const _o = "#ff5a1f", _o2 = "#ffab6b", _g = "#8a97a6"; // orange, orange clair, gris
function _svg(inner) {
  return `<svg class="ex-art" viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${inner}</svg>`;
}
const _base = `<rect x="0" y="0" width="100" height="80" rx="10" fill="#11161c"/>`;

const ARTS = {
  "chest-press": _svg(`${_base}
    <rect x="18" y="24" width="10" height="36" rx="3" fill="${_g}"/>
    <circle cx="46" cy="34" r="9" fill="${_o2}"/>
    <rect x="42" y="42" width="10" height="20" rx="4" fill="${_o}"/>
    <line x1="52" y1="46" x2="74" y2="40" stroke="${_o}" stroke-width="5" stroke-linecap="round"/>
    <rect x="72" y="30" width="8" height="24" rx="3" fill="${_g}"/>
    <line x1="46" y1="60" x2="60" y2="60" stroke="${_g}" stroke-width="4" stroke-linecap="round"/>`),

  "pec-deck": _svg(`${_base}
    <circle cx="50" cy="30" r="9" fill="${_o2}"/>
    <rect x="45" y="38" width="10" height="22" rx="4" fill="${_o}"/>
    <path d="M50 46 Q30 44 26 62" stroke="${_o}" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M50 46 Q70 44 74 62" stroke="${_o}" stroke-width="5" fill="none" stroke-linecap="round"/>
    <rect x="22" y="58" width="8" height="10" rx="2" fill="${_g}"/>
    <rect x="70" y="58" width="8" height="10" rx="2" fill="${_g}"/>`),

  "shoulder-press": _svg(`${_base}
    <circle cx="50" cy="42" r="9" fill="${_o2}"/>
    <rect x="45" y="50" width="10" height="18" rx="4" fill="${_o}"/>
    <line x1="46" y1="50" x2="34" y2="26" stroke="${_o}" stroke-width="5" stroke-linecap="round"/>
    <line x1="54" y1="50" x2="66" y2="26" stroke="${_o}" stroke-width="5" stroke-linecap="round"/>
    <rect x="28" y="20" width="18" height="7" rx="3" fill="${_g}"/>
    <rect x="54" y="20" width="18" height="7" rx="3" fill="${_g}"/>`),

  "lat-pulldown": _svg(`${_base}
    <line x1="20" y1="14" x2="80" y2="14" stroke="${_g}" stroke-width="5" stroke-linecap="round"/>
    <line x1="34" y1="14" x2="42" y2="40" stroke="${_o}" stroke-width="4"/>
    <line x1="66" y1="14" x2="58" y2="40" stroke="${_o}" stroke-width="4"/>
    <circle cx="50" cy="46" r="8" fill="${_o2}"/>
    <rect x="45" y="53" width="10" height="16" rx="4" fill="${_o}"/>`),

  "seated-row": _svg(`${_base}
    <rect x="16" y="30" width="8" height="30" rx="3" fill="${_g}"/>
    <circle cx="60" cy="34" r="9" fill="${_o2}"/>
    <rect x="55" y="42" width="10" height="20" rx="4" fill="${_o}"/>
    <line x1="55" y1="46" x2="26" y2="44" stroke="${_o}" stroke-width="5" stroke-linecap="round"/>
    <rect x="72" y="52" width="14" height="10" rx="3" fill="${_g}"/>`),

  "leg-press": _svg(`${_base}
    <rect x="18" y="20" width="26" height="40" rx="4" fill="${_g}"/>
    <circle cx="66" cy="52" r="9" fill="${_o2}"/>
    <line x1="60" y1="50" x2="46" y2="34" stroke="${_o}" stroke-width="7" stroke-linecap="round"/>
    <line x1="46" y1="34" x2="40" y2="42" stroke="${_o}" stroke-width="7" stroke-linecap="round"/>`),

  "leg-extension": _svg(`${_base}
    <rect x="20" y="26" width="8" height="34" rx="3" fill="${_g}"/>
    <circle cx="38" cy="34" r="8" fill="${_o2}"/>
    <line x1="38" y1="40" x2="60" y2="40" stroke="${_o}" stroke-width="7" stroke-linecap="round"/>
    <line x1="60" y1="40" x2="76" y2="26" stroke="${_o}" stroke-width="7" stroke-linecap="round"/>
    <circle cx="78" cy="24" r="5" fill="${_g}"/>`),

  "leg-curl": _svg(`${_base}
    <rect x="20" y="34" width="8" height="28" rx="3" fill="${_g}"/>
    <line x1="26" y1="40" x2="54" y2="40" stroke="${_o}" stroke-width="8" stroke-linecap="round"/>
    <path d="M54 40 Q72 42 70 60" stroke="${_o}" stroke-width="8" fill="none" stroke-linecap="round"/>
    <circle cx="70" cy="62" r="5" fill="${_g}"/>`),

  "smith": _svg(`${_base}
    <line x1="24" y1="12" x2="24" y2="68" stroke="${_g}" stroke-width="4"/>
    <line x1="76" y1="12" x2="76" y2="68" stroke="${_g}" stroke-width="4"/>
    <line x1="24" y1="30" x2="76" y2="30" stroke="${_o}" stroke-width="5"/>
    <circle cx="50" cy="42" r="8" fill="${_o2}"/>
    <rect x="45" y="49" width="10" height="20" rx="4" fill="${_o}"/>`),

  "abductor": _svg(`${_base}
    <circle cx="50" cy="30" r="9" fill="${_o2}"/>
    <rect x="45" y="38" width="10" height="16" rx="4" fill="${_o}"/>
    <line x1="48" y1="52" x2="30" y2="66" stroke="${_o}" stroke-width="7" stroke-linecap="round"/>
    <line x1="52" y1="52" x2="70" y2="66" stroke="${_o}" stroke-width="7" stroke-linecap="round"/>
    <rect x="22" y="62" width="10" height="8" rx="2" fill="${_g}"/>
    <rect x="68" y="62" width="10" height="8" rx="2" fill="${_g}"/>`),

  "crunch": _svg(`${_base}
    <rect x="18" y="52" width="64" height="8" rx="4" fill="${_g}"/>
    <path d="M30 52 Q40 30 58 34" stroke="${_o}" stroke-width="7" fill="none" stroke-linecap="round"/>
    <circle cx="60" cy="34" r="7" fill="${_o2}"/>`),

  "hyperextension": _svg(`${_base}
    <line x1="24" y1="60" x2="50" y2="44" stroke="${_g}" stroke-width="6" stroke-linecap="round"/>
    <line x1="50" y1="44" x2="78" y2="30" stroke="${_o}" stroke-width="7" stroke-linecap="round"/>
    <circle cx="80" cy="28" r="6" fill="${_o2}"/>
    <rect x="20" y="60" width="14" height="10" rx="3" fill="${_g}"/>`),

  "pull-up": _svg(`${_base}
    <line x1="20" y1="16" x2="80" y2="16" stroke="${_g}" stroke-width="5" stroke-linecap="round"/>
    <line x1="40" y1="16" x2="44" y2="34" stroke="${_o}" stroke-width="4"/>
    <line x1="60" y1="16" x2="56" y2="34" stroke="${_o}" stroke-width="4"/>
    <circle cx="50" cy="40" r="8" fill="${_o2}"/>
    <rect x="45" y="47" width="10" height="18" rx="4" fill="${_o}"/>`),

  "cable": _svg(`${_base}
    <rect x="16" y="12" width="8" height="56" rx="3" fill="${_g}"/>
    <line x1="20" y1="16" x2="52" y2="40" stroke="${_o2}" stroke-width="3"/>
    <circle cx="60" cy="36" r="8" fill="${_o2}"/>
    <rect x="55" y="43" width="10" height="20" rx="4" fill="${_o}"/>
    <line x1="52" y1="40" x2="54" y2="48" stroke="${_o}" stroke-width="4" stroke-linecap="round"/>`),

  "dumbbell": _svg(`${_base}
    <rect x="38" y="34" width="24" height="8" rx="3" fill="${_o}"/>
    <rect x="24" y="24" width="10" height="28" rx="4" fill="${_o2}"/>
    <rect x="66" y="24" width="10" height="28" rx="4" fill="${_o2}"/>
    <rect x="18" y="30" width="8" height="16" rx="3" fill="${_g}"/>
    <rect x="74" y="30" width="8" height="16" rx="3" fill="${_g}"/>`),

  "barbell": _svg(`${_base}
    <line x1="12" y1="40" x2="88" y2="40" stroke="${_o}" stroke-width="5" stroke-linecap="round"/>
    <rect x="20" y="28" width="9" height="24" rx="3" fill="${_o2}"/>
    <rect x="30" y="24" width="9" height="32" rx="3" fill="${_g}"/>
    <rect x="61" y="24" width="9" height="32" rx="3" fill="${_g}"/>
    <rect x="71" y="28" width="9" height="24" rx="3" fill="${_o2}"/>`),

  "treadmill": _svg(`${_base}
    <path d="M16 60 L74 60 L84 66 L26 66 Z" fill="${_g}"/>
    <line x1="74" y1="60" x2="80" y2="26" stroke="${_g}" stroke-width="4"/>
    <line x1="80" y1="26" x2="66" y2="26" stroke="${_g}" stroke-width="4"/>
    <circle cx="44" cy="24" r="7" fill="${_o2}"/>
    <line x1="44" y1="31" x2="42" y2="46" stroke="${_o}" stroke-width="5" stroke-linecap="round"/>
    <line x1="42" y1="38" x2="52" y2="34" stroke="${_o}" stroke-width="4" stroke-linecap="round"/>
    <line x1="42" y1="46" x2="34" y2="58" stroke="${_o}" stroke-width="4" stroke-linecap="round"/>
    <line x1="42" y1="46" x2="52" y2="56" stroke="${_o}" stroke-width="4" stroke-linecap="round"/>`),

  "bike": _svg(`${_base}
    <circle cx="30" cy="52" r="12" fill="none" stroke="${_g}" stroke-width="4"/>
    <circle cx="72" cy="52" r="12" fill="none" stroke="${_g}" stroke-width="4"/>
    <path d="M30 52 L48 52 L60 34 L72 52" stroke="${_o}" stroke-width="4" fill="none"/>
    <line x1="48" y1="52" x2="42" y2="34" stroke="${_o}" stroke-width="4"/>
    <line x1="36" y1="34" x2="48" y2="34" stroke="${_o2}" stroke-width="4" stroke-linecap="round"/>
    <circle cx="60" cy="30" r="5" fill="${_o2}"/>`),

  "rower": _svg(`${_base}
    <line x1="14" y1="58" x2="86" y2="58" stroke="${_g}" stroke-width="4" stroke-linecap="round"/>
    <rect x="16" y="30" width="12" height="20" rx="3" fill="${_g}"/>
    <circle cx="52" cy="44" r="8" fill="${_o2}"/>
    <rect x="48" y="50" width="10" height="10" rx="3" fill="${_o}"/>
    <line x1="48" y1="46" x2="28" y2="40" stroke="${_o}" stroke-width="4" stroke-linecap="round"/>
    <line x1="52" y1="58" x2="72" y2="58" stroke="${_o}" stroke-width="4"/>`),

  "elliptical": _svg(`${_base}
    <ellipse cx="50" cy="56" rx="30" ry="8" fill="none" stroke="${_g}" stroke-width="4"/>
    <circle cx="50" cy="26" r="7" fill="${_o2}"/>
    <line x1="50" y1="33" x2="50" y2="50" stroke="${_o}" stroke-width="5" stroke-linecap="round"/>
    <line x1="50" y1="38" x2="34" y2="30" stroke="${_o}" stroke-width="4" stroke-linecap="round"/>
    <line x1="50" y1="38" x2="66" y2="46" stroke="${_o}" stroke-width="4" stroke-linecap="round"/>
    <line x1="50" y1="50" x2="30" y2="58" stroke="${_o}" stroke-width="4" stroke-linecap="round"/>
    <line x1="50" y1="50" x2="70" y2="54" stroke="${_o}" stroke-width="4" stroke-linecap="round"/>`),

  "mat": _svg(`${_base}
    <rect x="16" y="50" width="68" height="10" rx="4" fill="${_g}"/>
    <line x1="26" y1="48" x2="74" y2="40" stroke="${_o}" stroke-width="7" stroke-linecap="round"/>
    <circle cx="76" cy="38" r="6" fill="${_o2}"/>
    <line x1="34" y1="48" x2="30" y2="58" stroke="${_o}" stroke-width="4" stroke-linecap="round"/>`),
};

function artExercice(cle) {
  return ARTS[cle] || ARTS["dumbbell"];
}
