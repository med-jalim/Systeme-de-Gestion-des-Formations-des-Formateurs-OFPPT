import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as api from "../api";
import {
  formationSchema,
  type FormationFormValues,
} from "../schemas/formation.schema";
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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowLeft, GraduationCap } from "lucide-react";

export const FormationCreatePage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const form = useForm<FormationFormValues>({
    resolver: zodResolver(formationSchema),
    defaultValues: {
      title: "",
      description: "",
      start_date: "",
      end_date: "",
    },
  });

  const mutation = useMutation({
    mutationFn: api.createFormation,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["formations"] });
      toast.success("Programme de formation créé !");
      navigate(`/formations/${data.id}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur de création");
    },
  });

  const onSubmit = (values: FormationFormValues) => {
    mutation.mutate(values);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 mb-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="rounded-full"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <GraduationCap className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-primary">
            Nouveau Programme
          </h1>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-muted shadow-xl shadow-primary/5">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">
                    Titre du Programme
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Développement Web Avancé"
                      className="font-medium"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Date de début</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Date de fin</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Objectifs et public cible..."
                      className="min-h-[120px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="pt-4 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                className="font-bold"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                className="font-bold px-8"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? "Création..." : "Enregistrer"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};
