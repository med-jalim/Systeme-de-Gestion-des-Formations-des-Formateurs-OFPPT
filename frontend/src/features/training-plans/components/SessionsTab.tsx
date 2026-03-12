import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchSessions, createSession, deleteSession } from "../api";
import type { TrainingPlan, TrainingSession } from "../types";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Trash2,
  Calendar as CalendarIcon,
  Clock,
  Video,
  MapPin,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface SessionsTabProps {
  plan: TrainingPlan;
}

export function SessionsTab({ plan }: SessionsTabProps) {
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newSession, setNewSession] = useState<Partial<TrainingSession>>({
    training_plan_id: plan.id,
    type: "présentiel",
    date: new Date().toISOString().split("T")[0],
    start_time: "09:00",
    end_time: "12:00",
  });

  const { data: sessions, isLoading } = useQuery({
    queryKey: ["sessions", plan.id],
    queryFn: () => fetchSessions(plan.id),
  });

  const createMutation = useMutation({
    mutationFn: createSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions", plan.id] });
      setIsAddDialogOpen(false);
      toast.success("Session ajoutée avec succès");
      setNewSession({
        training_plan_id: plan.id,
        type: "présentiel",
        date: new Date().toISOString().split("T")[0],
        start_time: "09:00",
        end_time: "12:00",
      });
    },
    onError: () => toast.error("Erreur lors de l'ajout de la session"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions", plan.id] });
      toast.success("Session supprimée");
    },
    onError: () => toast.error("Erreur lors de la suppression"),
  });

  const handleCreate = () => {
    if (!newSession.theme_id || !newSession.trainer_id || !newSession.date) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }
    createMutation.mutate(newSession);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold">Calendrier des Sessions</h3>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" /> Programmer une session
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Programmer une nouvelle session</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Thématique</Label>
                <Select
                  value={newSession.theme_id?.toString()}
                  onValueChange={(val) =>
                    setNewSession({
                      ...newSession,
                      theme_id: parseInt(val),
                      trainer_id: undefined,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir un thème" />
                  </SelectTrigger>
                  <SelectContent>
                    {plan.formation?.themes?.map((t) => (
                      <SelectItem key={t.id} value={t.id.toString()}>
                        {t.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Formateur</Label>
                <Select
                  value={newSession.trainer_id?.toString()}
                  onValueChange={(val) =>
                    setNewSession({ ...newSession, trainer_id: parseInt(val) })
                  }
                  disabled={!newSession.theme_id}
                >
                  <SelectTrigger
                    className={
                      !newSession.theme_id
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }
                  >
                    <SelectValue
                      placeholder={
                        newSession.theme_id
                          ? "Choisir un formateur"
                          : "Sélectionnez d'abord un thème"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {plan.theme_assignments
                      ?.filter((a) => a.theme_id === newSession.theme_id)
                      .map((a) => a.trainer)
                      .filter(
                        (t, index, self) =>
                          t && self.findIndex((s) => s?.id === t.id) === index,
                      )
                      .map((t) => (
                        <SelectItem key={t!.id} value={t!.id.toString()}>
                          {t!.first_name} {t!.last_name}
                        </SelectItem>
                      ))}
                    {plan.theme_assignments?.filter(
                      (a) => a.theme_id === newSession.theme_id,
                    ).length === 0 && (
                      <div className="py-2 px-4 text-xs italic text-muted-foreground">
                        Aucun formateur assigné à ce thème
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={newSession.date}
                    onChange={(e) =>
                      setNewSession({ ...newSession, date: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Type</Label>
                  <Select
                    value={newSession.type}
                    onValueChange={(val: any) =>
                      setNewSession({ ...newSession, type: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="présentiel">Présentiel</SelectItem>
                      <SelectItem value="à distance">À distance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Début</Label>
                  <Input
                    type="time"
                    value={newSession.start_time}
                    onChange={(e) =>
                      setNewSession({
                        ...newSession,
                        start_time: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Fin</Label>
                  <Input
                    type="time"
                    value={newSession.end_time}
                    onChange={(e) =>
                      setNewSession({ ...newSession, end_time: e.target.value })
                    }
                  />
                </div>
              </div>

              {newSession.type === "à distance" && (
                <div className="grid gap-2">
                  <Label>Lien de la réunion</Label>
                  <Input
                    placeholder="https://teams.microsoft.com/..."
                    value={newSession.remote_link || ""}
                    onChange={(e) =>
                      setNewSession({
                        ...newSession,
                        remote_link: e.target.value,
                      })
                    }
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
              >
                Annuler
              </Button>
              <Button
                onClick={handleCreate}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Confirmer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-xl border border-muted shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead>Date & Heure</TableHead>
              <TableHead>Thématique</TableHead>
              <TableHead>Formateur</TableHead>
              <TableHead>Modalité</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions?.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center h-24 text-muted-foreground italic"
                >
                  Aucune session programmée.
                </TableCell>
              </TableRow>
            ) : (
              sessions?.map((session) => (
                <TableRow key={session.id} className="group transition-colors">
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold flex items-center gap-1.5 text-sm">
                        <CalendarIcon className="h-3.5 w-3.5 text-primary" />
                        {new Date(session.date).toLocaleDateString("fr-FR")}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                        <Clock className="h-3 w-3" />
                        {session.start_time.substring(0, 5)} -{" "}
                        {session.end_time.substring(0, 5)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium">
                      {session.theme?.title}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {session.trainer
                        ? `${session.trainer.first_name} ${session.trainer.last_name}`
                        : "---"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          session.type === "à distance"
                            ? "secondary"
                            : "outline"
                        }
                        className="capitalize px-1.5 py-0 text-[10px]"
                      >
                        {session.type === "à distance" ? (
                          <Video className="h-3 w-3 mr-1" />
                        ) : (
                          <MapPin className="h-3 w-3 mr-1" />
                        )}
                        {session.type}
                      </Badge>
                      {session.type === "à distance" && session.remote_link && (
                        <a
                          href={session.remote_link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary hover:text-primary/80"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => {
                        if (confirm("Supprimer cette session ?")) {
                          deleteMutation.mutate(session.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
