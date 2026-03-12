import { useState, useMemo, useEffect } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import axiosInstance from "@/lib/axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/ui/data-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { User as UserIcon, Trash2, Plus, XCircle, Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { TrainingPlan, User, Theme } from "../types";
import { updatePlan } from "../api";

interface AssignmentsDialogProps {
  plan: TrainingPlan;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AssignmentsDialog = ({
  plan,
  open,
  onOpenChange,
}: AssignmentsDialogProps) => {
  const queryClient = useQueryClient();

  // Local state for temporary edits
  const [participants, setParticipants] = useState<{ userId: number }[]>([]);
  const [trainers, setTrainers] = useState<
    { userId: number; themeIds: number[] }[]
  >([]);
  const [assignments, setAssignments] = useState<
    {
      theme_id: number;
      participant_id: number;
      formateur_id: number;
    }[]
  >([]);

  // Initialize state from plan
  useEffect(() => {
    if (open && plan) {
      setParticipants(plan.participants?.map((p) => ({ userId: p.id })) || []);

      // For trainers, we need to map themes from theme_assignments if not directly available
      // Actually plan.trainers exists but we need their theme assignments
      // Theme assignments for trainers are usually stored in a way that we can extract
      const trainerMap = new Map<number, number[]>();
      plan.theme_assignments?.forEach((ta) => {
        if (ta.formateur_id) {
          const themes = trainerMap.get(ta.formateur_id) || [];
          if (!themes.includes(ta.theme_id)) themes.push(ta.theme_id);
          trainerMap.set(ta.formateur_id, themes);
        }
      });

      setTrainers(
        plan.trainers?.map((t) => ({
          userId: t.id,
          themeIds: trainerMap.get(t.id) || [],
        })) || [],
      );

      setAssignments(
        plan.theme_assignments?.map((ta) => ({
          theme_id: ta.theme_id,
          participant_id: ta.participant_id,
          formateur_id: ta.formateur_id,
        })) || [],
      );
    }
  }, [open, plan]);

  // Data fetching
  const { data: allUsers } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await axiosInstance.get("/users");
      return response.data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => updatePlan(plan.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plan", String(plan.id)] });
      toast.success("Affectations mises à jour.");
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Erreur lors de la mise à jour.",
      );
    },
  });

  const handleSave = () => {
    updateMutation.mutate({
      participants,
      trainers,
      theme_assignments: assignments,
    });
  };

  // Helper selectors
  const themes = plan.formation?.themes || [];
  const selectedParticipantIds = useMemo(
    () => participants.map((p) => p.userId),
    [participants],
  );
  const selectedTrainerIds = useMemo(
    () => trainers.map((t) => t.userId),
    [trainers],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>Gérer les Bénéficiaires & Formateurs</DialogTitle>
        </DialogHeader>

        <Tabs
          defaultValue="participants"
          className="flex-1 flex flex-col overflow-hidden"
        >
          <div className="px-6 py-2 border-b bg-muted/30">
            <TabsList className="grid w-full grid-cols-3 max-w-md h-9">
              <TabsTrigger value="participants" className="text-xs font-bold">
                Bénéficiaires
              </TabsTrigger>
              <TabsTrigger value="trainers" className="text-xs font-bold">
                Formateurs
              </TabsTrigger>
              <TabsTrigger value="assignments" className="text-xs font-bold">
                Affectations
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-auto p-6">
            <TabsContent value="participants" className="mt-0 h-full">
              <UserSelectionSection
                allUsers={allUsers || []}
                selectedIds={selectedParticipantIds}
                onSelectionChange={(ids) => {
                  setParticipants(ids.map((id) => ({ userId: id })));
                  // Clean up assignments for removed participants
                  setAssignments((prev) =>
                    prev.filter((a) => ids.includes(a.participant_id)),
                  );
                }}
                title="Sélctionner les Bénéficiaires"
              />
            </TabsContent>

            <TabsContent value="trainers" className="mt-0 h-full">
              <TrainerManagementSection
                allUsers={allUsers || []}
                selectedTrainers={trainers}
                themes={themes}
                onTrainersChange={(updatedTrainers) => {
                  setTrainers(updatedTrainers);
                  // Clean up assignments for removed trainers
                  const ids = updatedTrainers.map((t) => t.userId);
                  setAssignments((prev) =>
                    prev.filter((a) => ids.includes(a.formateur_id)),
                  );
                }}
              />
            </TabsContent>

            <TabsContent value="assignments" className="mt-0 h-full">
              <AssignmentsSection
                allUsers={allUsers || []}
                participants={participants}
                trainers={trainers}
                themes={themes}
                assignments={assignments}
                onAssignmentsChange={setAssignments}
              />
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter className="px-6 py-4 border-t bg-muted/30">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={updateMutation.isPending}>
            {updateMutation.isPending
              ? "Mise à jour..."
              : "Enregistrer les modifications"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Sub-components
const UserSelectionSection = ({
  allUsers,
  selectedIds,
  onSelectionChange,
  title,
}: {
  allUsers: User[];
  selectedIds: number[];
  onSelectionChange: (ids: number[]) => void;
  title: string;
}) => {
  const columns: ColumnDef<User>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={selectedIds.includes(row.original.id)}
          onCheckedChange={(value) => {
            if (value) {
              onSelectionChange([...selectedIds, row.original.id]);
            } else {
              onSelectionChange(
                selectedIds.filter((id) => id !== row.original.id),
              );
            }
          }}
        />
      ),
    },
    { accessorKey: "matricule", header: "Matricule" },
    {
      accessorKey: "name",
      header: "Nom",
      accessorFn: (u) => `${u.first_name} ${u.last_name}`,
    },
    { accessorKey: "direction.name", header: "Direction" },
    { accessorKey: "centre.name", header: "Centre" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg">
          {title} ({selectedIds.length})
        </h3>
      </div>
      <DataTable
        columns={columns}
        data={allUsers}
        searchKey="name"
        placeholder="Filtrer par nom..."
      />
    </div>
  );
};

const TrainerManagementSection = ({
  allUsers,
  selectedTrainers,
  themes,
  onTrainersChange,
}: {
  allUsers: User[];
  selectedTrainers: { userId: number; themeIds: number[] }[];
  themes: Theme[];
  onTrainersChange: (t: { userId: number; themeIds: number[] }[]) => void;
}) => {
  const selectedIds = selectedTrainers.map((t) => t.userId);

  const columns: ColumnDef<User>[] = [
    {
      id: "select",
      header: "Sél.",
      cell: ({ row }) => (
        <Checkbox
          checked={selectedIds.includes(row.original.id)}
          onCheckedChange={(value) => {
            if (value) {
              onTrainersChange([
                ...selectedTrainers,
                { userId: row.original.id, themeIds: [] },
              ]);
            } else {
              onTrainersChange(
                selectedTrainers.filter((t) => t.userId !== row.original.id),
              );
            }
          }}
        />
      ),
    },
    {
      header: "Formateur",
      accessorFn: (u) => `${u.first_name} ${u.last_name}`,
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-bold text-xs">{`${row.original.first_name} ${row.original.last_name}`}</span>
          <span className="text-[10px] text-muted-foreground">
            {row.original.direction?.name}
          </span>
        </div>
      ),
    },
    {
      header: "Thématiques Assignées",
      cell: ({ row }) => {
        const isSelected = selectedIds.includes(row.original.id);
        if (!isSelected)
          return (
            <span className="text-muted-foreground text-[10px] italic">
              Non sélectionné
            </span>
          );

        const trainer = selectedTrainers.find(
          (t) => t.userId === row.original.id,
        )!;

        return (
          <div className="flex flex-wrap gap-1">
            {themes.map((theme) => {
              const checked = trainer.themeIds.includes(theme.id);
              return (
                <Badge
                  key={theme.id}
                  variant={checked ? "default" : "outline"}
                  className="cursor-pointer text-[9px] px-1.5 py-0"
                  onClick={() => {
                    const newThemes = checked
                      ? trainer.themeIds.filter((id) => id !== theme.id)
                      : [...trainer.themeIds, theme.id];
                    onTrainersChange(
                      selectedTrainers.map((t) =>
                        t.userId === row.original.id
                          ? { ...t, themeIds: newThemes }
                          : t,
                      ),
                    );
                  }}
                >
                  {theme.title}
                </Badge>
              );
            })}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-lg">Gérer les Formateurs & Thèmes</h3>
      <DataTable
        columns={columns}
        data={allUsers}
        searchKey="Formateur"
        placeholder="Rechercher..."
      />
    </div>
  );
};

const AssignmentsSection = ({
  allUsers,
  participants,
  trainers,
  themes,
  assignments,
  onAssignmentsChange,
}: {
  allUsers: User[];
  participants: { userId: number }[];
  trainers: { userId: number; themeIds: number[] }[];
  themes: Theme[];
  assignments: {
    theme_id: number;
    participant_id: number;
    formateur_id: number;
  }[];
  onAssignmentsChange: (
    a: { theme_id: number; participant_id: number; formateur_id: number }[],
  ) => void;
}) => {
  const columns: ColumnDef<any>[] = [
    {
      header: "Bénéficiaire",
      cell: ({ row }) => {
        const user = allUsers.find((u) => u.id === row.original.userId);
        return (
          <div className="flex items-center gap-2">
            <UserIcon className="h-3 w-3 text-muted-foreground" />
            <span className="font-bold text-xs">
              {user ? `${user.first_name} ${user.last_name}` : "Inconnu"}
            </span>
          </div>
        );
      },
    },
    {
      header: "Affectations",
      cell: ({ row }) => {
        const userId = row.original.userId;
        const userAssignments = assignments.filter(
          (a) => a.participant_id === userId,
        );

        return (
          <div className="space-y-2 py-2">
            {userAssignments.map((asgn, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Select
                  value={String(asgn.theme_id)}
                  onValueChange={(val) => {
                    const themeId = Number(val);
                    onAssignmentsChange(
                      assignments.map((a) =>
                        a.participant_id === userId &&
                        a.theme_id === asgn.theme_id &&
                        a.formateur_id === asgn.formateur_id
                          ? { ...a, theme_id: themeId, formateur_id: 0 } // Reset trainer on theme change
                          : a,
                      ),
                    );
                  }}
                >
                  <SelectTrigger className="h-7 text-[10px] w-[180px]">
                    <SelectValue placeholder="Thème..." />
                  </SelectTrigger>
                  <SelectContent>
                    {themes.map((t) => (
                      <SelectItem
                        key={t.id}
                        value={String(t.id)}
                        className="text-xs"
                      >
                        {t.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={String(asgn.formateur_id)}
                  disabled={!asgn.theme_id}
                  onValueChange={(val) => {
                    onAssignmentsChange(
                      assignments.map((a) =>
                        a.participant_id === userId &&
                        a.theme_id === asgn.theme_id &&
                        a.formateur_id === asgn.formateur_id
                          ? { ...a, formateur_id: Number(val) }
                          : a,
                      ),
                    );
                  }}
                >
                  <SelectTrigger className="h-7 text-[10px] w-[180px]">
                    <SelectValue placeholder="Formateur..." />
                  </SelectTrigger>
                  <SelectContent>
                    {trainers
                      .filter((t) => t.themeIds.includes(asgn.theme_id))
                      .map((t) => {
                        const u = allUsers.find((user) => user.id === t.userId);
                        return (
                          <SelectItem
                            key={t.userId}
                            value={String(t.userId)}
                            className="text-xs"
                          >
                            {u
                              ? `${u.first_name} ${u.last_name}`
                              : `ID: ${t.userId}`}
                          </SelectItem>
                        );
                      })}
                  </SelectContent>
                </Select>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-red-600"
                  onClick={() => {
                    onAssignmentsChange(
                      assignments.filter(
                        (a) =>
                          !(
                            a.participant_id === userId &&
                            a.theme_id === asgn.theme_id &&
                            a.formateur_id === asgn.formateur_id
                          ),
                      ),
                    );
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 text-[10px] font-bold uppercase"
              onClick={() =>
                onAssignmentsChange([
                  ...assignments,
                  {
                    participant_id: userId,
                    theme_id: 0,
                    formateur_id: 0,
                  },
                ])
              }
            >
              + Ajouter Affectation
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-primary/5 border border-primary/10 p-3 rounded-lg">
        <p className="text-[10px] text-muted-foreground">
          Associez chaque bénéficiaire aux thématiques du programme et
          choisissez leur formateur référent.
        </p>
      </div>
      <DataTable
        columns={columns}
        data={participants}
        searchKey="userId"
        placeholder="Filtrer..."
      />
    </div>
  );
};
