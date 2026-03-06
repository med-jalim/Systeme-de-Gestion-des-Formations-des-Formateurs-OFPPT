import type { TrainingPlan } from "../types";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Trash2, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PlansTableProps {
  plans: TrainingPlan[];
  onEdit: (plan: TrainingPlan) => void;
  onDelete: (id: number) => void;
  onView: (plan: TrainingPlan) => void;
}

export const PlansTable = ({
  plans,
  onEdit,
  onDelete,
  onView,
}: PlansTableProps) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Actif</Badge>;
      case "completed":
        return <Badge className="bg-blue-500">Terminé</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Annulé</Badge>;
      default:
        return <Badge variant="secondary">Brouillon</Badge>;
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Titre</TableHead>
            <TableHead>Formation</TableHead>
            <TableHead>Dates</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {plans.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center py-6 text-muted-foreground"
              >
                Aucun plan de formation trouvé.
              </TableCell>
            </TableRow>
          ) : (
            plans.map((plan) => (
              <TableRow key={plan.id}>
                <TableCell className="font-medium">{plan.title}</TableCell>
                <TableCell>
                  {plan.formation?.title || `ID: ${plan.formation_id}`}
                </TableCell>
                <TableCell>
                  {new Date(plan.start_date).toLocaleDateString()} -{" "}
                  {new Date(plan.end_date).toLocaleDateString()}
                </TableCell>
                <TableCell>{getStatusBadge(plan.status)}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onView(plan)}
                    title="Voir détails"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(plan)}
                    title="Modifier"
                  >
                    <Edit className="h-4 w-4 text-blue-500" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(plan.id)}
                    title="Supprimer"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
