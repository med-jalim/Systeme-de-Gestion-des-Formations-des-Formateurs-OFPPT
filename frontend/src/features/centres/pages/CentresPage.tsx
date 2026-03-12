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
import { Building2, Plus, Edit, Trash2, Search } from "lucide-react";

interface Direction {
  id: number;
  code: string;
  name: string;
}

interface Centre {
  id: number;
  code: string;
  name: string;
  direction_id: number;
  direction?: Direction;
  sites_count?: number;
}

type FormData = { code: string; name: string; direction_id: string };
const EMPTY: FormData = { code: "", name: "", direction_id: "" };

export const CentresPage = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [dirFilter, setDirFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Centre | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY);
  const [deleteTarget, setDeleteTarget] = useState<Centre | null>(null);

  const { data: centres = [], isLoading } = useQuery<Centre[]>({
    queryKey: ["centres"],
    queryFn: async () => (await axiosInstance.get("/centres")).data,
  });

  const { data: directions = [] } = useQuery<Direction[]>({
    queryKey: ["directions"],
    queryFn: async () => (await axiosInstance.get("/directions")).data,
  });

  const createMutation = useMutation({
    mutationFn: (data: FormData) =>
      axiosInstance.post("/centres", {
        ...data,
        direction_id: Number(data.direction_id),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["centres"] });
      queryClient.invalidateQueries({ queryKey: ["directions"] });
      toast.success("Centre créé avec succès.");
      closeDialog();
    },
    onError: (e: any) =>
      toast.error(e.response?.data?.message || "Erreur lors de la création."),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: FormData }) =>
      axiosInstance.put(`/centres/${id}`, {
        ...data,
        direction_id: Number(data.direction_id),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["centres"] });
      queryClient.invalidateQueries({ queryKey: ["directions"] });
      toast.success("Centre mis à jour.");
      closeDialog();
    },
    onError: (e: any) =>
      toast.error(e.response?.data?.message || "Erreur lors de la mise à jour."),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => axiosInstance.delete(`/centres/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["centres"] });
      queryClient.invalidateQueries({ queryKey: ["directions"] });
      queryClient.invalidateQueries({ queryKey: ["sites"] });
      toast.success("Centre supprimé.");
      setDeleteTarget(null);
    },
    onError: (e: any) =>
      toast.error(e.response?.data?.message || "Erreur lors de la suppression."),
  });

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY);
    setDialogOpen(true);
  };

  const openEdit = (c: Centre) => {
    setEditing(c);
    setForm({
      code: c.code,
      name: c.name,
      direction_id: String(c.direction_id),
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditing(null);
    setForm(EMPTY);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) updateMutation.mutate({ id: editing.id, data: form });
    else createMutation.mutate(form);
  };

  const filtered = (centres as Centre[])
    .filter((c) => dirFilter === "all" || String(c.direction_id) === dirFilter)
    .filter(
      (c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.code.toLowerCase().includes(search.toLowerCase()) ||
        c.direction?.name.toLowerCase().includes(search.toLowerCase()),
    );

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            Gestion des Centres
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gérez les centres de formation rattachés aux directions.
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2 font-bold">
          <Plus className="h-4 w-4" /> Nouveau Centre
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border rounded-xl p-4 shadow-sm">
          <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-1">
            Total Centres
          </p>
          <p className="text-3xl font-black text-primary">{centres.length}</p>
        </div>
        {(directions as Direction[]).slice(0, 3).map((d) => (
          <div key={d.id} className="bg-white border rounded-xl p-4 shadow-sm">
            <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-1 truncate">
              {d.code}
            </p>
            <p className="text-3xl font-black text-primary">
              {(centres as Centre[]).filter((c) => c.direction_id === d.id).length}
            </p>
          </div>
        ))}
      </div>

      {/* Search + Filter + Table */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="p-4 border-b flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un centre..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={dirFilter} onValueChange={setDirFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrer par direction..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les directions</SelectItem>
              {(directions as Direction[]).map((d) => (
                <SelectItem key={d.id} value={String(d.id)}>
                  {d.code} – {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-xs text-muted-foreground font-medium shrink-0">
            {filtered.length} résultat(s)
          </span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-muted-foreground text-sm">
            Chargement...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Building2 className="h-10 w-10 text-muted-foreground/30 mx-auto" />
            <p className="text-muted-foreground text-sm">Aucun centre trouvé.</p>
            <Button variant="outline" size="sm" onClick={openCreate}>
              Créer le premier centre
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="font-black text-[11px] uppercase tracking-widest">
                  Code
                </TableHead>
                <TableHead className="font-black text-[11px] uppercase tracking-widest">
                  Nom
                </TableHead>
                <TableHead className="font-black text-[11px] uppercase tracking-widest">
                  Direction
                </TableHead>
                <TableHead className="font-black text-[11px] uppercase tracking-widest">
                  Sites
                </TableHead>
                <TableHead className="w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <TableRow
                  key={c.id}
                  className="hover:bg-muted/20 transition-colors"
                >
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="font-mono font-black text-xs"
                    >
                      {c.code}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-bold text-sm">{c.name}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold">
                        {c.direction?.name || "—"}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {c.direction?.code}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={c.sites_count ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {c.sites_count ?? 0} site(s)
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => openEdit(c)}
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => setDeleteTarget(c)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(v) => {
          if (!v) closeDialog();
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Modifier le Centre" : "Nouveau Centre"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor="ctr-direction">Direction *</Label>
              <Select
                value={form.direction_id}
                onValueChange={(v) => setForm({ ...form, direction_id: v })}
                required
              >
                <SelectTrigger id="ctr-direction">
                  <SelectValue placeholder="Sélectionner une direction..." />
                </SelectTrigger>
                <SelectContent>
                  {(directions as Direction[]).map((d) => (
                    <SelectItem key={d.id} value={String(d.id)}>
                      {d.code} – {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ctr-code">Code *</Label>
              <Input
                id="ctr-code"
                placeholder="Ex: CFMOTI"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ctr-name">Nom *</Label>
              <Input
                id="ctr-name"
                placeholder="Ex: Centre de Formation ISTA"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog}>
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={
                  isPending || !form.code || !form.name || !form.direction_id
                }
              >
                {isPending
                  ? "Enregistrement..."
                  : editing
                  ? "Mettre à jour"
                  : "Créer"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(v) => {
          if (!v) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le centre ?</AlertDialogTitle>
            <AlertDialogDescription>
              Vous allez supprimer{" "}
              <strong>
                {deleteTarget?.code} – {deleteTarget?.name}
              </strong>
              .
              {deleteTarget?.sites_count
                ? ` Ce centre a ${deleteTarget.sites_count} site(s) associés.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() =>
                deleteTarget && deleteMutation.mutate(deleteTarget.id)
              }
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
