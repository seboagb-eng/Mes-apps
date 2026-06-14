# Configurer Supabase pour PILOT

Suivez ces étapes une seule fois pour connecter l'application à votre base.

## 1. Créer le projet
1. Allez sur https://supabase.com → **New project**.
2. Nom : `pilot`. Région : **West EU (Ireland)** (la plus proche du Bénin avec un bon réseau).
3. Notez le **mot de passe de la base** (vous n'en aurez pas besoin pour l'app, mais gardez-le).

## 2. Désactiver la confirmation d'email (MVP)
**Authentication → Providers → Email** → décochez **Confirm email** → Save.
> Indispensable : sinon l'inscription ne peut pas créer l'entreprise dans la foulée.

## 3. Exécuter les migrations
**SQL Editor → New query**, puis exécutez **dans l'ordre**, l'un après l'autre, le contenu de :
1. `supabase/migrations/0001_schema.sql`
2. `supabase/migrations/0002_rls.sql`
3. `supabase/migrations/0003_functions.sql`
4. `supabase/migrations/0004_fedapay.sql`

## 4. Vérifier l'isolation multi-tenant (recommandé)
Exécutez `supabase/tests/isolation_rls.sql` dans le SQL Editor.
Vous devez voir des messages `OK — isolation multi-tenant vérifiée`. Le script fait un
`ROLLBACK` final : il ne laisse aucune donnée.

## 5. Récupérer les clés
**Project Settings → API** :
- `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` (secret) → `SUPABASE_SERVICE_ROLE_KEY`

Copiez `.env.example` en `.env.local` et collez les valeurs.

## 6. Lancer l'app
```bash
npm install
npm run dev
```
Ouvrez http://localhost:3000 → **Créer mon compte** → l'assistant de démarrage s'affiche.

## 7. (Plus tard) FedaPay — étape 7
1. Créez un compte sur https://fedapay.com (sandbox immédiat).
2. **Paramètres → API** : copiez les clés sandbox dans `.env.local`
   (`FEDAPAY_SECRET_KEY`, `FEDAPAY_PUBLIC_KEY`, `FEDAPAY_ENV=sandbox`).
3. Webhook : pointez-le vers `https://VOTRE-DOMAINE/api/fedapay/webhook`,
   copiez le secret dans `FEDAPAY_WEBHOOK_SECRET`.

> Sans clés FedaPay, le bouton « lien de paiement » utilise une page de secours
> `/payer/[id]` : le reste du produit reste pleinement utilisable.
