export interface Direction {
  id: number;
  code: string;
  name: string;
}

export interface Centre {
  id: number;
  direction_id: number;
  code: string;
  name: string;
  direction?: Direction;
}

export interface Site {
  id: number;
  centre_id: number;
  name: string;
  address: string;
  centre?: Centre;
}

export interface User {
  id: number;
  keycloak_id: string;
  matricule?: string;
  first_name: string;
  last_name: string;
  email: string;
  role: "admin" | "responsable_cdc" | "responsable_formation" | "responsable_dr" | "formateur_animateur" | "formateur_participant";
  centre_id: number;
  direction_id: number;
  centre?: Centre;
  direction?: Direction;
}

export interface Theme {
  id: number;
  formation_id: number;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
}

export interface Formation {
  id: number;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  themes?: Theme[];
}

export interface ThemeAssignment {
  id: number;
  plan_formation_id: number;
  theme_id: number;
  participant_id: number;
  formateur_id: number;
  theme?: Theme;
  participant?: User;
  trainer?: User;
}

export interface Accommodation {
  id: number;
  site_id: number;
  name: string;
  type: "hotel" | "resider" | "centre_interne";
  address: string;
}

export interface PlanAccommodation {
  id: number;
  plan_formation_id: number;
  hebergement_id: number;
  utilisateur_id: number;
  check_in_date: string;
  check_out_date: string;
  accommodation?: Accommodation;
  user?: User;
}

export interface TrainingSession {
  id: number;
  training_plan_id: number;
  theme_id: number;
  trainer_id: number;
  date: string;
  start_time: string;
  end_time: string;
  type: "présentiel" | "à distance";
  remote_link?: string;
  theme?: Theme;
  trainer?: User;
}

export interface Absence {
  id: number;
  training_session_id: number;
  user_id: number;
  status: "present" | "absent" | "late";
  minutes_late: number;
  is_justified: boolean;
  justification_reason?: string;
  participant?: User;
}

export interface TrainingPlan {
  id: number;
  formation_id: number;
  site_id: number;
  title: string;
  status: "draft" | "active" | "completed" | "cancelled";
  start_date: string;
  end_date: string;
  created_by?: number | null;
  validation_status: "en_attente" | "approuve" | "rejete";
  validated_by?: number | null;
  rejection_reason?: string | null;
  formation?: Formation;
  site?: Site;
  participants?: User[];
  trainers?: User[];
  creator?: User;
  validator?: User;
  theme_assignments?: ThemeAssignment[];
  plan_accommodations?: PlanAccommodation[];
  training_sessions?: TrainingSession[];
  created_at?: string;
  updated_at?: string;
}

export type CreateTrainingPlanPayload = Omit<TrainingPlan, "id" | "created_at" | "updated_at" | "formation" | "site" | "participants" | "trainers" | "theme_assignments" | "plan_accommodations" | "training_sessions" | "creator" | "validator" | "created_by" | "validation_status" | "validated_by" | "rejection_reason"> & {
  participants: { userId: number }[];
  trainers: { userId: number }[];
  theme_assignments?: {
    theme_id: number;
    participant_id: number;
    formateur_id: number;
  }[];
  plan_accommodations?: {
    hebergement_id: number;
    utilisateur_id: number;
    check_in_date?: string;
    check_out_date?: string;
  }[];
};
