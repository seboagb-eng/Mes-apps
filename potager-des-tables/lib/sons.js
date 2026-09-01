// Sons et vibrations générés à la volée (aucun fichier audio à charger).
// Déclenchés sur des interactions utilisateur, donc l'AudioContext peut démarrer.

let ctx = null;

function audioCtx() {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) ctx = new AC();
  }
  return ctx;
}

function bip(freq, duree = 0.12, type = 'sine', gain = 0.06) {
  const c = audioCtx();
  if (!c) return;
  try {
    if (c.state === 'suspended') c.resume();
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.value = freq;
    o.connect(g);
    g.connect(c.destination);
    const t = c.currentTime;
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + duree);
    o.start(t);
    o.stop(t + duree);
  } catch (e) {
    /* audio indisponible : on ignore */
  }
}

function vibrer(motif) {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try { navigator.vibrate(motif); } catch (e) { /* ignore */ }
  }
}

export function sonBon(actif = true) {
  if (!actif) return;
  bip(660, 0.1, 'sine');
  setTimeout(() => bip(880, 0.12, 'sine'), 90);
  vibrer(25);
}

export function sonMauvais(actif = true) {
  if (!actif) return;
  bip(200, 0.18, 'square', 0.05);
  vibrer([30, 40, 30]);
}

export function sonVictoire(actif = true) {
  if (!actif) return;
  [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => bip(f, 0.15, 'triangle'), i * 120));
  vibrer([25, 30, 60]);
}
