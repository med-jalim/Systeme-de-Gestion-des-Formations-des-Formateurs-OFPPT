import type { User } from "../types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface SelectedUsersTableProps {
  users: User[];
  onRemove: (id: number) => void;
  entityLabel?: string;
}

export const SelectedUsersTable = ({
  users,
  onRemove,
  entityLabel = "Utilisateur",
}: SelectedUsersTableProps) => {
  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border rounded-lg bg-muted/20 text-muted-foreground border-dashed">
        <p>Aucun {entityLabel.toLowerCase()} sélectionné.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom Complet</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Centre</TableHead>
            <TableHead className="w-[80px] text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">
                {user.first_name} {user.last_name}
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                {user.centre?.name || `ID Centre: ${user.centre_id}`}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemove(user.id)}
                  title={`Retirer ce ${entityLabel.toLowerCase()}`}
                  className="text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/40"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
