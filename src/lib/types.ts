/**
 * Types métier de PILOT.
 * Les montants sont toujours des entiers FCFA.
 */

export type Plan = "starter" | "business" | "entreprise";
export type RoleUtilisateur = "admin" | "gestionnaire" | "lecture";
export type StatutCompany = "essai" | "actif" | "bloque";
export type TypeCompte = "caisse" | "banque" | "mobile_money";
export type MoyenPaiement = "especes" | "momo" | "banque" | "virement";
export type StatutVente = "payee" | "partielle" | "impayee";
export type TypeMouvement = "entree" | "sortie";
export type CanalRelance = "whatsapp" | "sms";
export type TonRelance = "courtois" | "ferme" | "dernier_avis";
export type StatutRelance = "preparee" | "envoyee" | "payee";

export interface Company {
  id: string;
  nom: string;
  secteur: string | null;
  plan: Plan;
  statut: StatutCompany;
  date_fin_essai: string | null;
  created_at: string;
}

export interface Utilisateur {
  id: string;
  company_id: string;
  nom: string;
  telephone: string | null;
  email: string | null;
  role: RoleUtilisateur;
  created_at: string;
}

export interface Client {
  id: string;
  company_id: string;
  nom: string;
  telephone: string | null;
  email: string | null;
  notes: string | null;
  created_at: string;
}

export interface Produit {
  id: string;
  company_id: string;
  nom: string;
  prix_vente: number;
  prix_achat: number | null;
  unite: string | null;
  created_at: string;
}

export interface LigneVente {
  produit_id: string | null;
  designation: string;
  quantite: number;
  prix_unitaire: number;
}

export interface Vente {
  id: string;
  company_id: string;
  customer_id: string | null;
  date: string;
  lignes: LigneVente[];
  montant_total: number;
  montant_paye: number;
  statut: StatutVente;
  echeance: string | null;
  created_at: string;
}

export interface Paiement {
  id: string;
  company_id: string;
  sale_id: string | null;
  account_id: string;
  montant: number;
  date: string;
  moyen: MoyenPaiement;
  created_at: string;
}

export interface Compte {
  id: string;
  company_id: string;
  type: TypeCompte;
  nom: string;
  solde_courant: number;
  created_at: string;
}

export interface Transaction {
  id: string;
  company_id: string;
  account_id: string;
  type: TypeMouvement;
  categorie: string;
  montant: number;
  date: string;
  description: string | null;
  sale_id: string | null;
  created_at: string;
}

export interface Relance {
  id: string;
  company_id: string;
  sale_id: string;
  canal: CanalRelance;
  ton: TonRelance;
  statut: StatutRelance;
  date_envoi: string | null;
  lien_paiement: string | null;
  created_at: string;
}

export interface Abonnement {
  id: string;
  company_id: string;
  plan: Plan;
  montant: number;
  prochaine_echeance: string | null;
  statut: "actif" | "en_retard" | "annule";
  created_at: string;
}
