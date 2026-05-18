import { useNavigate } from "react-router-dom";
import { useTrainingPlans } from "../hooks/useTrainingPlans";
import { PlansTable } from "../components/PlansTable";
import { Plus } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { Button } from "@/components/ui/button";

export const PlansListPage = () => {
  const { plans, loading, removePlan } = useTrainingPlans();
  const navigate = useNavigate();
  const { user, isAdmin, hasRole } = useAuth();

  const filteredPlans = plans.filter(plan => {
    if (isAdmin()) return true;
    
    // Ownership check
    if (plan.created_by === user?.id) return true;
    
    // Responsable CDC: sees plans created by them OR plans in their center
    if (hasRole("responsable_cdc")) {
      return plan.site?.centre_id === user?.centre_id;
    }

    // Other Managers (DR, RF) see everything to facilitate validation
    if (hasRole(["responsable_dr", "responsable_formation"])) return true;
    
    // Trainers and Participants only see approved plans
    return plan.status === 'approuve' || plan.status === 'completed';
  });

  const handleDelete = async (id: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce plan ?")) {
      try {
        await removePlan(id);
      } catch (error) {
        console.error("Failed to delete plan", error);
      }
    }
  };

  const canCreate = isAdmin() || hasRole(["responsable_formation", "responsable_cdc"]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Plans de Formation</h1>
          <p className="text-sm text-slate-500">Gérez les sessions de formation, les thèmes, les participants et la logistique.</p>
        </div>
        {canCreate && (
          <Button onClick={() => navigate("/plans/new")} className="font-semibold">
            <Plus className="mr-2 h-4 w-4" /> Nouveau Plan
          </Button>
        )}
      </div>

      {/* Content Area */}
      <div className="pt-4">
        {loading && plans.length === 0 ? (
          <div className="py-20 text-center text-sm font-medium text-muted-foreground animate-pulse">
            Chargement des données institutionnelles...
          </div>
        ) : (
          <PlansTable
            plans={filteredPlans}
            onDelete={handleDelete}
            onEdit={(plan) => navigate(`/plans/${plan.id}`, { state: { edit: true } })}
            onView={(plan) => navigate(`/plans/${plan.id}`)}
          />
        )}
      </div>
    </div>
  );
};
