import { useState } from "react";
import type { CreateTrainingPlanPayload } from "../types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PlanFormProps {
  onSubmit: (data: CreateTrainingPlanPayload) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export const PlanForm = ({ onSubmit, onCancel, loading }: PlanFormProps) => {
  const [formData, setFormData] = useState<CreateTrainingPlanPayload>({
    formation_id: 0,
    site_id: 0,
    title: "",
    status: "draft",
    start_date: "",
    end_date: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name.includes("_id") ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Titre du Plan</Label>
          <Input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Ex: Session Hiver 2026"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Statut</Label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="draft">Brouillon (Draft)</option>
            <option value="active">Actif</option>
            <option value="completed">Terminé</option>
            <option value="cancelled">Annulé</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="start_date">Date de Début</Label>
          <Input
            id="start_date"
            name="start_date"
            type="date"
            value={formData.start_date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="end_date">Date de Fin</Label>
          <Input
            id="end_date"
            name="end_date"
            type="date"
            value={formData.end_date}
            onChange={handleChange}
            required
          />
        </div>

        {/* Temporary inputs for relations - these should be dropdowns fetched from API */}
        <div className="space-y-2">
          <Label htmlFor="formation_id">Formation ID</Label>
          <Input
            id="formation_id"
            name="formation_id"
            type="number"
            value={formData.formation_id || ""}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="site_id">Site ID</Label>
          <Input
            id="site_id"
            name="site_id"
            type="number"
            value={formData.site_id || ""}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Annuler
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Enregistrement..." : "Créer le Plan"}
        </Button>
      </div>
    </form>
  );
};
