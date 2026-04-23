import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Hotel, Plus, Edit, Trash2, Search, BedDouble } from "lucide-react";
import type { Accommodation } from "@/features/training-plans/types";
import type { Site } from "@/features/training-plans/types";

type AccFormData = {
  name: string;
  type: string;
  address: string;
  site_id: string;
};

const EMPTY_FORM: AccFormData = { name: "", type: "", address: "", site_id: "none" };

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  hotel: { label: "Hôtel", color: "bg-blue-100 text-blue-700 border-blue-200" },
  resider: { label: "Résidence", color: "bg-purple-100 text-purple-700 border-purple-200" },
  centre_interne: { label: "Centre Interne", color: "bg-green-100 text-green-700 border-green-200" },
};

export const AccommodationsPage = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Accommodation | null>(null);
  const [form, setForm] = useState<AccFormData>(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState<Accommodation | null>(null);

  const { data: accommodations = [], isLoading } = useQuery<Accommodation[]>({
    queryKey: ["accommodations"],
    queryFn: async () => (await axiosInstance.get("/accommodations")).data,
  });

  const { data: sites = [] } = useQuery<Site[]>({
    queryKey: ["sites"],
    queryFn: async () => (await axiosInstance.get("/sites")).data,
  });

  const createMutation = useMutation({
    mutationFn: (data: AccFormData) =>
      axiosInstance.post("/accommodations", {
        ...data,
        site_id: data.site_id && data.site_id !== "none" ? Number(data.site_id) : null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accommodations"] });
      toast.success("Hébergement créé avec succès.");
      closeDialog();
    },
    onError: (e: any) => toast.error(e.response?.data?.message || "Erreur lors de la création."),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: AccFormData }) =>
      axiosInstance.put(`/accommodations/${id}`, {
        ...data,
        site_id: data.site_id && data.site_id !== "none" ? Number(data.site_id) : null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accommodations"] });
      toast.success("Hébergement mis à jour.");
      closeDialog();
    },
    onError: (e: any) => toast.error(e.response?.data?.message || "Erreur lors de la mise à jour."),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => axiosInstance.delete(`/accommodations/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accommodations"] });
      toast.success("Hébergement supprimé.");
      setDeleteTarget(null);
    },
    onError: (e: any) => toast.error(e.response?.data?.message || "Erreur lors de la suppression."),
  });

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (acc: Accommodation) => {
    setEditing(acc);
    setForm({
      name: acc.name,
      type: acc.type,
      address: acc.address || "",
      site_id: acc.site_id ? String(acc.site_id) : "none",
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditing(null);
    setForm(EMPTY_FORM);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const filtered = (accommodations as any[])
    .filter((a) => typeFilter === "all" || a.type === typeFilter)
    .filter(
      (a) =>
        a.name?.toLowerCase().includes(search.toLowerCase()) ||
        a.address?.toLowerCase().includes(search.toLowerCase()) ||
        a.site?.name?.toLowerCase().includes(search.toLowerCase()),
    );

  const isPending = createMutation.isPending || updateMutation.isPending;

  const countByType = (type: string) =>
    (accommodations as any[]).filter((a) => a.type === type).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Hotel className="h-6 w-6 text-primary" />
            </div>
            Gestion des Hébergements
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gérez les lieux d'hébergement disponibles pour les formations.
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2 font-bold">
          <Plus className="h-4 w-4" /> Nouvel Hébergement
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border rounded-xl p-4 shadow-sm">
          <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-1">Total</p>
          <p className="text-3xl font-black text-primary">{accommodations.length}</p>
        </div>
        {Object.entries(TYPE_LABELS).map(([type, { label, color }]) => (
          <div key={type} className="bg-white border rounded-xl p-4 shadow-sm">
            <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-1">{label}s</p>
            <p className="text-3xl font-black text-primary">{countByType(type)}</p>
          </div>
        ))}
      </div>

      {/* Filters + Table */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="p-4 border-b flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Type..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              <SelectItem value="hotel">Hôtel</SelectItem>
              <SelectItem value="resider">Résidence</SelectItem>
              <SelectItem value="centre_interne">Centre Interne</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-xs text-muted-foreground font-medium shrink-0">
            {filtered.length} résultat(s)
          </span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-muted-foreground text-sm">Chargement...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <BedDouble className="h-10 w-10 text-muted-foreground/30 mx-auto" />
            <p className="text-muted-foreground text-sm">Aucun hébergement trouvé.</p>
            <Button variant="outline" size="sm" onClick={openCreate}>
              Créer le premier hébergement
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="font-black text-[11px] uppercase tracking-widest">Nom</TableHead>
                <TableHead className="font-black text-[11px] uppercase tracking-widest">Type</TableHead>
                <TableHead className="font-black text-[11px] uppercase tracking-widest">Site</TableHead>
                <TableHead className="font-black text-[11px] uppercase tracking-widest">Adresse</TableHead>
                <TableHead className="w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((acc: any) => {
                const typeInfo = TYPE_LABELS[acc.type];
                return (
                  <TableRow key={acc.id} className="hover:bg-muted/20 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Hotel className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span className="font-bold text-sm">{acc.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {typeInfo ? (
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide border ${typeInfo.color}`}
                        >
                          {typeInfo.label}
                        </span>
                      ) : (
                        <Badge variant="outline">{acc.type}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground">{acc.site?.name || "—"}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground">{acc.address || "—"}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => openEdit(acc)}
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => setDeleteTarget(acc)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(v) => { if (!v) closeDialog(); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Modifier l'Hébergement" : "Nouvel Hébergement"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor="acc-name">Nom *</Label>
              <Input
                id="acc-name"
                placeholder="Ex: Hôtel Atlas Asni"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="acc-type">Type *</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })} required>
                <SelectTrigger id="acc-type">
                  <SelectValue placeholder="Sélectionner un type..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hotel">Hôtel</SelectItem>
                  <SelectItem value="resider">Résidence</SelectItem>
                  <SelectItem value="centre_interne">Centre Interne</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="acc-site">Site (optionnel)</Label>
              <Select value={form.site_id} onValueChange={(v) => setForm({ ...form, site_id: v })}>
                <SelectTrigger id="acc-site">
                  <SelectValue placeholder="Lié à un site..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucun site</SelectItem>
                  {(sites as any[]).map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="acc-address">Adresse</Label>
              <Input
                id="acc-address"
                placeholder="Ex: 15 Av. Mohammed V, Casablanca"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog}>
                Annuler
              </Button>
              <Button type="submit" disabled={isPending || !form.name || !form.type}>
                {isPending ? "Enregistrement..." : editing ? "Mettre à jour" : "Créer"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => { if (!v) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l'hébergement ?</AlertDialogTitle>
            <AlertDialogDescription>
              Vous êtes sur le point de supprimer <strong>{deleteTarget?.name}</strong>. Cette action
              est irréversible et pourrait affecter les réservations existantes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Suppression..." : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
