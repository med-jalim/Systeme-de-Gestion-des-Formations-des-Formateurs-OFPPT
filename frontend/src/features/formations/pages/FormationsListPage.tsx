import { useNavigate } from "react-router-dom";
import { useFormations } from "../hooks/useFormations";
import { FormationsTable } from "../components/FormationsTable";
import { Plus } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { Button } from "@/components/ui/button";

export const FormationsListPage = () => {
  const { formations, loading, removeFormation } = useFormations();
  const navigate = useNavigate();
  const { user, hasRole, isAdmin } = useAuth();

  const canEdit = isAdmin() || hasRole(["responsable_cdc", "responsable_formation", "formateur_animateur"]);

  const filteredFormations = isAdmin() 
    ? formations 
    : formations.filter(f => f.created_by === user?.id);

  const handleDelete = async (id: number) => {
    if (confirm("Voulez-vous vraiment supprimer ce programme de formation ?")) {
      try {
        await removeFormation(id);
      } catch (error) {
        console.error("Failed to delete formation", error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Catalogue des Formations</h1>
          <p className="text-sm text-slate-500">Gérez les programmes de formation et les piliers thématiques du réseau.</p>
        </div>
        {canEdit && (
          <Button onClick={() => navigate("/formations/new")} className="font-semibold">
            <Plus className="mr-2 h-4 w-4" /> Nouveau Programme
          </Button>
        )}
      </div>

      {/* Content Area */}
      <div className="pt-4">
        {loading && formations.length === 0 ? (
          <div className="py-20 text-center text-sm font-medium text-muted-foreground animate-pulse">
            Chargement du catalogue académique...
          </div>
        ) : (
          <FormationsTable
            formations={filteredFormations}
            onDelete={handleDelete}
            onEdit={(f) => navigate(`/formations/${f.id}`, { state: { edit: true } })}
            onView={(f) => navigate(`/formations/${f.id}`)}
            canEdit={canEdit}
          />
        )}
      </div>
    </div>
  );
};
