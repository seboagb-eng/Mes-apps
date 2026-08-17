/*
 * documents.js — Génération des documents
 *  - Bon de commande : message texte envoyé au magasinier par WhatsApp
 *  - Facture : page imprimable (Enregistrer en PDF depuis le navigateur)
 *
 * NB : encapsulé dans une IIFE pour ne pas polluer la portée globale
 * (les <script> classiques partagent le même scope de premier niveau).
 */
(function () {
const { fmtMontant, fmtNombre, fmtDate, fmtDateHeure, escapeHtml } = window.Fmt;
const { Calc, Reglages } = window.Store;

// ---- BON DE COMMANDE (texte WhatsApp pour le magasinier) ----
function texteBonCommande(o) {
  const r = Reglages.get();
  const lignes = o.lignes
    .map((l) => `• ${l.nom} — ${fmtNombre(l.qte)} ${l.unite || ""}`.trim())
    .join("\n");
  const client = o.clientNom ? `\nClient : ${o.clientNom}` : "";
  return (
    `*BON DE COMMANDE ${o.numero}*\n` +
    `${r.entreprise}\n` +
    `Date : ${fmtDate(o.date)}${client}\n` +
    `------------------------------\n` +
    `${lignes}\n` +
    `------------------------------\n` +
    (o.note ? `Note : ${o.note}\n` : "") +
    `Merci de préparer cette commande. 🙏`
  );
}

// ---- FACTURE (résumé texte WhatsApp pour le client) ----
function texteFacture(o) {
  const r = Reglages.get();
  const lignes = o.lignes
    .map(
      (l) =>
        `• ${l.nom} x${fmtNombre(l.qte)} = ${fmtMontant(l.qte * l.prixUnitaire)}`
    )
    .join("\n");
  const total = Calc.total(o);
  const reste = Calc.reste(o);
  const num = o.factureNumero || o.numero;
  return (
    `*FACTURE ${num}*\n` +
    `${r.entreprise}\n` +
    `Date : ${fmtDate(o.factureDate || o.date)}\n` +
    `------------------------------\n` +
    `${lignes}\n` +
    (o.remise ? `Remise : -${fmtMontant(o.remise)}\n` : "") +
    `------------------------------\n` +
    `*TOTAL : ${fmtMontant(total)}*\n` +
    (o.montantPaye ? `Payé : ${fmtMontant(o.montantPaye)}\n` : "") +
    (reste > 0 ? `*Reste à payer : ${fmtMontant(reste)}*\n` : `✅ Payé intégralement\n`) +
    (r.piedFacture ? `\n${r.piedFacture}` : "")
  );
}

// ---- FACTURE IMPRIMABLE (HTML -> PDF via l'impression du navigateur) ----
function htmlFacture(o) {
  const r = Reglages.get();
  const total = Calc.total(o);
  const sousTotal = Calc.sousTotal(o);
  const reste = Calc.reste(o);
  const num = o.factureNumero || o.numero;
  const logo = r.logo
    ? `<img src="${r.logo}" alt="logo" style="max-height:64px;max-width:160px;object-fit:contain">`
    : "";

  const rows = o.lignes
    .map(
      (l, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${escapeHtml(l.nom)}</td>
        <td class="r">${fmtNombre(l.qte)} ${escapeHtml(l.unite || "")}</td>
        <td class="r">${fmtMontant(l.prixUnitaire)}</td>
        <td class="r">${fmtMontant(l.qte * l.prixUnitaire)}</td>
      </tr>`
    )
    .join("");

  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Facture ${escapeHtml(num)}</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: -apple-system, Segoe UI, Roboto, Arial, sans-serif; color:#111; margin:0; padding:24px; }
    .doc { max-width: 760px; margin: 0 auto; }
    .head { display:flex; justify-content:space-between; align-items:flex-start; gap:16px; border-bottom:3px solid #0B7A4B; padding-bottom:16px; }
    .ent h1 { margin:0 0 4px; font-size:20px; color:#0B7A4B; }
    .ent p { margin:2px 0; font-size:13px; color:#444; }
    .meta { text-align:right; }
    .meta .titre { font-size:22px; font-weight:800; letter-spacing:1px; }
    .meta .num { font-size:14px; color:#0B7A4B; font-weight:700; }
    .meta p { margin:2px 0; font-size:13px; color:#444; }
    .client { margin:18px 0; background:#f4f8f5; border:1px solid #e0e8e2; border-radius:8px; padding:12px 14px; }
    .client .lbl { font-size:11px; text-transform:uppercase; color:#888; letter-spacing:.5px; }
    .client .nom { font-size:15px; font-weight:700; }
    table { width:100%; border-collapse:collapse; margin-top:8px; font-size:13px; }
    th { background:#0B7A4B; color:#fff; text-align:left; padding:8px 10px; font-weight:600; }
    td { padding:8px 10px; border-bottom:1px solid #eee; }
    .r { text-align:right; }
    .totaux { margin-top:14px; width:100%; }
    .totaux td { padding:6px 10px; font-size:14px; border:none; }
    .totaux .grand { font-size:18px; font-weight:800; color:#0B7A4B; border-top:2px solid #0B7A4B; }
    .totaux .reste { color:#b00020; font-weight:700; }
    .pied { margin-top:28px; text-align:center; color:#555; font-size:13px; border-top:1px dashed #ccc; padding-top:14px; }
    .actions { max-width:760px; margin:16px auto 0; text-align:center; }
    .actions button { background:#0B7A4B; color:#fff; border:none; padding:12px 22px; border-radius:10px; font-size:15px; cursor:pointer; }
    @media print { .actions { display:none; } body { padding:0; } }
  </style></head>
  <body>
    <div class="doc">
      <div class="head">
        <div class="ent">
          ${logo}
          <h1>${escapeHtml(r.entreprise)}</h1>
          ${r.telephone ? `<p>Tél : ${escapeHtml(r.telephone)}</p>` : ""}
          ${r.adresse || r.ville ? `<p>${escapeHtml([r.adresse, r.ville].filter(Boolean).join(", "))}</p>` : ""}
        </div>
        <div class="meta">
          <div class="titre">FACTURE</div>
          <div class="num">${escapeHtml(num)}</div>
          <p>Date : ${fmtDate(o.factureDate || o.date)}</p>
          <p>Commande : ${escapeHtml(o.numero)}</p>
        </div>
      </div>

      <div class="client">
        <div class="lbl">Facturé à</div>
        <div class="nom">${escapeHtml(o.clientNom || "Client au comptant")}</div>
        ${o.clientTel ? `<div>Tél : ${escapeHtml(o.clientTel)}</div>` : ""}
      </div>

      <table>
        <thead>
          <tr><th>#</th><th>Désignation</th><th class="r">Qté</th><th class="r">P.U.</th><th class="r">Montant</th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>

      <table class="totaux">
        <tr><td class="r">Sous-total</td><td class="r" style="width:180px">${fmtMontant(sousTotal)}</td></tr>
        ${o.remise ? `<tr><td class="r">Remise</td><td class="r">- ${fmtMontant(o.remise)}</td></tr>` : ""}
        <tr><td class="r grand">TOTAL</td><td class="r grand">${fmtMontant(total)}</td></tr>
        ${o.montantPaye ? `<tr><td class="r">Payé (${window.Fmt.LIBELLE_PAIEMENT[o.modePaiement] || ""})</td><td class="r">${fmtMontant(o.montantPaye)}</td></tr>` : ""}
        ${reste > 0 ? `<tr><td class="r reste">Reste à payer</td><td class="r reste">${fmtMontant(reste)}</td></tr>` : ""}
      </table>

      <div class="pied">
        ${escapeHtml(r.piedFacture || "Merci pour votre confiance.")}<br>
        <small>Document généré le ${fmtDateHeure(Date.now())}</small>
      </div>
    </div>
    <div class="actions">
      <button onclick="window.print()">🖨️ Imprimer / Enregistrer en PDF</button>
    </div>
  </body></html>`;
}

function imprimerFacture(o) {
  const w = window.open("", "_blank");
  if (!w) {
    alert("Autorisez les fenêtres pop-up pour imprimer la facture.");
    return;
  }
  w.document.write(htmlFacture(o));
  w.document.close();
}

window.Docs = { texteBonCommande, texteFacture, htmlFacture, imprimerFacture };
})();
