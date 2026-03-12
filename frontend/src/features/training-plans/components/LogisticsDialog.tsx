import { useState, useMemo, useEffect } from "react";
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
import { DataTable } from "@/components/ui/data-table";
import { User as UserIcon, Hotel, Trash2, Plus, Calendar } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import type { ColumnDef } from "@tanstack/react-table";
import type { TrainingPlan, User, Accommodation } from "../types";
import { updatePlan } from "../api";

interface LogisticsDialogProps {
  plan: TrainingPlan;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const LogisticsDialog = ({
  plan,
  open,
  onOpenChange,
}: LogisticsDialogProps) => {
  const queryClient = useQueryClient();

  // Local state for temporary edits
  const [accommodations, setAccommodations] = useState<
    {
      hebergement_id: number;
      utilisateur_id: number;
      check_in_date: string;
      check_out_date: string;
    }[]
  >([]);

  // Initialize state from plan
  useEffect(() => {
    if (open && plan) {
      setAccommodations(
        plan.plan_accommodations?.map((acc) => ({
          hebergement_id: acc.hebergement_id,
          utilisateur_id: acc.utilisateur_id,
          check_in_date: acc.check_in_date
            ? acc.check_in_date.split("T")[0]
            : "",
          check_out_date: acc.check_out_date
            ? acc.check_out_date.split("T")[0]
            : "",
        })) || [],
      );
    }
  }, [open, plan]);

  // Data fetching
  const { data: allAccommodations } = useQuery<Accommodation[]>({
    queryKey: ["accommodations"],
    queryFn: async () => {
      const response = await axiosInstance.get("/accommodations");
      return response.data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => updatePlan(plan.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plan", String(plan.id)] });
      toast.success("Hébergements mis à jour.");
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
      plan_accommodations: accommodations,
    });
  };

  // List of all eligible persons (participants + trainers)
  const eligiblePersons = useMemo(() => {
    const list: User[] = [];
    if (plan.participants) list.push(...plan.participants);
    if (plan.trainers) {
      plan.trainers.forEach((t) => {
        if (!list.find((p) => p.id === t.id)) {
          list.push(t);
        }
      });
    }
    return list;
  }, [plan]);

  const columns: ColumnDef<any>[] = [
    {
      header: "Personne",
      cell: ({ row }) => {
        const user = eligiblePersons.find(
          (u) => u.id === row.original.utilisateur_id,
        );
        const isTrainer = plan.trainers?.some((t) => t.id === user?.id);
        return (
          <div className="flex items-center gap-2">
            <UserIcon className="h-3 w-3 text-muted-foreground" />
            <div className="flex flex-col">
              <span className="font-bold text-xs">
                {user ? `${user.first_name} ${user.last_name}` : "Inconnu"}
              </span>
              <Badge variant="outline" className="text-[8px] h-3.5 px-1 w-fit">
                {isTrainer ? "Formateur" : "Bénéficiaire"}
              </Badge>
            </div>
          </div>
        );
      },
    },
    {
      header: "Hébergement",
      cell: ({ row, index }) => (
        <Select
          value={String(row.original.hebergement_id)}
          onValueChange={(val) => {
            const updated = [...accommodations];
            updated[index].hebergement_id = Number(val);
            setAccommodations(updated);
          }}
        >
          <SelectTrigger className="h-7 text-[10px] w-[180px]">
            <SelectValue placeholder="Choisir..." />
          </SelectTrigger>
          <SelectContent>
            {allAccommodations?.map((acc) => (
              <SelectItem
                key={acc.id}
                value={String(acc.id)}
                className="text-xs"
              >
                {acc.name} ({acc.type})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
    },
    {
      header: "Période",
      cell: ({ row, index }) => (
        <div className="flex items-center gap-1">
          <Input
            type="date"
            className="h-7 text-[10px] w-[110px] p-1"
            value={row.original.check_in_date}
            onChange={(e) => {
              const updated = [...accommodations];
              updated[index].check_in_date = e.target.value;
              setAccommodations(updated);
            }}
          />
          <span className="text-[10px] text-muted-foreground">→</span>
          <Input
            type="date"
            className="h-7 text-[10px] w-[110px] p-1"
            value={row.original.check_out_date}
            onChange={(e) => {
              const updated = [...accommodations];
              updated[index].check_out_date = e.target.value;
              setAccommodations(updated);
            }}
          />
        </div>
      ),
    },
    {
      id: "actions",
      cell: ({ index }) => (
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-red-600"
          onClick={() => {
            setAccommodations(accommodations.filter((_, i) => i !== index));
          }}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      ),
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>Gérer les Réservations & Logistique</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto p-6 space-y-6">
          <div className="bg-primary/5 border border-primary/10 p-4 rounded-xl flex gap-3 items-start">
            <Hotel className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-primary">
                Gestion des Hébergements
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Assignez des lieux d'hébergement aux participants et formateurs
                pour la durée de leur séjour.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">
                Réservations ({accommodations.length})
              </h3>
              <AddReservationRow
                eligiblePersons={eligiblePersons}
                allAccommodations={allAccommodations || []}
                onAdd={(data) => setAccommodations([...accommodations, data])}
                existingUserIds={accommodations.map((a) => a.utilisateur_id)}
              />
            </div>

            <DataTable
              columns={columns}
              data={accommodations}
              searchKey="Personne"
              placeholder="Rechercher..."
            />
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t bg-muted/30">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? "Mise à jour..." : "Enregistrer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const AddReservationRow = ({
  eligiblePersons,
  allAccommodations,
  onAdd,
  existingUserIds,
}: {
  eligiblePersons: User[];
  allAccommodations: Accommodation[];
  onAdd: (data: any) => void;
  existingUserIds: number[];
}) => {
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [selectedAcc, setSelectedAcc] = useState<string>("");

  const handleAdd = () => {
    if (!selectedUser || !selectedAcc) return;
    onAdd({
      utilisateur_id: Number(selectedUser),
      hebergement_id: Number(selectedAcc),
      check_in_date: "",
      check_out_date: "",
    });
    setSelectedUser("");
    setSelectedAcc("");
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={selectedUser} onValueChange={setSelectedUser}>
        <SelectTrigger className="h-8 text-xs w-[200px]">
          <SelectValue placeholder="Choisir une personne..." />
        </SelectTrigger>
        <SelectContent>
          {eligiblePersons
            .filter((u) => !existingUserIds.includes(u.id))
            .map((u) => (
              <SelectItem key={u.id} value={String(u.id)} className="text-xs">
                {u.first_name} {u.last_name}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>

      <Select value={selectedAcc} onValueChange={setSelectedAcc}>
        <SelectTrigger className="h-8 text-xs w-[180px]">
          <SelectValue placeholder="Choisir un lieu..." />
        </SelectTrigger>
        <SelectContent>
          {allAccommodations.map((acc) => (
            <SelectItem key={acc.id} value={String(acc.id)} className="text-xs">
              {acc.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        size="sm"
        className="h-8 px-3 font-bold text-xs"
        onClick={handleAdd}
        disabled={!selectedUser || !selectedAcc}
      >
        <Plus className="h-3.5 w-3.5 mr-1" /> Ajouter
      </Button>
    </div>
  );
};
