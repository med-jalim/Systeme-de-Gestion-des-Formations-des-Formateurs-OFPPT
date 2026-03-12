import { useParams, Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "../api";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Calendar,
  Layers,
  PlusCircle,
  Edit,
  Trash2,
  GraduationCap,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const FormationDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const location = useLocation();
  const [isThemeDialogOpen, setIsThemeDialogOpen] = useState(false);
  const [editingTheme, setEditingTheme] = useState<{
    id?: number;
    title: string;
    description: string;
    start_date: string;
    end_date: string;
  } | null>(null);

  const [isFormationDialogOpen, setIsFormationDialogOpen] = useState(false);
  const [editingFormation, setEditingFormation] = useState<{
    title: string;
    description: string;
    start_date: string;
    end_date: string;
  } | null>(null);

  const { data: formation, isLoading } = useQuery({
    queryKey: ["formation", id],
    queryFn: () => api.fetchFormationById(Number(id)),
    enabled: !!id,
  });

  useEffect(() => {
    if (location.state?.edit && formation) {
      setEditingFormation({
        title: formation.title,
        description: formation.description,
        start_date: formation.start_date.split("T")[0],
        end_date: formation.end_date.split("T")[0],
      });
      setIsFormationDialogOpen(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state, formation]);

  const createThemeMutation = useMutation({
    mutationFn: (data: {
      title: string;
      description: string;
      start_date: string;
      end_date: string;
    }) => api.createTheme({ formation_id: Number(id), ...data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["formation", id] });
      setIsThemeDialogOpen(false);
      setEditingTheme(null);
      toast.success("Thématique ajoutée avec succès.");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors de l'ajout.");
    },
  });

  const updateThemeMutation = useMutation({
    mutationFn: (data: {
      id: number;
      title: string;
      description: string;
      start_date: string;
      end_date: string;
    }) =>
      api.updateTheme(data.id, {
        title: data.title,
        description: data.description,
        start_date: data.start_date,
        end_date: data.end_date,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["formation", id] });
      setIsThemeDialogOpen(false);
      setEditingTheme(null);
      toast.success("Thématique mise à jour.");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Erreur lors de la modification.",
      );
    },
  });

  const deleteThemeMutation = useMutation({
    mutationFn: (themeId: number) => api.deleteTheme(themeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["formation", id] });
      toast.success("Thématique supprimée.");
    },
  });

  const updateFormationMutation = useMutation({
    mutationFn: (data: any) => api.updateFormation(Number(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["formation", id] });
      setIsFormationDialogOpen(false);
      toast.success("Programme mis à jour avec succès.");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Erreur lors de la mise à jour.",
      );
    },
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-10 w-64" />
        </div>
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (!formation) return <div>Formation non trouvée</div>;

  const handleSaveTheme = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTheme) return;

    // Basic frontend validation
    if (new Date(editingTheme.start_date) > new Date(editingTheme.end_date)) {
      toast.error("La date de fin doit être après la date de début.");
      return;
    }

    if (
      new Date(editingTheme.start_date) < new Date(formation.start_date) ||
      new Date(editingTheme.end_date) > new Date(formation.end_date)
    ) {
      toast.error(
        `Les dates doivent être entre le ${new Date(formation.start_date).toLocaleDateString()} et le ${new Date(formation.end_date).toLocaleDateString()}`,
      );
      return;
    }

    if (editingTheme.id) {
      updateThemeMutation.mutate(editingTheme as any);
    } else {
      createThemeMutation.mutate(editingTheme as any);
    }
  };

  const handleDeleteTheme = (themeId: number) => {
    if (confirm("Supprimer cette thématique ?")) {
      deleteThemeMutation.mutate(themeId);
    }
  };

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-muted shadow-sm">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="h-10 w-10 shrink-0 rounded-full bg-muted/50 hover:bg-muted"
          >
            <Link to="/formations">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black tracking-tight text-primary">
                {formation.title}
              </h1>
              <Badge
                variant="outline"
                className="text-primary border-primary/30 uppercase text-[10px] font-bold"
              >
                Catalogue
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                Défini du{" "}
                {new Date(formation.start_date).toLocaleDateString(
                  "fr-FR",
                )} au {new Date(formation.end_date).toLocaleDateString("fr-FR")}
              </span>
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="font-bold"
            onClick={() => {
              setEditingFormation({
                title: formation.title,
                description: formation.description,
                start_date: formation.start_date.split("T")[0],
                end_date: formation.end_date.split("T")[0],
              });
              setIsFormationDialogOpen(true);
            }}
          >
            <Edit className="mr-2 h-4 w-4" /> Modifier Programme
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Info Card */}
        <div className="bg-white rounded-xl border border-muted p-6 shadow-sm h-fit">
          <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 mb-4">
            <GraduationCap className="h-4 w-4" /> À propos du programme
          </h3>
          <p className="text-sm text-gray-700 leading-relaxed">
            {formation.description ||
              "Aucune description fournie pour ce programme."}
          </p>
        </div>

        {/* Themes Table */}
        <div className="md:col-span-2 bg-white rounded-xl border border-muted p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Layers className="h-4 w-4" /> Thématiques Associées
            </h3>
            <Button
              size="sm"
              className="font-bold h-8"
              onClick={() => {
                setEditingTheme({
                  title: "",
                  description: "",
                  start_date: formation.start_date,
                  end_date: formation.end_date,
                });
                setIsThemeDialogOpen(true);
              }}
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Ajouter
            </Button>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="font-bold">Titre</TableHead>
                  <TableHead className="font-bold">Période</TableHead>
                  <TableHead className="text-right font-bold">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {formation.themes?.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center py-10 text-muted-foreground"
                    >
                      Aucune thématique définie.
                    </TableCell>
                  </TableRow>
                ) : (
                  formation.themes?.map((theme) => (
                    <TableRow key={theme.id}>
                      <TableCell className="font-bold text-sm w-[250px]">
                        <div className="flex flex-col">
                          <span>{theme.title}</span>
                          <span className="text-[10px] text-muted-foreground font-normal line-clamp-1">
                            {theme.description}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {theme.start_date ? (
                          <span>
                            {new Date(theme.start_date).toLocaleDateString()} -{" "}
                            {new Date(theme.end_date).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="italic">Non définie</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-blue-500"
                          onClick={() => {
                            setEditingTheme({
                              ...theme,
                              start_date:
                                theme.start_date || formation.start_date,
                              end_date: theme.end_date || formation.end_date,
                            } as any);
                            setIsThemeDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500"
                          onClick={() => handleDeleteTheme(theme.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Theme Dialog */}
      <Dialog open={isThemeDialogOpen} onOpenChange={setIsThemeDialogOpen}>
        <DialogContent>
          <form onSubmit={handleSaveTheme}>
            <DialogHeader>
              <DialogTitle>
                {editingTheme?.id
                  ? "Modifier la thématique"
                  : "Nouvelle thématique"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Titre</Label>
                <Input
                  id="title"
                  value={editingTheme?.title || ""}
                  onChange={(e) =>
                    setEditingTheme((prev) => ({
                      ...prev!,
                      title: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="start_date">Date de début</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={
                      (editingTheme?.start_date as any)?.split("T")[0] || ""
                    }
                    onChange={(e) =>
                      setEditingTheme((prev) => ({
                        ...prev!,
                        start_date: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="end_date">Date de fin</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={(editingTheme?.end_date as any)?.split("T")[0] || ""}
                    onChange={(e) =>
                      setEditingTheme((prev) => ({
                        ...prev!,
                        end_date: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={editingTheme?.description || ""}
                  onChange={(e) =>
                    setEditingTheme((prev) => ({
                      ...prev!,
                      description: e.target.value,
                    }))
                  }
                  rows={4}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsThemeDialogOpen(false)}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={
                  createThemeMutation.isPending || updateThemeMutation.isPending
                }
              >
                Enregistrer
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Formation Edit Dialog */}
      <Dialog
        open={isFormationDialogOpen}
        onOpenChange={setIsFormationDialogOpen}
      >
        <DialogContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateFormationMutation.mutate(editingFormation);
            }}
          >
            <DialogHeader>
              <DialogTitle>Modifier le programme</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="f-title">Titre</Label>
                <Input
                  id="f-title"
                  value={editingFormation?.title || ""}
                  onChange={(e) =>
                    setEditingFormation((prev) => ({
                      ...prev!,
                      title: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="f-start_date">Date de début</Label>
                  <Input
                    id="f-start_date"
                    type="date"
                    value={editingFormation?.start_date || ""}
                    onChange={(e) =>
                      setEditingFormation((prev) => ({
                        ...prev!,
                        start_date: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="f-end_date">Date de fin</Label>
                  <Input
                    id="f-end_date"
                    type="date"
                    value={editingFormation?.end_date || ""}
                    onChange={(e) =>
                      setEditingFormation((prev) => ({
                        ...prev!,
                        end_date: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="f-description">Description</Label>
                <Textarea
                  id="f-description"
                  value={editingFormation?.description || ""}
                  onChange={(e) =>
                    setEditingFormation((prev) => ({
                      ...prev!,
                      description: e.target.value,
                    }))
                  }
                  rows={4}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsFormationDialogOpen(false)}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={updateFormationMutation.isPending}
              >
                {updateFormationMutation.isPending
                  ? "Mise à jour..."
                  : "Enregistrer les modifications"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
