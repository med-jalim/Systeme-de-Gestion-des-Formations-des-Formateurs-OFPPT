import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchSessions, fetchAbsences, updateAbsencesBatch } from "../api";
import type { TrainingPlan, Absence } from "../types";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Save,
  Loader2,
  Users,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/providers/AuthProvider";

interface AbsenceTabProps {
  plan: TrainingPlan;
}

export function AbsenceTab({ plan }: AbsenceTabProps) {
  const queryClient = useQueryClient();
  const { hasRole, isAdmin } = useAuth();
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");
  const [localAbsences, setLocalAbsences] = useState<
    Record<number, Partial<Absence>>
  >({});

  const canEdit = isAdmin() || hasRole(["responsable_formation", "responsable_dr", "formateur_animateur", "formateur_participant"]);

  const { data: sessions } = useQuery({
    queryKey: ["sessions", plan.id],
    queryFn: () => fetchSessions(plan.id),
  });

  const selectedSession = useMemo(
    () => sessions?.find((s) => s.id.toString() === selectedSessionId),
    [sessions, selectedSessionId],
  );

  const { data: absences } = useQuery({
    queryKey: ["absences", selectedSessionId],
    queryFn: () => fetchAbsences(parseInt(selectedSessionId)),
    enabled: !!selectedSessionId,
  });

  // Initialize local state when absences are fetched
  useMemo(() => {
    if (absences) {
      const state: Record<number, Partial<Absence>> = {};
      absences.forEach((a) => {
        state[a.user_id] = {
          status: a.status,
          minutes_late: a.minutes_late,
          is_justified: a.is_justified,
          justification_reason: a.justification_reason,
        };
      });
      setLocalAbsences(state);
    }
  }, [absences]);

  const updateMutation = useMutation({
    mutationFn: updateAbsencesBatch,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["absences", selectedSessionId],
      });
      toast.success("Feuille d'émargement enregistrée");
    },
    onError: () => toast.error("Erreur lors de l'enregistrement"),
  });

  const handleStatusChange = (userId: number, status: Absence["status"]) => {
    setLocalAbsences((prev) => ({
      ...prev,
      [userId]: { ...prev[userId], status, user_id: userId },
    }));
  };

  const handleSave = () => {
    if (!selectedSessionId) return;

    const payload = {
      training_session_id: parseInt(selectedSessionId),
      absences: Object.entries(localAbsences).map(([userId, data]) => ({
        user_id: parseInt(userId),
        ...data,
      })),
    };

    updateMutation.mutate(payload);
  };

  if (!sessions || sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-dashed border-muted text-center">
        <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
        <h3 className="font-bold text-lg">Aucune session programmée</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Vous devez d'abord programmer des sessions dans l'onglet "Calendrier"
          avant de pouvoir gérer les absences.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-muted shadow-sm">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Label className="shrink-0 font-bold">Session :</Label>
          <Select
            value={selectedSessionId}
            onOpenChange={() => {}}
            onValueChange={setSelectedSessionId}
          >
            <SelectTrigger className="w-full sm:w-[350px]">
              <SelectValue placeholder="Sélectionner une session..." />
            </SelectTrigger>
            <SelectContent>
              {sessions.map((s) => (
                <SelectItem key={s.id} value={s.id.toString()}>
                  {new Date(s.date).toLocaleDateString("fr-FR")} •{" "}
                  {s.start_time.substring(0, 5)} - {s.theme?.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {canEdit && (
          <Button
            onClick={handleSave}
            disabled={!selectedSessionId || updateMutation.isPending}
            className="gap-2 w-full sm:w-auto"
          >
            {updateMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Enregistrer les modifications
          </Button>
        )}
      </div>

      {!selectedSessionId ? (
        <div className="flex flex-col items-center justify-center p-24 bg-white rounded-xl border border-muted text-center opacity-60">
          <Users className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            Veuillez sélectionner une session pour afficher la liste des
            participants.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-muted shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="p-4 border-b border-muted bg-muted/10">
            <h4 className="font-black text-sm uppercase tracking-wider text-primary truncate">
              {selectedSession?.theme?.title}
            </h4>
            <p className="text-xs text-muted-foreground mt-1">
              Formateur: {selectedSession?.trainer?.first_name}{" "}
              {selectedSession?.trainer?.last_name}
            </p>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                <TableHead className="font-semibold text-xs uppercase tracking-wider py-4 px-6">Participant</TableHead>
                <TableHead className="w-[150px] text-center font-semibold text-xs uppercase tracking-wider py-4 px-6">Présent</TableHead>
                <TableHead className="w-[150px] text-center font-semibold text-xs uppercase tracking-wider py-4 px-6">Retard</TableHead>
                <TableHead className="w-[150px] text-center font-semibold text-xs uppercase tracking-wider py-4 px-6">Absent</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider py-4 px-6">Justification</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plan.participants?.map((participant) => {
                const state = localAbsences[participant.id] || {
                  status: "present",
                };
                return (
                  <TableRow key={participant.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-sm">
                          {participant.first_name} {participant.last_name}
                        </span>
                        <span className="text-[10px] text-muted-foreground uppercase font-black italic">
                          {participant.matricule}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center py-4 px-6">
                      <Button
                        variant={
                          state.status === "present" ? "default" : "outline"
                        }
                        size="sm"
                        className={`h-8 w-8 p-0 rounded-full transition-all ${
                          state.status === "present"
                            ? "bg-green-600 hover:bg-green-700 shadow-md scale-110"
                            : "text-muted-foreground hover:text-green-600"
                        }`}
                        onClick={() =>
                          canEdit && handleStatusChange(participant.id, "present")
                        }
                      >
                        <CheckCircle2 className="h-5 w-5" />
                      </Button>
                    </TableCell>
                    <TableCell className="text-center py-4 px-6">
                      <Button
                        variant={
                          state.status === "late" ? "default" : "outline"
                        }
                        size="sm"
                        disabled={!canEdit}
                        className={`h-8 w-8 p-0 rounded-full transition-all ${
                          state.status === "late"
                            ? "bg-amber-500 hover:bg-amber-600 shadow-md scale-110"
                            : "text-muted-foreground hover:text-amber-500"
                        }`}
                        onClick={() =>
                          canEdit && handleStatusChange(participant.id, "late")
                        }
                      >
                        <Clock className="h-5 w-5" />
                      </Button>
                    </TableCell>
                    <TableCell className="text-center py-4 px-6">
                      <Button
                        variant={
                          state.status === "absent" ? "default" : "outline"
                        }
                        size="sm"
                        disabled={!canEdit}
                        className={`h-8 w-8 p-0 rounded-full transition-all ${
                          state.status === "absent"
                            ? "bg-red-600 hover:bg-red-700 shadow-md scale-110"
                            : "text-muted-foreground hover:text-red-600"
                        }`}
                        onClick={() =>
                          canEdit && handleStatusChange(participant.id, "absent")
                        }
                      >
                        <XCircle className="h-5 w-5" />
                      </Button>
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      {state.status === "absent" && (
                        <Input
                          placeholder="Motif..."
                          className="h-8 text-xs"
                          value={state.justification_reason || ""}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setLocalAbsences((prev) => ({
                              ...prev,
                              [participant.id]: {
                                ...prev[participant.id],
                                justification_reason: e.target.value,
                                user_id: participant.id,
                              },
                            }))
                          }
                        />
                      )}
                      {state.status === "late" && (
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            placeholder="Min"
                            className="h-8 w-20 text-xs"
                            value={state.minutes_late || ""}
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>,
                            ) =>
                              setLocalAbsences((prev) => ({
                                ...prev,
                                [participant.id]: {
                                  ...prev[participant.id],
                                  minutes_late: parseInt(e.target.value) || 0,
                                  user_id: participant.id,
                                },
                              }))
                            }
                          />
                          <span className="text-[10px] text-muted-foreground font-bold uppercase">
                            min
                          </span>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
