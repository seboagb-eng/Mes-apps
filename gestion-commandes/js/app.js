/*
 * app.js — Interface, navigation et logique d'écran
 * Application de gestion des commandes (offline-first, mobile-first)
 */
(function () {
  const { Reglages, Produits, Clients, Commandes, Calc, Sauvegarde } = window.Store;
  const {
    fmtMontant, fmtNombre, fmtDate, fmtDateHeure, debutJour, debutMois,
    ouvrirWhatsApp, LIBELLE_PAIEMENT, LIBELLE_STATUT, escapeHtml,
  } = window.Fmt;
  const Docs = window.Docs;

  const App = { brouillon: null };
  window.App = App;

  const $app = () => document.getElementById("app");

  /* ============================= ROUTEUR ============================= */
  const routes = {
    "": vueDashboard,
    "commandes": vueCommandes,
    "commande-nouvelle": () => vueEditeur(null),
    "etat": vueEtatJournalier,
    "produits": vueProduits,
    "clients": vueClients,
    "reglages": vueReglages,
    "sauvegarde": vueSauvegarde,
  };

  function router() {
    const hash = location.hash.replace(/^#\/?/, "");
    const [route, param] = hash.split("/");
    window.scrollTo(0, 0);

    if (route === "commande" && param) return vueDetail(param);
    if (route === "commande-modifier" && param) return vueEditeur(param);

    const vue = routes[route] || vueDashboard;
    vue();
    majNav(route);
  }

  function majNav(route) {
    const map = { "": "accueil", commandes: "commandes", "commande-nouvelle": "commandes", etat: "accueil", produits: "produits", clients: "clients", reglages: "reglages", sauvegarde: "reglages" };
    const actif = map[route] || "accueil";
    document.querySelectorAll(".nav-item").forEach((n) => {
      n.classList.toggle("actif", n.dataset.nav === actif);
    });
  }

  function go(hash) {
    location.hash = hash;
  }
  App.go = go;

  /* ============================= COMPOSANTS ============================= */
  function entete(titre, sousTitre, actionHtml) {
    return `<header class="entete">
      <div>
        <h1>${escapeHtml(titre)}</h1>
        ${sousTitre ? `<p class="sous">${escapeHtml(sousTitre)}</p>` : ""}
      </div>
      ${actionHtml || ""}
    </header>`;
  }

  function badgeStatut(s) {
    return `<span class="badge b-${s}">${LIBELLE_STATUT[s] || s}</span>`;
  }

  /* ============================= TABLEAU DE BORD ============================= */
  function vueDashboard() {
    const r = Reglages.get();
    const cmds = Commandes.liste().filter((o) => o.statut !== "annulee");
    const jour0 = debutJour();
    const mois0 = debutMois();

    const caJour = cmds.filter((o) => o.date >= jour0).reduce((s, o) => s + Calc.total(o), 0);
    const caMois = cmds.filter((o) => o.date >= mois0).reduce((s, o) => s + Calc.total(o), 0);
    const nbMois = cmds.filter((o) => o.date >= mois0).length;
    const creances = cmds.reduce((s, o) => s + Calc.reste(o), 0);
    const valeurStock = Produits.valeurStock();
    const alertes = Produits.enAlerte();
    const perim = Produits.peremptionProche(14);
    const recentes = Commandes.liste().slice(0, 5);

    $app().innerHTML = `
      ${entete(r.entreprise, "Tableau de bord", `<button class="btn-icone" onclick="App.go('#/reglages')" aria-label="Réglages">⚙️</button>`)}

      <div class="grille-stats">
        <div class="carte-stat vert">
          <div class="label">Chiffre du jour</div>
          <div class="valeur">${fmtMontant(caJour)}</div>
        </div>
        <div class="carte-stat bleu">
          <div class="label">Chiffre du mois</div>
          <div class="valeur">${fmtMontant(caMois)}</div>
          <div class="detail">${nbMois} commande(s)</div>
        </div>
        <div class="carte-stat orange">
          <div class="label">Crédits en cours</div>
          <div class="valeur">${fmtMontant(creances)}</div>
        </div>
        <div class="carte-stat gris">
          <div class="label">Valeur du stock</div>
          <div class="valeur">${fmtMontant(valeurStock)}</div>
        </div>
      </div>

      <button class="btn-primaire large" onclick="App.go('#/commande-nouvelle')">➕ Nouvelle commande</button>
      <button class="btn-secondaire large" onclick="App.go('#/etat')">📅 État journalier</button>

      ${alertes.length ? `
        <section class="bloc alerte-bloc">
          <h2>⚠️ Stock faible (${alertes.length})</h2>
          ${alertes.map((p) => `
            <div class="ligne-liste" onclick="App.go('#/produits')">
              <div><strong>${escapeHtml(p.nom)}</strong></div>
              <div class="rouge">${fmtNombre(p.stock)} ${escapeHtml(p.unite)}</div>
            </div>`).join("")}
        </section>` : ""}

      ${perim.length ? `
        <section class="bloc alerte-bloc perim-bloc">
          <h2>🧊 Péremption proche (${perim.length})</h2>
          ${perim.map((x) => `
            <div class="ligne-liste" onclick="App.go('#/produits')">
              <div><strong>${escapeHtml(x.produit.nom)}</strong></div>
              <div class="${x.jours < 0 ? "rouge" : "orange-txt"}">${x.jours < 0 ? `Périmé (${-x.jours} j)` : `${x.jours} j restant(s)`}</div>
            </div>`).join("")}
        </section>` : ""}

      <section class="bloc">
        <div class="bloc-tete">
          <h2>Commandes récentes</h2>
          <a onclick="App.go('#/commandes')">Tout voir</a>
        </div>
        ${recentes.length ? recentes.map(ligneCommande).join("") : `<p class="vide">Aucune commande. Créez la première !</p>`}
      </section>
    `;
  }

  function ligneCommande(o) {
    const reste = Calc.reste(o);
    return `<div class="ligne-liste" onclick="App.go('#/commande/${o.id}')">
      <div>
        <div class="titre-ligne">${escapeHtml(o.numero)} · ${escapeHtml(o.clientNom || "Comptant")}</div>
        <div class="sous-ligne">${fmtDate(o.date)} — ${o.lignes.length} article(s) ${badgeStatut(o.statut)}</div>
      </div>
      <div class="montant-ligne">
        <div>${fmtMontant(Calc.total(o))}</div>
        ${reste > 0 && o.statut !== "annulee" ? `<div class="mini-reste">reste ${fmtMontant(reste)}</div>` : ""}
      </div>
    </div>`;
  }

  /* ============================= ÉTAT JOURNALIER ============================= */
  // Construit le rapport agrégé d'une journée
  function rapportJour(ts) {
    const j0 = debutJour(ts);
    const j1 = j0 + 86400000;
    const jour = Commandes.liste().filter((o) => o.date >= j0 && o.date < j1);
    const actives = jour.filter((o) => o.statut !== "annulee");
    const ca = actives.reduce((s, o) => s + Calc.total(o), 0);
    const encaisse = actives.reduce((s, o) => s + Math.min(Number(o.montantPaye) || 0, Calc.total(o)), 0);
    const creances = actives.reduce((s, o) => s + Calc.reste(o), 0);
    const nbLivrees = actives.filter((o) => o.statut === "livree").length;
    const nbAlivrer = actives.filter((o) => o.statut === "validee").length;
    const nbAnnulees = jour.filter((o) => o.statut === "annulee").length;
    const parPaiement = {};
    actives.forEach((o) => {
      const m = Math.min(Number(o.montantPaye) || 0, Calc.total(o));
      if (m > 0) parPaiement[o.modePaiement] = (parPaiement[o.modePaiement] || 0) + m;
    });
    const prod = {};
    actives.forEach((o) => o.lignes.forEach((l) => {
      if (!prod[l.nom]) prod[l.nom] = { nom: l.nom, unite: l.unite, qte: 0, montant: 0 };
      prod[l.nom].qte += Number(l.qte) || 0;
      prod[l.nom].montant += (Number(l.qte) || 0) * (Number(l.prixUnitaire) || 0);
    }));
    const topProduits = Object.values(prod).sort((a, b) => b.montant - a.montant);
    return {
      ts: j0, nbCommandes: actives.length, nbAnnulees, ca, encaisse, creances,
      nbLivrees, nbAlivrer, parPaiement, topProduits,
      commandes: actives.slice().sort((a, b) => b.date - a.date),
    };
  }

  function vueEtatJournalier() {
    if (!App._dateEtat) App._dateEtat = new Date().toISOString().slice(0, 10);
    const rap = rapportJour(App._dateEtat + "T12:00:00");
    const paiements = Object.entries(rap.parPaiement);

    $app().innerHTML = `
      ${entete("État journalier", fmtDate(rap.ts), `<button class="btn-icone" onclick="App.go('#/')">←</button>`)}

      <section class="bloc">
        <label class="lbl">Date du rapport</label>
        <input type="date" value="${App._dateEtat}" onchange="App.setDateEtat(this.value)">
      </section>

      <div class="grille-stats">
        <div class="carte-stat bleu"><div class="label">Commandes</div><div class="valeur">${rap.nbCommandes}</div>${rap.nbAnnulees ? `<div class="detail">${rap.nbAnnulees} annulée(s)</div>` : ""}</div>
        <div class="carte-stat vert"><div class="label">Chiffre d'affaires</div><div class="valeur">${fmtMontant(rap.ca)}</div></div>
        <div class="carte-stat vert"><div class="label">Encaissé</div><div class="valeur">${fmtMontant(rap.encaisse)}</div></div>
        <div class="carte-stat orange"><div class="label">Créances (reste)</div><div class="valeur">${fmtMontant(rap.creances)}</div></div>
        <div class="carte-stat gris"><div class="label">Livrées</div><div class="valeur">${rap.nbLivrees}</div></div>
        <div class="carte-stat gris"><div class="label">À livrer</div><div class="valeur">${rap.nbAlivrer}</div></div>
      </div>

      <section class="bloc">
        <h2>Encaissements par mode</h2>
        ${paiements.length ? paiements.map(([m, v]) => `
          <div class="recap-ligne"><span>${LIBELLE_PAIEMENT[m] || m}</span><span>${fmtMontant(v)}</span></div>`).join("")
          : `<p class="vide">Aucun encaissement.</p>`}
      </section>

      <section class="bloc">
        <h2>Produits vendus</h2>
        ${rap.topProduits.length ? rap.topProduits.map((p) => `
          <div class="ligne-liste" style="cursor:default">
            <div><div class="titre-ligne">${escapeHtml(p.nom)}</div><div class="sous-ligne">${fmtNombre(p.qte)} ${escapeHtml(p.unite || "")}</div></div>
            <div class="montant-ligne">${fmtMontant(p.montant)}</div>
          </div>`).join("") : `<p class="vide">Aucune vente ce jour.</p>`}
      </section>

      <section class="bloc">
        <h2>Commandes du jour (${rap.commandes.length})</h2>
        ${rap.commandes.length ? rap.commandes.map(ligneCommande).join("") : `<p class="vide">Aucune commande ce jour.</p>`}
      </section>

      <button class="btn-secondaire large" onclick="App.imprimerEtat()">🖨️ Imprimer l'état (A4 / ticket)</button>
    `;
  }

  App.setDateEtat = (iso) => { App._dateEtat = iso || new Date().toISOString().slice(0, 10); vueEtatJournalier(); };
  App.imprimerEtat = () => {
    const rap = rapportJour(App._dateEtat + "T12:00:00");
    Docs.imprimerEtat(rap);
  };

  /* ============================= LISTE COMMANDES ============================= */
  function vueCommandes() {
    App._filtreCmd = App._filtreCmd || "toutes";
    App._rechCmd = App._rechCmd || "";
    dessinerCommandes();
  }

  function dessinerCommandes() {
    const filtre = App._filtreCmd;
    const rech = (App._rechCmd || "").toLowerCase();
    let cmds = Commandes.liste();
    if (filtre === "credit") cmds = cmds.filter((o) => Calc.reste(o) > 0 && o.statut !== "annulee");
    else if (filtre !== "toutes") cmds = cmds.filter((o) => o.statut === filtre);
    if (rech) cmds = cmds.filter((o) => (o.numero + " " + o.clientNom).toLowerCase().includes(rech));

    const onglet = (v, lbl) => `<button class="chip ${App._filtreCmd === v ? "actif" : ""}" onclick="App.setFiltreCmd('${v}')">${lbl}</button>`;

    $app().innerHTML = `
      ${entete("Commandes", cmds.length + " résultat(s)", `<button class="btn-primaire" onclick="App.go('#/commande-nouvelle')">➕</button>`)}
      <input class="recherche" placeholder="🔍 Rechercher (n° ou client)" value="${escapeHtml(App._rechCmd)}" oninput="App.rechercheCmd(this.value)">
      <div class="chips">
        ${onglet("toutes", "Toutes")}
        ${onglet("validee", "Validées")}
        ${onglet("livree", "Livrées")}
        ${onglet("credit", "À crédit")}
        ${onglet("annulee", "Annulées")}
      </div>
      <div class="bloc">
        ${cmds.length ? cmds.map(ligneCommande).join("") : `<p class="vide">Aucune commande.</p>`}
      </div>
    `;
  }

  App.setFiltreCmd = (v) => { App._filtreCmd = v; dessinerCommandes(); };
  App.rechercheCmd = (v) => { App._rechCmd = v; const b = document.querySelector(".bloc"); const rech = v.toLowerCase(); let cmds = Commandes.liste(); const filtre = App._filtreCmd; if (filtre === "credit") cmds = cmds.filter((o) => Calc.reste(o) > 0 && o.statut !== "annulee"); else if (filtre !== "toutes") cmds = cmds.filter((o) => o.statut === filtre); if (rech) cmds = cmds.filter((o) => (o.numero + " " + o.clientNom).toLowerCase().includes(rech)); if (b) b.innerHTML = cmds.length ? cmds.map(ligneCommande).join("") : `<p class="vide">Aucune commande.</p>`; };

  /* ============================= ÉDITEUR DE COMMANDE ============================= */
  function vueEditeur(id) {
    if (id) {
      const o = Commandes.get(id);
      if (!o) return go("#/commandes");
      if (o.stockDeduit || o.statut === "annulee") {
        alert("Cette commande est déjà livrée/annulée et ne peut plus être modifiée.");
        return go("#/commande/" + id);
      }
      App.brouillon = JSON.parse(JSON.stringify(o));
      App.brouillon._edit = id;
    } else {
      App.brouillon = {
        _edit: null,
        clientId: "", clientNom: "", clientTel: "",
        lignes: [], remise: 0, modePaiement: "especes", montantPaye: 0, note: "",
        date: Date.now(),
      };
    }
    dessinerEditeur();
  }

  function dessinerEditeur() {
    const b = App.brouillon;
    const produits = Produits.liste().filter((p) => p.actif);
    const clients = Clients.liste();
    const numero = b._edit ? Commandes.get(b._edit).numero : Commandes.numeroSuivant();

    const optionsProduits = produits
      .map((p) => `<option value="${p.id}">${escapeHtml(p.nom)} — ${fmtMontant(p.prixVente)} (stock ${fmtNombre(p.stock)})</option>`)
      .join("");

    const optionsClients = clients
      .map((c) => `<option value="${c.id}" ${b.clientId === c.id ? "selected" : ""}>${escapeHtml(c.nom)}</option>`)
      .join("");

    $app().innerHTML = `
      ${entete(b._edit ? "Modifier commande" : "Nouvelle commande", numero, `<button class="btn-icone" onclick="App.go('#/commandes')">✕</button>`)}

      <section class="bloc">
        <label class="lbl">Client</label>
        <select id="f-client" onchange="App.choixClient(this.value)">
          <option value="">— Client au comptant —</option>
          ${optionsClients}
        </select>
        <div class="deux-col" style="margin-top:8px">
          <input id="f-clientNom" placeholder="Nom (si nouveau)" value="${escapeHtml(b.clientNom)}" oninput="App.brouillon.clientNom=this.value">
          <input id="f-clientTel" placeholder="Téléphone" value="${escapeHtml(b.clientTel)}" oninput="App.brouillon.clientTel=this.value">
        </div>
      </section>

      <section class="bloc">
        <label class="lbl">Ajouter un article</label>
        <div class="ajout-ligne">
          <select id="f-produit">${optionsProduits || `<option value="">Aucun produit — ajoutez-en dans Stock</option>`}</select>
          <input id="f-qte" type="number" inputmode="decimal" min="0" step="any" value="1" style="max-width:70px" title="Quantité (décimales autorisées, ex: 2,5)">
          <button class="btn-primaire" onclick="App.ajouterLigne()">Ajouter</button>
        </div>
        <p class="aide">💡 Vente au poids : saisissez par ex. <b>2.5</b> kg — le montant se calcule tout seul.</p>
        <div id="lignes-cmd">${dessinerLignes()}</div>
      </section>

      <section class="bloc">
        <div class="deux-col">
          <div>
            <label class="lbl">Remise (FCFA)</label>
            <input type="number" inputmode="numeric" min="0" value="${b.remise || 0}" oninput="App.brouillon.remise=Number(this.value)||0; App.majTotaux()">
          </div>
          <div>
            <label class="lbl">Mode de paiement</label>
            <select onchange="App.brouillon.modePaiement=this.value">
              ${Object.entries(LIBELLE_PAIEMENT).map(([k, v]) => `<option value="${k}" ${b.modePaiement === k ? "selected" : ""}>${v}</option>`).join("")}
            </select>
          </div>
        </div>
        <label class="lbl" style="margin-top:8px">Montant payé / acompte (FCFA)</label>
        <input type="number" inputmode="numeric" min="0" value="${b.montantPaye || 0}" oninput="App.brouillon.montantPaye=Number(this.value)||0; App.majTotaux()">
        <label class="lbl" style="margin-top:8px">Note (facultatif)</label>
        <input placeholder="Ex: livrer avant 17h" value="${escapeHtml(b.note)}" oninput="App.brouillon.note=this.value">
      </section>

      <div class="recap" id="recap">${dessinerRecap()}</div>

      <div class="barre-actions">
        <button class="btn-primaire large" onclick="App.enregistrerCommande()">💾 Enregistrer la commande</button>
      </div>
    `;
  }

  function dessinerLignes() {
    const b = App.brouillon;
    if (!b.lignes.length) return `<p class="vide">Aucun article ajouté.</p>`;
    return b.lignes.map((l, i) => `
      <div class="ligne-article">
        <div class="art-nom">${escapeHtml(l.nom)} <span class="unite-hint">${escapeHtml(l.unite || "")}</span></div>
        <div class="art-controls">
          <input type="number" inputmode="decimal" min="0" step="any" value="${l.qte}" title="Quantité"
                 oninput="App.majLigne(${i},'qte',this.value)">
          <span class="fois">×</span>
          <input type="number" inputmode="numeric" min="0" step="any" value="${l.prixUnitaire}" title="Prix unitaire"
                 oninput="App.majLigne(${i},'prixUnitaire',this.value)">
          <span class="art-total" id="art-total-${i}">${fmtMontant(l.qte * l.prixUnitaire)}</span>
          <button class="btn-suppr" onclick="App.supprLigne(${i})">🗑️</button>
        </div>
      </div>`).join("");
  }

  function dessinerRecap() {
    const b = App.brouillon;
    const st = b.lignes.reduce((s, l) => s + l.qte * l.prixUnitaire, 0);
    const total = Math.max(0, st - (b.remise || 0));
    const reste = Math.max(0, total - (b.montantPaye || 0));
    return `
      <div class="recap-ligne"><span>Sous-total</span><span>${fmtMontant(st)}</span></div>
      ${b.remise ? `<div class="recap-ligne"><span>Remise</span><span>- ${fmtMontant(b.remise)}</span></div>` : ""}
      <div class="recap-ligne grand"><span>TOTAL</span><span>${fmtMontant(total)}</span></div>
      ${b.montantPaye ? `<div class="recap-ligne"><span>Payé</span><span>${fmtMontant(b.montantPaye)}</span></div>` : ""}
      ${reste > 0 ? `<div class="recap-ligne reste"><span>Reste à payer</span><span>${fmtMontant(reste)}</span></div>` : ""}
    `;
  }

  App.choixClient = (id) => {
    const b = App.brouillon;
    b.clientId = id;
    if (id) {
      const c = Clients.get(id);
      if (c) { b.clientNom = c.nom; b.clientTel = c.telephone; }
    }
    const n = document.getElementById("f-clientNom");
    const t = document.getElementById("f-clientTel");
    if (n) n.value = b.clientNom;
    if (t) t.value = b.clientTel;
  };

  App.ajouterLigne = () => {
    const sel = document.getElementById("f-produit");
    const qteEl = document.getElementById("f-qte");
    if (!sel || !sel.value) { alert("Aucun produit sélectionné."); return; }
    const p = Produits.get(sel.value);
    const qte = parseFloat(qteEl.value);
    if (!qte || qte <= 0) { alert("Quantité invalide."); return; }
    const existante = App.brouillon.lignes.find((l) => l.produitId === p.id);
    if (existante) existante.qte += qte;
    else App.brouillon.lignes.push({ produitId: p.id, nom: p.nom, unite: p.unite, qte, prixUnitaire: p.prixVente });
    qteEl.value = 1;
    document.getElementById("lignes-cmd").innerHTML = dessinerLignes();
    App.majTotaux();
  };

  App.majLigne = (i, champ, val) => {
    const l = App.brouillon.lignes[i];
    if (!l) return;
    l[champ] = Math.max(0, Number(val) || 0);
    const cell = document.getElementById("art-total-" + i);
    if (cell) cell.textContent = fmtMontant(l.qte * l.prixUnitaire);
    App.majTotaux();
  };

  App.supprLigne = (i) => {
    App.brouillon.lignes.splice(i, 1);
    document.getElementById("lignes-cmd").innerHTML = dessinerLignes();
    App.majTotaux();
  };

  App.majTotaux = () => {
    const rec = document.getElementById("recap");
    if (rec) rec.innerHTML = dessinerRecap();
  };

  App.enregistrerCommande = () => {
    const b = App.brouillon;
    if (!b.lignes.length) { alert("Ajoutez au moins un article."); return; }
    // Lire les champs texte au cas où (au comptant)
    const n = document.getElementById("f-clientNom");
    const t = document.getElementById("f-clientTel");
    if (n) b.clientNom = n.value;
    if (t) b.clientTel = t.value;

    if (b._edit) {
      Commandes.maj(b._edit, {
        clientId: b.clientId, clientNom: b.clientNom, clientTel: b.clientTel,
        lignes: b.lignes, remise: b.remise, modePaiement: b.modePaiement,
        montantPaye: b.montantPaye, note: b.note,
      });
      go("#/commande/" + b._edit);
    } else {
      const cmd = Commandes.creer(b);
      go("#/commande/" + cmd.id);
    }
    App.brouillon = null;
  };

  /* ============================= DÉTAIL COMMANDE ============================= */
  function vueDetail(id) {
    const o = Commandes.get(id);
    if (!o) return go("#/commandes");
    const total = Calc.total(o);
    const reste = Calc.reste(o);
    const r = Reglages.get();

    const lignes = o.lignes.map((l) => `
      <div class="detail-ligne">
        <div><strong>${escapeHtml(l.nom)}</strong><br><small>${fmtNombre(l.qte)} ${escapeHtml(l.unite || "")} × ${fmtMontant(l.prixUnitaire)}</small></div>
        <div>${fmtMontant(l.qte * l.prixUnitaire)}</div>
      </div>`).join("");

    $app().innerHTML = `
      ${entete(o.numero, fmtDateHeure(o.date), `<button class="btn-icone" onclick="App.go('#/commandes')">←</button>`)}

      <section class="bloc">
        <div class="detail-tete">
          <div>
            <div class="titre-ligne">${escapeHtml(o.clientNom || "Client au comptant")}</div>
            ${o.clientTel ? `<div class="sous-ligne">📞 ${escapeHtml(o.clientTel)}</div>` : ""}
          </div>
          ${badgeStatut(o.statut)}
        </div>
      </section>

      <section class="bloc">
        ${lignes}
        <div class="recap" style="margin-top:8px">
          <div class="recap-ligne"><span>Sous-total</span><span>${fmtMontant(Calc.sousTotal(o))}</span></div>
          ${o.remise ? `<div class="recap-ligne"><span>Remise</span><span>- ${fmtMontant(o.remise)}</span></div>` : ""}
          <div class="recap-ligne grand"><span>TOTAL</span><span>${fmtMontant(total)}</span></div>
          <div class="recap-ligne"><span>Payé (${LIBELLE_PAIEMENT[o.modePaiement] || ""})</span><span>${fmtMontant(o.montantPaye)}</span></div>
          ${reste > 0 ? `<div class="recap-ligne reste"><span>Reste à payer</span><span>${fmtMontant(reste)}</span></div>` : `<div class="recap-ligne paye-ok"><span>✅ Payé intégralement</span><span></span></div>`}
        </div>
        ${o.note ? `<p class="note-cmd">📝 ${escapeHtml(o.note)}</p>` : ""}
        ${o.factureNumero ? `<p class="sous-ligne">Facture : <strong>${escapeHtml(o.factureNumero)}</strong> (${fmtDate(o.factureDate)})</p>` : ""}
      </section>

      <section class="bloc">
        <h2>Documents</h2>
        <div class="grille-boutons">
          <button class="btn-wa" onclick="App.envoyerBonCommande('${o.id}')">📦 Bon de commande → Magasinier (WhatsApp)</button>
          <button class="btn-secondaire" onclick="App.imprimerBon('${o.id}')">🖨️ Imprimer le bon de commande</button>
          <button class="btn-wa" onclick="App.envoyerFacture('${o.id}')">🧾 Facture → Client (WhatsApp)</button>
          <button class="btn-secondaire" onclick="App.imprimerFacture('${o.id}')">🖨️ Imprimer la facture / le reçu</button>
        </div>
      </section>

      ${o.statut !== "annulee" ? `
      <section class="bloc">
        <h2>Actions</h2>
        <div class="grille-boutons">
          ${reste > 0 ? `<button class="btn-primaire" onclick="App.modalPaiement('${o.id}')">💰 Enregistrer un paiement</button>` : ""}
          ${!o.stockDeduit ? `<button class="btn-secondaire" onclick="App.livrer('${o.id}')">✅ Marquer livrée (déduire stock)</button>` : `<span class="info-livree">📦 Stock déjà déduit</span>`}
          ${!o.stockDeduit ? `<button class="btn-secondaire" onclick="App.go('#/commande-modifier/${o.id}')">✏️ Modifier</button>` : ""}
          <button class="btn-danger" onclick="App.annuler('${o.id}')">🚫 Annuler la commande</button>
        </div>
      </section>` : ""}

      <button class="btn-lien-suppr" onclick="App.supprimer('${o.id}')">Supprimer définitivement</button>
    `;
  }

  App.envoyerBonCommande = (id) => {
    const o = Commandes.get(id);
    const r = Reglages.get();
    if (!r.magasinierTel) {
      if (confirm("Aucun numéro de magasinier enregistré. Aller aux réglages ?")) go("#/reglages");
      // On ouvre quand même WhatsApp sans destinataire
    }
    ouvrirWhatsApp(r.magasinierTel, Docs.texteBonCommande(o));
  };

  App.envoyerFacture = (id) => {
    const o = Commandes.genererFacture(id);
    ouvrirWhatsApp(o.clientTel, Docs.texteFacture(o));
    vueDetail(id);
  };

  App.imprimerFacture = (id) => {
    const o = Commandes.genererFacture(id);
    Docs.imprimerFacture(o);
    vueDetail(id);
  };

  App.imprimerBon = (id) => {
    const o = Commandes.get(id);
    Docs.imprimerBon(o);
  };

  App.livrer = (id) => {
    if (!confirm("Marquer cette commande comme livrée et déduire les quantités du stock ?")) return;
    Commandes.livrer(id);
    vueDetail(id);
  };

  App.annuler = (id) => {
    if (!confirm("Annuler cette commande ? Le stock déduit sera restitué.")) return;
    Commandes.annuler(id);
    vueDetail(id);
  };

  App.supprimer = (id) => {
    if (!confirm("Supprimer définitivement cette commande ? Action irréversible.")) return;
    Commandes.supprimer(id);
    go("#/commandes");
  };

  App.modalPaiement = (id) => {
    const o = Commandes.get(id);
    const reste = Calc.reste(o);
    ouvrirModal("Enregistrer un paiement", `
      <p class="sous">Reste à payer : <strong>${fmtMontant(reste)}</strong></p>
      <label class="lbl">Montant reçu (FCFA)</label>
      <input id="m-montant" type="number" inputmode="numeric" min="0" value="${reste}">
      <label class="lbl" style="margin-top:8px">Mode</label>
      <select id="m-mode">
        ${Object.entries(LIBELLE_PAIEMENT).filter(([k]) => k !== "credit").map(([k, v]) => `<option value="${k}" ${o.modePaiement === k ? "selected" : ""}>${v}</option>`).join("")}
      </select>
    `, () => {
      const montant = Number(document.getElementById("m-montant").value) || 0;
      const mode = document.getElementById("m-mode").value;
      Commandes.enregistrerPaiement(id, montant, mode);
      fermerModal();
      vueDetail(id);
    });
  };

  /* ============================= PRODUITS / STOCK ============================= */
  function vueProduits() {
    App._rechProd = App._rechProd || "";
    const rech = App._rechProd.toLowerCase();
    let produits = Produits.liste();
    if (rech) produits = produits.filter((p) => p.nom.toLowerCase().includes(rech));

    $app().innerHTML = `
      ${entete("Stock & Produits", Produits.liste().length + " produit(s)", `<button class="btn-primaire" onclick="App.modalProduit()">➕</button>`)}
      <input class="recherche" placeholder="🔍 Rechercher un produit" value="${escapeHtml(App._rechProd)}" oninput="App._rechProd=this.value; App.rerender('produits')">
      <div class="bloc">
        ${produits.length ? produits.map((p) => {
          const bas = p.stock <= p.seuilAlerte;
          const j = p.datePeremption ? Fmt.joursAvant(p.datePeremption) : null;
          let per = "";
          if (j !== null) {
            const cls = j < 0 ? "per-expire" : j <= 14 ? "per-proche" : "per-ok";
            const txt = j < 0 ? `Périmé depuis ${-j} j` : `Périme le ${Fmt.fmtDateJour(p.datePeremption)} (${j} j)`;
            per = `<div class="sous-ligne ${cls}">🧊 ${txt}</div>`;
          }
          return `<div class="ligne-liste">
            <div onclick="App.modalProduit('${p.id}')" style="flex:1">
              <div class="titre-ligne">${escapeHtml(p.nom)} ${!p.actif ? '<span class="badge b-annulee">inactif</span>' : ""}</div>
              <div class="sous-ligne">Vente ${fmtMontant(p.prixVente)} · ${escapeHtml(p.categorie || "—")}</div>
              ${per}
            </div>
            <div class="stock-badge ${bas ? "bas" : ""}">
              ${fmtNombre(p.stock)} ${escapeHtml(p.unite)}
              ${bas ? '<span class="pastille">⚠️</span>' : ""}
            </div>
            <button class="btn-mini" onclick="App.modalReappro('${p.id}')" title="Réapprovisionner">➕📦</button>
          </div>`;
        }).join("") : `<p class="vide">Aucun produit. Ajoutez votre premier article.</p>`}
      </div>
    `;
  }

  App.modalProduit = (id) => {
    const p = id ? Produits.get(id) : null;
    ouvrirModal(p ? "Modifier le produit" : "Nouveau produit", `
      <label class="lbl">Nom</label>
      <input id="p-nom" value="${p ? escapeHtml(p.nom) : ""}" placeholder="Ex: Sac de riz 25kg">
      <div class="deux-col">
        <div><label class="lbl">Catégorie</label><input id="p-cat" value="${p ? escapeHtml(p.categorie) : ""}" placeholder="Céréales"></div>
        <div><label class="lbl">Unité</label><input id="p-unite" value="${p ? escapeHtml(p.unite) : "pièce"}" placeholder="sac, carton..."></div>
      </div>
      <div class="deux-col">
        <div><label class="lbl">Prix d'achat</label><input id="p-achat" type="number" inputmode="numeric" min="0" value="${p ? p.prixAchat : 0}"></div>
        <div><label class="lbl">Prix de vente</label><input id="p-vente" type="number" inputmode="numeric" min="0" value="${p ? p.prixVente : 0}"></div>
      </div>
      <div class="deux-col">
        <div><label class="lbl">Stock actuel</label><input id="p-stock" type="number" inputmode="decimal" min="0" step="any" value="${p ? p.stock : 0}"></div>
        <div><label class="lbl">Seuil d'alerte</label><input id="p-seuil" type="number" inputmode="decimal" min="0" step="any" value="${p ? p.seuilAlerte : 0}"></div>
      </div>
      <div class="deux-col">
        <div><label class="lbl">Date d'arrivage</label><input id="p-arr" type="date" value="${p ? escapeHtml(p.dateArrivage || "") : ""}"></div>
        <div><label class="lbl">Date de péremption</label><input id="p-per" type="date" value="${p ? escapeHtml(p.datePeremption || "") : ""}"></div>
      </div>
      <p class="aide">🧊 Dates utiles pour le poisson congelé / périssable (facultatif).</p>
      ${p ? `<button class="btn-lien-suppr" onclick="App.supprProduit('${p.id}')">Supprimer ce produit</button>` : ""}
    `, () => {
      const data = {
        nom: val("p-nom"), categorie: val("p-cat"), unite: val("p-unite") || "pièce",
        prixAchat: val("p-achat"), prixVente: val("p-vente"),
        stock: val("p-stock"), seuilAlerte: val("p-seuil"),
        dateArrivage: val("p-arr"), datePeremption: val("p-per"),
      };
      if (!data.nom) { alert("Le nom est obligatoire."); return; }
      if (p) Produits.maj(p.id, data); else Produits.ajouter(data);
      fermerModal();
      vueProduits();
    });
  };

  App.supprProduit = (id) => {
    if (!confirm("Supprimer ce produit ?")) return;
    Produits.supprimer(id);
    fermerModal();
    vueProduits();
  };

  App.modalReappro = (id) => {
    const p = Produits.get(id);
    const auj = new Date().toISOString().slice(0, 10);
    ouvrirModal("Réapprovisionner", `
      <p class="sous">${escapeHtml(p.nom)} — stock actuel : <strong>${fmtNombre(p.stock)} ${escapeHtml(p.unite)}</strong></p>
      <label class="lbl">Quantité reçue à ajouter</label>
      <input id="re-qte" type="number" inputmode="decimal" min="0" step="any" value="1">
      <label class="lbl" style="margin-top:8px">Nouvelle date de péremption (facultatif)</label>
      <input id="re-per" type="date" value="${escapeHtml(p.datePeremption || "")}">
      <p class="aide">La date d'arrivage sera mise à ${Fmt.fmtDateJour(auj)}.</p>
    `, () => {
      const q = parseFloat(document.getElementById("re-qte").value) || 0;
      const per = document.getElementById("re-per").value;
      if (q > 0) Produits.bougerStock(id, q);
      Produits.maj(id, { dateArrivage: auj, datePeremption: per });
      fermerModal();
      vueProduits();
    });
  };

  /* ============================= CLIENTS ============================= */
  function vueClients() {
    App._rechCli = App._rechCli || "";
    const rech = App._rechCli.toLowerCase();
    let clients = Clients.liste().slice().sort((a, b) => a.nom.localeCompare(b.nom));
    if (rech) clients = clients.filter((c) => (c.nom + " " + c.telephone).toLowerCase().includes(rech));

    $app().innerHTML = `
      ${entete("Clients", Clients.liste().length + " client(s)", `<button class="btn-primaire" onclick="App.modalClient()">➕</button>`)}
      <input class="recherche" placeholder="🔍 Rechercher un client" value="${escapeHtml(App._rechCli)}" oninput="App._rechCli=this.value; App.rerender('clients')">
      <div class="bloc">
        ${clients.length ? clients.map((c) => `
          <div class="ligne-liste">
            <div onclick="App.modalClient('${c.id}')" style="flex:1">
              <div class="titre-ligne">${escapeHtml(c.nom)}</div>
              <div class="sous-ligne">${c.telephone ? "📞 " + escapeHtml(c.telephone) : "Pas de téléphone"}</div>
            </div>
            ${c.telephone ? `<button class="btn-mini" onclick="App.waClient('${c.id}')" title="WhatsApp">💬</button>` : ""}
          </div>`).join("") : `<p class="vide">Aucun client enregistré.</p>`}
      </div>
    `;
  }

  App.modalClient = (id) => {
    const c = id ? Clients.get(id) : null;
    ouvrirModal(c ? "Modifier le client" : "Nouveau client", `
      <label class="lbl">Nom</label>
      <input id="c-nom" value="${c ? escapeHtml(c.nom) : ""}" placeholder="Nom du client">
      <label class="lbl">Téléphone (WhatsApp)</label>
      <input id="c-tel" value="${c ? escapeHtml(c.telephone) : ""}" placeholder="Ex: 97 00 00 00" inputmode="tel">
      <label class="lbl">Adresse</label>
      <input id="c-adr" value="${c ? escapeHtml(c.adresse) : ""}" placeholder="Quartier, ville">
      <label class="lbl">Note</label>
      <input id="c-note" value="${c ? escapeHtml(c.note) : ""}" placeholder="Info utile">
      ${c ? `<button class="btn-lien-suppr" onclick="App.supprClient('${c.id}')">Supprimer ce client</button>` : ""}
    `, () => {
      const data = { nom: val("c-nom"), telephone: val("c-tel"), adresse: val("c-adr"), note: val("c-note") };
      if (!data.nom) { alert("Le nom est obligatoire."); return; }
      if (c) Clients.maj(c.id, data); else Clients.ajouter(data);
      fermerModal();
      vueClients();
    });
  };

  App.supprClient = (id) => {
    if (!confirm("Supprimer ce client ?")) return;
    Clients.supprimer(id);
    fermerModal();
    vueClients();
  };

  App.waClient = (id) => {
    const c = Clients.get(id);
    ouvrirWhatsApp(c.telephone, `Bonjour ${c.nom},`);
  };

  /* ============================= RÉGLAGES ============================= */
  function vueReglages() {
    const r = Reglages.get();
    $app().innerHTML = `
      ${entete("Réglages", "Personnalisez votre application")}

      <section class="bloc">
        <h2>Mon entreprise</h2>
        <label class="lbl">Nom de la boutique</label>
        <input id="r-ent" value="${escapeHtml(r.entreprise)}">
        <div class="deux-col">
          <div><label class="lbl">Téléphone</label><input id="r-tel" value="${escapeHtml(r.telephone)}"></div>
          <div><label class="lbl">Ville</label><input id="r-ville" value="${escapeHtml(r.ville)}"></div>
        </div>
        <label class="lbl">Adresse</label>
        <input id="r-adr" value="${escapeHtml(r.adresse)}">
        <label class="lbl">Logo (facultatif)</label>
        <input type="file" accept="image/*" onchange="App.chargerLogo(this)">
        ${r.logo ? `<div class="apercu-logo"><img src="${r.logo}"><button class="btn-mini" onclick="App.retirerLogo()">Retirer</button></div>` : ""}
      </section>

      <section class="bloc">
        <h2>Magasinier (destinataire des bons)</h2>
        <label class="lbl">Nom</label>
        <input id="r-magNom" value="${escapeHtml(r.magasinierNom)}">
        <label class="lbl">Numéro WhatsApp</label>
        <input id="r-magTel" value="${escapeHtml(r.magasinierTel)}" placeholder="Ex: 97000000 ou 22997000000" inputmode="tel">
        <p class="aide">Les bons de commande seront envoyés à ce numéro.</p>
      </section>

      <section class="bloc">
        <h2>Documents</h2>
        <div class="deux-col">
          <div><label class="lbl">Préfixe commande</label><input id="r-pc" value="${escapeHtml(r.prefixeCommande)}"></div>
          <div><label class="lbl">Préfixe facture</label><input id="r-pf" value="${escapeHtml(r.prefixeFacture)}"></div>
        </div>
        <label class="lbl">Devise</label>
        <input id="r-dev" value="${escapeHtml(r.devise)}">
        <label class="lbl">Message de bas de facture</label>
        <input id="r-pied" value="${escapeHtml(r.piedFacture)}">
      </section>

      <button class="btn-primaire large" onclick="App.enregistrerReglages()">💾 Enregistrer les réglages</button>

      <section class="bloc" style="margin-top:16px">
        <h2>Données</h2>
        <button class="btn-secondaire" onclick="App.go('#/sauvegarde')">💾 Sauvegarde & restauration</button>
      </section>

      <p class="version">Gestion des Commandes · v1 · Fonctionne hors ligne</p>
    `;
  }

  App.enregistrerReglages = () => {
    Reglages.maj({
      entreprise: val("r-ent") || "Ma Boutique",
      telephone: val("r-tel"), ville: val("r-ville"), adresse: val("r-adr"),
      magasinierNom: val("r-magNom"), magasinierTel: val("r-magTel"),
      prefixeCommande: val("r-pc") || "CMD", prefixeFacture: val("r-pf") || "FAC",
      devise: val("r-dev") || "FCFA", piedFacture: val("r-pied"),
    });
    toast("Réglages enregistrés ✅");
  };

  App.chargerLogo = (input) => {
    const f = input.files && input.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => { Reglages.maj({ logo: reader.result }); vueReglages(); };
    reader.readAsDataURL(f);
  };
  App.retirerLogo = () => { Reglages.maj({ logo: "" }); vueReglages(); };

  /* ============================= SAUVEGARDE ============================= */
  function vueSauvegarde() {
    const db = Store.charger();
    $app().innerHTML = `
      ${entete("Sauvegarde", "Protégez vos données", `<button class="btn-icone" onclick="App.go('#/reglages')">←</button>`)}
      <section class="bloc">
        <p class="aide">Vos données sont enregistrées sur ce téléphone. Faites régulièrement une sauvegarde et gardez le fichier (Google Drive, e-mail, WhatsApp...).</p>
        <div class="chiffres-db">
          <span>${db.produits.length} produits</span>
          <span>${db.clients.length} clients</span>
          <span>${db.commandes.length} commandes</span>
        </div>
        <button class="btn-primaire large" onclick="App.exporter()">⬇️ Télécharger une sauvegarde</button>
      </section>
      <section class="bloc">
        <h2>Restaurer</h2>
        <p class="aide">Importer un fichier de sauvegarde remplace toutes les données actuelles.</p>
        <input type="file" accept="application/json,.json" onchange="App.importer(this)">
      </section>
      <section class="bloc">
        <h2>Zone sensible</h2>
        <button class="btn-danger" onclick="App.reinit()">🗑️ Tout effacer</button>
      </section>
    `;
  }

  App.exporter = () => {
    const data = Sauvegarde.exporter();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const d = new Date();
    a.href = url;
    a.download = `sauvegarde-commandes-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast("Sauvegarde téléchargée ✅");
  };

  App.importer = (input) => {
    const f = input.files && input.files[0];
    if (!f) return;
    if (!confirm("Remplacer TOUTES les données actuelles par cette sauvegarde ?")) { input.value = ""; return; }
    const reader = new FileReader();
    reader.onload = () => {
      try { Sauvegarde.importer(reader.result); toast("Données restaurées ✅"); go("#/"); router(); }
      catch (e) { alert("Fichier invalide : " + e.message); }
    };
    reader.readAsText(f);
  };

  App.reinit = () => {
    if (!confirm("Effacer TOUTES les données ? Cette action est irréversible.")) return;
    if (!confirm("Êtes-vous vraiment sûre ? Toutes les commandes, produits et clients seront perdus.")) return;
    Sauvegarde.reinitialiser();
    go("#/");
    router();
  };

  /* ============================= MODAL & OUTILS ============================= */
  function ouvrirModal(titre, corps, onValider) {
    App._onValider = onValider;
    const el = document.getElementById("modal");
    el.innerHTML = `
      <div class="modal-fond" onclick="App.fermerModal()"></div>
      <div class="modal-boite">
        <div class="modal-tete"><h3>${escapeHtml(titre)}</h3><button class="btn-icone" onclick="App.fermerModal()">✕</button></div>
        <div class="modal-corps">${corps}</div>
        <div class="modal-pied">
          <button class="btn-secondaire" onclick="App.fermerModal()">Annuler</button>
          <button class="btn-primaire" onclick="App._valider()">Valider</button>
        </div>
      </div>`;
    el.classList.add("ouvert");
  }
  function fermerModal() {
    const el = document.getElementById("modal");
    el.classList.remove("ouvert");
    el.innerHTML = "";
    App._onValider = null;
  }
  App.fermerModal = fermerModal;
  App._valider = () => { if (App._onValider) App._onValider(); };

  App.rerender = (vue) => {
    if (vue === "produits") vueProduits();
    else if (vue === "clients") vueClients();
    // conserver le focus du champ de recherche
    const inp = document.querySelector(".recherche");
    if (inp) { inp.focus(); const v = inp.value; inp.value = ""; inp.value = v; }
  };

  function val(id) {
    const e = document.getElementById(id);
    return e ? e.value.trim() : "";
  }

  function toast(msg) {
    let t = document.getElementById("toast");
    if (!t) { t = document.createElement("div"); t.id = "toast"; document.body.appendChild(t); }
    t.textContent = msg;
    t.classList.add("visible");
    clearTimeout(App._toastTimer);
    App._toastTimer = setTimeout(() => t.classList.remove("visible"), 2200);
  }

  /* ============================= DÉMARRAGE ============================= */
  window.addEventListener("hashchange", router);
  window.addEventListener("DOMContentLoaded", () => {
    Store.charger();
    router();
  });
  // Si le DOM est déjà prêt
  if (document.readyState !== "loading") { Store.charger(); router(); }
})();
