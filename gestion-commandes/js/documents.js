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
  ouvrirImpression(htmlFacture(o));
}

// ---- REÇU / TICKET pour imprimante portable (thermique 58 mm / 80 mm) ----
function htmlRecu(o) {
  const r = Reglages.get();
  const total = Calc.total(o);
  const sousTotal = Calc.sousTotal(o);
  const reste = Calc.reste(o);
  const num = o.factureNumero || o.numero;

  const lignes = o.lignes
    .map(
      (l) => `
      <div class="art">
        <div class="art-nom">${escapeHtml(l.nom)}</div>
        <div class="art-det">
          <span class="art-qte">${fmtNombre(l.qte)} ${escapeHtml(l.unite || "")} × ${fmtNombre(l.prixUnitaire)}</span>
          <span class="art-mt">${fmtMontant(l.qte * l.prixUnitaire)}</span>
        </div>
      </div>`
    )
    .join("");

  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Reçu ${escapeHtml(num)}</title>
  <style id="pageStyle">@page { size: 58mm auto; margin: 2mm; }</style>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; background: #eee; font-family: "Courier New", ui-monospace, monospace; color: #000; }
    .ticket { width: 54mm; margin: 8px auto; background: #fff; padding: 4mm 3mm; font-size: 12px; line-height: 1.35; }
    .c { text-align: center; }
    .ent-nom { font-weight: 700; font-size: 15px; text-transform: uppercase; }
    .pt { font-size: 11px; }
    .sep { border-top: 1px dashed #000; margin: 6px 0; }
    .art { margin-bottom: 4px; }
    .art-nom { font-weight: 700; }
    .art-det { display: flex; justify-content: space-between; gap: 6px; font-size: 11px; }
    .art-qte { flex: 1; min-width: 0; color: #333; }
    .art-mt { white-space: nowrap; font-weight: 600; }
    .tot { display: flex; justify-content: space-between; font-size: 12px; }
    .grand { font-weight: 700; font-size: 15px; }
    .reste { font-weight: 700; }
    .barre { position: sticky; top: 0; background: #0B7A4B; color: #fff; padding: 10px; text-align: center; display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; }
    .barre button, .barre select { padding: 8px 12px; border-radius: 8px; border: none; font-size: 14px; font-weight: 600; }
    .barre button { background: #fff; color: #0B7A4B; }
    @media print { .barre { display: none; } body { background: #fff; } .ticket { margin: 0; width: auto; } }
  </style></head>
  <body>
    <div class="barre">
      <label style="color:#fff;align-self:center">Largeur :</label>
      <select onchange="changerLargeur(this.value)">
        <option value="58">58 mm</option>
        <option value="80">80 mm</option>
      </select>
      <button onclick="window.print()">🖨️ Imprimer le reçu</button>
    </div>
    <div class="ticket" id="ticket">
      ${r.logo ? `<div class="c"><img src="${r.logo}" style="max-height:40px;max-width:80%"></div>` : ""}
      <div class="c ent-nom">${escapeHtml(r.entreprise)}</div>
      ${r.telephone ? `<div class="c pt">Tél : ${escapeHtml(r.telephone)}</div>` : ""}
      ${r.adresse || r.ville ? `<div class="c pt">${escapeHtml([r.adresse, r.ville].filter(Boolean).join(", "))}</div>` : ""}
      <div class="sep"></div>
      <div class="pt">Reçu : <b>${escapeHtml(num)}</b></div>
      <div class="pt">Date : ${fmtDate(o.factureDate || o.date)}</div>
      <div class="pt">Client : ${escapeHtml(o.clientNom || "Comptant")}</div>
      <div class="sep"></div>
      ${lignes}
      <div class="sep"></div>
      <div class="tot"><span>Sous-total</span><span>${fmtMontant(sousTotal)}</span></div>
      ${o.remise ? `<div class="tot"><span>Remise</span><span>- ${fmtMontant(o.remise)}</span></div>` : ""}
      <div class="tot grand"><span>TOTAL</span><span>${fmtMontant(total)}</span></div>
      ${o.montantPaye ? `<div class="tot"><span>Payé</span><span>${fmtMontant(o.montantPaye)}</span></div>` : ""}
      ${reste > 0 ? `<div class="tot reste"><span>RESTE</span><span>${fmtMontant(reste)}</span></div>` : `<div class="c pt">*** PAYÉ ***</div>`}
      <div class="sep"></div>
      <div class="c pt">${escapeHtml(r.piedFacture || "Merci !")}</div>
      <div class="c pt" style="margin-top:4px">${fmtDateHeure(Date.now())}</div>
    </div>
    <script>
      function changerLargeur(mm) {
        document.getElementById("pageStyle").textContent = "@page { size: " + mm + "mm auto; margin: 2mm; }";
        document.getElementById("ticket").style.width = (mm - 4) + "mm";
      }
    <\/script>
  </body></html>`;
}

function imprimerRecu(o) {
  ouvrirImpression(htmlRecu(o));
}

// Ouvre une fenêtre d'impression (avec repli si les pop-ups sont bloqués)
function ouvrirImpression(html) {
  const w = window.open("", "_blank");
  if (w && w.document) {
    w.document.write(html);
    w.document.close();
    return;
  }
  // Repli : iframe caché dans la page courante
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  document.body.appendChild(iframe);
  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(html);
  doc.close();
  setTimeout(() => {
    try { iframe.contentWindow.focus(); iframe.contentWindow.print(); } catch (e) {}
  }, 400);
}

window.Docs = { texteBonCommande, texteFacture, htmlFacture, imprimerFacture, htmlRecu, imprimerRecu };
})();
