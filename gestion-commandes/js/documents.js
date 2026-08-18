/*
 * documents.js — Génération des documents
 *  - Bon de commande : message WhatsApp (magasinier) + version imprimable
 *  - Facture / reçu   : message WhatsApp (client) + version imprimable
 *
 * Impression unifiée : une même page propose 3 formats au choix
 *   • A4 (feuille classique, PDF)
 *   • Ticket 80 mm  (imprimante portable)
 *   • Ticket 58 mm  (imprimante portable)
 *
 * Encapsulé dans une IIFE pour ne pas polluer la portée globale.
 */
(function () {
const { fmtMontant, fmtNombre, fmtDate, fmtDateHeure, escapeHtml, LIBELLE_PAIEMENT } = window.Fmt;
const { Calc, Reglages } = window.Store;

/* ===================== MESSAGES WHATSAPP (texte) ===================== */
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

function texteFacture(o) {
  const r = Reglages.get();
  const lignes = o.lignes
    .map((l) => `• ${l.nom} x${fmtNombre(l.qte)} = ${fmtMontant(l.qte * l.prixUnitaire)}`)
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

/* ===================== EN-TÊTE COMMUNE ===================== */
function enteteA4() {
  const r = Reglages.get();
  const logo = r.logo
    ? `<img src="${r.logo}" alt="logo" class="a4-logo">`
    : "";
  const coord =
    (r.telephone ? `<p>Tél : ${escapeHtml(r.telephone)}</p>` : "") +
    (r.adresse || r.ville ? `<p>${escapeHtml([r.adresse, r.ville].filter(Boolean).join(", "))}</p>` : "");
  return { logo, coord, r };
}

/* ===================== FACTURE — FRAGMENT A4 ===================== */
function blocFactureA4(o) {
  const { logo, coord, r } = enteteA4();
  const total = Calc.total(o);
  const sousTotal = Calc.sousTotal(o);
  const reste = Calc.reste(o);
  const num = o.factureNumero || o.numero;

  const rows = o.lignes.map((l, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${escapeHtml(l.nom)}</td>
      <td class="r">${fmtNombre(l.qte)} ${escapeHtml(l.unite || "")}</td>
      <td class="r">${fmtMontant(l.prixUnitaire)}</td>
      <td class="r">${fmtMontant(l.qte * l.prixUnitaire)}</td>
    </tr>`).join("");

  return `<div class="a4wrap">
    <div class="a4-head">
      <div class="a4-ent">${logo}<h1>${escapeHtml(r.entreprise)}</h1>${coord}</div>
      <div class="a4-meta">
        <div class="a4-titre">FACTURE</div>
        <div class="a4-num">${escapeHtml(num)}</div>
        <p>Date : ${fmtDate(o.factureDate || o.date)}</p>
        <p>Commande : ${escapeHtml(o.numero)}</p>
      </div>
    </div>
    <div class="a4-client">
      <div class="a4-lbl">Facturé à</div>
      <div class="a4-nom">${escapeHtml(o.clientNom || "Client au comptant")}</div>
      ${o.clientTel ? `<div>Tél : ${escapeHtml(o.clientTel)}</div>` : ""}
    </div>
    <table class="a4-table">
      <thead><tr><th>#</th><th>Désignation</th><th class="r">Qté</th><th class="r">P.U.</th><th class="r">Montant</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <table class="a4-tot">
      <tr><td class="r">Sous-total</td><td class="r amt">${fmtMontant(sousTotal)}</td></tr>
      ${o.remise ? `<tr><td class="r">Remise</td><td class="r amt">- ${fmtMontant(o.remise)}</td></tr>` : ""}
      <tr><td class="r grand">TOTAL</td><td class="r grand amt">${fmtMontant(total)}</td></tr>
      ${o.montantPaye ? `<tr><td class="r">Payé (${escapeHtml(LIBELLE_PAIEMENT[o.modePaiement] || "")})</td><td class="r amt">${fmtMontant(o.montantPaye)}</td></tr>` : ""}
      ${reste > 0 ? `<tr><td class="r reste">Reste à payer</td><td class="r reste amt">${fmtMontant(reste)}</td></tr>` : ""}
    </table>
    <div class="a4-pied">${escapeHtml(r.piedFacture || "Merci pour votre confiance.")}<br>
      <small>Document généré le ${fmtDateHeure(Date.now())}</small></div>
  </div>`;
}

/* ===================== BON DE COMMANDE — FRAGMENT A4 ===================== */
function blocBonA4(o) {
  const { logo, coord, r } = enteteA4();
  const rows = o.lignes.map((l, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${escapeHtml(l.nom)}</td>
      <td class="r bold">${fmtNombre(l.qte)} ${escapeHtml(l.unite || "")}</td>
      <td class="case">☐</td>
    </tr>`).join("");

  return `<div class="a4wrap">
    <div class="a4-head">
      <div class="a4-ent">${logo}<h1>${escapeHtml(r.entreprise)}</h1>${coord}</div>
      <div class="a4-meta">
        <div class="a4-titre">BON DE<br>COMMANDE</div>
        <div class="a4-num">${escapeHtml(o.numero)}</div>
        <p>Date : ${fmtDate(o.date)}</p>
      </div>
    </div>
    <div class="a4-client">
      <div class="a4-lbl">Destinataire</div>
      <div class="a4-nom">${escapeHtml(r.magasinierNom || "Magasinier")}</div>
      ${o.clientNom ? `<div>Pour le client : ${escapeHtml(o.clientNom)}</div>` : ""}
    </div>
    <table class="a4-table">
      <thead><tr><th>#</th><th>Article à préparer</th><th class="r">Quantité</th><th class="case">Préparé</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    ${o.note ? `<div class="a4-note">📝 ${escapeHtml(o.note)}</div>` : ""}
    <div class="a4-sign">
      <div>Préparé par : ______________________</div>
      <div>Signature : ______________________</div>
    </div>
    <div class="a4-pied"><small>Bon généré le ${fmtDateHeure(Date.now())}</small></div>
  </div>`;
}

/* ===================== TICKET (58/80 mm) — FRAGMENTS ===================== */
function ticketFacture(o) {
  const r = Reglages.get();
  const total = Calc.total(o);
  const sousTotal = Calc.sousTotal(o);
  const reste = Calc.reste(o);
  const num = o.factureNumero || o.numero;
  const lignes = o.lignes.map((l) => `
    <div class="art">
      <div class="art-nom">${escapeHtml(l.nom)}</div>
      <div class="art-det"><span class="art-qte">${fmtNombre(l.qte)} ${escapeHtml(l.unite || "")} × ${fmtNombre(l.prixUnitaire)}</span><span class="art-mt">${fmtMontant(l.qte * l.prixUnitaire)}</span></div>
    </div>`).join("");
  return `
    ${r.logo ? `<div class="c"><img src="${r.logo}" class="t-logo"></div>` : ""}
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
    <div class="c pt" style="margin-top:4px">${fmtDateHeure(Date.now())}</div>`;
}

function ticketBon(o) {
  const r = Reglages.get();
  const lignes = o.lignes.map((l) => `
    <div class="art">
      <div class="art-det"><span class="art-qte">${escapeHtml(l.nom)}</span><span class="art-mt">${fmtNombre(l.qte)} ${escapeHtml(l.unite || "")}</span></div>
    </div>`).join("");
  return `
    <div class="c ent-nom">${escapeHtml(r.entreprise)}</div>
    <div class="c pt">BON DE COMMANDE</div>
    <div class="sep"></div>
    <div class="pt">N° : <b>${escapeHtml(o.numero)}</b></div>
    <div class="pt">Date : ${fmtDate(o.date)}</div>
    ${o.clientNom ? `<div class="pt">Client : ${escapeHtml(o.clientNom)}</div>` : ""}
    <div class="sep"></div>
    <div class="pt" style="font-weight:700;margin-bottom:4px">Articles à préparer :</div>
    ${lignes}
    <div class="sep"></div>
    ${o.note ? `<div class="pt">Note : ${escapeHtml(o.note)}</div><div class="sep"></div>` : ""}
    <div class="pt">Préparé par : ______________</div>
    <div class="c pt" style="margin-top:6px">${fmtDateHeure(Date.now())}</div>`;
}

/* ===================== PAGE D'IMPRESSION (A4 / 80 / 58) ===================== */
function pageImpression(titre, a4Html, ticketHtml) {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(titre)}</title>
  <style id="pageStyle">@page { size: A4; margin: 12mm; }</style>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; background: #e9edeb; color: #111; font-family: -apple-system, "Segoe UI", Roboto, Arial, sans-serif; }
    .barre { position: sticky; top: 0; z-index: 5; background: #0B7A4B; color: #fff; padding: 10px; display: flex; gap: 8px; justify-content: center; align-items: center; flex-wrap: wrap; }
    .barre label { align-self: center; font-size: 14px; }
    .barre select, .barre button { padding: 9px 12px; border-radius: 8px; border: none; font-size: 14px; font-weight: 600; }
    .barre button { background: #fff; color: #0B7A4B; cursor: pointer; }
    #zone { padding: 14px; }
    .vue-a4, .vue-ticket { display: none; }
    #zone.mode-a4 .vue-a4 { display: block; }
    #zone.mode-t .vue-ticket { display: block; }

    /* --- A4 --- */
    .a4wrap { background: #fff; max-width: 780px; margin: 0 auto; padding: 26px; box-shadow: 0 2px 10px rgba(0,0,0,.12); }
    .a4-logo { max-height: 64px; max-width: 160px; object-fit: contain; }
    .a4-head { display: flex; justify-content: space-between; gap: 16px; border-bottom: 3px solid #0B7A4B; padding-bottom: 16px; }
    .a4-ent h1 { margin: 4px 0; font-size: 20px; color: #0B7A4B; }
    .a4-ent p { margin: 2px 0; font-size: 13px; color: #444; }
    .a4-meta { text-align: right; }
    .a4-titre { font-size: 20px; font-weight: 800; letter-spacing: 1px; line-height: 1.1; }
    .a4-num { font-size: 14px; color: #0B7A4B; font-weight: 700; }
    .a4-meta p { margin: 2px 0; font-size: 13px; color: #444; }
    .a4-client { margin: 18px 0; background: #f4f8f5; border: 1px solid #e0e8e2; border-radius: 8px; padding: 12px 14px; }
    .a4-lbl { font-size: 11px; text-transform: uppercase; color: #888; letter-spacing: .5px; }
    .a4-nom { font-size: 15px; font-weight: 700; }
    .a4-table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 13px; }
    .a4-table th { background: #0B7A4B; color: #fff; text-align: left; padding: 8px 10px; }
    .a4-table td { padding: 8px 10px; border-bottom: 1px solid #eee; }
    .a4-table .r, .a4-tot .r { text-align: right; }
    .a4-table .bold { font-weight: 700; }
    .a4-table .case, th.case { text-align: center; font-size: 16px; width: 64px; }
    .a4-tot { width: 100%; margin-top: 14px; }
    .a4-tot td { padding: 6px 10px; font-size: 14px; }
    .a4-tot .amt { width: 190px; }
    .a4-tot .grand { font-size: 18px; font-weight: 800; color: #0B7A4B; border-top: 2px solid #0B7A4B; }
    .a4-tot .reste { color: #b00020; font-weight: 700; }
    .a4-note { margin-top: 14px; background: #fff8ef; border: 1px solid #f6d9b8; border-radius: 8px; padding: 10px 12px; font-size: 13px; }
    .a4-sign { margin-top: 34px; display: flex; justify-content: space-between; gap: 20px; font-size: 13px; color: #333; }
    .a4-pied { margin-top: 26px; text-align: center; color: #555; font-size: 13px; border-top: 1px dashed #ccc; padding-top: 12px; }

    /* --- Ticket --- */
    .ticket { width: 54mm; margin: 0 auto; background: #fff; padding: 4mm 3mm; font-family: "Courier New", ui-monospace, monospace; font-size: 12px; line-height: 1.35; color: #000; box-shadow: 0 2px 10px rgba(0,0,0,.12); }
    .ticket .c { text-align: center; }
    .ticket .ent-nom { font-weight: 700; font-size: 15px; text-transform: uppercase; }
    .ticket .pt { font-size: 11px; }
    .ticket .t-logo { max-height: 40px; max-width: 80%; }
    .ticket .sep { border-top: 1px dashed #000; margin: 6px 0; }
    .ticket .art { margin-bottom: 4px; }
    .ticket .art-nom { font-weight: 700; }
    .ticket .art-det { display: flex; justify-content: space-between; gap: 6px; font-size: 11px; }
    .ticket .art-qte { flex: 1; min-width: 0; }
    .ticket .art-mt { white-space: nowrap; font-weight: 600; }
    .ticket .tot { display: flex; justify-content: space-between; }
    .ticket .grand { font-weight: 700; font-size: 15px; }
    .ticket .reste { font-weight: 700; }

    @media print {
      .barre { display: none; }
      body { background: #fff; }
      .a4wrap, .ticket { box-shadow: none; margin: 0; }
      #zone { padding: 0; }
      .a4wrap { max-width: none; padding: 0; }
    }
  </style></head>
  <body>
    <div class="barre">
      <label>Format :</label>
      <select id="fmt" onchange="changerFormat(this.value)">
        <option value="a4">A4 (feuille / PDF)</option>
        <option value="80">Ticket 80 mm</option>
        <option value="58">Ticket 58 mm</option>
      </select>
      <button onclick="window.print()">🖨️ Imprimer</button>
    </div>
    <div id="zone" class="mode-a4">
      <div class="vue-a4">${a4Html}</div>
      <div class="vue-ticket"><div class="ticket" id="ticket">${ticketHtml}</div></div>
    </div>
    <script>
      function changerFormat(v) {
        var zone = document.getElementById("zone");
        var ps = document.getElementById("pageStyle");
        if (v === "a4") {
          zone.className = "mode-a4";
          ps.textContent = "@page { size: A4; margin: 12mm; }";
        } else {
          zone.className = "mode-t";
          ps.textContent = "@page { size: " + v + "mm auto; margin: 2mm; }";
          document.getElementById("ticket").style.width = (v - 4) + "mm";
        }
      }
    <\/script>
  </body></html>`;
}

/* ===================== OUVERTURE / IMPRESSION ===================== */
function ouvrirImpression(html) {
  const w = window.open("", "_blank");
  if (w && w.document) {
    w.document.write(html);
    w.document.close();
    return;
  }
  // Repli : iframe caché si les pop-ups sont bloqués
  const iframe = document.createElement("iframe");
  Object.assign(iframe.style, { position: "fixed", right: "0", bottom: "0", width: "0", height: "0", border: "0" });
  document.body.appendChild(iframe);
  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(html);
  doc.close();
  setTimeout(() => { try { iframe.contentWindow.focus(); iframe.contentWindow.print(); } catch (e) {} }, 500);
}

function imprimerFacture(o) {
  ouvrirImpression(pageImpression("Facture " + (o.factureNumero || o.numero), blocFactureA4(o), ticketFacture(o)));
}
function imprimerBon(o) {
  ouvrirImpression(pageImpression("Bon de commande " + o.numero, blocBonA4(o), ticketBon(o)));
}

/* ===================== ÉTAT JOURNALIER — FRAGMENTS ===================== */
function blocEtatA4(rap) {
  const { logo, coord, r } = enteteA4();
  const stats = [
    ["Nombre de commandes", String(rap.nbCommandes)],
    ["Chiffre d'affaires", fmtMontant(rap.ca)],
    ["Encaissé", fmtMontant(rap.encaisse)],
    ["Créances (reste à payer)", fmtMontant(rap.creances)],
    ["Commandes livrées", String(rap.nbLivrees)],
    ["Commandes à livrer", String(rap.nbAlivrer)],
  ];
  if (rap.nbAnnulees) stats.push(["Commandes annulées", String(rap.nbAnnulees)]);

  const statRows = stats.map((s) => `<tr><td>${s[0]}</td><td class="r bold">${s[1]}</td></tr>`).join("");
  const payRows = Object.entries(rap.parPaiement)
    .map(([m, v]) => `<tr><td>${escapeHtml(LIBELLE_PAIEMENT[m] || m)}</td><td class="r">${fmtMontant(v)}</td></tr>`)
    .join("") || `<tr><td colspan="2">Aucun encaissement</td></tr>`;
  const prodRows = rap.topProduits
    .map((p, i) => `<tr><td>${i + 1}</td><td>${escapeHtml(p.nom)}</td><td class="r">${fmtNombre(p.qte)} ${escapeHtml(p.unite || "")}</td><td class="r">${fmtMontant(p.montant)}</td></tr>`)
    .join("") || `<tr><td colspan="4">Aucune vente</td></tr>`;

  return `<div class="a4wrap">
    <div class="a4-head">
      <div class="a4-ent">${logo}<h1>${escapeHtml(r.entreprise)}</h1>${coord}</div>
      <div class="a4-meta">
        <div class="a4-titre">ÉTAT</div>
        <p>${escapeHtml(rap.libelle || "")}</p>
      </div>
    </div>
    <table class="a4-table"><thead><tr><th>Indicateur</th><th class="r">Valeur</th></tr></thead><tbody>${statRows}</tbody></table>
    <h3 style="margin:18px 0 4px;color:#0B7A4B">Encaissements par mode</h3>
    <table class="a4-table"><tbody>${payRows}</tbody></table>
    <h3 style="margin:18px 0 4px;color:#0B7A4B">Produits vendus</h3>
    <table class="a4-table"><thead><tr><th>#</th><th>Produit</th><th class="r">Qté</th><th class="r">Montant</th></tr></thead><tbody>${prodRows}</tbody></table>
    <div class="a4-pied"><small>Édité le ${fmtDateHeure(Date.now())}</small></div>
  </div>`;
}

function ticketEtat(rap) {
  const r = Reglages.get();
  const line = (a, b) => `<div class="tot"><span>${a}</span><span>${b}</span></div>`;
  const pay = Object.entries(rap.parPaiement).map(([m, v]) => line(escapeHtml(LIBELLE_PAIEMENT[m] || m), fmtMontant(v))).join("");
  const prod = rap.topProduits.map((p) => `
    <div class="art"><div class="art-det"><span class="art-qte">${escapeHtml(p.nom)} (${fmtNombre(p.qte)})</span><span class="art-mt">${fmtMontant(p.montant)}</span></div></div>`).join("");
  return `
    <div class="c ent-nom">${escapeHtml(r.entreprise)}</div>
    <div class="c pt">ÉTAT</div>
    <div class="c pt">${escapeHtml(rap.libelle || "")}</div>
    <div class="sep"></div>
    ${line("Commandes", String(rap.nbCommandes))}
    ${line("Livrées", String(rap.nbLivrees))}
    ${line("À livrer", String(rap.nbAlivrer))}
    <div class="sep"></div>
    <div class="tot grand"><span>C.A.</span><span>${fmtMontant(rap.ca)}</span></div>
    ${line("Encaissé", fmtMontant(rap.encaisse))}
    <div class="tot reste"><span>Créances</span><span>${fmtMontant(rap.creances)}</span></div>
    <div class="sep"></div>
    <div class="pt" style="font-weight:700">Par mode :</div>
    ${pay || '<div class="pt">—</div>'}
    <div class="sep"></div>
    <div class="pt" style="font-weight:700">Produits vendus :</div>
    ${prod || '<div class="pt">—</div>'}
    <div class="sep"></div>
    <div class="c pt">${fmtDateHeure(Date.now())}</div>`;
}

function imprimerEtat(rap) {
  ouvrirImpression(pageImpression(rap.libelle || "État", blocEtatA4(rap), ticketEtat(rap)));
}

window.Docs = {
  texteBonCommande, texteFacture,
  blocFactureA4, blocBonA4, ticketFacture, ticketBon, pageImpression,
  blocEtatA4, ticketEtat, imprimerEtat,
  imprimerFacture, imprimerBon,
};
})();
