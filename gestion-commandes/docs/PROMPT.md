# Cahier des charges / Prompt produit

> Document de référence décrivant l'application telle qu'elle a été conçue.
> Il sert de « prompt » réutilisable pour faire évoluer ou reconstruire l'app.

## 1. Contexte & utilisatrice cible

**Utilisatrice** : une commerçante indépendante au **Bénin** — vente de **poisson**
(frais, congelé, fumé, séché) et d'**articles divers** (huile, riz, conserves…).
Elle travaille depuis son **téléphone**, avec une
connexion internet **instable** (3G), et échange principalement par **WhatsApp**.
Elle n'a pas de compétence informatique ni de support technique.

**Problème à résoudre** : gérer ses commandes de bout en bout —
enregistrer une commande et son prix, transmettre un **bon de commande au magasinier**,
remettre une **facture** au client, et **savoir où en est son stock**.

## 2. Objectifs produit

1. **Enregistrer les commandes** avec les articles, quantités et prix.
2. **Générer un bon de commande** transmissible au magasinier **par WhatsApp**.
3. **Générer des factures** (imprimables / PDF, ou envoyées par WhatsApp).
4. **Suivre le stock** en temps réel (déduction automatique, alertes de rupture).
5. Fonctionner **sur le téléphone**, **hors ligne**, sans abonnement.

## 3. Principes directeurs

- **Hors ligne d'abord** : aucune action ne doit dépendre du réseau. Données locales.
- **Simplicité radicale** : gros boutons, peu de champs, français clair, zéro jargon.
- **WhatsApp comme canal** : bons de commande, factures et relances partent par WhatsApp.
- **Contexte local** : FCFA, Mobile Money (MoMo/Moov), **vente à crédit** gérée.
- **Zéro coût, zéro compte** : pas de serveur obligatoire, pas d'inscription.
- **Aucune perte de données** : sauvegarde/restauration par fichier, à la main de l'utilisatrice.

## 4. Fonctionnalités (portée livrée)

### 4.1 Tableau de bord
- Chiffre d'affaires du **jour** et du **mois**, nombre de commandes du mois.
- **Crédits en cours** (somme des restes à payer).
- **Valeur du stock** (au prix d'achat).
- **Alertes de stock faible** (produits sous le seuil).
- Raccourci « Nouvelle commande » et commandes récentes.

### 4.2 Commandes
- Création : client (répertoire ou saisie libre « au comptant »), lignes d'articles
  (produit, quantité, prix unitaire modifiable), **remise**, **mode de paiement**,
  **acompte / montant payé**, note.
- Numérotation automatique (`CMD-0001`…).
- Statuts : **validée**, **livrée**, **annulée**.
- Détail : récapitulatif, reste à payer, actions.
- **Livraison** → déduit automatiquement les quantités du stock (une seule fois).
- **Annulation** → restitue le stock déduit.
- **Paiements** partiels successifs (suivi du reste).

### 4.3 Bon de commande (magasinier)
- Génère un **message texte structuré** listant les articles et quantités.
- Envoi en un clic vers le **numéro WhatsApp du magasinier** (réglages).

### 4.4 Factures & reçus (client)
- Facture professionnelle **A4** : logo, coordonnées, lignes, totaux, remise,
  payé, **reste à payer**, message de pied. **Imprimable / PDF**.
- **Reçu / ticket** optimisé pour **imprimante Bluetooth portable** (58 mm / 80 mm,
  largeur réglable) — cas d'usage réel de la commerçante.
- Ou **résumé envoyé au client par WhatsApp**.
- Numérotation automatique (`FAC-0001`…).

### 4.5 Stock & produits
- CRUD produits : nom, catégorie, unité, **prix d'achat**, **prix de vente**,
  **stock**, **seuil d'alerte**.
- **Vente au poids** : quantités **décimales** (ex. 2,5 kg), montant calculé auto.
- **Dates d'arrivage et de péremption** (poisson congelé/périssable) + **alerte**
  de péremption proche sur le tableau de bord.
- Badge de stock, mise en évidence des ruptures.
- **Réapprovisionnement** rapide (entrée de stock, met à jour l'arrivage).

### 4.6 Clients
- Répertoire : nom, téléphone (WhatsApp), adresse, note.
- Bouton WhatsApp direct.

### 4.7 Réglages (personnalisation)
- Identité : nom de la boutique, logo, téléphone, ville, adresse.
- **Magasinier** : nom + numéro WhatsApp destinataire des bons.
- Devise, préfixes de numérotation, message de bas de facture.

### 4.8 Sauvegarde
- **Export** JSON téléchargeable (à conserver hors du téléphone).
- **Import** (restauration) et réinitialisation.

## 5. Idées ajoutées (valeur d'ingénieur senior)

- **Vente à crédit et suivi des paiements** — essentiel dans le commerce informel béninois.
- **Déduction automatique du stock** à la livraison + **restitution** à l'annulation.
- **Alertes de rupture** dès que le stock passe sous le seuil.
- **PWA installable + hors ligne** (service worker) — utilisable sans réseau.
- **Sauvegarde/restauration** par fichier — résilience sans serveur.
- **Modes Mobile Money** intégrés (MTN MoMo, Moov Money).
- **Numérotation automatique** des commandes et factures.

## 6. Hors périmètre (évolutions futures)
- Synchronisation multi-appareils / cloud (Supabase).
- Lien de paiement Mobile Money intégré à la facture (FedaPay / KKiaPay).
- Statistiques avancées (top produits, marges, saisonnalité).
- Multi-utilisateurs / multi-boutiques, rôles.
- Scan de code-barres.

## 7. Contraintes techniques
- 100 % **client** (HTML/CSS/JS), sans build ni dépendance externe.
- Stockage **local** (`localStorage`), format JSON versionné.
- Compatible navigateurs mobiles récents (Chrome Android, Safari iOS).
