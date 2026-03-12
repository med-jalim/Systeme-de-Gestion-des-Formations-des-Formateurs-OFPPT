import * as z from "zod";

export const formationSchema = z.object({
  title: z.string().min(3, "Le titre doit contenir au moins 3 caractères"),
  description: z.string().optional(),
  start_date: z.string().min(1, "La date de début est requise"),
  end_date: z.string().min(1, "La date de fin est requise"),
}).refine((data) => new Date(data.start_date) <= new Date(data.end_date), {
  message: "La date de fin doit être après la date de début",
  path: ["end_date"],
});

export type FormationFormValues = z.infer<typeof formationSchema>;
