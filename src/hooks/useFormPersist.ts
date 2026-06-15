"use client";

import { useCallback } from "react";

/**
 * Sauvegarde automatique des champs d'un formulaire dans localStorage.
 * Protège la saisie contre les coupures réseau / rechargements involontaires.
 *
 * Usage :
 *   const { save, restore, clear } = useFormPersist("pilot:saisie-vente");
 *   <div onChange={save}> … </div>
 *   useEffect(() => { if (ouvert) restore(divRef.current); }, [ouvert]);
 */
export function useFormPersist(key: string) {
  // Écouter les changements sur un conteneur (via bubbling) et sauvegarder.
  const save = useCallback(
    (e: React.SyntheticEvent<HTMLElement>) => {
      const container = e.currentTarget;
      const inputs = container.querySelectorAll<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >("[name]");
      const data: Record<string, string> = {};
      inputs.forEach((el) => {
        if (el.name) data[el.name] = el.value;
      });
      try {
        localStorage.setItem(key, JSON.stringify(data));
      } catch {}
    },
    [key]
  );

  // Restaurer les valeurs dans un conteneur.
  const restore = useCallback(
    (container: HTMLElement | null) => {
      if (!container) return;
      const raw = localStorage.getItem(key);
      if (!raw) return;
      try {
        const data = JSON.parse(raw) as Record<string, string>;
        Object.entries(data).forEach(([name, value]) => {
          const el = container.querySelector<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
          >(`[name="${name}"]`);
          if (el && value !== undefined) el.value = value;
        });
      } catch {}
    },
    [key]
  );

  // Effacer la sauvegarde (après succès).
  const clear = useCallback(() => {
    try {
      localStorage.removeItem(key);
    } catch {}
  }, [key]);

  return { save, restore, clear };
}
