# Architecture

## Vue d'ensemble

Application **web autonome, offline-first**, sans serveur ni build. Trois raisons
justifient ce choix par rapport à un framework (React/Next) ou une app native :

1. **Contexte** : commerçante indépendante, réseau instable, pas de support IT.
   → tout doit marcher hors ligne et sans installation technique.
2. **Coût & durabilité** : zéro dépendance = rien à maintenir, rien à payer,
   aucune obsolescence de librairie.
3. **Portabilité** : un simple dossier de fichiers statiques, hébergeable partout
   ou même ouvrable localement.

```
┌───────────────────────────────────────────────┐
│                  index.html                    │
│   Coque + navigation basse + <script> ordonnés │
└───────────────┬───────────────────────────────┘
                │ charge dans l'ordre
   ┌────────────┼───────────────┬─────────────────┐
   ▼            ▼               ▼                 ▼
store.js     format.js      documents.js        app.js
(données)   (affichage)     (bons/factures)   (UI + routeur)
   │
   ▼
localStorage  ← persistance sur l'appareil (clé "gc_data_v1")

sw.js  ← service worker : met en cache la coque → fonctionnement hors ligne
manifest.webmanifest ← installation « écran d'accueil »
```

## Couches

### 1. Données — `js/store.js`
Source de vérité unique. Expose `window.Store` avec des « repositories » :

- `Reglages` — paramètres de la boutique.
- `Produits` — CRUD, mouvements de stock, alertes, valeur du stock.
- `Clients` — CRUD.
- `Commandes` — CRUD, `livrer()` (déduit le stock), `annuler()` (restitue),
  `enregistrerPaiement()`, `genererFacture()`, numérotation automatique.
- `Calc` — calculs dérivés (sous-total, total, reste à payer).
- `Sauvegarde` — export / import / réinitialisation.

**Persistance** : tout l'état est un seul objet JSON sérialisé dans `localStorage`
sous la clé `gc_data_v1`. Un cache mémoire (`_cache`) évite les relectures.
Le champ `version` permet des migrations futures. La fusion défensive des réglages
garantit que l'ajout de nouvelles clés n'écrase pas les données existantes.

**Modèle de données**
```
reglages   { entreprise, telephone, adresse, ville, devise, logo,
             magasinierNom, magasinierTel, piedFacture,
             prefixe/ compteur Commande & Facture }
produit    { id, nom, categorie, unite, prixAchat, prixVente,
             stock, seuilAlerte, actif }
client     { id, nom, telephone, adresse, note }
commande   { id, numero, date, clientId/Nom/Tel,
             lignes[{produitId, nom, unite, qte, prixUnitaire}],
             remise, modePaiement, montantPaye,
             statut(validee|livree|annulee), stockDeduit,
             factureNumero, factureDate, note }
```

### 2. Présentation — `js/format.js`
Fonctions pures d'affichage (`window.Fmt`) : montants FCFA (« 56 000 FCFA »),
dates en français, normalisation des numéros WhatsApp (numéro local béninois à
8 chiffres → préfixe `229`), ouverture de `wa.me`, libellés, échappement HTML.

### 3. Documents — `js/documents.js`
`window.Docs` génère :
- **Bon de commande** : message texte WhatsApp pour le magasinier.
- **Facture** : résumé texte WhatsApp **et** page HTML imprimable (→ PDF via le
  navigateur). Encapsulé dans une IIFE pour ne pas polluer la portée globale.

### 4. Interface — `js/app.js`
Encapsulé dans une IIFE, expose `window.App`. Contient :
- Un **routeur** par hash (`#/`, `#/commandes`, `#/commande/:id`,
  `#/commande-nouvelle`, `#/commande-modifier/:id`, `#/produits`, `#/clients`,
  `#/reglages`, `#/sauvegarde`).
- Des **fonctions de vue** qui produisent du HTML injecté dans `#app`.
- Un système de **modale** générique et de **toast**.
- L'**éditeur de commande** : gère un « brouillon » en mémoire, met à jour les
  totaux en direct sans re-render complet (préservation du focus des champs).

### Choix d'implémentation notables
- **Scripts classiques** (pas de modules ES) pour un fonctionnement en `file://`
  sans serveur. → chaque fichier applicatif est isolé dans une **IIFE** (sauf
  `store.js`/`format.js` qui exposent volontairement leurs API sur `window`).
- **Re-render ciblé** dans l'éditeur : les saisies de texte mettent à jour le
  brouillon et rafraîchissent uniquement les totaux, évitant la perte de focus.
- **Déduction de stock idempotente** : le drapeau `stockDeduit` empêche une double
  déduction ; l'annulation restitue proprement les quantités.

## Fonctionnement hors ligne
1. Au premier chargement, `sw.js` met en cache la coque (`index.html`, CSS, JS, icône).
2. Les visites suivantes servent depuis le cache (stratégie *cache-first*),
   avec repli réseau puis repli `index.html`.
3. Les données ne transitent **jamais** par le réseau : elles restent dans
   `localStorage` sur l'appareil.

## Tests
La logique métier est validée sans DOM (Node + `localStorage` factice) et
l'interface est vérifiée dans un vrai navigateur (Chromium/Playwright) :
rendu des écrans, création de commande, livraison/déduction de stock, paiement,
persistance après rechargement, génération de la facture.

## Sécurité & confidentialité
- Aucune donnée personnelle envoyée à un tiers.
- Le partage WhatsApp ouvre l'app WhatsApp de l'utilisatrice avec un message
  pré-rempli : c'est elle qui décide d'envoyer.
- Sauvegardes sous le contrôle exclusif de l'utilisatrice (fichier local).
