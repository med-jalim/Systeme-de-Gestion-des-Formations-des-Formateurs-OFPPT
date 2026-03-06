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
  first_name: string;
  last_name: string;
  email: string;
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

export interface TrainingPlan {
  id: number;
  formation_id: number;
  site_id: number;
  title: string;
  status: "draft" | "active" | "completed" | "cancelled";
  start_date: string;
  end_date: string;
  formation?: Formation;
  site?: Site;
  participants?: User[];
  trainers?: User[];
  themeAssignments?: ThemeAssignment[];
  planAccommodations?: PlanAccommodation[];
  created_at?: string;
  updated_at?: string;
}

export type CreateTrainingPlanPayload = Omit<TrainingPlan, "id" | "created_at" | "updated_at" | "formation" | "site" | "participants" | "trainers" | "themeAssignments" | "planAccommodations"> & {
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
