import { createContext, useContext, useEffect, useState, useRef } from "react";
import type { ReactNode } from "react";
import keycloak from "@/lib/keycloak";

// ─── Types ────────────────────────────────────────────────────────────────────

export type AppRole =
  | "admin"
  | "responsable_cdc"
  | "responsable_formation"
  | "responsable_dr"
  | "formateur_animateur"
  | "formateur_participant";

interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  roles: string[];
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasRole: (role: AppRole | AppRole[]) => boolean;
  isAdmin: () => boolean;
  logout: () => void;
}

// ─── Singleton init — runs ONCE outside React, immune to StrictMode ───────────

const APP_ROLES: AppRole[] = [
  "admin",
  "responsable_cdc",
  "responsable_formation",
  "responsable_dr",
  "formateur_animateur",
  "formateur_participant",
];

let _initPromise: Promise<boolean> | null = null;

function getInitPromise(): Promise<boolean> {
  if (!_initPromise) {
    _initPromise = keycloak.init({
      onLoad: "login-required",
      checkLoginIframe: false,
      pkceMethod: "S256",
    });
  }
  return _initPromise;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  hasRole: () => false,
  isAdmin: () => false,
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

// ─── Provider ─────────────────────────────────────────────────────────────────

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const refreshInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    getInitPromise()
      .then((authenticated) => {
        if (authenticated && keycloak.tokenParsed) {
          const profile = keycloak.tokenParsed;
          const realmRoles: AppRole[] = (
            profile.realm_access?.roles ?? []
          ).filter((r: string): r is AppRole =>
            APP_ROLES.includes(r as AppRole),
          );
          console.log(profile);

          setUser({
            id: profile.sub!,
            email: profile.email ?? "",
            firstName: profile.given_name ?? "",
            lastName: profile.family_name ?? "",
            fullName:
              `${profile.given_name ?? ""} ${profile.family_name ?? ""}`.trim() ||
              (profile.preferred_username ?? ""),
            roles: realmRoles,
          });
          setToken(keycloak.token!);

          // Auto-refresh token 60s before expiry
          refreshInterval.current = setInterval(() => {
            keycloak.updateToken(60).catch(() => keycloak.logout());
          }, 30_000);
        } else {
          // Not authenticated — keycloak will redirect automatically
          keycloak.login();
        }
      })
      .catch((err) => {
        console.error("Keycloak init error:", err);
      })
      .finally(() => setIsLoading(false));

    // Keep token state in sync after silent refresh
    keycloak.onAuthRefreshSuccess = () => {
      setToken(keycloak.token ?? null);
    };

    return () => {
      if (refreshInterval.current) clearInterval(refreshInterval.current);
    };
  }, []);

  const hasRole = (role: AppRole | AppRole[]): boolean => {
    if (!user) return false;
    if (Array.isArray(role)) return role.some((r) => user.roles.includes(r));
    return user.roles.includes(role);
  };

  const logout = () => keycloak.logout({ redirectUri: window.location.origin });

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        hasRole,
        isAdmin: () => hasRole("admin"),
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
