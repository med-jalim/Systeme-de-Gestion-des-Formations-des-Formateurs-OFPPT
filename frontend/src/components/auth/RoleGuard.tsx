import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/providers/AuthProvider";
import type { AppRole } from "@/providers/AuthProvider";

interface RoleGuardProps {
  allowedRoles?: AppRole[];
  children: ReactNode;
  fallback?: string;
  requireAll?: boolean;
}

export function RoleGuard({ 
  allowedRoles, 
  children, 
  fallback = "/dashboard", 
  requireAll = false 
}: RoleGuardProps) {
  const { user, hasRole, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return null; // or a loading spinner
  }

  if (!user) {
    return <Navigate to="/dashboard" replace />;
  }

  // Admin automatically bypasses all restrictions
  if (isAdmin()) {
    return <>{children}</>;
  }

  // If a specific list of roles is passed
  if (allowedRoles !== undefined) {
    // If it's explicitly empty, NO ONE (except admin) can access
    if (allowedRoles.length === 0) {
      return <Navigate to={fallback} replace />;
    }

    const hasRequiredRole = requireAll
      ? allowedRoles.every((role) => hasRole(role))
      : hasRole(allowedRoles);

    if (!hasRequiredRole) {
      return <Navigate to={fallback} replace />;
    }
  }

  return <>{children}</>;
}
