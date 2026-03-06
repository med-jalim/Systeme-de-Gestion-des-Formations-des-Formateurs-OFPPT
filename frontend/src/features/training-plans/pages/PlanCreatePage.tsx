import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PlanCreateWizard } from "../components/PlanCreateWizard";
import type { CreateTrainingPlanFormValues } from "../schemas/plan.schema";
import { createPlan } from "../api";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const PlanCreatePage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutateAsync: submitPlan, isPending } = useMutation({
    mutationFn: createPlan,
    onSuccess: () => {
      // Invalidate the plans list cache
      queryClient.invalidateQueries({ queryKey: ["trainingPlans"] });
      toast.success("Plan de formation créé avec succès !");
      // navigate to details or list
      navigate("/plans");
    },
    onError: (error: any) => {
      const msg =
        error.response?.data?.message ||
        "Une erreur est survenue lors de la création.";
      toast.error(msg);
      console.error("Creation failed", error);
    },
  });

  const handleSubmit = async (data: CreateTrainingPlanFormValues) => {
    await submitPlan({
      ...data,
      title: data.title || "",
      participants: data.participants.map((p) => ({ userId: p.userId })),
      trainers: data.trainers.map((t) => ({ userId: t.userId })),
      theme_assignments: data.participants.flatMap((p) =>
        p.assignments.map((a) => ({
          theme_id: a.themeId,
          participant_id: p.userId,
          formateur_id: a.trainerId,
        })),
      ),
      plan_accommodations: data.accommodations?.map((acc) => ({
        hebergement_id: acc.hebergementId,
        utilisateur_id: acc.userId,
        check_in_date: acc.check_in_date,
        check_out_date: acc.check_out_date,
      })),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4 mb-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          title="Retour"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Nouveau Plan de Formation
          </h1>
          <p className="text-muted-foreground">
            Suivez les étapes pour configurer une nouvelle session de formation.
          </p>
        </div>
      </div>

      <PlanCreateWizard onSubmit={handleSubmit} isSubmitting={isPending} />
    </div>
  );
};
