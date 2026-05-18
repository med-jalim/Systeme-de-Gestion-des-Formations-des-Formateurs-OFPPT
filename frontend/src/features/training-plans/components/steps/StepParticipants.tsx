import { useState, useMemo, useCallback } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import type {
  PlanParticipantsFormValues,
  PlanTrainersFormValues,
  ParticipantAssignment,
} from "../../schemas/plan.schema";
import type { Theme } from "../../types";
import { Button } from "@/components/ui/button";
import {
  Trash2,
  AlertCircle,
  Plus,
  User as UserIcon,
  Filter,
  Layers,
  XCircle,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/ui/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";

export const StepParticipants = () => {
  const { setValue, getValues } = useFormContext<
    PlanParticipantsFormValues &
      PlanTrainersFormValues & { formation_id: number }
  >();

  const participantsAssignments = useWatch({ name: "participants" }) || [];
  const trainersAssignments = useWatch({ name: "trainers" }) || [];
  const formationId = useWatch({ name: "formation_id" });

  const selectedParticipantIds = useMemo(
    () => participantsAssignments.map((a: ParticipantAssignment) => a.userId),
    [participantsAssignments],
  );

  // Source Filters
  const [srcDirFilter, setSrcDirFilter] = useState<string>("all");
  const [srcCentreFilter] = useState<string>("all");

  // Assignment Filters
  const [asgnDirFilter, setAsgnDirFilter] = useState<string>("all");
  const [asgnCentreFilter] = useState<string>("all");

  const [assignedTableSelection, setAssignedTableSelection] = useState<any[]>(
    [],
  );

  // Fetch All Potential Participants (same users endpoint)
  const { data: allUsers, isLoading: usersLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await axiosInstance.get("/users?all=true");
      return response.data;
    },
  });

  const participantsData = useMemo(() => allUsers || [], [allUsers]);

  // Fetch Themes based on formationId
  const { data: themes, isLoading: themesLoading } = useQuery({
    queryKey: ["themes", formationId],
    queryFn: async () => {
      if (!formationId) return [];
      const response = await axiosInstance.get(
        `/themes?formation_id=${formationId}`,
      );
      return response.data;
    },
    enabled: !!formationId,
  });

  const directions = useMemo<string[]>(
    () =>
      Array.from(
        new Set(
          participantsData.map(
            (u: any) => u.direction?.name as string | undefined,
          ),
        ),
      ).filter((name): name is string => Boolean(name)),
    [participantsData],
  );

  const filteredSourceParticipants = useMemo(() => {
    return participantsData.filter((u: any) => {
      const matchesDir =
        srcDirFilter === "all" || u.direction?.name === srcDirFilter;
      const matchesCentre =
        srcCentreFilter === "all" || u.centre?.name === srcCentreFilter;
      return matchesDir && matchesCentre;
    });
  }, [participantsData, srcDirFilter, srcCentreFilter]);

  // Compute initial selection from form state (for navigation back)
  const initialSelectedRowIds = useMemo(() => {
    const ids: Record<string, boolean> = {};
    filteredSourceParticipants.forEach((u: any, index: number) => {
      if (selectedParticipantIds.includes(u.id)) {
        ids[String(index)] = true;
      }
    });
    return ids;
  }, [filteredSourceParticipants, selectedParticipantIds]);

  // Filtered Assignment Data
  const filteredAssignedParticipants = useMemo(() => {
    return participantsAssignments.filter((a: ParticipantAssignment) => {
      const user = participantsData.find((u: any) => u.id === a.userId);
      if (!user) return true;
      const matchesDir =
        asgnDirFilter === "all" || user.direction?.name === asgnDirFilter;
      const matchesCentre =
        asgnCentreFilter === "all" || user.centre?.name === asgnCentreFilter;
      return matchesDir && matchesCentre;
    });
  }, [
    participantsAssignments,
    participantsData,
    asgnDirFilter,
    asgnCentreFilter,
  ]);

  const assignedThemeIds = useMemo(() => {
    const ids = new Set<number>();
    trainersAssignments.forEach((ta: any) => {
      ta.themeIds?.forEach((id: number) => ids.add(id));
    });
    return Array.from(ids);
  }, [trainersAssignments]);

  const availableThemes = useMemo(() => {
    const allThemes = (themes as Theme[]) || [];
    return allThemes.filter((t: Theme) => assignedThemeIds.includes(t.id));
  }, [themes, assignedThemeIds]);

  const handleSourceSelectionChange = useCallback(
    (rows: any[]) => {
      const newSelectedIds = rows.map((r) => r.id);
      const currentAssignments = getValues("participants") || [];
      const updatedAssignments = [...currentAssignments];

      // Add new ones
      newSelectedIds.forEach((id) => {
        if (!updatedAssignments.find((a) => a.userId === id)) {
          updatedAssignments.push({
            userId: id,
            assignments: [{ themeId: 0, trainerId: 0 }],
          });
        }
      });

      // Remove only if they are visible in the CURRENT filtered view (standard multi-select behavior)
      const visibleIds = filteredSourceParticipants.map((u: any) => u.id);
      const finalAssignments = updatedAssignments.filter((a) => {
        if (visibleIds.includes(a.userId)) {
          return newSelectedIds.includes(a.userId);
        }
        return true;
      });

      if (
        JSON.stringify(currentAssignments) !== JSON.stringify(finalAssignments)
      ) {
        setValue("participants", finalAssignments, { shouldValidate: true });
      }
    },
    [filteredSourceParticipants, setValue, getValues],
  );

  const handleAddThemeRow = useCallback(
    (userId: number) => {
      const current = getValues("participants") || [];
      const updated = current.map((p: ParticipantAssignment) =>
        p.userId === userId
          ? {
              ...p,
              assignments: [...p.assignments, { themeId: 0, trainerId: 0 }],
            }
          : p,
      );
      setValue("participants", updated, { shouldValidate: true });
    },
    [getValues, setValue],
  );

  const handleRemoveThemeRow = useCallback(
    (userId: number, index: number) => {
      const current = getValues("participants") || [];
      const updated = current.map((p: ParticipantAssignment) => {
        if (p.userId === userId) {
          const newAssignments = p.assignments.filter((_, i) => i !== index);
          return {
            ...p,
            assignments:
              newAssignments.length > 0
                ? newAssignments
                : [{ themeId: 0, trainerId: 0 }],
          };
        }
        return p;
      });
      setValue("participants", updated, { shouldValidate: true });
    },
    [getValues, setValue],
  );

  const handleUpdateAssignment = useCallback(
    (
      userIds: number[],
      index: number | null,
      field: "themeId" | "trainerId",
      value: number,
    ) => {
      const current = getValues("participants") || [];
      const updated = current.map((p: ParticipantAssignment) => {
        if (userIds.includes(p.userId)) {
          const newAssignments = [...p.assignments];
          if (index !== null) {
            // Specific row update
            newAssignments[index] = {
              ...newAssignments[index],
              [field]: value,
            };
            if (field === "themeId") {
              // Auto-select trainer if only one exists
              const eligible = trainersAssignments
                .filter((ta: any) => ta.themeIds.includes(value))
                .map((ta: any) => ta.userId);
              newAssignments[index].trainerId =
                eligible.length === 1 ? eligible[0] : 0;
            }
          }
          return { ...p, assignments: newAssignments };
        }
        return p;
      });
      setValue("participants", updated, { shouldValidate: true });
    },
    [getValues, setValue, trainersAssignments],
  );

  const handleBulkAssign = useCallback(
    (userIds: number[], themeId: number, trainerId: number) => {
      const current = getValues("participants") || [];
      const updated = current.map((p: ParticipantAssignment) => {
        if (userIds.includes(p.userId)) {
          const newAssignment = { themeId, trainerId };
          let newAssignments = [...p.assignments];

          if (newAssignments.length === 1 && newAssignments[0].themeId === 0) {
            newAssignments = [newAssignment];
          } else {
            const alreadyAssigned = newAssignments.some(
              (a) => a.themeId === themeId && a.trainerId === trainerId,
            );
            if (!alreadyAssigned) newAssignments.push(newAssignment);
          }
          return { ...p, assignments: newAssignments };
        }
        return p;
      });
      setValue("participants", updated, { shouldValidate: true });
    },
    [getValues, setValue],
  );

  const handleBulkUnassign = useCallback(
    (userIds: number[]) => {
      const current = getValues("participants") || [];
      const updated = current.map((p: ParticipantAssignment) => {
        if (userIds.includes(p.userId)) {
          return { ...p, assignments: [{ themeId: 0, trainerId: 0 }] };
        }
        return p;
      });
      setValue("participants", updated, { shouldValidate: true });
    },
    [getValues, setValue],
  );

  const sourceColumns: ColumnDef<any>[] = useMemo(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={selectedParticipantIds.includes(row.original.id)}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
          />
        ),
      },
      {
        accessorKey: "matricule",
        header: "Matricule",
        cell: ({ row }) => (
          <span className="font-mono text-[10px] font-bold">
            {row.getValue("matricule")}
          </span>
        ),
      },
      {
        accessorKey: "full_name",
        header: "Nom Complet",
        accessorFn: (row) => `${row.first_name} ${row.last_name}`,
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-bold text-xs">
              {row.getValue("full_name")}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {row.original.email}
            </span>
          </div>
        ),
      },
      { accessorKey: "centre.name", header: "Établissement" },
      { accessorKey: "direction.name", header: "Direction" },
    ],
    [selectedParticipantIds],
  );

  const assignedColumns: ColumnDef<any>[] = useMemo(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
          />
        ),
      },
      {
        header: "Participant",
        cell: ({ row }) => {
          const user = participantsData.find(
            (u: any) => u.id === row.original.userId,
          );
          return (
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="h-5 w-5 p-0 flex items-center justify-center rounded-full"
              >
                <UserIcon className="h-3 w-3" />
              </Badge>
              <div className="flex flex-col">
                <span className="font-bold text-xs">
                  {user?.first_name} {user?.last_name}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {user?.direction?.name} • {user?.centre?.name}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        header: "Thématiques & Formateurs",
        cell: ({ row }) => (
          <div className="space-y-2 py-1">
            {row.original.assignments.map((assignment: any, index: number) => {
              const eligibleTrainers = trainersAssignments
                .filter((ta: any) => ta.themeIds.includes(assignment.themeId))
                .map((ta: any) => {
                  const u = participantsData.find(
                    (user: any) => user.id === ta.userId,
                  );
                  return {
                    id: ta.userId,
                    name: u
                      ? `${u.first_name} ${u.last_name}`
                      : `Trainer ${ta.userId}`,
                  };
                });

              return (
                <div key={index} className="flex items-center gap-2 group/row">
                  <Select
                    value={assignment.themeId ? String(assignment.themeId) : ""}
                    onValueChange={(val) =>
                      handleUpdateAssignment(
                        [row.original.userId],
                        index,
                        "themeId",
                        Number(val),
                      )
                    }
                  >
                    <SelectTrigger className="h-7 text-[10px] font-medium min-w-[150px]">
                      <SelectValue placeholder="Thème..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableThemes.map((theme) => (
                        <SelectItem
                          key={theme.id}
                          value={String(theme.id)}
                          className="text-xs"
                        >
                          {theme.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={
                      assignment.trainerId ? String(assignment.trainerId) : ""
                    }
                    onValueChange={(val) =>
                      handleUpdateAssignment(
                        [row.original.userId],
                        index,
                        "trainerId",
                        Number(val),
                      )
                    }
                    disabled={!assignment.themeId}
                  >
                    <SelectTrigger className="h-7 text-[10px] font-medium min-w-[150px]">
                      <SelectValue placeholder="Formateur..." />
                    </SelectTrigger>
                    <SelectContent>
                      {eligibleTrainers.map((t: any) => (
                        <SelectItem
                          key={t.id}
                          value={String(t.id)}
                          className="text-xs"
                        >
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      handleRemoveThemeRow(row.original.userId, index)
                    }
                    className="h-6 w-6 opacity-0 group-hover/row:opacity-100 transition-opacity"
                    disabled={
                      row.original.assignments.length === 1 &&
                      assignment.themeId === 0
                    }
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              );
            })}
            <Button
              variant="link"
              size="sm"
              onClick={() => handleAddThemeRow(row.original.userId)}
              className="h-auto p-0 text-[10px] font-bold uppercase text-primary"
            >
              + Ajouter thématique
            </Button>
          </div>
        ),
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              handleSourceSelectionChange(
                participantsAssignments
                  .filter((a: any) => a.userId !== row.original.userId)
                  .map((a: any) => ({ id: a.userId })),
              )
            }
            className="h-7 w-7 text-muted-foreground hover:text-red-600"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        ),
      },
    ],
    [
      participantsData,
      availableThemes,
      trainersAssignments,
      handleUpdateAssignment,
      handleAddThemeRow,
      handleRemoveThemeRow,
      handleSourceSelectionChange,
      participantsAssignments,
    ],
  );

  if (usersLoading || themesLoading) {
    return <Skeleton className="h-[400px] w-full rounded-lg" />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-primary/5 border border-primary/10 p-4 rounded-lg flex gap-3 items-start">
        <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-bold text-primary uppercase tracking-tight">
            Etape 3: Sélection des Participants
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Recherchez les participants et affectez-les aux thématiques et
            formateurs.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* SOURCE TABLE */}
        <div className="space-y-3">
          <h4 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground px-1 flex items-center gap-2">
            <Filter className="h-3 w-3" /> Base de données
          </h4>
          <DataTable
            columns={sourceColumns}
            data={filteredSourceParticipants}
            searchKey="full_name"
            placeholder="Rechercher..."
            onSelectionChange={handleSourceSelectionChange}
            initialSelectedRowIds={initialSelectedRowIds}
            extraFilters={
              <div className="flex items-center gap-2">
                <Select value={srcDirFilter} onValueChange={setSrcDirFilter}>
                  <SelectTrigger className="h-9 text-xs w-[140px]">
                    <SelectValue placeholder="Direction" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes Directions</SelectItem>
                    {directions.map((d: string) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            }
          />
        </div>

        {/* ASSIGNMENT TABLE */}
        <div className="pt-6 border-t space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex flex-col gap-1">
              <h4 className="text-[11px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                <Layers className="h-3 w-3" /> Affectations (
                {participantsAssignments.length})
              </h4>
              <div className="flex items-center gap-2 mt-1">
                <Select value={asgnDirFilter} onValueChange={setAsgnDirFilter}>
                  <SelectTrigger className="h-7 text-[10px] w-[120px] bg-muted/30">
                    <SelectValue placeholder="Filtrer Direction" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes (Bas)</SelectItem>
                    {(directions as string[]).map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {assignedTableSelection.length > 0 && (
              <div className="flex items-center gap-2 animate-in slide-in-from-right-2 duration-300">
                <span className="text-[10px] font-bold text-muted-foreground whitespace-nowrap">
                  Sélection ({assignedTableSelection.length}) :
                </span>
                <BatchParticipantAssignor
                  themes={availableThemes}
                  trainersAssignments={trainersAssignments}
                  trainersData={participantsData}
                  onAssign={(themeId, trainerId) => {
                    handleBulkAssign(
                      assignedTableSelection.map((s) => s.userId),
                      themeId,
                      trainerId,
                    );
                  }}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    handleBulkUnassign(
                      assignedTableSelection.map((s) => s.userId),
                    );
                    setAssignedTableSelection([]);
                  }}
                  className="h-7 text-[10px] font-bold uppercase border-red-200 text-red-600 hover:bg-red-50 gap-1"
                >
                  <XCircle className="h-3 w-3" /> Vider
                </Button>
              </div>
            )}
          </div>
          <DataTable
            columns={assignedColumns}
            data={filteredAssignedParticipants}
            onSelectionChange={setAssignedTableSelection}
          />
        </div>
      </div>
    </div>
  );
};

const BatchParticipantAssignor = ({
  themes,
  trainersAssignments,
  trainersData,
  onAssign,
}: {
  themes: Theme[];
  trainersAssignments: any[];
  trainersData: any[];
  onAssign: (t: number, tr: number) => void;
}) => {
  const [themeId, setThemeId] = useState<number>(0);
  const [trainerId, setTrainerId] = useState<number>(0);

  const eligible = useMemo(() => {
    if (!themeId) return [];
    return trainersAssignments
      .filter((ta) => ta.themeIds.includes(themeId))
      .map((ta) => {
        const u = trainersData.find((user: any) => user.id === ta.userId);
        return {
          id: ta.userId,
          name: u ? `${u.first_name} ${u.last_name}` : `Trainer ${ta.userId}`,
        };
      });
  }, [themeId, trainersAssignments, trainersData]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size="sm" className="h-7 text-[10px] font-bold uppercase gap-2">
          <Plus className="h-3 w-3" /> Affecter en lot
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-4" align="end">
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase text-muted-foreground">
              Thématique
            </p>
            <Select
              value={themeId ? String(themeId) : ""}
              onValueChange={(v) => setThemeId(Number(v))}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Choisir thème..." />
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
          </div>
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase text-muted-foreground">
              Formateur
            </p>
            <Select
              value={trainerId ? String(trainerId) : ""}
              onValueChange={(v) => setTrainerId(Number(v))}
              disabled={!themeId}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Choisir formateur..." />
              </SelectTrigger>
              <SelectContent>
                {eligible.map((t) => (
                  <SelectItem
                    key={t.id}
                    value={String(t.id)}
                    className="text-xs"
                  >
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            className="w-full h-8 text-[11px] font-bold"
            disabled={!themeId || !trainerId}
            onClick={() => {
              onAssign(themeId, trainerId);
              setThemeId(0);
              setTrainerId(0);
            }}
          >
            Appliquer à la sélection
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
