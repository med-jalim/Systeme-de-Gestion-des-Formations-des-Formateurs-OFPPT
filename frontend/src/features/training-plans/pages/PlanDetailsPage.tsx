import { useParams, Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import type { TrainingPlan } from "../../types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useState } from "react";
import { fetchPlanById, updatePlan } from "../api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Layers,
  User as UserIcon,
  Hotel,
  Edit,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/ui/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import { SessionsTab } from "../components/SessionsTab";
import { AbsenceTab } from "../components/AbsenceTab";
import { AssignmentsDialog } from "../components/AssignmentsDialog";
import { LogisticsDialog } from "../components/LogisticsDialog";

export const PlanDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const location = useLocation();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAssignmentsDialogOpen, setIsAssignmentsDialogOpen] = useState(false);
  const [isLogisticsDialogOpen, setIsLogisticsDialogOpen] = useState(false);
  const [editingData, setEditingData] = useState<{
    title: string;
    site_id: number;
    status: string;
    start_date: string;
    end_date: string;
  } | null>(null);

  const { data: plan, isLoading } = useQuery<TrainingPlan>({
    queryKey: ["plan", id],
    queryFn: () => fetchPlanById(Number(id)),
    enabled: !!id,
  });

  useEffect(() => {
    if (location.state?.edit && plan) {
      setEditingData({
        title: plan.title || "",
        site_id: plan.site_id,
        status: plan.status,
        start_date: plan.start_date.split("T")[0],
        end_date: plan.end_date.split("T")[0],
      });
      setIsEditDialogOpen(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state, plan]);

  const { data: sites } = useQuery<any[]>({
    queryKey: ["sites"],
    queryFn: async () => {
      const resp = await axiosInstance.get("/sites");
      return resp.data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => updatePlan(Number(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plan", id] });
      setIsEditDialogOpen(false);
      toast.success("Plan de formation mis à jour.");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Erreur lors de la mise à jour.",
      );
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-10 w-64" />
        </div>
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <h2 className="text-xl font-bold">Plan introuvable</h2>
        <Button asChild variant="outline">
          <Link to="/plans">Retour à la liste</Link>
        </Button>
      </div>
    );
  }

  const statusColors = {
    draft: "bg-gray-100 text-gray-800",
    active: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };

  const statusLabels = {
    draft: "Brouillon",
    active: "Actif",
    completed: "Terminé",
    cancelled: "Annulé",
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-muted shadow-sm">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="h-10 w-10 shrink-0 rounded-full bg-muted/50 hover:bg-muted"
          >
            <Link to="/plans">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black tracking-tight text-primary">
                {plan.title || plan.formation?.title || "Plan de Formation"}
              </h1>
              <Badge
                variant="secondary"
                className={`uppercase text-[10px] font-bold ${statusColors[plan.status]}`}
              >
                {statusLabels[plan.status]}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {new Date(plan.start_date).toLocaleDateString("fr-FR")} -{" "}
                {new Date(plan.end_date).toLocaleDateString("fr-FR")}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                {plan.site?.name || "Lieu non défini"}
              </span>
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="font-bold"
            onClick={() => {
              setEditingData({
                title: plan.title || "",
                site_id: plan.site_id,
                status: plan.status,
                start_date: plan.start_date.split("T")[0],
                end_date: plan.end_date.split("T")[0],
              });
              setIsEditDialogOpen(true);
            }}
          >
            <Edit className="mr-2 h-4 w-4" /> Modifier Plan
          </Button>
        </div>
      </div>

      {/* Tabs Layout */}
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-5 max-w-4xl bg-white border border-muted shadow-sm h-12 p-1 rounded-xl">
          <TabsTrigger
            value="general"
            className="text-xs font-bold rounded-lg data-[state=active]:bg-primary/5 data-[state=active]:text-primary"
          >
            Général
          </TabsTrigger>
          <TabsTrigger
            value="participants"
            className="text-xs font-bold rounded-lg data-[state=active]:bg-primary/5 data-[state=active]:text-primary"
          >
            Bénéficiaires & Formateurs
          </TabsTrigger>
          <TabsTrigger
            value="logistics"
            className="text-xs font-bold rounded-lg data-[state=active]:bg-primary/5 data-[state=active]:text-primary"
          >
            Logistique & Hébergement
          </TabsTrigger>
          <TabsTrigger
            value="sessions"
            className="text-xs font-bold rounded-lg data-[state=active]:bg-primary/5 data-[state=active]:text-primary"
          >
            Calendrier
          </TabsTrigger>
          <TabsTrigger
            value="absences"
            className="text-xs font-bold rounded-lg data-[state=active]:bg-primary/5 data-[state=active]:text-primary"
          >
            Feuille d'émargement
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent
            value="general"
            className="focus-visible:outline-none focus-visible:ring-0"
          >
            <GeneralTab plan={plan} />
          </TabsContent>
          <TabsContent
            value="participants"
            className="focus-visible:outline-none focus-visible:ring-0"
          >
            <ParticipantsTab
              plan={plan}
              onEditAssignments={() => setIsAssignmentsDialogOpen(true)}
            />
          </TabsContent>
          <TabsContent
            value="logistics"
            className="focus-visible:outline-none focus-visible:ring-0"
          >
            <LogisticsTab
              plan={plan}
              onEditLogistics={() => setIsLogisticsDialogOpen(true)}
            />
          </TabsContent>
          <TabsContent
            value="sessions"
            className="focus-visible:outline-none focus-visible:ring-0"
          >
            <SessionsTab plan={plan} />
          </TabsContent>
          <TabsContent
            value="absences"
            className="focus-visible:outline-none focus-visible:ring-0"
          >
            <AbsenceTab plan={plan} />
          </TabsContent>
        </div>
      </Tabs>

      {/* Assignments Dialog */}
      <AssignmentsDialog
        plan={plan}
        open={isAssignmentsDialogOpen}
        onOpenChange={setIsAssignmentsDialogOpen}
      />

      <LogisticsDialog
        plan={plan}
        open={isLogisticsDialogOpen}
        onOpenChange={setIsLogisticsDialogOpen}
      />

      {/* Edit Plan Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateMutation.mutate(editingData);
            }}
          >
            <DialogHeader>
              <DialogTitle>Modifier le Plan de Formation</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Titre (Facultatif)</Label>
                <Input
                  id="title"
                  value={editingData?.title || ""}
                  onChange={(e) =>
                    setEditingData((prev) => ({
                      ...prev!,
                      title: e.target.value,
                    }))
                  }
                  placeholder="Laisser vide pour utiliser le titre de la formation"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="site">Lieu de formation</Label>
                <Select
                  value={editingData?.site_id.toString()}
                  onValueChange={(val) =>
                    setEditingData((prev) => ({
                      ...prev!,
                      site_id: parseInt(val),
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir un site" />
                  </SelectTrigger>
                  <SelectContent>
                    {sites?.map((site) => (
                      <SelectItem key={site.id} value={site.id.toString()}>
                        {site.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="status">Statut</Label>
                <Select
                  value={editingData?.status}
                  onValueChange={(val) =>
                    setEditingData((prev) => ({ ...prev!, status: val }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir un statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Brouillon</SelectItem>
                    <SelectItem value="active">Actif</SelectItem>
                    <SelectItem value="completed">Terminé</SelectItem>
                    <SelectItem value="cancelled">Annulé</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="start_date">Date de début</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={editingData?.start_date || ""}
                    onChange={(e) =>
                      setEditingData((prev) => ({
                        ...prev!,
                        start_date: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="end_date">Date de fin</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={editingData?.end_date || ""}
                    onChange={(e) =>
                      setEditingData((prev) => ({
                        ...prev!,
                        end_date: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Mise à jour..." : "Enregistrer"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

function GeneralTab({ plan }: { plan: TrainingPlan }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl border border-muted p-6 shadow-sm">
        <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 mb-4">
          <Layers className="h-4 w-4" /> Détails de la Formation
        </h3>
        {plan.formation ? (
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Titre
              </p>
              <p className="text-sm font-bold">{plan.formation.title}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Description
              </p>
              <p className="text-sm text-gray-700">
                {plan.formation.description}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm italic text-muted-foreground">
            Aucune formation liée.
          </p>
        )}
      </div>

      <div className="bg-white rounded-xl border border-muted p-6 shadow-sm">
        <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 mb-4">
          <MapPin className="h-4 w-4" /> Détails du Site
        </h3>
        {plan.site ? (
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Établissement
              </p>
              <p className="text-sm font-bold">{plan.site.name}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Adresse
              </p>
              <p className="text-sm text-gray-700">{plan.site.address}</p>
            </div>
            {plan.site.centre && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Centre de rattachement
                </p>
                <p className="text-sm text-gray-700">
                  {plan.site.centre.name} ({plan.site.centre.code})
                </p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm italic text-muted-foreground">
            Aucun site lié.
          </p>
        )}
      </div>
    </div>
  );
}

function ParticipantsTab({
  plan,
  onEditAssignments,
}: {
  plan: TrainingPlan;
  onEditAssignments: () => void;
}) {
  const assignments = plan.theme_assignments || [];

  const columns: ColumnDef<any>[] = [
    {
      id: "participant",
      header: "Bénéficiaire",
      cell: ({ row }) => {
        const participant = row.original.participant;
        return (
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className="h-6 w-6 p-0 flex items-center justify-center rounded-full shrink-0"
            >
              <UserIcon className="h-3 w-3" />
            </Badge>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-xs truncate">
                {participant
                  ? `${participant.first_name} ${participant.last_name}`
                  : "Inconnu"}
              </span>
              <span className="text-[10px] text-muted-foreground uppercase font-black">
                {participant?.direction?.name || "---"} •{" "}
                {participant?.matricule || "---"}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      header: "Thématique",
      accessorKey: "theme.title",
      cell: ({ row }) => (
        <span className="text-xs font-medium">{row.original.theme?.title}</span>
      ),
    },
    {
      id: "trainer",
      header: "Formateur Assigné",
      cell: ({ row }) => {
        const trainer = row.original.trainer;
        return (
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="h-6 w-6 p-0 flex items-center justify-center rounded-full shrink-0 border-primary/30 text-primary"
            >
              <UserIcon className="h-3 w-3" />
            </Badge>
            <span className="text-xs font-bold">
              {trainer
                ? `${trainer.first_name} ${trainer.last_name}`
                : "Inconnu"}
            </span>
          </div>
        );
      },
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-muted p-6 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">
          Affectations par Thématique
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={onEditAssignments}
          className="font-bold text-xs"
        >
          <Edit className="h-3.5 w-3.5 mr-2" />
          Modifier les Affectations
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={assignments}
        searchKey="participant"
        placeholder="Rechercher par bénéficiaire ou thème..."
      />
    </div>
  );
}

function LogisticsTab({
  plan,
  onEditLogistics,
}: {
  plan: TrainingPlan;
  onEditLogistics: () => void;
}) {
  const accommodations = plan.plan_accommodations || [];

  const columns: ColumnDef<any>[] = [
    {
      id: "user",
      header: "Personne",
      cell: ({ row }) => {
        const user = row.original.user;
        const isTrainer = plan.trainers?.some((t) => t.id === user?.id);
        const roleLabel = isTrainer ? "Formateur" : "Participant";

        return (
          <div className="flex items-center gap-2">
            <Badge
              variant={isTrainer ? "outline" : "secondary"}
              className="h-6 w-6 p-0 flex items-center justify-center rounded-full shrink-0"
            >
              <UserIcon className="h-3 w-3" />
            </Badge>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-xs truncate">
                {user ? `${user.first_name} ${user.last_name}` : "Inconnu"}
              </span>
              <span className="text-[10px] text-muted-foreground uppercase font-black">
                {roleLabel} • {user?.matricule || "---"}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      id: "accommodation",
      header: "Hébergement",
      cell: ({ row }) => {
        const acc = row.original.accommodation;
        if (!acc)
          return (
            <span className="text-xs italic text-muted-foreground">
              Aucun / Autonome
            </span>
          );

        return (
          <div className="flex items-center gap-2">
            <Hotel className="h-3 w-3 text-muted-foreground" />
            <div className="flex flex-col">
              <span className="text-xs font-bold">{acc.name}</span>
              <span className="text-[10px] text-muted-foreground capitalize">
                {acc.type.replace("_", " ")}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      id: "period",
      header: "Période",
      cell: ({ row }) => {
        const checkIn = row.original.check_in_date;
        const checkOut = row.original.check_out_date;

        if (!checkIn && !checkOut)
          return <span className="text-xs text-muted-foreground">---</span>;

        return (
          <div className="flex flex-col">
            <span className="text-xs flex items-center gap-1">
              <span className="text-[10px] uppercase text-muted-foreground font-bold w-12">
                Arrivée:
              </span>
              {checkIn ? new Date(checkIn).toLocaleDateString("fr-FR") : "---"}
            </span>
            <span className="text-xs flex items-center gap-1 text-muted-foreground">
              <span className="text-[10px] uppercase font-bold w-12">
                Départ:
              </span>
              {checkOut
                ? new Date(checkOut).toLocaleDateString("fr-FR")
                : "---"}
            </span>
          </div>
        );
      },
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-muted p-6 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">
          Liste des Réservations
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={onEditLogistics}
          className="font-bold text-xs"
        >
          <Edit className="h-3.5 w-3.5 mr-2" />
          Modifier les Réservations
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={accommodations}
        searchKey="user"
        placeholder="Rechercher..."
      />
    </div>
  );
}
