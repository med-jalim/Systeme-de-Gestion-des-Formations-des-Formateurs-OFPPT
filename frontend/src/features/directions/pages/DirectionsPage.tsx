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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Network, Plus, Edit, Trash2, Search, ChevronRight } from "lucide-react";

interface Direction {
  id: number;
  code: string;
  name: string;
  centres_count?: number;
}

type FormData = { code: string; name: string };
const EMPTY: FormData = { code: "", name: "" };

export const DirectionsPage = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Direction | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY);
  const [deleteTarget, setDeleteTarget] = useState<Direction | null>(null);

  const { data: directions = [], isLoading } = useQuery<Direction[]>({
    queryKey: ["directions"],
    queryFn: async () => (await axiosInstance.get("/directions")).data,
  });

  const createMutation = useMutation({
    mutationFn: (data: FormData) => axiosInstance.post("/directions", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["directions"] });
      toast.success("Direction créée avec succès.");
      closeDialog();
    },
    onError: (e: any) =>
      toast.error(e.response?.data?.message || "Erreur lors de la création."),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: FormData }) =>
      axiosInstance.put(`/directions/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["directions"] });
      toast.success("Direction mise à jour.");
      closeDialog();
    },
    onError: (e: any) =>
      toast.error(e.response?.data?.message || "Erreur lors de la mise à jour."),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => axiosInstance.delete(`/directions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["directions"] });
      queryClient.invalidateQueries({ queryKey: ["centres"] });
      toast.success("Direction supprimée.");
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

  const openEdit = (d: Direction) => {
    setEditing(d);
    setForm({ code: d.code, name: d.name });
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

  const filtered = (directions as Direction[]).filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.code.toLowerCase().includes(search.toLowerCase()),
  );

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Network className="h-6 w-6 text-primary" />
            </div>
            Gestion des Directions
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gérez les directions régionales de l'OFPPT.
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2 font-bold">
          <Plus className="h-4 w-4" /> Nouvelle Direction
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white border rounded-xl p-4 shadow-sm">
          <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-1">
            Total Directions
          </p>
          <p className="text-3xl font-black text-primary">{directions.length}</p>
        </div>
        <div className="bg-white border rounded-xl p-4 shadow-sm">
          <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-1">
            Total Centres
          </p>
          <p className="text-3xl font-black text-primary">
            {(directions as Direction[]).reduce(
              (sum, d) => sum + (d.centres_count || 0),
              0,
            )}
          </p>
        </div>
      </div>

      {/* Search + Table */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="p-4 border-b flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une direction..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <span className="text-xs text-muted-foreground font-medium">
            {filtered.length} résultat(s)
          </span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-muted-foreground text-sm">
            Chargement...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Network className="h-10 w-10 text-muted-foreground/30 mx-auto" />
            <p className="text-muted-foreground text-sm">Aucune direction trouvée.</p>
            <Button variant="outline" size="sm" onClick={openCreate}>
              Créer la première direction
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
                  Centres
                </TableHead>
                <TableHead className="w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((d) => (
                <TableRow
                  key={d.id}
                  className="hover:bg-muted/20 transition-colors"
                >
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="font-mono font-black text-xs"
                    >
                      {d.code}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <ChevronRight className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="font-bold text-sm">{d.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={d.centres_count ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {d.centres_count ?? 0} centre(s)
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => openEdit(d)}
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => setDeleteTarget(d)}
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
              {editing ? "Modifier la Direction" : "Nouvelle Direction"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor="dir-code">Code *</Label>
              <Input
                id="dir-code"
                placeholder="Ex: DR-CASA"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dir-name">Nom *</Label>
              <Input
                id="dir-name"
                placeholder="Ex: Direction Régionale Casablanca"
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
                disabled={isPending || !form.code || !form.name}
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
            <AlertDialogTitle>Supprimer la direction ?</AlertDialogTitle>
            <AlertDialogDescription>
              Vous allez supprimer{" "}
              <strong>
                {deleteTarget?.code} – {deleteTarget?.name}
              </strong>
              .
              {deleteTarget?.centres_count
                ? ` Cette direction contient ${deleteTarget.centres_count} centre(s) qui seront également supprimés.`
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
