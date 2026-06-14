"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Client Supabase pour les composants côté navigateur.
 * Utilise la clé anon publique : toute la sécurité repose sur le RLS.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
