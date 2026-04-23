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
import { Edit, Trash2, Eye, CheckCircle2, Clock, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/providers/AuthProvider";

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
  const { user, isAdmin } = useAuth();

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

  const getValidationBadge = (status: string) => {
    switch (status) {
      case "approuve":
        return (
          <Badge className="bg-emerald-600 hover:bg-emerald-700 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /> Approuvé
          </Badge>
        );
      case "rejete":
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <XCircle className="h-3 w-3" /> Rejeté
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="text-amber-600 border-amber-200 bg-amber-50 flex items-center gap-1"
          >
            <Clock className="h-3 w-3" /> En attente
          </Badge>
        );
    }
  };

  return (
    <div className="rounded-md border shadow-sm overflow-hidden bg-white">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead className="font-semibold">Titre</TableHead>
            <TableHead className="font-semibold">Formation</TableHead>
            <TableHead className="font-semibold">Dates</TableHead>
            <TableHead className="font-semibold">Statut</TableHead>
            <TableHead className="font-semibold">Validation</TableHead>
            <TableHead className="text-right font-semibold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {plans.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center py-10 text-muted-foreground"
              >
                Aucun plan de formation trouvé.
              </TableCell>
            </TableRow>
          ) : (
            plans.map((plan) => {
              const isOwner = user?.id === plan.creator?.keycloak_id;
              const canEdit = isAdmin() || isOwner;

              return (
                <TableRow key={plan.id} className="hover:bg-slate-50/50">
                  <TableCell className="font-medium">{plan.title}</TableCell>
                  <TableCell>
                    {plan.formation?.title || `ID: ${plan.formation_id}`}
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {new Date(plan.start_date).toLocaleDateString()} -{" "}
                    {new Date(plan.end_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{getStatusBadge(plan.status)}</TableCell>
                  <TableCell>{getValidationBadge(plan.validation_status)}</TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-500 hover:text-slate-900"
                      onClick={() => onView(plan)}
                      title="Voir détails"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {canEdit && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                          onClick={() => onEdit(plan)}
                          title="Modifier"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => onDelete(plan.id)}
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
};
