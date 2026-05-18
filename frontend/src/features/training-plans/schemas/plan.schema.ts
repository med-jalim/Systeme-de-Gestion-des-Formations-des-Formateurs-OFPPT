import { z } from "zod";

export const planInfoBaseSchema = z.object({
  formation_id: z.number().min(1, "Veuillez sélectionner une formation"),
  site_id: z.number().min(1, "Veuillez sélectionner un site"),
  title: z.string().optional(),
  status: z.enum(["draft", "en_attente", "approuve", "rejete", "completed", "cancelled"]).default("draft"),
  start_date: z.string().min(1, "La date de début est requise"),
  end_date: z.string().min(1, "La date de fin est requise"),
});

export const planInfoSchema = planInfoBaseSchema.refine((data) => {
  if (data.start_date && data.end_date) {
    return new Date(data.end_date) >= new Date(data.start_date);
  }
  return true;
}, {
  message: "La date de fin doit être postérieure ou égale à la date de début",
  path: ["end_date"]
});

export const trainerAssignmentSchema = z.object({
  userId: z.number(),
  themeIds: z.array(z.number()).min(1, "Veuillez sélectionner au moins un thème"),
});

export const participantAssignmentSchema = z.object({
  userId: z.number(),
  assignments: z.array(z.object({
    themeId: z.number().min(1, "Thème requis"),
    trainerId: z.number().min(1, "Formateur requis"),
  })).min(1, "Veuillez assigner au moins une thématique"),
});

export const planTrainersSchema = z.object({
  trainers: z.array(trainerAssignmentSchema).min(1, "Veuillez sélectionner au moins un formateur"),
});

export const planParticipantsSchema = z.object({
  participants: z.array(participantAssignmentSchema).min(1, "Veuillez sélectionner au moins un participant"),
});

export const planAccommodationAssignmentSchema = z.object({
  userId: z.number(),
  hebergementId: z.number().min(0, "Hébergement requis"), // 0 could mean "Autonome/Sans"
  check_in_date: z.string().optional(),
  check_out_date: z.string().optional(),
});

export const planLogisticsSchema = z.object({
  accommodations: z.array(planAccommodationAssignmentSchema).optional(),
  logistics_notes: z.string().optional(),
});

// Full schema for final submission
export const createTrainingPlanSchema = planInfoBaseSchema
  .merge(planTrainersSchema)
  .merge(planParticipantsSchema)
  .merge(planLogisticsSchema);

export type PlanInfoFormValues = z.infer<typeof planInfoSchema>;
export type PlanTrainersFormValues = z.infer<typeof planTrainersSchema>;
export type PlanParticipantsFormValues = z.infer<typeof planParticipantsSchema>;
export type PlanLogisticsFormValues = z.infer<typeof planLogisticsSchema>;
export type CreateTrainingPlanFormValues = z.infer<typeof createTrainingPlanSchema>;
export type TrainerAssignment = z.infer<typeof trainerAssignmentSchema>;
export type ParticipantAssignment = z.infer<typeof participantAssignmentSchema>;
