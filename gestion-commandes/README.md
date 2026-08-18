# 🧾 Gestion des Commandes

**Application mobile de gestion des commandes, factures et stock — pour commerçante indépendante au Bénin.**

Enregistrez vos commandes, envoyez le **bon de commande au magasinier par WhatsApp**, générez vos **factures (PDF)** et suivez votre **stock** en temps réel. L'application **fonctionne 100 % hors ligne** et **s'installe sur le téléphone** comme une vraie application (aucun App Store, aucun abonnement, aucune donnée envoyée sur internet).

---

## ✨ Fonctionnalités

| Module | Ce que ça fait |
|---|---|
| **Tableau de bord** | Chiffre du jour / du mois, crédits en cours, valeur du stock, alertes de rupture |
| **États (jour / semaine / mois)** | Rapport sur la période choisie : nb de commandes, chiffre d'affaires, encaissé, créances, livrées/à livrer, encaissements par mode, produits vendus — **imprimable** (A4 / ticket) |
| **Commandes** | Créer une commande (client, articles, quantités, prix, remise, acompte), suivre son statut |
| **Vente au poids** | Quantités **décimales** (ex. 2,5 kg) — le montant se calcule automatiquement |
| **Bon de commande** | Envoi au **magasinier par WhatsApp** en un clic, **et impression** (A4 ou ticket portable) — liste de préparation avec cases à cocher |
| **Factures & reçus** | **Impression au choix : A4 (PDF), ticket 80 mm ou 58 mm** (imprimante portable), ou envoi WhatsApp — sélecteur de format sur la page d'impression |
| **Stock** | Produits avec prix d'achat/vente, stock déduit automatiquement à la livraison, seuil d'alerte, réapprovisionnement |
| **Péremption** | Dates d'**arrivage** et de **péremption** (poisson congelé/périssable) + **alerte** avant expiration |
| **Clients** | Répertoire clients avec téléphone, accès WhatsApp direct |
| **Crédit / paiements** | Suivi des ventes à crédit et des montants restant à payer (courant au Bénin) |
| **Réglages** | Nom de la boutique, logo, coordonnées, numéro du magasinier, devise, préfixes de numérotation |
| **Sauvegarde** | Export / import d'un fichier de sauvegarde (à garder sur Drive, e-mail ou WhatsApp) |

### Pensé pour le contexte béninois
- 💰 Devise **FCFA / XOF**, montants entiers, format « 56 000 FCFA »
- 📶 **Hors ligne d'abord** — tolère le réseau 3G instable, tout est stocké sur le téléphone
- 💬 **WhatsApp** comme canal principal (bons de commande, factures, relances)
- 🖨️ **Reçu imprimable** sur imprimante Bluetooth portable (58 mm / 80 mm)
- ⚖️ **Vente au poids** (kg) avec quantités décimales
- 🧊 Suivi des **dates de péremption** pour le poisson congelé
- 📱 **Mobile Money** (MTN MoMo, Moov Money) parmi les modes de paiement
- 🗣️ Interface **100 % en français**, gros boutons, simple d'usage

---

## 🚀 Utilisation (aucune installation technique)

1. Ouvrez le dossier `gestion-commandes/` et lancez `index.html` dans un navigateur, **ou** hébergez-le (voir ci-dessous).
2. Sur le téléphone, ouvrez le lien dans **Chrome** (Android) ou **Safari** (iPhone).
3. Menu du navigateur → **« Ajouter à l'écran d'accueil »**. L'app s'installe comme une vraie application.
4. Une fois ouverte une première fois, elle **fonctionne sans internet**.

### Première configuration
1. Allez dans **⚙️ Réglages** → renseignez le **nom de la boutique** et le **numéro WhatsApp du magasinier**.
2. Dans **📦 Stock**, ajoutez vos produits (les exemples fournis peuvent être supprimés).
3. Créez votre première commande avec **➕ Nouvelle commande**.

> 🖨️ **Impression** : dans le détail d'une commande, touchez *« Imprimer le bon
> de commande »* ou *« Imprimer la facture / le reçu »*. Sur la page qui s'ouvre,
> choisissez le **format** (A4 pour une feuille/PDF, ou ticket **80 mm / 58 mm**
> pour une imprimante Bluetooth portable), puis **Imprimer**.

> 💡 **Sauvegarde** : les données vivent sur le téléphone. Faites régulièrement
> *Réglages → Sauvegarde → Télécharger une sauvegarde* et gardez le fichier
> (Google Drive, e-mail, WhatsApp). En cas de changement de téléphone, il suffit
> de réimporter ce fichier.

---

## 🌍 Mise en ligne (optionnelle, gratuite)

Pour partager un lien installable, hébergez le dossier sur n'importe quel hébergeur statique gratuit :

- **Netlify Drop** : glissez le dossier `gestion-commandes/` sur https://app.netlify.com/drop
- **GitHub Pages** : activez Pages sur ce dépôt et pointez sur `/gestion-commandes/`
- **Vercel** : `vercel deploy` dans le dossier

Aucune base de données ni serveur n'est requis.

---

## 🛠️ Technique

- **HTML + CSS + JavaScript pur** — zéro dépendance, zéro build, zéro compte.
- **PWA** installable (`manifest.webmanifest` + `sw.js` service worker) → mode hors ligne.
- **Stockage local** (`localStorage`) — toutes les données restent sur l'appareil.
- **Factures** générées côté navigateur (impression → « Enregistrer en PDF »).
- **WhatsApp** via liens `wa.me` avec message pré-rempli.

Détails d'architecture : voir [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).
Cahier des charges / prompt produit : voir [`docs/PROMPT.md`](docs/PROMPT.md).

### Structure des fichiers
```
gestion-commandes/
├── index.html              # Coque de l'application + navigation
├── manifest.webmanifest    # Métadonnées PWA (installation)
├── sw.js                   # Service worker (fonctionnement hors ligne)
├── css/styles.css          # Thème mobile-first
├── icons/icon.svg          # Icône de l'application
├── js/
│   ├── store.js            # Données locales : produits, clients, commandes, calculs, sauvegarde
│   ├── format.js           # Formats FCFA / dates + helpers WhatsApp
│   ├── documents.js        # Bon de commande (texte) + facture (PDF imprimable)
│   └── app.js              # Interface, routeur et écrans
└── docs/                   # Prompt produit & architecture
```

---

## 🔮 Évolutions possibles
- Synchronisation multi-appareils (Supabase — déjà utilisé par l'app PILOT du même dépôt)
- Lien de paiement Mobile Money dans la facture (FedaPay/KKiaPay)
- Statistiques de vente (produits les plus vendus, marges)
- Multi-boutiques / plusieurs vendeurs
- Lecture de code-barres pour le stock

---

*Application autonome du dépôt **Mes-apps**. Fonctionne hors ligne, sans compte, sans abonnement.*
