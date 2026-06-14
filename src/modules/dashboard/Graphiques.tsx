"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatFCFA } from "@/lib/format";

const COULEURS = ["#0B5FFF", "#16A34A", "#D97706", "#DC2626", "#7C3AED", "#0891B2"];

const fcfaCourt = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1000 ? `${Math.round(n / 1000)}k` : `${n}`;

/** Courbe du chiffre d'affaires sur 12 semaines. */
export function GraphiqueCA({ data }: { data: { semaine: string; montant: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 10, right: 8, left: -8, bottom: 0 }}>
        <defs>
          <linearGradient id="grad-ca" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#0B5FFF" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#0B5FFF" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="semaine" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
        <YAxis tickFormatter={fcfaCourt} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={40} />
        <Tooltip formatter={(v: number) => formatFCFA(v)} labelStyle={{ fontSize: 12 }} />
        <Area type="monotone" dataKey="montant" stroke="#0B5FFF" strokeWidth={2} fill="url(#grad-ca)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/** Répartition des dépenses du mois par catégorie. */
export function GraphiqueDepenses({
  data,
}: {
  data: { categorie: string; montant: number }[];
}) {
  if (data.length === 0) {
    return <p className="py-8 text-center text-sm text-gray-400">Aucune dépense ce mois-ci.</p>;
  }
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 12, left: 0, bottom: 0 }}>
        <XAxis type="number" tickFormatter={fcfaCourt} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey="categorie" tick={{ fontSize: 11 }} width={90} axisLine={false} tickLine={false} />
        <Tooltip formatter={(v: number) => formatFCFA(v)} />
        <Bar dataKey="montant" radius={[0, 6, 6, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={COULEURS[i % COULEURS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
