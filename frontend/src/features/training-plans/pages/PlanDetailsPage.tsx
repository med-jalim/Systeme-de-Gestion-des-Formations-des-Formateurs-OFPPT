import { useParams, Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import type { TrainingPlan } from "../../types";
import { toast } from "sonner";
import { fetchPlanById, updatePlan, approvePlan } from "../api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Layers,
  User as UserIcon,
  Hotel,
  Edit,
  FolderOpen,
  CheckCircle,
  XCircle as XCircleIcon,
  Clock,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SessionsTab } from "../components/SessionsTab";
import { AbsenceTab } from "../components/AbsenceTab";
import { AssignmentsDialog } from "../components/AssignmentsDialog";
import { LogisticsDialog } from "../components/LogisticsDialog";
import { DocumentsPanel } from "@/features/documents/components/DocumentsPanel";
import { useAuth } from "@/providers/AuthProvider";
import { cn } from "@/lib/utils";

export const PlanDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const location = useLocation();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAssignmentsDialogOpen, setIsAssignmentsDialogOpen] = useState(false);
  const [isLogisticsDialogOpen, setIsLogisticsDialogOpen] = useState(false);
  const [editingData, setEditingData] = useState<{
    title: string;
    site_id: number;
    status: string;
    start_date: string;
    end_date: string;
  } | null>(null);

  const { user, hasRole, isAdmin } = useAuth();
  const { data: plan, isLoading } = useQuery<TrainingPlan>({
    queryKey: ["plan", id],
    queryFn: () => fetchPlanById(Number(id)),
    enabled: !!id,
  });

  useEffect(() => {
    if (location.state?.edit && plan) {
      setEditingData({
        title: plan.title || "",
        site_id: plan.site_id,
        status: plan.status,
        start_date: plan.start_date.split("T")[0],
        end_date: plan.end_date.split("T")[0],
      });
      setIsEditDialogOpen(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state, plan]);

  const { data: sites } = useQuery<any[]>({
    queryKey: ["sites"],
    queryFn: async () => {
      const resp = await axiosInstance.get("/sites");
      return resp.data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => updatePlan(Number(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plan", id] });
      setIsEditDialogOpen(false);
      toast.success("Plan mis à jour.");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur de mise à jour.");
    },
  });

  const approvalMutation = useMutation({
    mutationFn: (data: { status: "approuve" | "rejete"; rejection_reason?: string }) =>
      approvePlan(Number(id), data),
    onSuccess: (updatedPlan) => {
      queryClient.invalidateQueries({ queryKey: ["plan", id] });
      toast.success(updatedPlan.status === "approuve" ? "Approuvé." : "Rejeté.");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur.");
    },
  });

  const canApprove =
    plan?.status === "en_attente" &&
    (isAdmin() ||
      (hasRole("responsable_dr") &&
        plan?.site?.centre?.direction_id.toString() === user?.direction_id?.toString()));

  const isOwner = user?.id === plan?.creator?.id;
  const canManage = isAdmin() || isOwner || hasRole(["responsable_cdc", "responsable_formation"]);
  const canModify = canManage || hasRole("responsable_dr");

  if (isLoading) {
    return (
      <div className="py-40 text-center text-slate-400 font-medium animate-pulse">
        Chargement des dossiers stratégiques...
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="py-40 text-center space-y-6">
        <h2 className="text-3xl font-bold">Plan introuvable.</h2>
        <Button asChild variant="outline">
          <Link to="/plans">Retour à l'archive</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-10 page-transition">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-8">
        <div className="space-y-4">
          <Link to="/plans" className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-primary transition-colors">
            <ArrowLeft className="h-3 w-3" /> Retour à l'archive
          </Link>
          <div className="space-y-2">
             <div className="flex items-center gap-3">
                <span className={cn(
                  "px-2.5 py-0.5 text-[10px] font-bold rounded-full border", 
                  plan.status === 'approuve' ? "bg-blue-100 text-blue-700 border-blue-200" : 
                  plan.status === 'rejete' ? "bg-rose-100 text-rose-700 border-rose-200" :
                  plan.status === 'en_attente' ? "bg-amber-100 text-amber-700 border-amber-200" :
                  plan.status === 'completed' ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
                  plan.status === 'cancelled' ? "bg-slate-200 text-slate-700 border-slate-300" :
                  "bg-slate-100 text-slate-600 border-slate-300 border-dashed" // draft
                )}>
                  {plan.status === 'approuve' ? 'APPROUVÉ' : 
                   plan.status === 'rejete' ? 'REJETÉ' : 
                   plan.status === 'en_attente' ? 'EN ATTENTE D\'APPROBATION' :
                   plan.status === 'completed' ? 'TERMINÉ' :
                   plan.status === 'cancelled' ? 'ANNULÉ' : 'BROUILLON'}
                </span>
             </div>
             <h1 className="text-4xl font-bold text-slate-900 leading-tight">
                {plan.title || "Sans titre"}
             </h1>
             <div className="flex flex-wrap gap-6 pt-2">
                <div className="flex items-center gap-2 text-slate-500">
                   <Calendar className="h-4 w-4" />
                   <span className="text-xs font-medium">{new Date(plan.start_date).toLocaleDateString()} — {new Date(plan.end_date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                   <MapPin className="h-4 w-4" />
                   <span className="text-xs font-medium">{plan.site?.name || "Déploiement Global"}</span>
                </div>
             </div>
          </div>
        </div>
        
        {canModify && (
          <Button 
            onClick={() => {
              setEditingData({ title: plan.title || "", site_id: plan.site_id, status: plan.status, start_date: plan.start_date.split("T")[0], end_date: plan.end_date.split("T")[0] });
              setIsEditDialogOpen(true);
            }} 
            variant="outline"
            className="flex items-center gap-2"
          >
             <Edit className="h-4 w-4" /> Modifier le plan
          </Button>
        )}
      </div>

      {/* Approval Alert */}
      {canApprove && (
        <div className="bg-blue-50 border border-blue-100 p-8 rounded-lg flex flex-col md:flex-row justify-between items-center gap-6">
           <div className="space-y-1">
              <h3 className="text-lg font-bold text-blue-900 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5" /> Autorisation Requise
              </h3>
              <p className="text-sm text-blue-700">Ce plan est en attente d'approbation institutionnelle de votre secteur.</p>
           </div>
           <div className="flex gap-3">
              <Button onClick={() => approvalMutation.mutate({ status: "approuve" })}>Approuver la stratégie</Button>
              <Button variant="outline" onClick={() => { const r = prompt("Raison du rejet:"); if(r) approvalMutation.mutate({ status: "rejete", rejection_reason: r })}} className="text-rose-600 hover:text-rose-700">Rejeter</Button>
           </div>
        </div>
      )}

      {/* Resubmit Alert */}
      {plan?.status === 'rejete' && (isAdmin() || isOwner) && (
        <div className="bg-rose-50 border border-rose-200 p-8 rounded-lg flex flex-col md:flex-row justify-between items-center gap-6">
           <div className="space-y-1">
              <h3 className="text-lg font-bold text-rose-900 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" /> Plan Rejeté
              </h3>
              <p className="text-sm text-rose-700">
                Ce plan a été rejeté. Motif : <span className="font-semibold">{plan.rejection_reason || "Aucun motif spécifié"}</span>.
                Veuillez effectuer les modifications nécessaires puis le soumettre à nouveau.
              </p>
           </div>
           <div className="flex gap-3">
              <Button className="bg-rose-600 hover:bg-rose-700 text-white" onClick={() => updateMutation.mutate({ status: "en_attente" })}>
                Soumettre à nouveau
              </Button>
           </div>
        </div>
      )}

      {/* Tabs Layout */}
      <Tabs defaultValue="general" className="w-full space-y-8">
        <TabsList className="bg-transparent border-b border-border w-full justify-start h-auto p-0 rounded-none gap-8">
          {[
            { id: "general", label: "Général" },
            { id: "participants", label: "Bénéficiaires" },
            { id: "logistics", label: "Logistique" },
            { id: "sessions", label: "Sessions" },
            { id: "absences", label: "Absences" },
            { id: "documents", label: "Documents" }
          ].map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="px-0 py-3 bg-transparent rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary text-xs font-semibold text-slate-500 hover:text-slate-900 transition-all"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="pt-2">
          <TabsContent value="general">
            <GeneralTab plan={plan} />
          </TabsContent>
          <TabsContent value="participants">
            <ParticipantsTab plan={plan} onEditAssignments={() => setIsAssignmentsDialogOpen(true)} canModify={canModify} />
          </TabsContent>
          <TabsContent value="logistics">
            <LogisticsTab plan={plan} onEditLogistics={() => setIsLogisticsDialogOpen(true)} canModify={canModify} />
          </TabsContent>
          <TabsContent value="sessions">
            <SessionsTab plan={plan} />
          </TabsContent>
          <TabsContent value="absences">
            <AbsenceTab plan={plan} />
          </TabsContent>
          <TabsContent value="documents">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <h3 className="text-xl font-bold flex items-center gap-3">
                  <FolderOpen className="h-5 w-5 text-slate-400" />
                  Gestion des documents
                </h3>
              </div>
              <DocumentsPanel entityType="plan" entityId={Number(id)} />
            </div>
          </TabsContent>
        </div>
      </Tabs>

      {/* Dialogs */}
      <AssignmentsDialog plan={plan} open={isAssignmentsDialogOpen} onOpenChange={setIsAssignmentsDialogOpen} />
      <LogisticsDialog plan={plan} open={isLogisticsDialogOpen} onOpenChange={setIsLogisticsDialogOpen} />

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Modifier le plan de formation</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); updateMutation.mutate(editingData); }} className="space-y-6 pt-4">
            <div className="space-y-2">
              <Label>Titre du plan</Label>
              <Input value={editingData?.title || ""} onChange={(e) => setEditingData(p => ({ ...p!, title: e.target.value }))} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Date de Début</Label>
                <Input type="date" value={editingData?.start_date || ""} onChange={(e) => setEditingData(p => ({ ...p!, start_date: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Date de Fin</Label>
                <Input type="date" value={editingData?.end_date || ""} onChange={(e) => setEditingData(p => ({ ...p!, end_date: e.target.value }))} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Lieu de formation</Label>
                <Select value={editingData?.site_id ? String(editingData.site_id) : ""} onValueChange={(v) => setEditingData(p => ({ ...p!, site_id: Number(v) }))}>
                  <SelectTrigger className="h-10 text-sm">
                    <SelectValue placeholder="Choisir un site..." />
                  </SelectTrigger>
                  <SelectContent>
                    {sites?.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Statut global</Label>
                <Select value={editingData?.status || ""} onValueChange={(v) => setEditingData(p => ({ ...p!, status: v }))}>
                  <SelectTrigger className="h-10 text-sm">
                    <SelectValue placeholder="Statut..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Brouillon</SelectItem>
                    <SelectItem value="en_attente">En attente (Soumettre)</SelectItem>
                    <SelectItem value="approuve">Approuvé</SelectItem>
                    <SelectItem value="rejete">Rejeté</SelectItem>
                    <SelectItem value="completed">Terminé</SelectItem>
                    <SelectItem value="cancelled">Annulé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="pt-4">
               <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>Annuler</Button>
               <Button type="submit" disabled={updateMutation.isPending}>
                 {updateMutation.isPending ? "Enregistrement..." : "Enregistrer les modifications"}
               </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

function GeneralTab({ plan }: { plan: TrainingPlan }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="formal-card p-8 space-y-6">
        <h3 className="text-lg font-bold border-b border-slate-100 pb-4 flex items-center gap-3">
          <Layers className="h-5 w-5 text-primary" /> Détails du programme
        </h3>
        {plan.formation ? (
          <div className="space-y-6">
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Thématique principale</p>
              <p className="text-xl font-bold text-slate-900">{plan.formation.title}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Description stratégique</p>
              <p className="text-sm text-slate-600 leading-relaxed">
                {plan.formation.description}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm italic text-slate-400">Aucun programme lié.</p>
        )}
      </div>

      <div className="formal-card p-8 space-y-6">
        <h3 className="text-lg font-bold border-b border-slate-100 pb-4 flex items-center gap-3">
          <MapPin className="h-5 w-5 text-primary" /> Site de déploiement
        </h3>
        {plan.site ? (
          <div className="space-y-6">
            <div className="space-y-1">
               <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Institution d'accueil</p>
               <p className="text-xl font-bold text-slate-900">{plan.site.name}</p>
            </div>
            <div className="grid grid-cols-2 gap-6">
               <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Centre Administratif</p>
                  <p className="text-xs font-semibold text-slate-700">{plan.site.centre?.name || "Global"}</p>
               </div>
               <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Adresse</p>
                  <p className="text-xs font-medium text-slate-600">{plan.site.address}</p>
               </div>
            </div>
          </div>
        ) : (
          <p className="text-sm italic text-slate-400">Aucune affectation de site.</p>
        )}
      </div>
    </div>
  );
}

function ParticipantsTab({ plan, onEditAssignments, canModify }: { plan: TrainingPlan; onEditAssignments: () => void; canModify: boolean; }) {
  const assignments = plan.theme_assignments || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end border-b border-slate-100 pb-4">
        <h3 className="text-xl font-bold">Bénéficiaires & Formateurs</h3>
        {canModify && (
          <Button onClick={onEditAssignments} variant="outline" size="sm" className="h-8 text-xs font-semibold">
            <Edit className="h-3 w-3 mr-2" /> Réassigner
          </Button>
        )}
      </div>
      <div className="grid grid-cols-1 gap-4">
        {assignments.map((item, i) => (
           <div key={i} className="formal-card p-6 flex flex-col md:flex-row md:items-center gap-8 group hover:bg-slate-50 transition-colors">
              <div className="flex-1 flex items-center gap-4">
                <div className="h-12 w-12 rounded-md bg-slate-100 flex items-center justify-center font-bold text-slate-600 shrink-0">
                  {item.participant?.first_name[0]}{item.participant?.last_name[0]}
                </div>
                <div>
                   <h4 className="text-base font-bold text-slate-900">{item.participant?.first_name} {item.participant?.last_name}</h4>
                   <p className="text-xs text-slate-500 font-medium">Matricule: {item.participant?.matricule}</p>
                </div>
              </div>
              <div className="flex-1">
                 <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Module Affecté</p>
                 <p className="text-xs font-semibold text-slate-700">{item.theme?.title}</p>
              </div>
              <div className="flex-1 flex items-center gap-3">
                 <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-primary">
                    <UserIcon className="h-4 w-4" />
                 </div>
                 <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Formateur Animateur</p>
                    <p className="text-xs font-semibold text-slate-700">{item.trainer?.first_name} {item.trainer?.last_name}</p>
                 </div>
              </div>
           </div>
        ))}
      </div>
    </div>
  );
}

function LogisticsTab({ plan, onEditLogistics, canModify }: { plan: TrainingPlan; onEditLogistics: () => void; canModify: boolean; }) {
  const accommodations = plan.plan_accommodations || [];
  return (
    <div className="space-y-6">
       <div className="flex justify-between items-end border-b border-slate-100 pb-4">
          <h3 className="text-xl font-bold">Logistique & Hébergement</h3>
          {canModify && (
            <Button onClick={onEditLogistics} variant="outline" size="sm" className="h-8 text-xs font-semibold">
              <Edit className="h-3 w-3 mr-2" /> Mettre à jour la logistique
            </Button>
          )}
       </div>
       <div className="grid grid-cols-1 gap-4">
          {accommodations.map((item, i) => (
            <div key={i} className="formal-card p-6 flex flex-col md:flex-row md:items-center gap-10 group hover:bg-slate-50 transition-colors">
               <div className="flex-1 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-md bg-slate-100 flex items-center justify-center font-bold text-slate-600 shrink-0">
                     {item.user?.first_name[0]}{item.user?.last_name[0]}
                  </div>
                  <div>
                     <h4 className="text-base font-bold text-slate-900">{item.user?.first_name} {item.user?.last_name}</h4>
                     <p className="text-xs text-slate-500 font-medium capitalize">{item.user?.role?.replace('_', ' ')}</p>
                  </div>
               </div>
               <div className="flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Hébergement</p>
                  <p className="text-xs font-semibold text-slate-700 flex items-center gap-2">
                     <Hotel className="h-3.5 w-3.5 text-primary" /> {item.accommodation?.name || "Autonome"}
                  </p>
               </div>
               <div className="flex-1 grid grid-cols-2 gap-4">
                  <div>
                     <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Check-in</p>
                     <p className="text-xs font-medium text-slate-600">{item.check_in_date ? new Date(item.check_in_date).toLocaleDateString() : "---"}</p>
                  </div>
                  <div>
                     <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Check-out</p>
                     <p className="text-xs font-medium text-slate-600">{item.check_out_date ? new Date(item.check_out_date).toLocaleDateString() : "---"}</p>
                  </div>
               </div>
            </div>
          ))}
       </div>
    </div>
  );
}
