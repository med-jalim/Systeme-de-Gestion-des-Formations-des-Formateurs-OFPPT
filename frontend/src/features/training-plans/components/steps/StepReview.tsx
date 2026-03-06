import { useWatch } from "react-hook-form";
import type {
  CreateTrainingPlanFormValues,
  TrainerAssignment,
  ParticipantAssignment,
} from "../../schemas/plan.schema";
import { Badge } from "@/components/ui/badge";
import {
  User as UserIcon,
  GraduationCap,
  Users as UsersIcon,
  Calendar,
  MapPin,
  BedDouble,
  Info,
  CheckCircle2,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";

// Mock fallbacks for display
const MOCK_THEMES = [
  { id: 1, title: "Développement React Modern" },
  { id: 2, title: "Architecture API REST" },
  { id: 3, title: "Gestion d'Etat avec TanStack" },
];

export const StepReview = () => {
  const values = useWatch() as CreateTrainingPlanFormValues;

  // Fetch Formations and Sites for names
  const { data: formations } = useQuery({
    queryKey: ["formations"],
    queryFn: async () => {
      const response = await axiosInstance
        .get("/formations")
        .catch(() => ({ data: [] }));
      return response.data;
    },
  });

  const { data: sites } = useQuery({
    queryKey: ["sites"],
    queryFn: async () => {
      const response = await axiosInstance
        .get("/sites")
        .catch(() => ({ data: [] }));
      return response.data;
    },
  });

  const { data: accommodations } = useQuery({
    queryKey: ["accommodations"],
    queryFn: async () => {
      const response = await axiosInstance
        .get("/accommodations")
        .catch(() => ({ data: [] }));
      return response.data;
    },
  });

  const formationName =
    formations?.find((f: any) => f.id === values.formation_id)?.title ||
    `ID: ${values.formation_id}`;
  const siteName =
    sites?.find((s: any) => s.id === values.site_id)?.name ||
    `ID: ${values.site_id}`;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500 hover:bg-green-600">Actif</Badge>;
      case "completed":
        return <Badge className="bg-blue-500 hover:bg-blue-600">Terminé</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Annulé</Badge>;
      default:
        return <Badge variant="secondary">Brouillon</Badge>;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-8">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h3 className="text-xl font-black text-primary tracking-tight uppercase flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6" />
            Vérification Finale
          </h3>
          <p className="text-xs text-muted-foreground mt-1 font-medium">
            Veuillez confirmer les détails de la session de formation.
          </p>
        </div>
        {getStatusBadge(values.status || "draft")}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Info Section */}
        <div className="space-y-4">
          <h4 className="text-[11px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2 px-1">
            <Info className="w-3.5 h-3.5" />
            Informations Générales
          </h4>
          <div className="rounded-xl border bg-card p-4 space-y-4 shadow-sm">
            <div>
              <label className="text-[10px] font-black uppercase text-muted-foreground">
                Titre du plan
              </label>
              <p className="text-sm font-bold text-foreground">
                {values.title || "—"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-1">
                  <GraduationCap className="w-3 h-3" /> Formation
                </label>
                <p className="text-xs font-bold truncate">{formationName}</p>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Site
                </label>
                <p className="text-xs font-bold truncate">{siteName}</p>
              </div>
            </div>

            <div className="pt-2 border-t">
              <label className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Période
              </label>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-[10px] font-bold">
                  {values.start_date
                    ? new Date(values.start_date).toLocaleDateString()
                    : "—"}
                </Badge>
                <span className="text-muted-foreground font-bold">→</span>
                <Badge variant="secondary" className="text-[10px] font-bold">
                  {values.end_date
                    ? new Date(values.end_date).toLocaleDateString()
                    : "—"}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Accommodations Section */}
        <div className="space-y-4">
          <h4 className="text-[11px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2 px-1">
            <BedDouble className="w-3.5 h-3.5" />
            Logistique & Hébergement ({values.accommodations?.length || 0})
          </h4>
          <div className="rounded-xl border bg-card p-2 shadow-sm max-h-[220px] overflow-y-auto space-y-1">
            {values.accommodations?.length ? (
              values.accommodations.map((acc, idx) => {
                const accName =
                  accommodations?.find((a: any) => a.id === acc.hebergementId)
                    ?.name ||
                  (acc.hebergementId === 0
                    ? "Autonome"
                    : `ID: ${acc.hebergementId}`);
                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/30 text-[10px] border border-transparent hover:border-primary/20"
                  >
                    <div className="flex items-center gap-2">
                      <UserIcon className="w-3 h-3 text-muted-foreground" />
                      <span className="font-bold">
                        Utilisateur {acc.userId}
                      </span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="font-bold text-primary">{accName}</span>
                      <span className="text-[8px] text-muted-foreground">
                        {acc.check_in_date} au {acc.check_out_date}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="p-4 text-center text-xs text-muted-foreground italic">
                Aucun hébergement spécifié
              </p>
            )}
          </div>
          {values.logistics_notes && (
            <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-3 text-[10px] flex gap-2">
              <Info className="w-3 h-3 text-blue-600 shrink-0" />
              <p>
                <span className="font-bold text-blue-800">Note: </span>
                {values.logistics_notes}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Trainers */}
        <div className="space-y-3">
          <h4 className="text-[11px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2 px-1">
            <UserIcon className="w-3.5 h-3.5" />
            Équipe Pédagogique ({values.trainers?.length || 0})
          </h4>
          <div className="space-y-2">
            {values.trainers?.map((t: TrainerAssignment) => (
              <div
                key={t.userId}
                className="bg-card border rounded-xl p-3 shadow-sm border-l-4 border-l-amber-500"
              >
                <div className="font-bold text-xs text-foreground mb-2 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  Formateur {t.userId}
                </div>
                <div className="flex flex-wrap gap-1">
                  {t.themeIds.map((tid) => {
                    const theme = MOCK_THEMES.find((mt) => mt.id === tid);
                    return (
                      <Badge
                        key={tid}
                        variant="secondary"
                        className="text-[9px] py-0 font-bold uppercase tracking-tight bg-amber-50 text-amber-900 border-amber-200"
                      >
                        {theme?.title || tid}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Participants */}
        <div className="space-y-3">
          <h4 className="text-[11px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2 px-1">
            <UsersIcon className="w-3.5 h-3.5" />
            Participants ({values.participants?.length || 0})
          </h4>
          <div className="space-y-2">
            {values.participants?.map((p: ParticipantAssignment) => (
              <div
                key={p.userId}
                className="bg-card border rounded-xl p-3 shadow-sm border-l-4 border-l-blue-500"
              >
                <div className="font-bold text-xs mb-2 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  Participant {p.userId}
                </div>
                <div className="space-y-1.5">
                  {p.assignments.map((as, idx) => {
                    const theme = MOCK_THEMES.find(
                      (mt) => mt.id === as.themeId,
                    );
                    return (
                      <div
                        key={idx}
                        className="flex flex-col bg-muted/30 p-2 rounded-lg border border-transparent hover:border-blue-200 transition-colors"
                      >
                        <span className="text-[9px] font-bold text-foreground truncate">
                          {theme?.title || `Thème ${as.themeId}`}
                        </span>
                        <span className="text-[8px] text-muted-foreground font-black uppercase">
                          Encadré par: Formateur {as.trainerId}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
