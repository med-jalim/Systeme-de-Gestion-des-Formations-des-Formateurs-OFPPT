import { useNavigate } from "react-router-dom";
import { useTrainingPlans } from "../hooks/useTrainingPlans";
import { PlansTable } from "../components/PlansTable";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export const PlansListPage = () => {
  const { plans, loading, removePlan } = useTrainingPlans();
  const navigate = useNavigate();

  const handleDelete = async (id: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce plan ?")) {
      try {
        await removePlan(id);
      } catch (error) {
        console.error("Failed to delete plan", error);
      }
    }
  };

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
        <Button onClick={() => navigate("/plans/new")}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nouveau Plan
        </Button>
      </div>

      {loading && plans.length === 0 ? (
        <div className="flex justify-center p-12 text-muted-foreground">
          Chargement des données...
        </div>
      ) : (
        <PlansTable
          plans={plans}
          onDelete={handleDelete}
          onEdit={(plan) => console.log("Edit plan", plan)}
          onView={(plan) => console.log("View plan", plan)}
        />
      )}
    </div>
  );
};
