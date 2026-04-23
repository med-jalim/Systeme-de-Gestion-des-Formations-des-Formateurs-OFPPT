import { useNavigate } from "react-router-dom";
import { useFormations } from "../hooks/useFormations";
import { FormationsTable } from "../components/FormationsTable";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusCircle, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/providers/AuthProvider";

export const FormationsListPage = () => {
  const { formations, loading, removeFormation } = useFormations();
  const navigate = useNavigate();
  const { hasRole, isAdmin } = useAuth();

  const canEdit = isAdmin() || hasRole(["responsable_cdc", "responsable_formation"]);

  const handleDelete = async (id: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette formation ?")) {
      try {
        await removeFormation(id);
        toast.success("Formation supprimée avec succès.");
      } catch (error) {
        console.error("Failed to delete formation", error);
        toast.error("Erreur lors de la suppression.");
      }
    }
  };

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-muted shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-primary">
              Catalogue des Formations
            </h1>
            <p className="text-muted-foreground text-sm font-medium mt-1">
              Gérez les programmes de formation et leurs thématiques associées.
            </p>
          </div>
        </div>
        
        {canEdit && (
          <Button
            onClick={() => navigate("/formations/new")}
            className="font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Nouveau Programme
          </Button>
        )}
      </div>

      {loading && formations.length === 0 ? (
        <div className="space-y-4 pt-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-8 w-24" />
          </div>
          <Skeleton className="h-[400px] w-full rounded-xl" />
        </div>
      ) : (
        <FormationsTable
          formations={formations}
          onDelete={handleDelete}
          onEdit={(formation) =>
            navigate(`/formations/${formation.id}`, { state: { edit: true } })
          }
          onView={(formation) => navigate(`/formations/${formation.id}`)}
          canEdit={canEdit}
        />
      )}
    </div>
  );
};
