import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  Users,
  GraduationCap,
  MapPin,
  CheckCircle2,
  Clock,
  PlayCircle,
  TrendingUp,
  Hotel,
  BookOpen,
  Activity,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// ─── Types ────────────────────────────────────────────────────────────────────
interface DashboardData {
  metrics: {
    total_plans: number;
    active_plans: number;
    planned_plans: number;
    completed_plans: number;
    total_users: number;
    total_formateurs: number;
    total_participants: number;
    total_formations: number;
    total_sessions: number;
    total_sites: number;
    total_accommodations: number;
    total_absences: number;
    attendance_rate: number | null;
  };
  plans_by_status: { status: string; count: number }[];
  plans_by_site: { site: string; count: number }[];
  users_by_role: { role: string; count: number }[];
  recent_plans: {
    id: number;
    title: string;
    status: string;
    start_date: string;
    end_date: string;
    site?: { name: string };
  }[];
  sessions_per_month: { month: string; count: number }[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  planifie:  { label: "Planifié",   color: "text-blue-600 bg-blue-50 border-blue-200",   icon: Clock },
  en_cours:  { label: "En cours",   color: "text-amber-600 bg-amber-50 border-amber-200", icon: PlayCircle },
  termine:   { label: "Terminé",    color: "text-green-600 bg-green-50 border-green-200", icon: CheckCircle2 },
  suspendu:  { label: "Suspendu",   color: "text-red-600 bg-red-50 border-red-200",       icon: AlertTriangle },
};

const ROLE_LABELS: Record<string, string> = {
  admin:                 "Admin",
  responsable_cdc:       "Resp. CDC",
  responsable_formation: "Resp. Formation",
  responsable_dr:        "Resp. DR",
  formateur_animateur:   "Form. Animateur",
  formateur_participant: "Form. Participant",
};

const ROLE_COLORS = [
  "bg-red-500", "bg-orange-500", "bg-amber-500",
  "bg-blue-500", "bg-purple-500", "bg-green-500",
];

// Simple bar chart using divs
function BarChart({ data, labelKey, valueKey, colors }: {
  data: any[]; labelKey: string; valueKey: string; colors?: string[];
}) {
  const max = Math.max(...data.map(d => d[valueKey]), 1);
  return (
    <div className="space-y-2.5">
      {data.map((item, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="text-[11px] font-semibold text-muted-foreground w-28 shrink-0 truncate">
            {item[labelKey]}
          </span>
          <div className="flex-1 bg-muted/40 rounded-full h-5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 flex items-center justify-end pr-2 ${
                colors?.[i % colors.length] ?? "bg-primary"
              }`}
              style={{ width: `${Math.max((item[valueKey] / max) * 100, 4)}%` }}
            >
              <span className="text-[10px] font-black text-white">{item[valueKey]}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Donut chart SVG
function DonutChart({ data, colors }: { data: { label: string; value: number }[]; colors: string[] }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  let offset = 0;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  return (
    <div className="flex items-center gap-6">
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="12" />
        {data.map((d, i) => {
          const portion = (d.value / total) * circumference;
          const dashArray = `${portion} ${circumference - portion}`;
          const dashOffset = circumference - offset;
          offset += portion;
          return (
            <circle
              key={i}
              cx="50" cy="50" r={radius}
              fill="none"
              stroke={colors[i % colors.length].replace("bg-", "").replace("-500", "")}
              strokeWidth="12"
              strokeDasharray={dashArray}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              className="transition-all duration-500"
              style={{ stroke: CHART_COLORS[i % CHART_COLORS.length] }}
            />
          );
        })}
        <text x="50" y="54" textAnchor="middle" className="text-xs font-black" fontSize="13" fontWeight="900" fill="#1e293b">
          {total}
        </text>
      </svg>
      <div className="space-y-1.5 flex-1">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
            <span className="text-[11px] font-semibold text-muted-foreground truncate flex-1">{d.label}</span>
            <span className="text-[11px] font-black">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const CHART_COLORS = ["#3b82f6", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#06b6d4"];

// ─── Main Component ───────────────────────────────────────────────────────────
export const DashboardPage = () => {
  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ["dashboard"],
    queryFn: async () => (await axiosInstance.get("/dashboard")).data,
    refetchInterval: 60_000,
  });

  if (isLoading || !data) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-64 bg-muted rounded-lg" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const m = data.metrics;

  const planStatusData = [
    { label: "Planifié", value: m.planned_plans },
    { label: "En cours", value: m.active_plans },
    { label: "Terminé",  value: m.completed_plans },
  ].filter(d => d.value > 0);

  const roleData = data.users_by_role.map(r => ({
    label: ROLE_LABELS[r.role] ?? r.role,
    value: r.count,
  }));

  const maxMonthCount = Math.max(...(data.sessions_per_month.map(s => s.count)), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Tableau de Bord</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Vue d'ensemble du système de gestion des formations — OFPPT
          </p>
        </div>
        <div className="text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full font-medium">
          Actualisé toutes les 60s
        </div>
      </div>

      {/* ── Primary KPI Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Plans */}
        <div className="bg-white border rounded-xl p-5 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full -mr-6 -mt-6" />
          <CalendarDays className="h-5 w-5 text-primary mb-3" />
          <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Plans de Formation</p>
          <p className="text-4xl font-black text-primary mt-1">{m.total_plans}</p>
          <div className="flex gap-2 mt-2 flex-wrap">
            <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-bold">{m.active_plans} en cours</span>
            <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-bold">{m.completed_plans} terminés</span>
          </div>
        </div>

        {/* Users */}
        <div className="bg-white border rounded-xl p-5 shadow-sm relative overflow-hidden hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 rounded-full -mr-6 -mt-6" />
          <Users className="h-5 w-5 text-blue-600 mb-3" />
          <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Utilisateurs</p>
          <p className="text-4xl font-black text-blue-600 mt-1">{m.total_users}</p>
          <p className="text-[10px] text-muted-foreground mt-2">{m.total_formateurs} formateurs</p>
        </div>

        {/* Sessions */}
        <div className="bg-white border rounded-xl p-5 shadow-sm relative overflow-hidden hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/5 rounded-full -mr-6 -mt-6" />
          <Activity className="h-5 w-5 text-purple-600 mb-3" />
          <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Sessions</p>
          <p className="text-4xl font-black text-purple-600 mt-1">{m.total_sessions}</p>
          <p className="text-[10px] text-muted-foreground mt-2">{m.total_formations} formations</p>
        </div>

        {/* Attendance */}
        <div className="bg-white border rounded-xl p-5 shadow-sm relative overflow-hidden hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/5 rounded-full -mr-6 -mt-6" />
          <TrendingUp className="h-5 w-5 text-green-600 mb-3" />
          <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Taux de Présence</p>
          <p className="text-4xl font-black text-green-600 mt-1">
            {m.attendance_rate !== null ? `${m.attendance_rate}%` : "—"}
          </p>
          <p className="text-[10px] text-muted-foreground mt-2">{m.total_absences} absences enregistrées</p>
        </div>
      </div>

      {/* ── Secondary metric row ── */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {[
          { icon: MapPin,    label: "Sites",         value: m.total_sites,          color: "text-orange-500" },
          { icon: Hotel,     label: "Hébergements",  value: m.total_accommodations,  color: "text-teal-500" },
          { icon: BookOpen,  label: "Formations",    value: m.total_formations,      color: "text-indigo-500" },
          { icon: GraduationCap, label: "Formateurs",value: m.total_formateurs,     color: "text-pink-500" },
          { icon: CheckCircle2,  label: "Planifiés",  value: m.planned_plans,       color: "text-blue-500" },
          { icon: AlertTriangle, label: "Absences",  value: m.total_absences,       color: "text-red-500" },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-white border rounded-xl p-3 shadow-sm text-center hover:shadow-md transition-shadow">
            <Icon className={`h-4 w-4 mx-auto mb-1.5 ${color}`} />
            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{label}</p>
            <p className={`text-xl font-black ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Plans by Status Donut */}
        <div className="bg-white border rounded-xl p-5 shadow-sm">
          <h3 className="font-black text-sm mb-4 flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-primary" />
            Plans par Statut
          </h3>
          {planStatusData.length > 0 ? (
            <DonutChart data={planStatusData} colors={CHART_COLORS} />
          ) : (
            <p className="text-sm text-muted-foreground text-center py-6">Aucune donnée</p>
          )}
        </div>

        {/* Users by Role */}
        <div className="bg-white border rounded-xl p-5 shadow-sm">
          <h3 className="font-black text-sm mb-4 flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-600" />
            Utilisateurs par Rôle
          </h3>
          {roleData.length > 0 ? (
            <DonutChart data={roleData} colors={CHART_COLORS} />
          ) : (
            <p className="text-sm text-muted-foreground text-center py-6">Aucune donnée</p>
          )}
        </div>

        {/* Plans by Site Bar */}
        <div className="bg-white border rounded-xl p-5 shadow-sm">
          <h3 className="font-black text-sm mb-4 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-orange-500" />
            Plans par Site (Top 5)
          </h3>
          {data.plans_by_site.length > 0 ? (
            <BarChart
              data={data.plans_by_site}
              labelKey="site"
              valueKey="count"
              colors={["bg-orange-500", "bg-amber-500", "bg-yellow-500", "bg-orange-400", "bg-amber-400"]}
            />
          ) : (
            <p className="text-sm text-muted-foreground text-center py-6">Aucune donnée</p>
          )}
        </div>
      </div>

      {/* ── Sessions per Month sparkline ── */}
      {data.sessions_per_month.length > 0 && (
        <div className="bg-white border rounded-xl p-5 shadow-sm">
          <h3 className="font-black text-sm mb-4 flex items-center gap-2">
            <Activity className="h-4 w-4 text-purple-600" />
            Sessions – 6 derniers mois
          </h3>
          <div className="flex items-end gap-3 h-24">
            {data.sessions_per_month.map((item, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] font-black text-purple-600">{item.count}</span>
                <div
                  className="w-full bg-purple-500 rounded-t-md transition-all duration-700"
                  style={{ height: `${Math.max((item.count / maxMonthCount) * 72, 4)}px` }}
                />
                <span className="text-[9px] text-muted-foreground font-medium">
                  {item.month.slice(5)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Recent Plans ── */}
      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-black text-sm flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-primary" />
            Plans Récents
          </h3>
          <Button variant="ghost" size="sm" className="text-xs gap-1" asChild>
            <Link to="/plans">Voir tous <ArrowRight className="h-3 w-3" /></Link>
          </Button>
        </div>
        <div className="divide-y">
          {data.recent_plans.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground text-center">Aucun plan récent.</p>
          ) : (
            data.recent_plans.map(plan => {
              const s = STATUS_CONFIG[plan.status] ?? STATUS_CONFIG.planifie;
              const Icon = s.icon;
              return (
                <Link
                  key={plan.id}
                  to={`/plans/${plan.id}`}
                  className="flex items-center gap-4 px-4 py-3 hover:bg-muted/20 transition-colors group"
                >
                  <div className={`p-1.5 rounded-lg border ${s.color}`}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate group-hover:text-primary transition-colors">
                      {plan.title}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {plan.site?.name ?? "Site non défini"} •{" "}
                      {plan.start_date ? new Date(plan.start_date).toLocaleDateString("fr-FR") : "—"} →{" "}
                      {plan.end_date ? new Date(plan.end_date).toLocaleDateString("fr-FR") : "—"}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-black border ${s.color} shrink-0`}
                  >
                    {s.label}
                  </Badge>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
