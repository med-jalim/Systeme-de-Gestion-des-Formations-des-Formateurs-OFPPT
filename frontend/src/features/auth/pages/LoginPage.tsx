import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/providers/AuthProvider";
import axiosInstance from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Lock } from "lucide-react";
import logo from "@/assets/logo.jpg";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axiosInstance.post("/login", { email, password });
      const { access_token, user } = response.data;

      login(access_token, user);
      toast.success("Connexion réussie.");
      navigate("/dashboard");
    } catch (error: any) {
      const message = error.response?.data?.message || "Identifiants invalides.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-6">
      <div className="w-full max-w-[420px] bg-card border border-border shadow-xl rounded-xl overflow-hidden">
        {/* Institutional Banner */}
        <div className="bg-primary p-8 flex flex-col items-center justify-center space-y-4">
          <img src={logo} alt="OFPPT" className="h-20 w-auto object-contain rounded-full" />
          <div className="text-center">
            <h1 className="text-xl font-bold text-white tracking-tight">SGFF</h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary-foreground/70">
              Système de Gestion des Formations
            </p>
          </div>
        </div>

        {/* Login Form Section */}
        <div className="p-8 space-y-8">
          <div className="text-center space-y-1">
            <h2 className="text-lg font-bold">Authentification</h2>
            <p className="text-xs text-muted-foreground">Veuillez entrer vos identifiants institutionnels.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Email Professionnel</label>
              <Input
                type="email"
                placeholder="nom.prenom@ofppt.ma"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 bg-muted/50 border-border focus:ring-1 focus:ring-primary"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Mot de passe</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 bg-muted/50 border-border focus:ring-1 focus:ring-primary"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11 font-bold shadow-lg shadow-primary/20"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Lock className="h-4 w-4 mr-2" />
              )}
              Se connecter
            </Button>
          </form>
        </div>

        {/* Institutional Footer */}
        <div className="p-6 bg-muted/10 border-t border-border text-center">
          <p className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em]">
            © 2026 OFPPT . Direction de la Formation
          </p>
        </div>
      </div>
    </div>
  );
}
