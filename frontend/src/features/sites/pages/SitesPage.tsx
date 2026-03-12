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
import { MapPin, Plus, Edit, Trash2, Building2, Search } from "lucide-react";
import type { Site } from "@/features/training-plans/types";

interface Centre {
  id: number;
  name: string;
  code: string;
  direction?: { name: string };
}

type SiteFormData = {
  centre_id: string;
  name: string;
  address: string;
};

const EMPTY_FORM: SiteFormData = { centre_id: "", name: "", address: "" };

export const SitesPage = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<Site | null>(null);
  const [form, setForm] = useState<SiteFormData>(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState<Site | null>(null);

  const { data: sites = [], isLoading } = useQuery<Site[]>({
    queryKey: ["sites"],
    queryFn: async () => (await axiosInstance.get("/sites")).data,
  });

  const { data: centres = [] } = useQuery<Centre[]>({
    queryKey: ["centres"],
    queryFn: async () => (await axiosInstance.get("/centres")).data,
  });

  const createMutation = useMutation({
    mutationFn: (data: SiteFormData) =>
      axiosInstance.post("/sites", { ...data, centre_id: Number(data.centre_id) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sites"] });
      toast.success("Site créé avec succès.");
      closeDialog();
    },
    onError: (e: any) => toast.error(e.response?.data?.message || "Erreur lors de la création."),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: SiteFormData }) =>
      axiosInstance.put(`/sites/${id}`, { ...data, centre_id: Number(data.centre_id) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sites"] });
      toast.success("Site mis à jour.");
      closeDialog();
    },
    onError: (e: any) => toast.error(e.response?.data?.message || "Erreur lors de la mise à jour."),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => axiosInstance.delete(`/sites/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sites"] });
      toast.success("Site supprimé.");
      setDeleteTarget(null);
    },
    onError: (e: any) => toast.error(e.response?.data?.message || "Erreur lors de la suppression."),
  });

  const openCreate = () => {
    setEditingSite(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (site: Site) => {
    setEditingSite(site);
    setForm({
      centre_id: String(site.centre_id),
      name: site.name,
      address: site.address || "",
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingSite(null);
    setForm(EMPTY_FORM);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSite) {
      updateMutation.mutate({ id: editingSite.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const filteredSites = (sites as any[]).filter(
    (s) =>
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.centre?.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.address?.toLowerCase().includes(search.toLowerCase()),
  );

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <MapPin className="h-6 w-6 text-primary" />
            </div>
            Gestion des Sites
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gérez les sites de formation rattachés aux centres.
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2 font-bold">
          <Plus className="h-4 w-4" /> Nouveau Site
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white border rounded-xl p-4 shadow-sm">
          <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-1">
            Total Sites
          </p>
          <p className="text-3xl font-black text-primary">{sites.length}</p>
        </div>
        <div className="bg-white border rounded-xl p-4 shadow-sm">
          <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-1">
            Centres
          </p>
          <p className="text-3xl font-black text-primary">{centres.length}</p>
        </div>
      </div>

      {/* Search + Table */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="p-4 border-b flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un site..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <span className="text-xs text-muted-foreground font-medium">
            {filteredSites.length} résultat(s)
          </span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-muted-foreground text-sm">Chargement...</div>
        ) : filteredSites.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Building2 className="h-10 w-10 text-muted-foreground/30 mx-auto" />
            <p className="text-muted-foreground text-sm">Aucun site trouvé.</p>
            <Button variant="outline" size="sm" onClick={openCreate}>
              Créer le premier site
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="font-black text-[11px] uppercase tracking-widest">Nom</TableHead>
                <TableHead className="font-black text-[11px] uppercase tracking-widest">Centre</TableHead>
                <TableHead className="font-black text-[11px] uppercase tracking-widest">Direction</TableHead>
                <TableHead className="font-black text-[11px] uppercase tracking-widest">Adresse</TableHead>
                <TableHead className="w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSites.map((site: any) => (
                <TableRow key={site.id} className="hover:bg-muted/20 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="font-bold text-sm">{site.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-semibold text-xs">
                      {site.centre?.name || "—"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-muted-foreground">
                      {site.centre?.direction?.name || "—"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-muted-foreground">{site.address || "—"}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => openEdit(site)}
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => setDeleteTarget(site)}
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

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(v) => { if (!v) closeDialog(); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingSite ? "Modifier le Site" : "Nouveau Site"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor="site-name">Nom du site *</Label>
              <Input
                id="site-name"
                placeholder="Ex: Centre de Formation Agdal"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="site-centre">Centre rattaché *</Label>
              <Select
                value={form.centre_id}
                onValueChange={(v) => setForm({ ...form, centre_id: v })}
                required
              >
                <SelectTrigger id="site-centre">
                  <SelectValue placeholder="Sélectionner un centre..." />
                </SelectTrigger>
                <SelectContent>
                  {centres.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                      {c.code ? ` (${c.code})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="site-address">Adresse</Label>
              <Input
                id="site-address"
                placeholder="Ex: 12 Rue Hassan II, Rabat"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog}>
                Annuler
              </Button>
              <Button type="submit" disabled={isPending || !form.name || !form.centre_id}>
                {isPending ? "Enregistrement..." : editingSite ? "Mettre à jour" : "Créer"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => { if (!v) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le site ?</AlertDialogTitle>
            <AlertDialogDescription>
              Vous êtes sur le point de supprimer <strong>{deleteTarget?.name}</strong>. Cette action est
              irréversible et pourrait affecter les plans de formation liés.
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
