import { useState, useMemo, useCallback } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import type {
  PlanTrainersFormValues,
  TrainerAssignment,
} from "../../schemas/plan.schema";
import type { Theme, User } from "../../types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Trash2,
  AlertCircle,
  Check,
  ChevronsUpDown,
  User as UserIcon,
  Filter,
  Layers,
  Plus,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { DataTable } from "@/components/ui/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const StepTrainers = () => {
  const { setValue, getValues } = useFormContext<
    PlanTrainersFormValues & { formation_id: number }
  >();

  const trainersAssignments = useWatch({ name: "trainers" }) || [];
  const formationId = useWatch({ name: "formation_id" });

  const selectedTrainerIds = useMemo(
    () => trainersAssignments.map((a: TrainerAssignment) => a.userId),
    [trainersAssignments],
  );

  const [directionFilter, setDirectionFilter] = useState<string>("all");
  const [centreFilter, setCentreFilter] = useState<string>("all");
  const [assignedTableSelection, setAssignedTableSelection] = useState<
    TrainerAssignment[]
  >([]);

  // Fetch All Users (Formateurs)
  const { data: allUsers } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await axiosInstance.get("/users");
      return response.data;
    },
  });

  const trainersData = useMemo(() => allUsers || [], [allUsers]);

  // Fetch Themes based on formationId
  const { data: themes } = useQuery({
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

  const availableThemes = useMemo(() => themes || [], [themes]);

  const directions = useMemo<string[]>(
    () =>
      Array.from(new Set(trainersData.map((u) => u.direction?.name))).filter(
        (name): name is string => Boolean(name),
      ),
    [trainersData],
  );

  const centres = useMemo<string[]>(() => {
    const filteredByDirection =
      directionFilter === "all"
        ? trainersData
        : trainersData.filter((u) => u.direction?.name === directionFilter);
    return Array.from(
      new Set(filteredByDirection.map((u) => u.centre?.name)),
    ).filter((name): name is string => Boolean(name));
  }, [trainersData, directionFilter]);

  const filteredTrainers = useMemo(() => {
    return trainersData.filter((u) => {
      const matchesDir =
        directionFilter === "all" || u.direction?.name === directionFilter;
      const matchesCentre =
        centreFilter === "all" || u.centre?.name === centreFilter;
      return matchesDir && matchesCentre;
    });
  }, [trainersData, directionFilter, centreFilter]);

  // Compute initial selection from form state (for navigation back to this step)
  const initialSelectedRowIds = useMemo(() => {
    const ids: Record<string, boolean> = {};
    filteredTrainers.forEach((u, index) => {
      if (selectedTrainerIds.includes(u.id)) {
        ids[String(index)] = true;
      }
    });
    return ids;
  }, [filteredTrainers, selectedTrainerIds]);

  const handleSourceSelectionChange = useCallback(
    (rows: User[]) => {
      const newSelectedIds = rows.map((r) => r.id);
      const currentAssignments = getValues("trainers") || [];
      const updatedAssignments = [...currentAssignments];

      newSelectedIds.forEach((id) => {
        if (!updatedAssignments.find((a) => a.userId === id)) {
          updatedAssignments.push({ userId: id, themeIds: [] });
        }
      });

      const visibleIds = filteredTrainers.map((u) => u.id);
      const finalAssignments = updatedAssignments.filter((a) => {
        if (visibleIds.includes(a.userId)) {
          return newSelectedIds.includes(a.userId);
        }
        return true;
      });

      if (
        JSON.stringify(currentAssignments) !== JSON.stringify(finalAssignments)
      ) {
        setValue("trainers", finalAssignments, { shouldValidate: true });
      }
    },
    [filteredTrainers, setValue, getValues],
  );

  const handleUpdateThemes = useCallback(
    (
      userIds: number[],
      themeIds: number[],
      mode: "replace" | "add" = "add",
    ) => {
      const currentAssignments = getValues("trainers") || [];
      const updated = currentAssignments.map((a: TrainerAssignment) => {
        if (userIds.includes(a.userId)) {
          const newThemes =
            mode === "replace"
              ? themeIds
              : Array.from(new Set([...a.themeIds, ...themeIds]));
          return { ...a, themeIds: newThemes };
        }
        return a;
      });
      setValue("trainers", updated, { shouldValidate: true });
    },
    [getValues, setValue],
  );

  const handleRemoveTrainer = useCallback(
    (userId: number) => {
      const currentAssignments = getValues("trainers") || [];
      const updated = currentAssignments.filter(
        (a: TrainerAssignment) => a.userId !== userId,
      );
      setValue("trainers", updated, { shouldValidate: true });
    },
    [getValues, setValue],
  );

  const sourceColumns: ColumnDef<User>[] = useMemo(
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
            checked={selectedTrainerIds.includes(row.original.id)}
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
      { accessorKey: "centre.name", header: "Centre" },
      { accessorKey: "direction.name", header: "Direction" },
    ],
    [selectedTrainerIds],
  );

  const assignedColumns: ColumnDef<TrainerAssignment>[] = useMemo(
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
        header: "Formateur",
        cell: ({ row }) => {
          const user = trainersData.find((u) => u.id === row.original.userId);
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
                  {user?.matricule}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        header: "Thématiques",
        cell: ({ row }) => (
          <ThemeAssignmentSelector
            availableThemes={availableThemes}
            selectedThemeIds={row.original.themeIds}
            onChange={(ids) =>
              handleUpdateThemes([row.original.userId], ids, "replace")
            }
          />
        ),
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleRemoveTrainer(row.original.userId)}
            className="h-7 w-7 text-muted-foreground hover:text-red-600"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        ),
      },
    ],
    [trainersData, availableThemes, handleUpdateThemes, handleRemoveTrainer],
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-primary/5 border border-primary/10 p-4 rounded-lg flex gap-3 items-start">
        <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-bold text-primary uppercase tracking-tight">
            Etape 2: Sélection des Formateurs
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Utilisez les filtres pour trouver les formateurs, puis affectez les
            thèmes dans le tableau récapitulatif.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <h4 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground px-1 flex items-center gap-2">
            <Filter className="h-3 w-3" /> Base de données
          </h4>
          <DataTable
            columns={sourceColumns}
            data={filteredTrainers}
            searchKey="full_name"
            placeholder="Rechercher..."
            onSelectionChange={handleSourceSelectionChange}
            initialSelectedRowIds={initialSelectedRowIds}
            extraFilters={
              <div className="flex items-center gap-2">
                <Select
                  value={directionFilter}
                  onValueChange={(v) => {
                    setDirectionFilter(v);
                    setCentreFilter("all");
                  }}
                >
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
                <Select value={centreFilter} onValueChange={setCentreFilter}>
                  <SelectTrigger className="h-9 text-xs w-[140px]">
                    <SelectValue placeholder="Centre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous Centres</SelectItem>
                    {centres.map((c: string) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            }
          />
        </div>

        <div className="pt-6 border-t space-y-4">
          <div className="flex items-center justify-between px-1">
            <h4 className="text-[11px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
              <Layers className="h-3 w-3" /> Affectation (
              {trainersAssignments.length})
            </h4>
            {assignedTableSelection.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-muted-foreground">
                  Sélectionné ({assignedTableSelection.length}) :
                </span>
                <BatchThemeAssignor
                  themes={availableThemes}
                  onAssign={(themeIds) => {
                    handleUpdateThemes(
                      assignedTableSelection.map((s) => s.userId),
                      themeIds,
                    );
                    setAssignedTableSelection([]);
                  }}
                />
              </div>
            )}
          </div>
          <DataTable
            columns={assignedColumns}
            data={trainersAssignments}
            onSelectionChange={setAssignedTableSelection}
          />
        </div>
      </div>
    </div>
  );
};

const ThemeAssignmentSelector = ({
  availableThemes,
  selectedThemeIds,
  onChange,
}: {
  availableThemes: Theme[];
  selectedThemeIds: number[];
  onChange: (ids: number[]) => void;
}) => {
  return (
    <div className="flex flex-col gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className="w-full justify-between h-7 px-2 text-[10px] font-medium"
          >
            {selectedThemeIds.length > 0
              ? `${selectedThemeIds.length} thématique(s)`
              : "Ajouter thèmes..."}
            <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[280px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Filtrer..." className="h-8 text-xs" />
            <CommandList>
              <CommandEmpty>Aucun thème.</CommandEmpty>
              <CommandGroup>
                {availableThemes.map((theme) => (
                  <CommandItem
                    key={theme.id}
                    onSelect={() => {
                      const newIds = selectedThemeIds.includes(theme.id)
                        ? selectedThemeIds.filter((id) => id !== theme.id)
                        : [...selectedThemeIds, theme.id];
                      onChange(newIds);
                    }}
                    className="text-xs"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-3 w-3",
                        selectedThemeIds.includes(theme.id)
                          ? "opacity-100"
                          : "opacity-0",
                      )}
                    />
                    {theme.title}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <div className="flex flex-wrap gap-1 max-w-[300px]">
        {selectedThemeIds.map((id) => {
          const theme = availableThemes.find((t) => t.id === id);
          return (
            <Badge
              key={id}
              variant="secondary"
              className="text-[8px] px-1 py-0 font-bold bg-secondary/20 border-secondary/30"
            >
              {theme?.title}
            </Badge>
          );
        })}
      </div>
    </div>
  );
};

const BatchThemeAssignor = ({
  themes,
  onAssign,
}: {
  themes: Theme[];
  onAssign: (ids: number[]) => void;
}) => {
  const [selected, setSelected] = useState<number[]>([]);
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size="sm" className="h-7 text-[10px] font-bold uppercase gap-2">
          <Plus className="h-3 w-3" /> Affecter en lot
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-2" align="end">
        <div className="space-y-2">
          <p className="text-[10px] font-black uppercase text-muted-foreground px-1">
            Thématiques
          </p>
          <div className="space-y-1">
            {themes.map((t) => (
              <div
                key={t.id}
                className="flex items-center gap-2 p-1.5 rounded hover:bg-muted cursor-pointer"
                onClick={() =>
                  setSelected((prev) =>
                    prev.includes(t.id)
                      ? prev.filter((id) => id !== t.id)
                      : [...prev, t.id],
                  )
                }
              >
                <Checkbox checked={selected.includes(t.id)} />
                <span className="text-[11px] font-medium">{t.title}</span>
              </div>
            ))}
          </div>
          <Button
            className="w-full h-8 text-[11px] font-bold mt-2"
            disabled={selected.length === 0}
            onClick={() => {
              onAssign(selected);
              setSelected([]);
            }}
          >
            Appliquer
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
