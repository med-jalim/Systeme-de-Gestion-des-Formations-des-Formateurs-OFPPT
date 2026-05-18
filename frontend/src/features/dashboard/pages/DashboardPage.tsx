import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { Link } from "react-router-dom";
import {
   CalendarDays,
   Users,
   Activity,
   ArrowRight,
   TrendingUp,
   Clock,
   PlayCircle,
   CheckCircle2,
   AlertTriangle,
   LayoutGrid,
} from "lucide-react";
import { cn } from "@/lib/utils";

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

const STATUS_MAP: Record<string, { label: string; color: string }> = {
   planifie: { label: "Planifié", color: "bg-blue-100 text-blue-700 border-blue-200" },
   en_cours: { label: "En cours", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
   termine: { label: "Terminé", color: "bg-slate-100 text-slate-700 border-slate-200" },
   suspendu: { label: "Suspendu", color: "bg-rose-100 text-rose-700 border-rose-200" },
};

// ─── Components ───────────────────────────────────────────────────────────────

function KPICard({ title, value, subValue, icon: Icon }: any) {
   return (
      <div className="formal-card p-6 flex flex-col gap-4">
         <div className="flex items-center justify-between">
            <div className="h-10 w-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-primary">
               <Icon className="h-5 w-5" />
            </div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{title}</span>
         </div>
         <div>
            <h3 className="text-3xl font-bold text-slate-900">{value}</h3>
            <p className="text-xs text-slate-500 mt-1 font-medium">{subValue}</p>
         </div>
      </div>
   );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export const DashboardPage = () => {
   const { data, isLoading } = useQuery<DashboardData>({
      queryKey: ["dashboard"],
      queryFn: async () => (await axiosInstance.get("/dashboard")).data,
   });

   if (isLoading || !data) return <div className="py-20 text-center text-slate-400 font-medium animate-pulse">Synchronisation des données institutionnelles...</div>;

   const m = data.metrics;

   return (
      <div className="space-y-10 page-transition">
         {/* Header */}
         <div className="flex flex-col gap-1 border-b border-border pb-6">
            <h1 className="text-2xl font-bold text-slate-900">Tableau de Bord Stratégique</h1>
            <p className="text-sm text-slate-500">Suivi global des opérations de formation et des ressources.</p>
         </div>

         {/* Primary KPI Section */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPICard title="Plans Actifs" value={m.active_plans} subValue={`${m.total_plans} plans enregistrés`} icon={CalendarDays} />
            <KPICard title="Personnel" value={m.total_users} subValue={`${m.total_formateurs} formateurs actifs`} icon={Users} />
            <KPICard title="Sessions" value={m.total_sessions} subValue="Sessions ce semestre" icon={Activity} />
            <KPICard title="Performance" value={m.attendance_rate ? `${m.attendance_rate}%` : "100%"} subValue="Taux de présence global" icon={TrendingUp} />
         </div>

         {/* Secondary Content */}
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Deployments Table */}
            <div className="lg:col-span-2 space-y-4">
               <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold">Déploiements Récents</h3>
                  <Link to="/plans" className="text-xs font-semibold text-primary hover:underline">Consulter tout l'archive</Link>
               </div>
               <div className="formal-card">
                  <table className="w-full text-left">
                     <thead>
                        <tr className="formal-table-header ">
                           <th className="font-semibold p-2">Titre du Plan</th>
                           <th className="font-semibold p-2">Site</th>
                           <th className="font-semibold p-2">Statut</th>
                           <th className="text-right p-2">Action</th>
                        </tr>
                     </thead>
                     <tbody>
                        {data.recent_plans.map(plan => {
                           const s = STATUS_MAP[plan.status] ?? STATUS_MAP.planifie;
                           return (
                              <tr key={plan.id} className="formal-table-row">
                                 <td className="py-4 px-4 text-sm font-semibold text-slate-700">{plan.title}</td>
                                 <td className="py-4 px-4 text-xs text-slate-500">{plan.site?.name || "Non défini"}</td>
                                 <td className="py-4 px-4">
                                    <span className={cn("px-2.5 py-0.5 text-[10px] font-bold rounded-full border", s.color)}>
                                       {s.label}
                                    </span>
                                 </td>
                                 <td className="py-4 px-4 text-right">
                                    <Link to={`/plans/${plan.id}`} className="text-slate-400 hover:text-primary transition-colors">
                                       <ArrowRight className="h-4 w-4 ml-auto" />
                                    </Link>
                                 </td>
                              </tr>
                           )
                        })}
                     </tbody>
                  </table>
               </div>
            </div>

            {/* Roles Distribution */}
            <div className="space-y-4">
               <h3 className="text-lg font-bold">Répartition des Rôles</h3>
               <div className="formal-card p-6 space-y-4">
                  {data.users_by_role.map(role => (
                     <div key={role.role} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold">
                           <span className="text-slate-500 capitalize">{role.role.replace('_', ' ')}</span>
                           <span>{role.count}</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                           <div
                              className="h-full bg-primary transition-all duration-1000"
                              style={{ width: `${(role.count / m.total_users) * 100}%` }}
                           />
                        </div>
                     </div>
                  ))}
                  <div className="pt-4 mt-4 border-t border-slate-100 grid grid-cols-2 gap-4">
                     <div className="text-center">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Programmes</p>
                        <p className="text-xl font-bold text-slate-900">{m.total_formations}</p>
                     </div>
                     <div className="text-center">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Sites</p>
                        <p className="text-xl font-bold text-slate-900">{m.total_sites}</p>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
};
