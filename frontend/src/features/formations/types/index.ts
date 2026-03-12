import type { Theme } from "../../training-plans/types";

export interface Formation {
  id: number;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  themes?: Theme[];
}

export interface CreateFormationPayload {
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
}

export interface CreateThemePayload {
  formation_id: number;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
}
