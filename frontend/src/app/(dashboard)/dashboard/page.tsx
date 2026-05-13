'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

import { api } from '@/lib/api';
import { Ticket } from '@/types';

import { LoadingSpinner } from '@/components/ui/States';

import {
  Badge,
  ticketPriorityVariant,
  ticketStatusVariant,
} from '@/components/ui/Badge';

import { formatDate, fmt } from '@/lib/utils';

import {
  Ticket as TicketIcon,
  Users,
  Monitor,
  ClipboardList,
} from 'lucide-react';

/* =========================
   RECHARTS FIX SSR
========================= */

const PieChart = dynamic(
  () => import('recharts').then((mod) => mod.PieChart),
  { ssr: false }
);

const Pie = dynamic(
  () => import('recharts').then((mod) => mod.Pie),
  { ssr: false }
);

const Cell = dynamic(
  () => import('recharts').then((mod) => mod.Cell),
  { ssr: false }
);

const ResponsiveContainer = dynamic(
  () => import('recharts').then((mod) => mod.ResponsiveContainer),
  { ssr: false }
);

const Tooltip = dynamic(
  () => import('recharts').then((mod) => mod.Tooltip),
  { ssr: false }
);

const BarChart = dynamic(
  () => import('recharts').then((mod) => mod.BarChart),
  { ssr: false }
);

const Bar = dynamic(
  () => import('recharts').then((mod) => mod.Bar),
  { ssr: false }
);

const XAxis = dynamic(
  () => import('recharts').then((mod) => mod.XAxis),
  { ssr: false }
);

const YAxis = dynamic(
  () => import('recharts').then((mod) => mod.YAxis),
  { ssr: false }
);

/* ========================= */

interface Stats {
  abiertos: number;
  enProgreso: number;
  resueltos: number;
  criticos: number;
}

const COLORS = [
  '#f97316',
  '#eab308',
  '#22c55e',
  '#ef4444',
];

export default function DashboardPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<Ticket[]>('/tickets')
      .then((res) => {
        const list = res.data ?? [];

        setTickets(list.slice(0, 5));

        setStats({
          abiertos: list.filter(
            (t) => t.estado === 'ABIERTO'
          ).length,

          enProgreso: list.filter(
            (t) => t.estado === 'EN_PROGRESO'
          ).length,

          resueltos: list.filter(
            (t) => t.estado === 'RESUELTO'
          ).length,

          criticos: list.filter(
            (t) =>
              t.prioridad === 'CRITICA' &&
              t.estado !== 'CERRADO'
          ).length,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    {
      label: 'Tickets abiertos',
      value: stats?.abiertos ?? '-',
      icon: TicketIcon,
      color: 'bg-orange-100 text-orange-600',
    },

    {
      label: 'En progreso',
      value: stats?.enProgreso ?? '-',
      icon: ClipboardList,
      color: 'bg-yellow-100 text-yellow-600',
    },

    {
      label: 'Resueltos',
      value: stats?.resueltos ?? '-',
      icon: Monitor,
      color: 'bg-green-100 text-green-600',
    },

    {
      label: 'Tickets críticos',
      value: stats?.criticos ?? '-',
      icon: Users,
      color: 'bg-red-100 text-red-600',
    },
  ];

  const statusData = [
    {
      name: 'Abiertos',
      value: stats?.abiertos || 0,
    },

    {
      name: 'En progreso',
      value: stats?.enProgreso || 0,
    },

    {
      name: 'Resueltos',
      value: stats?.resueltos || 0,
    },
  ];

  const priorityData = [
    {
      name: 'Críticos',
      value: stats?.criticos || 0,
    },
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="flex flex-col gap-6">
      
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Dashboard
          </h1>

          <p className="text-sm text-gray-500">
            Resumen general del sistema de soporte técnico
          </p>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
          >
            <div
              className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl ${c.color}`}
            >
              <c.icon className="h-5 w-5" />
            </div>

            <p className="text-3xl font-bold text-gray-900">
              {c.value}
            </p>

            <p className="mt-1 text-sm text-gray-500">
              {c.label}
            </p>
          </div>
        ))}
      </div>

      {/* CHARTS */}
      <div className="grid gap-6 lg:grid-cols-2">
        
        {/* PIE CHART */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-gray-900">
            Estado de tickets
          </h2>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={45}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent || 100).toFixed(0)}%`
                  }
                >
                  {statusData.map((_, index) => (
                    <Cell
                      key={index}
                      fill={COLORS[index % COLORS.length]}
                      stroke="white"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>

                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* LEYENDA */}
          <div className="mt-4 flex items-center justify-center gap-6">
            {statusData.map((item, index) => (
              <div
                key={item.name}
                className="flex items-center gap-2 text-sm text-gray-600"
              >
                <div
                  className="h-3 w-3 rounded-full"
                  style={{
                    backgroundColor:
                      COLORS[index % COLORS.length],
                  }}
                />

                <span>{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* BAR CHART */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-gray-900">
            Tickets críticos
          </h2>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData}>
                <XAxis dataKey="name" />

                <YAxis />

                <Tooltip />

                <Bar
                  dataKey="value"
                  radius={[8, 8, 0, 0]}
                  fill="#ef4444"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* RECENT TICKETS */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="text-sm font-semibold text-gray-900">
            Tickets recientes
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs font-medium text-gray-400">
                <th className="px-5 py-3">Asunto</th>
                <th className="px-5 py-3">Estado</th>
                <th className="px-5 py-3">Prioridad</th>
                <th className="px-5 py-3">Fecha</th>
              </tr>
            </thead>

            <tbody>
              {tickets.map((t) => (
                <tr
                  key={t.id}
                  className="border-b border-gray-50 transition-colors hover:bg-gray-50"
                >
                  <td className="px-5 py-4 font-medium text-gray-900">
                    {t.titulo}
                  </td>

                  <td className="px-5 py-4">
                    <Badge
                      variant={ticketStatusVariant(
                        t.estado
                      )}
                    >
                      {fmt(t.estado)}
                    </Badge>
                  </td>

                  <td className="px-5 py-4">
                    <Badge
                      variant={ticketPriorityVariant(
                        t.prioridad
                      )}
                    >
                      {fmt(t.prioridad)}
                    </Badge>
                  </td>

                  <td className="px-5 py-4 text-gray-400">
                    {formatDate(t.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </div>
    </div>
  );
}