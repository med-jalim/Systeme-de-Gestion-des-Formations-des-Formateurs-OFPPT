import type { Formation } from "../types";
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

interface FormationsTableProps {
  formations: Formation[];
  onEdit: (formation: Formation) => void;
  onDelete: (id: number) => void;
  onView: (formation: Formation) => void;
}

export const FormationsTable = ({
  formations,
  onEdit,
  onDelete,
  onView,
}: FormationsTableProps) => {
  return (
    <div className="rounded-md border bg-white shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="font-bold">Titre</TableHead>
            <TableHead className="font-bold">Période</TableHead>
            <TableHead className="font-bold">Thématiques</TableHead>
            <TableHead className="text-right font-bold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {formations.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={4}
                className="text-center py-10 text-muted-foreground"
              >
                Aucune formation trouvée.
              </TableCell>
            </TableRow>
          ) : (
            formations.map((formation) => (
              <TableRow
                key={formation.id}
                className="hover:bg-muted/30 transition-colors"
              >
                <TableCell className="font-bold text-primary">
                  {formation.title}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(formation.start_date).toLocaleDateString("fr-FR")} -{" "}
                  {new Date(formation.end_date).toLocaleDateString("fr-FR")}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="font-bold">
                    {formation.themes?.length || 0} thèmes
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onView(formation)}
                    title="Voir détails"
                    className="hover:bg-primary/10 hover:text-primary rounded-full h-8 w-8"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(formation)}
                    title="Modifier"
                    className="hover:bg-blue-50 hover:text-blue-600 rounded-full h-8 w-8 text-blue-500"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(formation.id)}
                    title="Supprimer"
                    className="hover:bg-red-50 hover:text-red-600 rounded-full h-8 w-8 text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
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
