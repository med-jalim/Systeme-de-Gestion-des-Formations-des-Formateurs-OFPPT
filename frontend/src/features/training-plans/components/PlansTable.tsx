import type { TrainingPlan } from "../types";
import { Edit, Trash2, Eye, CheckCircle2, Clock, XCircle, ArrowRight } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PlansTableProps {
  plans: TrainingPlan[];
  onEdit: (plan: TrainingPlan) => void;
  onDelete: (id: number) => void;
  onView: (plan: TrainingPlan) => void;
}

export const PlansTable = ({ plans, onEdit, onDelete, onView }: PlansTableProps) => {
  const { user, isAdmin } = useAuth();

  return (
    <div className="formal-card">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 hover:bg-slate-50">
            <TableHead className="font-semibold text-xs uppercase tracking-wider py-4 px-6">Titre du Plan</TableHead>
            <TableHead className="font-semibold text-xs uppercase tracking-wider py-4 px-6">Programme</TableHead>
            <TableHead className="font-semibold text-xs uppercase tracking-wider py-4 px-6">Période</TableHead>
            <TableHead className="font-semibold text-xs uppercase tracking-wider py-4 px-6">Statut</TableHead>
            <TableHead className="text-right font-semibold text-xs uppercase tracking-wider py-4 px-6">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {plans.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="py-20 text-center text-slate-400 italic">
                Aucun plan de formation trouvé.
              </TableCell>
            </TableRow>
          ) : (
            plans.map((plan) => {
              const isOwner = user?.id === plan.creator?.id;
              const canEdit = isAdmin() || isOwner;

              return (
                <TableRow key={plan.id} className="hover:bg-slate-50/50 transition-colors">
                  <TableCell className="py-4 px-6">
                    <span 
                      className="text-sm font-semibold text-slate-900 cursor-pointer hover:text-primary transition-colors" 
                      onClick={() => onView(plan)}
                    >
                      {plan.title}
                    </span>
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    <div className="flex flex-col">
                       <span className="text-[11px] font-bold text-primary uppercase tracking-tight">
                         {plan.formation?.title || "Programme Spécialisé"}
                       </span>
                       <span className="text-[9px] text-slate-400">ID: {plan.formation_id}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    <span className="text-xs text-slate-600 font-medium">
                       {new Date(plan.start_date).toLocaleDateString()} — {new Date(plan.end_date).toLocaleDateString()}
                    </span>
                  </TableCell>
                  <TableCell className="py-4 px-6">
                      <div className="flex flex-col gap-1.5">
                         <span className={cn(
                            "px-2 py-1 text-[9px] font-bold rounded-full border w-fit uppercase text-center",
                            plan.status === 'approuve' ? "bg-blue-50 text-blue-600 border-blue-100" :
                            plan.status === 'rejete' ? "bg-rose-50 text-rose-600 border-rose-100" :
                            plan.status === 'en_attente' ? "bg-amber-50 text-amber-600 border-amber-100" :
                            plan.status === 'completed' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                            plan.status === 'cancelled' ? "bg-slate-100 text-slate-600 border-slate-200" :
                            "bg-slate-50 text-slate-500 border-slate-200 border-dashed"
                         )}>
                            {plan.status === 'approuve' ? 'APPROUVÉ' : 
                             plan.status === 'rejete' ? 'REJETÉ' : 
                             plan.status === 'en_attente' ? 'EN ATTENTE' :
                             plan.status === 'completed' ? 'TERMINÉ' :
                             plan.status === 'cancelled' ? 'ANNULÉ' : 'BROUILLON'}
                         </span>
                      </div>
                  </TableCell>
                  <TableCell className="text-right py-4 px-6">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => onView(plan)} className="h-8 w-8 text-slate-400 hover:text-primary">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {canEdit && (
                        <>
                          <Button variant="ghost" size="icon" onClick={() => onEdit(plan)} className="h-8 w-8 text-slate-400 hover:text-primary">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => onDelete(plan.id)} className="h-8 w-8 text-slate-400 hover:text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
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
