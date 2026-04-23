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
  Settings,
  Palette,
  Bell,
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { AppRole } from "@/providers/AuthProvider";

// ─── Verification Schema ──────────────────────────────────────────────────────

const profileSchema = z.object({
  first_name: z.string().min(1, "Le prénom est requis"),
  last_name: z.string().min(1, "Le nom est requis"),
  email: z.string().email().optional(),
});

const passwordSchema = z
  .object({
    password: z
      .string()
      .min(6, "Le mot de passe doit contenir au moins 6 caractères"),
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Les mots de passe ne correspondent pas",
    path: ["password_confirmation"],
  });

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

// Helpers for displaying roles nicely
const getRoleLabel = (role: string) => {
  const roles: Record<AppRole | string, string> = {
    admin: "Administrateur",
    responsable_cdc: "Responsable CDC",
    responsable_formation: "Responsable de Formation",
    responsable_dr: "Responsable DR",
    formateur_animateur: "Formateur Animateur",
    formateur_participant: "Formateur Participant",
  };
  return roles[role] || role;
};

// ─── Profile Tab Component ──────────────────────────────────────────────────

function ProfileTab() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Fetch full user profile to get the avatar URL generated from R2
  const { data: dbProfile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const res = await axiosInstance.get("/profile");
      return res.data;
    },
    enabled: !!user,
  });

  // 1. Profile information form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: user?.firstName || "",
      last_name: user?.lastName || "",
      email: user?.email || "",
    },
  });

  // API Call: Update profile
  const updateProfileMutation = useMutation({
    mutationFn: async (data: { first_name: string; last_name: string }) => {
      const response = await axiosInstance.put("/profile", data);
      return response.data;
    },
    onMutate: () => setIsUpdatingProfile(true),
    onSuccess: () => {
      toast.success("Profil mis à jour avec succès.");
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          "Erreur lors de la mise à jour du profil",
      );
    },
    onSettled: () => setIsUpdatingProfile(false),
  });

  // API Call: Upload Avatar to R2 Database files table
  const uploadAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!dbProfile?.id) throw new Error("Utilisateur non authentifié");
      const formData = new FormData();
      formData.append("file", file);
      formData.append("entity_type", "user");
      formData.append("entity_id", String(dbProfile.id));

      const response = await axiosInstance.post("/files", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    },
    onMutate: () => setIsUploadingAvatar(true),
    onSuccess: () => {
      toast.success("Photo de profil mise à jour avec succès.");
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          "Erreur lors du téléchargement de la photo",
      );
    },
    onSettled: () => setIsUploadingAvatar(false),
  });

  // API Call: Delete Avatar
  const deleteAvatarMutation = useMutation({
    mutationFn: async (fileId: number) => {
      await axiosInstance.delete(`/files/${fileId}`);
    },
    onSuccess: () => {
      toast.success("Photo de profil supprimée.");
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
    onError: () => {
      toast.error("Erreur lors de la suppression de la photo.");
    },
  });

  const onSubmitProfile = (values: ProfileFormValues) => {
    updateProfileMutation.mutate({
      first_name: values.first_name,
      last_name: values.last_name,
    });
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("L'image ne doit pas dépasser 5 Mo.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Veuillez sélectionner une image valide.");
      return;
    }

    uploadAvatarMutation.mutate(file);
  };

  const avatarFile = dbProfile?.avatar;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Left Column: Read-only info & Avatar  */}
      <div className="md:col-span-1 space-y-6">
        <Card className="border-none shadow-md overflow-hidden bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/5 dark:to-purple-500/5">
          <CardHeader className="text-center pb-6">
            <div className="relative inline-block mx-auto mb-4">
              <div
                className="relative group w-28 h-28 cursor-pointer rounded-full overflow-hidden border-4 border-background shadow-lg"
                onClick={handleAvatarClick}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/jpeg, image/png, image/webp"
                  onChange={handleFileChange}
                />

                {isUploadingAvatar || isLoadingProfile ? (
                  <div className="bg-indigo-100 dark:bg-indigo-900/50 w-full h-full flex flex-col items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                  </div>
                ) : avatarFile?.url ? (
                  <img
                    src={avatarFile.url}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="bg-indigo-100 dark:bg-indigo-900/50 w-full h-full flex items-center justify-center">
                    <span className="text-4xl font-bold text-indigo-700 dark:text-indigo-300">
                      {profileForm.getValues("first_name")?.charAt(0)}
                      {profileForm.getValues("last_name")?.charAt(0)}
                    </span>
                  </div>
                )}

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Camera className="w-6 h-6 text-white mb-1" />
                  <span className="text-white text-xs font-medium">
                    Modifier
                  </span>
                </div>
              </div>

              {/* Show Delete Button as a circular badge only if an avatar exists */}
              {avatarFile && (
                <button
                  type="button"
                  className="absolute bottom-1 right-1 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition-transform hover:scale-110 focus:outline-none ring-2 ring-background z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteAvatarMutation.mutate(avatarFile.id);
                  }}
                  disabled={deleteAvatarMutation.isPending}
                  title="Supprimer la photo"
                >
                  {deleteAvatarMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>

            <CardTitle>{user?.fullName}</CardTitle>
            <CardDescription className="pt-2">
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                {user?.roles?.[0]
                  ? getRoleLabel(user.roles[0])
                  : "Utilisateur Standard"}
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm space-y-4 pt-4 border-t bg-background/50">
            <div className="space-y-1">
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
                Email
              </p>
              <p className="font-medium truncate" title={user?.email}>
                {user?.email}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
                ID Keycloak
              </p>
              <p
                className="font-mono text-[10px] text-muted-foreground truncate"
                title={user?.id}
              >
                {user?.id}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column: Edit Forms */}
      <div className="md:col-span-2 space-y-6">
        {/* Personal Info Form */}
        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCircle className="w-5 h-5 text-primary" />
              Informations Personnelles
            </CardTitle>
            <CardDescription>
              Mettez à jour votre prénom et votre nom. L'email est géré par
              l'administrateur.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...profileForm}>
              <form
                onSubmit={profileForm.handleSubmit(onSubmitProfile)}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={profileForm.control}
                    name="first_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prénom</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={profileForm.control}
                    name="last_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={profileForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adresse Email</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled
                          className="bg-muted/50 text-muted-foreground"
                        />
                      </FormControl>
                      <p className="text-xs text-muted-foreground mt-1">
                        Veuillez contacter votre administrateur pour modifier
                        l'adresse email.
                      </p>
                    </FormItem>
                  )}
                />

                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={isUpdatingProfile}>
                    {isUpdatingProfile ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enregistrement...
                      </>
                    ) : (
                      "Enregistrer les modifications"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── Security Tab Component ──────────────────────────────────────────────────

function SecurityTab() {
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // 2. Password change form
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: "",
      password_confirmation: "",
    },
  });

  // API Call: Change password
  const changePasswordMutation = useMutation({
    mutationFn: async (data: { password: string }) => {
      const response = await axiosInstance.put("/profile", {
        password: data.password,
      });
      return response.data;
    },
    onMutate: () => setIsChangingPassword(true),
    onSuccess: () => {
      toast.success("Mot de passe changé avec succès !");
      passwordForm.reset();
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          "Erreur lors du changement de mot de passe",
      );
    },
    onSettled: () => setIsChangingPassword(false),
  });

  const onSubmitPassword = (values: PasswordFormValues) => {
    changePasswordMutation.mutate({
      password: values.password,
    });
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl">
      {/* Security Form */}
      <Card className="border-none shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            Sécurité / Mot de passe
          </CardTitle>
          <CardDescription>
            Modifiez votre mot de passe d'accès à la plateforme SGFF. Il est
            recommandé de choisir un mot de passe unique contenant des chiffres
            et des lettres.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...passwordForm}>
            <form
              onSubmit={passwordForm.handleSubmit(onSubmitPassword)}
              className="space-y-4"
            >
              <FormField
                control={passwordForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nouveau mot de passe</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={passwordForm.control}
                name="password_confirmation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmer le mot de passe</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isChangingPassword}>
                  {isChangingPassword ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Mise à jour...
                    </>
                  ) : (
                    "Changer le mot de passe"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Settings Page Wrapper ──────────────────────────────────────────────────

export function SettingsPage() {
  return (
    <div className="container py-8 space-y-8 max-w-6xl">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Paramètres</h2>
        <p className="text-muted-foreground mt-2">
          Gérez vos préférences, votre profil et les réglages de l'application.
        </p>
      </div>

      <Separator />

      <Tabs
        defaultValue="profile"
        className="flex flex-col md:flex-row gap-8 w-full items-start"
      >
        <TabsList className="flex flex-col h-auto bg-transparent p-0 w-full md:w-56 shrink-0 space-y-2 items-stretch justify-start">
          <TabsTrigger
            value="profile"
            className="justify-start px-4 py-2.5 text-sm font-medium data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none hover:bg-muted/50 rounded-md transition-all border border-transparent data-[state=active]:border-primary/20"
          >
            <UserCircle className="w-4 h-4 mr-2" />
            Mon Profil
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="justify-start px-4 py-2.5 text-sm font-medium data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none hover:bg-muted/50 rounded-md transition-all border border-transparent data-[state=active]:border-primary/20"
          >
            <ShieldCheck className="w-4 h-4 mr-2" />
            Sécurité
          </TabsTrigger>
          <TabsTrigger
            value="general"
            className="justify-start px-4 py-2.5 text-sm font-medium data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none hover:bg-muted/50 rounded-md transition-all border border-transparent data-[state=active]:border-primary/20"
          >
            <Settings className="w-4 h-4 mr-2" />
            Général
          </TabsTrigger>
          <TabsTrigger
            value="appearance"
            className="justify-start px-4 py-2.5 text-sm font-medium data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none hover:bg-muted/50 rounded-md transition-all border border-transparent data-[state=active]:border-primary/20"
          >
            <Palette className="w-4 h-4 mr-2" />
            Apparence
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="justify-start px-4 py-2.5 text-sm font-medium data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none hover:bg-muted/50 rounded-md transition-all border border-transparent data-[state=active]:border-primary/20"
          >
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 min-w-0">
          <TabsContent
            value="profile"
            className="m-0 focus-visible:outline-none focus-visible:ring-0"
          >
            <ProfileTab />
          </TabsContent>

          <TabsContent
            value="security"
            className="m-0 focus-visible:outline-none focus-visible:ring-0"
          >
            <SecurityTab />
          </TabsContent>

          <TabsContent
            value="general"
            className="m-0 h-[300px] flex flex-col items-center justify-center p-12 border border-dashed rounded-lg bg-muted/20 animate-in fade-in duration-500"
          >
            <Settings className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <div className="text-center">
              <h3 className="font-semibold text-xl text-foreground">
                Paramètres Généraux
              </h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
                Les réglages globaux de votre espace seront bientôt disponibles
                ici.
              </p>
            </div>
          </TabsContent>

          <TabsContent
            value="appearance"
            className="m-0 h-[300px] flex flex-col items-center justify-center p-12 border border-dashed rounded-lg bg-muted/20 animate-in fade-in duration-500"
          >
            <Palette className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <div className="text-center">
              <h3 className="font-semibold text-xl text-foreground">
                Apparence et Thème
              </h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
                Personnalisez le mode sombre, les couleurs et l'interface de
                SGFF très prochainement.
              </p>
            </div>
          </TabsContent>

          <TabsContent
            value="notifications"
            className="m-0 h-[300px] flex flex-col items-center justify-center p-12 border border-dashed rounded-lg bg-muted/20 animate-in fade-in duration-500"
          >
            <Bell className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <div className="text-center">
              <h3 className="font-semibold text-xl text-foreground">
                Préférences de Notifications
              </h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
                Contrôlez les alertes et les emails que vous souhaitez recevoir
                ou bloquer.
              </p>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
