import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Loader2,
  ShieldCheck,
  UserCircle,
  Camera,
  Trash2,
  Settings as SettingsIcon,
  Palette,
  Bell,
  ChevronRight,
} from "lucide-react";

import { useAuth } from "@/providers/AuthProvider";
import axiosInstance from "@/lib/axios";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { AppRole } from "@/providers/AuthProvider";
import { cn } from "@/lib/utils";

const profileSchema = z.object({
  first_name: z.string().min(1, "Required"),
  last_name: z.string().min(1, "Required"),
  email: z.string().email().optional(),
});

const passwordSchema = z.object({
    password: z.string().min(6, "Minimum 6 characters"),
    password_confirmation: z.string(),
  }).refine((data) => data.password === data.password_confirmation, {
    message: "Mismatch",
    path: ["password_confirmation"],
  });

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

const getRoleLabel = (role: string) => {
  const roles: Record<AppRole | string, string> = {
    admin: "Admin",
    responsable_cdc: "Resp. CDC",
    responsable_formation: "Formation",
    responsable_dr: "Direction",
    formateur_animateur: "Formateur",
    formateur_participant: "Participant",
  };
  return roles[role] || role;
};

// ─── Profile Tab ─────────────────────────────────────────────────────────────

function ProfileTab() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const { data: dbProfile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => (await axiosInstance.get("/profile")).data,
    enabled: !!user,
  });

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { first_name: user?.firstName || "", last_name: user?.lastName || "", email: user?.email || "", },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { first_name: string; last_name: string }) => (await axiosInstance.put("/profile", data)).data,
    onMutate: () => setIsUpdatingProfile(true),
    onSuccess: () => { toast.success("Updated."); queryClient.invalidateQueries({ queryKey: ["userProfile"] }); },
    onError: (e: any) => toast.error(e.response?.data?.message || "Error."),
    onSettled: () => setIsUpdatingProfile(false),
  });

  const uploadAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("entity_type", "user");
      formData.append("entity_id", String(dbProfile.id));
      return (await axiosInstance.post("/files", formData, { headers: { "Content-Type": "multipart/form-data" } })).data;
    },
    onMutate: () => setIsUploadingAvatar(true),
    onSuccess: () => { toast.success("Photo updated."); queryClient.invalidateQueries({ queryKey: ["userProfile"] }); },
    onError: (e: any) => toast.error(e.response?.data?.message || "Error."),
    onSettled: () => setIsUploadingAvatar(false),
  });

  const deleteAvatarMutation = useMutation({
    mutationFn: async (fileId: number) => { await axiosInstance.delete(`/files/${fileId}`); },
    onSuccess: () => { toast.success("Photo removed."); queryClient.invalidateQueries({ queryKey: ["userProfile"] }); },
    onError: () => toast.error("Error."),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadAvatarMutation.mutate(file);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 luxury-fade">
      <div className="lg:col-span-4 space-y-10">
         <div className="relative group w-48 h-48 bg-muted overflow-hidden transition-all duration-700 hover:scale-[1.02]">
            {isUploadingAvatar || isLoadingProfile ? (
              <div className="w-full h-full flex items-center justify-center"><Loader2 className="animate-spin" /></div>
            ) : dbProfile?.avatar?.url ? (
              <img src={dbProfile.avatar.url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl font-black">{user?.firstName[0]}{user?.lastName[0]}</div>
            )}
            <div className="absolute inset-0 bg-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer" onClick={() => fileInputRef.current?.click()}>
               <Camera className="text-white h-8 w-8 stroke-[1px]" />
               <span className="text-[9px] font-black uppercase tracking-widest text-white mt-2">Update Image</span>
            </div>
            <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
         </div>
         <div className="space-y-4">
            <h3 className="text-4xl font-black tracking-tighter">{user?.fullName}</h3>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">{getRoleLabel(user?.role || "").toUpperCase()}</p>
         </div>
      </div>

      <div className="lg:col-span-8 space-y-20">
         <div className="space-y-12">
            <h3 className="text-lg font-black tracking-tight border-b border-border pb-4 uppercase tracking-[0.2em]">Personal Identity</h3>
            <Form {...profileForm}>
              <form onSubmit={profileForm.handleSubmit((v) => updateProfileMutation.mutate(v))} className="space-y-10">
                <div className="grid grid-cols-2 gap-10">
                  <FormField control={profileForm.control} name="first_name" render={({ field }) => (
                    <FormItem className="space-y-4">
                      <FormLabel className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">First Name</FormLabel>
                      <FormControl><Input {...field} className="h-12 border-none border-b border-border rounded-none bg-transparent px-1 text-xs font-bold tracking-widest focus:border-foreground" /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={profileForm.control} name="last_name" render={({ field }) => (
                    <FormItem className="space-y-4">
                      <FormLabel className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Last Name</FormLabel>
                      <FormControl><Input {...field} className="h-12 border-none border-b border-border rounded-none bg-transparent px-1 text-xs font-bold tracking-widest focus:border-foreground" /></FormControl>
                    </FormItem>
                  )} />
                </div>
                <FormField control={profileForm.control} name="email" render={({ field }) => (
                  <FormItem className="space-y-4">
                    <FormLabel className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Primary Email</FormLabel>
                    <FormControl><Input {...field} disabled className="h-12 border-none border-b border-border rounded-none bg-muted/20 px-1 text-xs font-bold tracking-widest text-muted-foreground/40" /></FormControl>
                    <p className="text-[9px] font-medium italic luxury-heading text-muted-foreground/40">Email modifications require administrative privilege.</p>
                  </FormItem>
                )} />
                <Button type="submit" className="luxury-button" disabled={isUpdatingProfile}>
                  {isUpdatingProfile ? "Syncing..." : "Update Identity"}
                </Button>
              </form>
            </Form>
         </div>
      </div>
    </div>
  );
}

// ─── Security Tab ────────────────────────────────────────────────────────────

function SecurityTab() {
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const passwordForm = useForm<PasswordFormValues>({ resolver: zodResolver(passwordSchema), defaultValues: { password: "", password_confirmation: "", } });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: { password: string }) => (await axiosInstance.put("/profile", { password: data.password })).data,
    onMutate: () => setIsChangingPassword(true),
    onSuccess: () => { toast.success("Security updated."); passwordForm.reset(); },
    onError: (e: any) => toast.error(e.response?.data?.message || "Error."),
    onSettled: () => setIsChangingPassword(false),
  });

  return (
    <div className="max-w-2xl space-y-20 luxury-fade">
       <div className="space-y-12">
          <h3 className="text-lg font-black tracking-tight border-b border-border pb-4 uppercase tracking-[0.2em]">Security Protocol</h3>
          <p className="text-xs font-medium italic luxury-heading text-muted-foreground leading-relaxed">Ensure your strategic access remains confidential. We recommend a complex alphanumeric sequence of at least six characters.</p>
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit((v) => changePasswordMutation.mutate(v))} className="space-y-10">
              <FormField control={passwordForm.control} name="password" render={({ field }) => (
                <FormItem className="space-y-4">
                  <FormLabel className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">New Security Sequence</FormLabel>
                  <FormControl><Input type="password" {...field} className="h-12 border-none border-b border-border rounded-none bg-transparent px-1 text-xs font-bold tracking-widest focus:border-foreground" /></FormControl>
                </FormItem>
              )} />
              <FormField control={passwordForm.control} name="password_confirmation" render={({ field }) => (
                <FormItem className="space-y-4">
                  <FormLabel className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Confirm Sequence</FormLabel>
                  <FormControl><Input type="password" {...field} className="h-12 border-none border-b border-border rounded-none bg-transparent px-1 text-xs font-bold tracking-widest focus:border-foreground" /></FormControl>
                </FormItem>
              )} />
              <Button type="submit" className="luxury-button" disabled={isChangingPassword}>
                {isChangingPassword ? "Updating..." : "Authorize Change"}
              </Button>
            </form>
          </Form>
       </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export function SettingsPage() {
  return (
    <div className="space-y-24 pb-40 luxury-fade">
      <div className="space-y-6">
         <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">System Preferences</p>
         <h1 className="text-7xl md:text-8xl font-black tracking-tighter luxury-heading">Settings.</h1>
         <p className="text-sm font-medium text-muted-foreground max-w-lg leading-relaxed">
            Personalize your institutional portal, manage your security credentials, and calibrate the system to your operational needs.
         </p>
      </div>

      <Tabs defaultValue="profile" className="w-full space-y-16">
        <TabsList className="flex gap-12 border-b border-border bg-transparent h-auto p-0 rounded-none w-full justify-start overflow-x-auto custom-scrollbar pb-1">
          {["profile", "security", "general", "appearance", "notifications"].map((tab) => (
            <TabsTrigger
              key={tab}
              value={tab}
              className="px-0 py-4 bg-transparent rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-all"
            >
              {tab}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="luxury-fade">
          <TabsContent value="profile"><ProfileTab /></TabsContent>
          <TabsContent value="security"><SecurityTab /></TabsContent>
          {["general", "appearance", "notifications"].map(t => (
            <TabsContent key={t} value={t} className="py-20 text-center space-y-4">
               <div className="h-20 w-20 mx-auto bg-muted flex items-center justify-center">
                  <SettingsIcon className="h-8 w-8 text-muted-foreground/20 stroke-[1px]" />
               </div>
               <p className="text-xs font-medium italic luxury-heading text-muted-foreground">Module under institutional refinement.</p>
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  );
}
