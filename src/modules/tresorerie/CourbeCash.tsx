"use client";

import { useState } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatFCFA } from "@/lib/format";

const fcfaCourt = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1000 ? `${Math.round(n / 1000)}k` : `${n}`;

/**
 * Courbe d'évolution du cash. Reçoit la série jour par jour sur 90 jours
 * et permet de basculer entre 30 et 90 jours côté client (sans recharger).
 */
export default function CourbeCash({
  serie,
}: {
  serie: { date: string; solde: number }[];
}) {
  const [fenetre, setFenetre] = useState<30 | 90>(30);
  const data = serie.slice(-fenetre).map((p) => ({
    jour: p.date.slice(5), // MM-DD
    solde: p.solde,
  }));

  return (
    <div>
      <div className="mb-2 flex gap-2">
        {[30, 90].map((j) => (
          <button
            key={j}
            onClick={() => setFenetre(j as 30 | 90)}
            className={`badge ${
              fenetre === j ? "bg-primary text-white" : "bg-gray-100 text-gray-600"
            }`}
          >
            {j} jours
          </button>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
          <defs>
            <linearGradient id="grad-cash" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#16A34A" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#16A34A" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="jour" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} minTickGap={24} />
          <YAxis tickFormatter={fcfaCourt} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={40} />
          <Tooltip formatter={(v: number) => formatFCFA(v)} />
          <Area type="monotone" dataKey="solde" stroke="#16A34A" strokeWidth={2} fill="url(#grad-cash)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
