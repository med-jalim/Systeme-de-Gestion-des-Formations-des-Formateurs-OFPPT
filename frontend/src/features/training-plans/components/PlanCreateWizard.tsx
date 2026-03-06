import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { createTrainingPlanSchema } from "../schemas/plan.schema";
import type { CreateTrainingPlanFormValues } from "../schemas/plan.schema";
import {
  planInfoSchema,
  planParticipantsSchema,
  planTrainersSchema,
  planLogisticsSchema,
} from "../schemas/plan.schema";
import { StepPlanInfo } from "./steps/StepPlanInfo";
import { StepParticipants } from "./steps/StepParticipants";
import { StepTrainers } from "./steps/StepTrainers";
import { StepLogistics } from "./steps/StepLogistics";
import { StepReview } from "./steps/StepReview";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft, CheckCircle2 } from "lucide-react";

interface PlanCreateWizardProps {
  onSubmit: (data: CreateTrainingPlanFormValues) => Promise<void>;
  isSubmitting?: boolean;
}

const STEPS = [
  { id: 0, title: "Informations", schema: planInfoSchema },
  { id: 1, title: "Formateurs & Thèmes", schema: planTrainersSchema },
  { id: 2, title: "Participants & Thèmes", schema: planParticipantsSchema },
  { id: 3, title: "Logistique", schema: planLogisticsSchema },
  { id: 4, title: "Vérification", schema: createTrainingPlanSchema },
];

export const PlanCreateWizard = ({
  onSubmit,
  isSubmitting = false,
}: PlanCreateWizardProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const methods = useForm<CreateTrainingPlanFormValues>({
    resolver: zodResolver(STEPS[currentStep].schema as any),
    defaultValues: {
      status: "draft",
      trainers: [],
      participants: [],
      accommodations: [],
      logistics_notes: "",
    },
    mode: "onChange",
  });

  const {
    formState: { isValid },
    trigger,
    getValues,
  } = methods;

  const handleNext = async () => {
    // Validate current step fields before proceeding
    const isStepValid = await trigger();
    if (isStepValid) {
      if (currentStep < STEPS.length - 1) {
        setCurrentStep((prev) => prev + 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } else {
      toast.error("Veuillez corriger les erreurs avant de continuer.");
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleFinalSubmit = async () => {
    const isStepValid = await trigger();
    if (isStepValid) {
      await onSubmit(getValues());
    } else {
      toast.error("Le formulaire contient des erreurs.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Stepper Indicators */}
      <div className="mb-12 font-medium">
        <div className="flex justify-between items-center relative before:absolute before:inset-0 before:top-1/2 before:-translate-y-1/2 before:w-full before:h-0.5 before:bg-muted before:-z-10">
          {STEPS.map((step, index) => (
            <div
              key={step.id}
              className="flex flex-col items-center gap-3 bg-background px-4"
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
                  ${
                    currentStep === index
                      ? "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-110"
                      : currentStep > index
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-muted text-muted-foreground bg-background"
                  }`}
              >
                {currentStep > index ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : (
                  <span className="text-sm font-bold">{index + 1}</span>
                )}
              </div>
              <span
                className={`text-xs font-bold uppercase tracking-wider hidden sm:block ${currentStep >= index ? "text-primary" : "text-muted-foreground"}`}
              >
                {step.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      <FormProvider {...methods}>
        <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
          <div className="min-h-[400px] animate-in fade-in slide-in-from-bottom-4 duration-500">
            {currentStep === 0 && <StepPlanInfo />}
            {currentStep === 1 && <StepTrainers />}
            {currentStep === 2 && <StepParticipants />}
            {currentStep === 3 && <StepLogistics />}
            {currentStep === 4 && <StepReview />}
          </div>

          <div className="flex justify-between items-center pt-6 border-t">
            <Button
              type="button"
              variant="ghost"
              onClick={handleBack}
              disabled={currentStep === 0 || isSubmitting}
              className="font-semibold"
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              Précédent
            </Button>

            <div className="flex gap-3">
              {currentStep === STEPS.length - 1 ? (
                <Button
                  type="button"
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 font-bold"
                  onClick={handleFinalSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    "Création en cours..."
                  ) : (
                    <>
                      Confirmer et Créer
                      <CheckCircle2 className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  type="button"
                  size="lg"
                  className="px-8 font-bold"
                  onClick={handleNext}
                  disabled={!isValid}
                >
                  Suivant
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};
