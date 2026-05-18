import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import axiosInstance from "@/lib/axios";

// ─── Types ────────────────────────────────────────────────────────────────────

export type AppRole =
  | "admin"
  | "responsable_cdc"
  | "responsable_formation"
  | "responsable_dr"
  | "formateur_animateur"
  | "formateur_participant";

interface AuthUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: AppRole;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: any) => void;
  logout: () => void;
  hasRole: (role: AppRole | AppRole[]) => boolean;
  isAdmin: () => boolean;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  login: () => {},
  logout: () => {},
  hasRole: () => false,
  isAdmin: () => false,
});

export const useAuth = () => useContext(AuthContext);

// ─── Provider ─────────────────────────────────────────────────────────────────

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const mapUser = (laravelUser: any): AuthUser => ({
    id: laravelUser.id,
    email: laravelUser.email,
    firstName: laravelUser.first_name,
    lastName: laravelUser.last_name,
    fullName: `${laravelUser.first_name} ${laravelUser.last_name}`.trim(),
    role: laravelUser.role as AppRole,
  });

  useEffect(() => {
    const storedToken = localStorage.getItem("auth_token");
    const storedUser = localStorage.getItem("auth_user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = (newToken: string, laravelUser: any) => {
    const mappedUser = mapUser(laravelUser);
    setToken(newToken);
    setUser(mappedUser);
    localStorage.setItem("auth_token", newToken);
    localStorage.setItem("auth_user", JSON.stringify(mappedUser));
  };

  const logout = async () => {
    try {
      await axiosInstance.post("/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      window.location.href = "/login";
    }
  };

  const hasRole = (role: AppRole | AppRole[]): boolean => {
    if (!user) return false;
    if (Array.isArray(role)) return role.includes(user.role);
    return user.role === role;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        hasRole,
        isAdmin: () => hasRole("admin"),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
