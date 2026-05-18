import type { Formation } from "../types";
import { Edit, Trash2, Eye, BookOpen } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface FormationsTableProps {
  formations: Formation[];
  onEdit: (formation: Formation) => void;
  onDelete: (id: number) => void;
  onView: (formation: Formation) => void;
  canEdit?: boolean;
}

export const FormationsTable = ({ formations, onEdit, onDelete, onView, canEdit = true }: FormationsTableProps) => {
  return (
    <div className="formal-card">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 hover:bg-slate-50">
            <TableHead className="font-semibold text-xs uppercase tracking-wider py-4 px-6">Programme</TableHead>
            <TableHead className="font-semibold text-xs uppercase tracking-wider py-4 px-6">Calendrier</TableHead>
            <TableHead className="font-semibold text-xs uppercase tracking-wider py-4 px-6">Contenu</TableHead>
            <TableHead className="text-right font-semibold text-xs uppercase tracking-wider py-4 px-6">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {formations.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="py-20 text-center text-slate-400 italic">
                Aucun programme trouvé dans le catalogue.
              </TableCell>
            </TableRow>
          ) : (
            formations.map((f) => (
              <TableRow key={f.id} className="hover:bg-slate-50/50 transition-colors">
                <TableCell className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-md bg-primary/5 border border-primary/10 flex items-center justify-center text-primary">
                      <BookOpen className="h-4 w-4" />
                    </div>
                    <span className="font-semibold text-sm text-slate-900">{f.title}</span>
                  </div>
                </TableCell>
                <TableCell className="py-4 px-6">
                   <div className="flex flex-col">
                      <span className="text-xs text-slate-600 font-medium">
                        {new Date(f.start_date).toLocaleDateString()} — {new Date(f.end_date).toLocaleDateString()}
                      </span>
                   </div>
                </TableCell>
                <TableCell className="py-4 px-6">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                    {f.themes?.length || 0} Modules
                  </span>
                </TableCell>
                <TableCell className="text-right py-4 px-6">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => onView(f)} className="h-8 w-8 text-slate-400 hover:text-primary">
                      <Eye className="h-4 w-4" />
                    </Button>
                    {canEdit && (
                      <>
                        <Button variant="ghost" size="icon" onClick={() => onEdit(f)} className="h-8 w-8 text-slate-400 hover:text-primary">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => onDelete(f.id)} className="h-8 w-8 text-slate-400 hover:text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
