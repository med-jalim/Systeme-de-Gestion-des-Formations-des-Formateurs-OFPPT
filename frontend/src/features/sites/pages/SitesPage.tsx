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
    <div className="space-y-6 page-transition">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestion des Sites</h1>
          <p className="text-sm text-slate-500">
             Administration des lieux de formation et des structures rattachées.
          </p>
        </div>
        <Button onClick={openCreate} className="font-semibold">
          <Plus className="mr-2 h-4 w-4" /> Nouveau Site
        </Button>
      </div>

      {/* Stats KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="formal-card p-6 flex flex-col gap-2">
           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Sites Actifs</span>
           <div className="flex items-end justify-between">
              <h3 className="text-3xl font-bold text-slate-900">{sites.length}</h3>
              <MapPin className="h-5 w-5 text-primary opacity-20" />
           </div>
        </div>
        <div className="formal-card p-6 flex flex-col gap-2">
           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Centres Administratifs</span>
           <div className="flex items-end justify-between">
              <h3 className="text-3xl font-bold text-slate-900">{centres.length}</h3>
              <Building2 className="h-5 w-5 text-primary opacity-20" />
           </div>
        </div>
      </div>

      {/* Filter Area */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-slate-50 p-4 rounded-lg border border-border">
        <div className="relative flex-1 w-full">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
           <Input 
             placeholder="Rechercher par nom, centre ou adresse..." 
             className="pl-9 bg-white"
             value={search}
             onChange={(e) => setSearch(e.target.value)}
           />
        </div>
        <div className="text-xs text-slate-500 font-medium px-2">
           {filteredSites.length} site(s) identifié(s)
        </div>
      </div>

      {/* Institutional Table */}
      <div className="formal-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 hover:bg-slate-50">
              <TableHead className="font-semibold text-xs uppercase tracking-wider py-4 px-6">Nom du Site</TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider py-4 px-6">Centre Rattaché</TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider py-4 px-6">Direction</TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider py-4 px-6">Adresse</TableHead>
              <TableHead className="text-right font-semibold text-xs uppercase tracking-wider py-4 px-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="py-20 text-center text-slate-400">Chargement...</TableCell></TableRow>
            ) : filteredSites.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="py-20 text-center text-slate-400 italic">Aucun site trouvé.</TableCell></TableRow>
            ) : (
              filteredSites.map((site: any) => (
                <TableRow key={site.id} className="hover:bg-slate-50/50 transition-colors">
                  <TableCell className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded bg-primary/5 flex items-center justify-center text-primary">
                         <MapPin className="h-4 w-4" />
                      </div>
                      <span className="font-semibold text-sm text-slate-900">{site.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                      {site.centre?.name || "—"}
                    </span>
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    <span className="text-xs text-slate-500 font-medium">
                      {site.centre?.direction?.name || "—"}
                    </span>
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    <span className="text-xs text-slate-500 italic">{site.address || "—"}</span>
                  </TableCell>
                  <TableCell className="text-right py-4 px-6">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(site)} className="h-8 w-8 text-slate-400 hover:text-primary">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(site)} className="h-8 w-8 text-slate-400 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialogs */}
      <Dialog open={dialogOpen} onOpenChange={(v) => { if (!v) closeDialog(); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingSite ? "Modifier le Site" : "Nouveau Site"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="space-y-1.5">
              <Label>Nom du site</Label>
              <Input placeholder="Ex: Centre de Formation Agdal" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="space-y-1.5">
              <Label>Centre rattaché</Label>
              <select value={form.centre_id} onChange={(e) => setForm({ ...form, centre_id: e.target.value })} className="w-full h-10 bg-white border border-border rounded-md px-3 text-sm outline-none focus:ring-1 focus:ring-primary" required>
                <option value="">Sélectionner un centre...</option>
                {centres.map((c) => (
                  <option key={c.id} value={String(c.id)}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Adresse physique</Label>
              <Input placeholder="Adresse complète..." value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
            <DialogFooter className="pt-4">
               <Button type="button" variant="outline" onClick={closeDialog}>Annuler</Button>
               <Button type="submit" disabled={isPending}>{isPending ? "Enregistrement..." : "Confirmer"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => { if (!v) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le site ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Les plans de formation liés pourraient être affectés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}>
              Confirmer la suppression
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
