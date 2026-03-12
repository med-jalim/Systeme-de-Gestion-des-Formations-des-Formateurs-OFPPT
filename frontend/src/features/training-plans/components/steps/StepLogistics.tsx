import { useState, useMemo, useCallback, useEffect } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import type { CreateTrainingPlanFormValues } from "../../schemas/plan.schema";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  NotebookPen,
  User as UserIcon,
  Calendar,
  Hotel,
  Plus,
  Filter,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
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
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export const StepLogistics = () => {
  const { control, setValue, getValues } =
    useFormContext<CreateTrainingPlanFormValues>();

  const trainers = useWatch({ name: "trainers" }) || [];
  const participants = useWatch({ name: "participants" }) || [];
  const currentAccommodations = useWatch({ name: "accommodations" }) || [];

  const [tableSelection, setTableSelection] = useState<any[]>([]);

  // Combine all selected users and their basic info
  const allSelectedUserIds = useMemo(
    () =>
      Array.from(
        new Set([
          ...trainers.map((t: any) => t.userId),
          ...participants.map((p: any) => p.userId),
        ]),
      ),
    [trainers, participants],
  );

  // Fetch Accommodations list
  const { data: accommodationsList, isLoading: accLoading } = useQuery<any[]>({
    queryKey: ["accommodations"],
    queryFn: async () => {
      const response = await axiosInstance.get("/accommodations");
      return response.data;
    },
  });

  // Fetch Users to get names/matricules
  const { data: allUsers, isLoading: usersLoading } = useQuery<any[]>({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await axiosInstance.get("/users");
      return response.data;
    },
  });

  // Logic to sync accommodations array with selected users
  useEffect(() => {
    const existingIds = currentAccommodations.map((a: any) => a.userId);
    const missingIds = allSelectedUserIds.filter(
      (id: number) => !existingIds.includes(id),
    );

    if (missingIds.length > 0) {
      const newEntries = missingIds.map((userId: number) => ({
        userId,
        hebergementId: 0,
        check_in_date: getValues("start_date") || "",
        check_out_date: getValues("end_date") || "",
      }));
      setValue("accommodations", [...currentAccommodations, ...newEntries]);
    }

    const surplusIds = existingIds.filter(
      (id: number) => !allSelectedUserIds.includes(id),
    );
    if (surplusIds.length > 0) {
      setValue(
        "accommodations",
        currentAccommodations.filter(
          (a: any) => !surplusIds.includes(a.userId),
        ),
      );
    }
  }, [allSelectedUserIds, currentAccommodations, setValue, getValues]);

  const handleUpdateEntry = useCallback(
    (userIds: number[], field: string, value: any) => {
      const current = getValues("accommodations") || [];
      const updated = current.map((a: any) =>
        userIds.includes(a.userId) ? { ...a, [field]: value } : a,
      );
      setValue("accommodations", updated);
    },
    [getValues, setValue],
  );

  const handleBulkUpdate = useCallback(
    (
      userIds: number[],
      data: {
        hebergementId?: number;
        check_in_date?: string;
        check_out_date?: string;
      },
    ) => {
      const current = getValues("accommodations") || [];
      const updated = current.map((a: any) =>
        userIds.includes(a.userId) ? { ...a, ...data } : a,
      );
      setValue("accommodations", updated);
    },
    [getValues, setValue],
  );

  // Table Data: Merge logistics with user info
  const tableData = useMemo(() => {
    return currentAccommodations.map((acc: any) => {
      const user = allUsers?.find((u: any) => u.id === acc.userId);
      const isTrainer = trainers.some((t: any) => t.userId === acc.userId);
      return {
        ...acc,
        full_name: user
          ? `${user.first_name} ${user.last_name}`
          : `Utilisateur ${acc.userId}`,
        matricule: user?.matricule || "---",
        planRole: isTrainer ? "Formateur" : "Participant",
      };
    });
  }, [currentAccommodations, allUsers, trainers]);

  const columns: ColumnDef<any>[] = useMemo(
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
        header: "Bénéficiaire",
        accessorKey: "full_name",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Badge
              variant={
                row.original.planRole === "Formateur" ? "outline" : "secondary"
              }
              className="h-5 w-5 p-0 flex items-center justify-center rounded-full shrink-0"
            >
              <UserIcon className="h-3 w-3" />
            </Badge>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-xs truncate">
                {row.original.full_name}
              </span>
              <span className="text-[10px] text-muted-foreground uppercase font-black">
                {row.original.planRole} • {row.original.matricule}
              </span>
            </div>
          </div>
        ),
      },
      {
        header: "Hébergement",
        cell: ({ row }) => (
          <Select
            value={String(row.original.hebergementId)}
            onValueChange={(val) =>
              handleUpdateEntry(
                [row.original.userId],
                "hebergementId",
                Number(val),
              )
            }
          >
            <SelectTrigger className="h-7 text-[10px] font-medium w-[180px]">
              <SelectValue placeholder="Choisir..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0" className="text-xs">
                Aucun / Autonome
              </SelectItem>
              {accommodationsList?.map((acc: any) => (
                <SelectItem
                  key={acc.id}
                  value={String(acc.id)}
                  className="text-xs"
                >
                  {acc.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ),
      },
      {
        header: "Période",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <div className="relative">
              <Calendar className="absolute left-1.5 top-1.5 h-3 w-3 text-muted-foreground opacity-50" />
              <Input
                type="date"
                className="h-7 pl-6 pr-1 py-0 text-[10px] w-[105px]"
                value={row.original.check_in_date || ""}
                onChange={(e) =>
                  handleUpdateEntry(
                    [row.original.userId],
                    "check_in_date",
                    e.target.value,
                  )
                }
              />
            </div>
            <span className="text-[10px] text-muted-foreground">→</span>
            <div className="relative">
              <Calendar className="absolute left-1.5 top-1.5 h-3 w-3 text-muted-foreground opacity-50" />
              <Input
                type="date"
                className="h-7 pl-6 pr-1 py-0 text-[10px] w-[105px]"
                value={row.original.check_out_date || ""}
                onChange={(e) =>
                  handleUpdateEntry(
                    [row.original.userId],
                    "check_out_date",
                    e.target.value,
                  )
                }
              />
            </div>
          </div>
        ),
      },
    ],
    [accommodationsList, handleUpdateEntry],
  );

  if (accLoading || usersLoading) {
    return <Skeleton className="h-[400px] w-full rounded-lg" />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-primary/5 border border-primary/10 p-4 rounded-lg flex gap-3 items-start">
        <Hotel className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-bold text-primary uppercase tracking-tight">
            Etape 4: Logistique Individuelle
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Gérez l'hébergement et les dates pour chaque participant et
            formateur.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h4 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <Filter className="h-3 w-3" /> Liste des bénéficiaires (
            {tableData.length})
          </h4>

          {tableSelection.length > 0 && (
            <div className="flex items-center gap-2 animate-in slide-in-from-right-2 duration-300">
              <span className="text-[10px] font-bold text-muted-foreground">
                Sélection ({tableSelection.length}) :
              </span>
              <BatchLogisticsAssignor
                accommodationsList={accommodationsList || []}
                onAssign={(data) => {
                  handleBulkUpdate(
                    tableSelection.map((s) => s.userId),
                    data,
                  );
                  setTableSelection([]);
                }}
              />
            </div>
          )}
        </div>

        <DataTable
          columns={columns}
          data={tableData}
          onSelectionChange={setTableSelection}
          searchKey="full_name"
          placeholder="Rechercher par nom..."
        />

        <FormField
          control={control}
          name="logistics_notes"
          render={({ field }) => (
            <FormItem className="pt-4 border-t">
              <FormLabel className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-2">
                <NotebookPen className="w-3 h-3 text-primary" />
                Notes logistiques additionnelles
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Besoins spécifiques : transport, régime alimentaire, matériel, etc..."
                  className="resize-none h-20 text-xs border-muted-foreground/20 focus-visible:ring-primary/30"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

const BatchLogisticsAssignor = ({
  accommodationsList,
  onAssign,
}: {
  accommodationsList: any[];
  onAssign: (data: any) => void;
}) => {
  const [hebergementId, setHebergementId] = useState<number>(-1);
  const [checkIn, setCheckIn] = useState<string>("");
  const [checkOut, setCheckOut] = useState<string>("");

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size="sm" className="h-7 text-[10px] font-bold uppercase gap-2">
          <Plus className="h-3 w-3" /> Affecter en lot
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-3" align="end">
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase text-muted-foreground">
              Lieu d'hébergement
            </p>
            <Select
              value={hebergementId !== -1 ? String(hebergementId) : ""}
              onValueChange={(v) => setHebergementId(Number(v))}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Garder inchangé" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="-1" className="text-xs italic">
                  Garder inchangé
                </SelectItem>
                <SelectItem value="0" className="text-xs">
                  Aucun / Autonome
                </SelectItem>
                {accommodationsList?.map((acc: any) => (
                  <SelectItem
                    key={acc.id}
                    value={String(acc.id)}
                    className="text-xs"
                  >
                    {acc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase text-muted-foreground">
                Arrivée
              </p>
              <Input
                type="date"
                className="h-8 text-[11px]"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase text-muted-foreground">
                Départ
              </p>
              <Input
                type="date"
                className="h-8 text-[11px]"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
              />
            </div>
          </div>

          <Button
            className="w-full h-8 text-[11px] font-bold"
            disabled={hebergementId === -1 && !checkIn && !checkOut}
            onClick={() => {
              const data: any = {};
              if (hebergementId !== -1) data.hebergementId = hebergementId;
              if (checkIn) data.check_in_date = checkIn;
              if (checkOut) data.check_out_date = checkOut;
              onAssign(data);
              setHebergementId(-1);
              setCheckIn("");
              setCheckOut("");
            }}
          >
            Mettre à jour la sélection
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
