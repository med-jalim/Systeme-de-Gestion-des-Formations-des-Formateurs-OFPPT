import { useEffect, useState } from "react";
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
import { Plus, Edit, Trash2, Search, UserCircle, Key, MoreHorizontal, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/AuthProvider";

// ─── Types ───────────────────────────────────────────────────────────────────
interface User {
  id: number; first_name: string; last_name: string; email: string; matricule: string; role: string;
  centre_id?: number; direction_id?: number;
  centre?: { name: string; direction_id?: number }; direction?: { name: string };
}

const ROLE_BADGES: Record<string, { label: string; color: string }> = {
  admin: { label: "Administrateur", color: "bg-slate-100 text-slate-700 border-slate-200" },
  responsable_cdc: { label: "Resp. CDC", color: "bg-blue-100 text-blue-700 border-blue-200" },
  responsable_formation: { label: "Resp. Formation", color: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  responsable_dr: { label: "Resp. Direction", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  formateur_animateur: { label: "Formateur Animateur", color: "bg-purple-100 text-purple-700 border-purple-200" },
  formateur_participant: { label: "Formateur Participant", color: "bg-slate-100 text-slate-600 border-slate-200" },
};

export const UsersPage = () => {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [passwordForm, setPasswordForm] = useState({ password: "" });
  const [form, setForm] = useState({ 
    first_name: "", last_name: "", email: "", matricule: "", 
    role: "", centre_id: "", direction_id: "" 
  });
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  // Data Fetching
  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: async () => (await axiosInstance.get("/users")).data,
  });

  const { data: directions = [] } = useQuery<any[]>({
    queryKey: ["directions"],
    queryFn: async () => (await axiosInstance.get("/directions")).data,
  });

  const { data: centres = [] } = useQuery<any[]>({
    queryKey: ["centres"],
    queryFn: async () => (await axiosInstance.get("/centres")).data,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
       ...form,
       centre_id: form.centre_id ? Number(form.centre_id) : null,
       direction_id: form.direction_id ? Number(form.direction_id) : null,
    };

    const mutation = editing 
      ? axiosInstance.put(`/users/${editing.id}`, payload)
      : axiosInstance.post("/users", payload);

    mutation.then(() => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success(editing ? "Utilisateur mis à jour" : "Utilisateur créé");
      setDialogOpen(false);
    }).catch(e => toast.error(e.response?.data?.message || "Une erreur est survenue"));
  };

  const handlePasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    axiosInstance.post(`/users/${editing?.id}/reset-password`, passwordForm)
      .then(() => {
        toast.success("Mot de passe réinitialisé");
        setPasswordDialogOpen(false);
      })
      .catch(e => toast.error(e.response?.data?.message || "Erreur de réinitialisation"));
  };

  const filtered = users.filter(u => 
    u.id !== currentUser?.id &&
    (roleFilter === "all" || u.role === roleFilter) &&
    (`${u.first_name} ${u.last_name} ${u.matricule} ${u.email}`.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 page-transition">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestion du Personnel</h1>
          <p className="text-sm text-slate-500">Administration des accès, des attributions régionales et des mots de passe.</p>
        </div>
        <Button onClick={() => { setEditing(null); setForm({ first_name: "", last_name: "", email: "", matricule: "", role: "", centre_id: "", direction_id: "" }); setDialogOpen(true); }} className="font-semibold">
          <Plus className="mr-2 h-4 w-4" /> Nouvel Utilisateur
        </Button>
      </div>

      {/* Filter Section */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-slate-50 p-4 rounded-lg border border-border">
        <div className="relative flex-1 w-full">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
           <Input 
             placeholder="Rechercher par nom, email ou matricule..." 
             className="pl-9 bg-white"
             value={search}
             onChange={(e) => setSearch(e.target.value)}
           />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
           <Label className="text-xs font-bold text-slate-500 whitespace-nowrap">Filtrer par rôle:</Label>
           <select 
             className="bg-white border border-border rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary w-full md:w-48"
             value={roleFilter}
             onChange={(e) => setRoleFilter(e.target.value)}
           >
              <option value="all">Tous les rôles</option>
              {Object.entries(ROLE_BADGES).map(([r, { label }]) => (
                <option key={r} value={r}>{label}</option>
              ))}
           </select>
        </div>
      </div>

      {/* Institutional Table */}
      <div className="formal-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 hover:bg-slate-50">
              <TableHead className="font-semibold text-xs uppercase tracking-wider py-4">Utilisateur</TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider py-4">Matricule</TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider py-4">Rôle</TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider py-4">Structure</TableHead>
              <TableHead className="text-right font-semibold text-xs uppercase tracking-wider py-4">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="py-20 text-center text-slate-400">Chargement des données...</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="py-20 text-center text-slate-400 italic">Aucun personnel correspondant.</TableCell></TableRow>
            ) : (
              filtered.map((u) => (
                <TableRow key={u.id} className="hover:bg-slate-50/50 transition-colors">
                  <TableCell className="py-4">
                    <div className="flex flex-col">
                       <span className="text-sm font-semibold text-slate-900">{u.first_name} {u.last_name}</span>
                       <span className="text-xs text-slate-500">{u.email}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-slate-600 font-medium">{u.matricule}</TableCell>
                  <TableCell>
                    <span className={cn("px-2.5 py-0.5 text-[10px] font-bold rounded-full border", ROLE_BADGES[u.role]?.color)}>
                      {ROLE_BADGES[u.role]?.label || u.role}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                       <span className="text-xs text-slate-700 font-semibold">{u.direction?.name || "Siège National"}</span>
                       {u.centre && <span className="text-[10px] text-slate-400 italic">{u.centre.name}</span>}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => { setEditing(u); setPasswordForm({ password: "", password_confirmation: "" }); setPasswordDialogOpen(true); }} title="Réinitialiser le mot de passe" className="h-8 w-8 text-slate-400 hover:text-amber-600">
                        <Key className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => { 
                        setEditing(u); 
                        const dirId = u.direction_id || u.centre?.direction_id;
                        setForm({ 
                          first_name: u.first_name, 
                          last_name: u.last_name, 
                          email: u.email, 
                          matricule: u.matricule, 
                          role: u.role, 
                          centre_id: u.centre_id?.toString() || "", 
                          direction_id: dirId?.toString() || "" 
                        }); 
                        setDialogOpen(true); 
                      }} className="h-8 w-8 text-slate-400 hover:text-primary">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(u)} className="h-8 w-8 text-slate-400 hover:text-red-600">
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

      {/* Standard Institutional Dialogs */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
           <DialogHeader>
              <DialogTitle>{editing ? "Modifier le compte" : "Créer un nouveau compte"}</DialogTitle>
           </DialogHeader>
           <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">Prénom</Label>
                    <Input value={form.first_name} onChange={e => setForm({...form, first_name: e.target.value})} required />
                 </div>
                 <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">Nom</Label>
                    <Input value={form.last_name} onChange={e => setForm({...form, last_name: e.target.value})} required />
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">Matricule</Label>
                    <Input value={form.matricule} onChange={e => setForm({...form, matricule: e.target.value})} required />
                 </div>
                 <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">Email Institutionnel</Label>
                    <Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
                 </div>
              </div>
              
              <div className="space-y-1.5">
                 <Label className="text-xs font-semibold text-slate-700">Rôle de l'utilisateur</Label>
                 <select className="w-full h-10 bg-white border border-border rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary" value={form.role} onChange={e => setForm({...form, role: e.target.value})} required>
                    <option value="">Sélectionner un rôle...</option>
                    {Object.entries(ROLE_BADGES).map(([r, { label }]) => <option key={r} value={r}>{label}</option>)}
                 </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">Direction Régionale</Label>
                    <select className="w-full h-10 bg-white border border-border rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary" value={form.direction_id} onChange={e => setForm({...form, direction_id: e.target.value, centre_id: ""})}>
                       <option value="">Sélectionner une direction...</option>
                       {directions.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                 </div>
                 <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">Centre</Label>
                    <select className="w-full h-10 bg-white border border-border rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary" value={form.centre_id} onChange={e => setForm({...form, centre_id: e.target.value})} disabled={!form.direction_id}>
                       <option value="">Sélectionner un centre...</option>
                       {centres.filter(c => c.direction_id === Number(form.direction_id)).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                 </div>
              </div>

              <DialogFooter className="pt-4">
                 <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
                 <Button type="submit">Enregistrer les modifications</Button>
              </DialogFooter>
           </form>
        </DialogContent>
      </Dialog>

      {/* Password Reset Dialog */}
      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
         <DialogContent className="max-w-md">
            <DialogHeader>
               <DialogTitle className="flex items-center gap-2">
                 <Key className="h-5 w-5 text-amber-600" />
                 Réinitialiser le mot de passe
               </DialogTitle>
            </DialogHeader>
            <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg flex gap-3 mb-4">
               <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0" />
               <p className="text-xs text-amber-700 font-medium leading-relaxed">
                  Vous allez réinitialiser le mot de passe pour <strong>{editing?.first_name} {editing?.last_name}</strong>. 
                  Assurez-vous de lui transmettre ses nouveaux identifiants après confirmation.
               </p>
            </div>
            <form onSubmit={handlePasswordReset} className="space-y-4">
               <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">Nouveau mot de passe</Label>
                  <Input type="password" value={passwordForm.password} onChange={e => setPasswordForm({ password: e.target.value })} required />
               </div>
               <DialogFooter className="pt-4">
                  <Button type="button" variant="outline" onClick={() => setPasswordDialogOpen(false)}>Annuler</Button>
                  <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white">Confirmer la réinitialisation</Button>
               </DialogFooter>
            </form>
         </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => { if (!v) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le compte ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action supprimera définitivement l'accès de <strong>{deleteTarget?.first_name} {deleteTarget?.last_name}</strong> au système.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => deleteTarget && axiosInstance.delete(`/users/${deleteTarget.id}`).then(() => { queryClient.invalidateQueries({queryKey:['users']}); setDeleteTarget(null); toast.success("Utilisateur supprimé"); })}>
              Confirmer la suppression
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
