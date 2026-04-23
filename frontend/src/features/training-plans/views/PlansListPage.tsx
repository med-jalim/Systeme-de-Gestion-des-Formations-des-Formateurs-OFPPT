import { useNavigate } from "react-router-dom";
import { useTrainingPlans } from "../hooks/useTrainingPlans";
import { PlansTable } from "../components/PlansTable";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusCircle } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";

export const PlansListPage = () => {
  const { plans, loading, removePlan } = useTrainingPlans();
  const navigate = useNavigate();
  const { hasRole } = useAuth();

  const handleDelete = async (id: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce plan ?")) {
      try {
        await removePlan(id);
      } catch (error) {
        console.error("Failed to delete plan", error);
      }
    }
  };

  const canCreate = !hasRole("responsable_cdc");

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Plans de Formation
          </h1>
          <p className="text-muted-foreground">
            Gérez les sessions de formation, les affected thèmes, les
            participants et la logistique.
          </p>
        </div>
        {canCreate && (
          <Button onClick={() => navigate("/plans/new")}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Nouveau Plan
          </Button>
        )}
      </div>

      {loading && plans.length === 0 ? (
        <div className="space-y-4 pt-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-8 w-24" />
          </div>
          <Skeleton className="h-[400px] w-full rounded-xl" />
        </div>
      ) : (
        <PlansTable
          plans={plans}
          onDelete={handleDelete}
          onEdit={(plan) =>
            navigate(`/plans/${plan.id}`, { state: { edit: true } })
          }
          onView={(plan) => navigate(`/plans/${plan.id}`)}
        />
      )}
    </div>
  );
};
