import { useFormContext } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { useAuth } from "@/providers/AuthProvider";
import type { PlanInfoFormValues } from "../../schemas/plan.schema";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar, GraduationCap, MapPin, Type, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export const StepPlanInfo = () => {
  const { control } = useFormContext<PlanInfoFormValues>();
  const { user, isAdmin } = useAuth();

  // Fetch Formations
  const { data: formations, isLoading: isLoadingFormations } = useQuery({
    queryKey: ["formations"],
    queryFn: async () => {
      const response = await axiosInstance.get("/formations");
      const data = response.data;
      if (isAdmin()) return data;
      return data.filter((f: any) => f.created_by === user?.id);
    },
  });

  // Fetch Sites
  const { data: sites, isLoading: isLoadingSites } = useQuery({
    queryKey: ["sites"],
    queryFn: async () => {
      const response = await axiosInstance.get("/sites?all=true");
      return response.data;
    },
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-primary/5 border border-primary/10 p-4 rounded-lg flex gap-3 items-start">
        <GraduationCap className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-bold text-primary uppercase tracking-tight">
            Etape 1: Informations de Base
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Définissez le cadre de la formation : thématique globale, lieu et
            période.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
        <FormField
          control={control}
          name="title"
          render={({ field }) => (
            <FormItem className="col-span-full">
              <FormLabel className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-2">
                <Type className="w-3 h-3" />
                Titre du Plan de Formation
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Ex: Session de Perfectionnement React - Printemps 2026"
                  className="h-9 text-xs"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="formation_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-2">
                <GraduationCap className="w-3 h-3" />
                Formation de Référence
              </FormLabel>
              <Select
                onValueChange={(val) => field.onChange(Number(val))}
                value={field.value ? String(field.value) : ""}
              >
                <FormControl>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue
                      placeholder={
                        isLoadingFormations
                          ? "Chargement..."
                          : "Choisir une formation..."
                      }
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {formations?.map((f: any) => (
                    <SelectItem
                      key={f.id}
                      value={String(f.id)}
                      className="text-xs"
                    >
                      {f.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="site_id"
          render={({ field }) => (
            <FormItem className="flex flex-col mt-2">
              <FormLabel className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-2 mb-1">
                <MapPin className="w-3 h-3" />
                Site de Formation
              </FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "w-full justify-between h-9 text-xs font-normal border-input",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value
                        ? sites?.find((s: any) => s.id === field.value)?.name
                        : "Rechercher un site..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Rechercher un site..." className="text-xs h-9" />
                    <CommandList>
                      <CommandEmpty>Aucun site trouvé.</CommandEmpty>
                      <CommandGroup>
                        {sites?.map((s: any) => (
                          <CommandItem
                            value={`${s.name} ${s.centre?.name}`}
                            key={s.id}
                            onSelect={() => {
                              field.onChange(s.id);
                            }}
                            className="text-xs"
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                s.id === field.value ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {s.name} <span className="text-muted-foreground ml-1">({s.centre?.name})</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="start_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-3 h-3" />
                Date de Début
              </FormLabel>
              <FormControl>
                <Input type="date" className="h-9 text-xs" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="end_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-3 h-3" />
                Date de Fin
              </FormLabel>
              <FormControl>
                <Input type="date" className="h-9 text-xs" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
