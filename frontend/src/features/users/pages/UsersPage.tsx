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
import { Users, Plus, Edit, Trash2, Search, UserCircle } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Direction {
  id: number;
  code: string;
  name: string;
}
interface Centre {
  id: number;
  code: string;
  name: string;
  direction?: Direction;
}
interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  matricule: string;
  role: string;
  centre_id?: number | null;
  direction_id?: number | null;
  centre?: Centre | null;
  direction?: Direction | null;
}

type FormData = {
  first_name: string;
  last_name: string;
  email: string;
  matricule: string;
  role: string;
  centre_id: string;
  direction_id: string;
};
const EMPTY: FormData = {
  first_name: "",
  last_name: "",
  email: "",
  matricule: "",
  role: "",
  centre_id: "",
  direction_id: "",
};

// ─── Role config ─────────────────────────────────────────────────────────────

const ROLES: Record<string, { label: string; color: string }> = {
  admin: {
    label: "Administrateur",
    color: "bg-red-100 text-red-700 border-red-200",
  },
  responsable_cdc: {
    label: "Resp. CDC",
    color: "bg-orange-100 text-orange-700 border-orange-200",
  },
  responsable_formation: {
    label: "Resp. Formation",
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },
  responsable_dr: {
    label: "Resp. Direction",
    color: "bg-blue-100 text-blue-700 border-blue-200",
  },
  formateur_animateur: {
    label: "Formateur Animateur",
    color: "bg-purple-100 text-purple-700 border-purple-200",
  },
  formateur_participant: {
    label: "Form. Participant",
    color: "bg-green-100 text-green-700 border-green-200",
  },
};

// ─── Component ───────────────────────────────────────────────────────────────

export const UsersPage = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  // ── Queries ──
  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: async () => (await axiosInstance.get("/users")).data,
  });
  const { data: centres = [] } = useQuery<Centre[]>({
    queryKey: ["centres"],
    queryFn: async () => (await axiosInstance.get("/centres")).data,
  });
  const { data: directions = [] } = useQuery<Direction[]>({
    queryKey: ["directions"],
    queryFn: async () => (await axiosInstance.get("/directions")).data,
  });

  useEffect(() => {
    console.log(centres);
  }, [centres]);

  // ── Mutations ──
  const createMutation = useMutation({
    mutationFn: (data: FormData) =>
      axiosInstance.post("/users", {
        ...data,
        centre_id:
          data.centre_id && data.centre_id !== "none"
            ? Number(data.centre_id)
            : null,
        direction_id:
          data.direction_id && data.direction_id !== "none"
            ? Number(data.direction_id)
            : null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Utilisateur créé.");
      closeDialog();
    },
    onError: (e: any) =>
      toast.error(e.response?.data?.message || "Erreur lors de la création."),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: FormData }) =>
      axiosInstance.put(`/users/${id}`, {
        ...data,
        centre_id:
          data.centre_id && data.centre_id !== "none"
            ? Number(data.centre_id)
            : null,
        direction_id:
          data.direction_id && data.direction_id !== "none"
            ? Number(data.direction_id)
            : null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Utilisateur mis à jour.");
      closeDialog();
    },
    onError: (e: any) =>
      toast.error(
        e.response?.data?.message || "Erreur lors de la mise à jour.",
      ),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => axiosInstance.delete(`/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Utilisateur supprimé.");
      setDeleteTarget(null);
    },
    onError: (e: any) =>
      toast.error(
        e.response?.data?.message || "Erreur lors de la suppression.",
      ),
  });

  // ── Helpers ──
  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY);
    setDialogOpen(true);
  };
  const openEdit = (u: User) => {
    setEditing(u);
    setForm({
      first_name: u.first_name,
      last_name: u.last_name,
      email: u.email,
      matricule: u.matricule,
      role: u.role,
      centre_id: u.centre_id ? String(u.centre_id) : "",
      direction_id: u.direction_id ? String(u.direction_id) : "",
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

  const filtered = (users as User[])
    .filter((u) => roleFilter === "all" || u.role === roleFilter)
    .filter(
      (u) =>
        `${u.first_name} ${u.last_name}`
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        u.matricule.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()),
    );

  const isPending = createMutation.isPending || updateMutation.isPending;

  const roleCounts = Object.fromEntries(
    Object.keys(ROLES).map((r) => [
      r,
      (users as User[]).filter((u) => u.role === r).length,
    ]),
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Users className="h-6 w-6 text-primary" />
            </div>
            Gestion des Utilisateurs
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gérez les comptes utilisateurs et leurs rôles dans le système.
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2 font-bold">
          <Plus className="h-4 w-4" /> Nouvel Utilisateur
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 md:grid-cols-4 xl:grid-cols-7 gap-3">
        <div className="bg-white border rounded-xl p-3 shadow-sm col-span-3 md:col-span-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">
            Total
          </p>
          <p className="text-3xl font-black text-primary">
            {(users as User[]).length}
          </p>
        </div>
        {Object.entries(ROLES).map(([role, { label }]) => (
          <div key={role} className="bg-white border rounded-xl p-3 shadow-sm">
            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1 truncate">
              {label}
            </p>
            <p className="text-2xl font-black text-primary">
              {roleCounts[role] ?? 0}
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
              placeholder="Nom, matricule ou email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrer par rôle..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les rôles</SelectItem>
              {Object.entries(ROLES).map(([r, { label }]) => (
                <SelectItem key={r} value={r}>
                  {label}
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
            <UserCircle className="h-10 w-10 text-muted-foreground/30 mx-auto" />
            <p className="text-muted-foreground text-sm">
              Aucun utilisateur trouvé.
            </p>
            <Button variant="outline" size="sm" onClick={openCreate}>
              Créer le premier utilisateur
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="font-black text-[11px] uppercase tracking-widest">
                  Utilisateur
                </TableHead>
                <TableHead className="font-black text-[11px] uppercase tracking-widest">
                  Matricule
                </TableHead>
                <TableHead className="font-black text-[11px] uppercase tracking-widest">
                  Rôle
                </TableHead>
                <TableHead className="font-black text-[11px] uppercase tracking-widest">
                  Centre / Direction
                </TableHead>
                <TableHead className="w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((u) => {
                const roleInfo = ROLES[u.role];
                return (
                  <TableRow
                    key={u.id}
                    className="hover:bg-muted/20 transition-colors"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="text-xs font-black text-primary">
                            {u.first_name[0]}
                            {u.last_name[0]}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-sm">
                            {u.first_name} {u.last_name}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {u.email}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="font-mono font-black text-xs"
                      >
                        {u.matricule}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {roleInfo ? (
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide border ${roleInfo.color}`}
                        >
                          {roleInfo.label}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          {u.role}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold">
                          {u.centre?.name || "—"}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {u.direction?.name || u.centre?.direction?.name || ""}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => openEdit(u)}
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => setDeleteTarget(u)}
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

      {/* Dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(v) => {
          if (!v) closeDialog();
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Modifier l'Utilisateur" : "Nouvel Utilisateur"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="u-first">Prénom *</Label>
                <Input
                  id="u-first"
                  placeholder="Prénom"
                  value={form.first_name}
                  onChange={(e) =>
                    setForm({ ...form, first_name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="u-last">Nom *</Label>
                <Input
                  id="u-last"
                  placeholder="Nom de famille"
                  value={form.last_name}
                  onChange={(e) =>
                    setForm({ ...form, last_name: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="u-mat">Matricule *</Label>
                <Input
                  id="u-mat"
                  placeholder="Ex: MAT-001"
                  value={form.matricule}
                  onChange={(e) =>
                    setForm({ ...form, matricule: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="u-email">Email *</Label>
                <Input
                  id="u-email"
                  type="email"
                  placeholder="email@ofppt.ma"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="u-role">Rôle *</Label>
              <Select
                value={form.role}
                onValueChange={(v) => setForm({ ...form, role: v })}
                required
              >
                <SelectTrigger id="u-role">
                  <SelectValue placeholder="Sélectionner un rôle..." />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ROLES).map(([r, { label }]) => (
                    <SelectItem key={r} value={r}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="u-dir">Direction</Label>
                <Select
                  value={form.direction_id || "none"}
                  onValueChange={(v) =>
                    setForm({
                      ...form,
                      direction_id: v === "none" ? "" : v,
                      centre_id: "",
                    })
                  }
                >
                  <SelectTrigger id="u-dir">
                    <SelectValue placeholder="Direction..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucune</SelectItem>
                    {(directions as Direction[]).map((d) => (
                      <SelectItem key={d.id} value={String(d.id)}>
                        {d.code} – {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="u-ctr">Centre</Label>
                <Select
                  value={form.centre_id || "none"}
                  onValueChange={(v) =>
                    setForm({ ...form, centre_id: v === "none" ? "" : v })
                  }
                >
                  <SelectTrigger id="u-ctr">
                    <SelectValue placeholder="Centre..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucun</SelectItem>
                    {(centres as Centre[])
                      .filter(
                        (c) =>
                          !form.direction_id ||
                          form.direction_id === "none" ||
                          String((c as any).direction_id) === form.direction_id,
                      )
                      .map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.code} – {c.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog}>
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={
                  isPending ||
                  !form.first_name ||
                  !form.last_name ||
                  !form.email ||
                  !form.matricule ||
                  !form.role
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
            <AlertDialogTitle>Supprimer l'utilisateur ?</AlertDialogTitle>
            <AlertDialogDescription>
              Vous allez supprimer{" "}
              <strong>
                {deleteTarget?.first_name} {deleteTarget?.last_name}
              </strong>{" "}
              ({deleteTarget?.matricule}). Cette action est irréversible.
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
