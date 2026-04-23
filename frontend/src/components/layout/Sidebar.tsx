import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/AuthProvider";
import type { AppRole } from "@/providers/AuthProvider";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  GraduationCap,
  Settings,
  MapPin,
  Hotel,
  Network,
  Building2,
} from "lucide-react";

type NavItem = {
  title: string;
  href: string;
  icon: React.ElementType;
  roles?: AppRole[]; // If missing, visible to all authenticated users. If empty `[]`, only meant for Admin.
};

const SIDEBAR_ITEMS: NavItem[] = [
  { title: "Tableau de Bord", href: "/dashboard", icon: LayoutDashboard },
  { title: "Plans de Formation", href: "/plans", icon: CalendarDays, roles: ["responsable_dr", "responsable_cdc", "responsable_formation"] },
  { title: "Formations & Thèmes", href: "/formations", icon: GraduationCap },
  { title: "Directions", href: "/directions", icon: Network, roles: [] },
  { title: "Centres", href: "/centres", icon: Building2, roles: ["responsable_dr"] },
  { title: "Sites", href: "/sites", icon: MapPin, roles: ["responsable_dr"] },
  { title: "Hébergements", href: "/accommodations", icon: Hotel, roles: ["responsable_dr"] },
  { title: "Utilisateurs", href: "/users", icon: Users, roles: [] },
];

interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  isCollapsed?: boolean;
}

export function Sidebar({ className, isCollapsed, ...props }: SidebarProps) {
  const { hasRole, isAdmin } = useAuth();

  const filteredNavItems = SIDEBAR_ITEMS.filter((item) => {
    if (isAdmin()) return true;
    if (!item.roles) return true; // Accessible to everyone
    if (item.roles.length === 0) return false; // Requires roles, but none specified (only Admin)
    return hasRole(item.roles);
  });

  return (
    <nav
      className={cn(
        "flex flex-col h-full bg-background border-r px-3 py-4 transition-all duration-300",
        isCollapsed ? "items-center" : "",
        className,
      )}
      {...props}
    >
      <div
        className={cn(
          "mb-10 px-2 flex items-center h-12 transition-all",
          isCollapsed ? "justify-center" : "px-4",
        )}
      >
        <div className="flex items-center gap-2">
          <div className="flex -space-x-1 shrink-0">
            <div className="w-3 h-3 rotate-45 border-2 border-secondary bg-secondary/10" />
            {!isCollapsed && (
              <>
                <div className="w-3 h-3 rotate-45 border-2 border-accent bg-accent/10" />
                <div className="w-3 h-3 rotate-45 border-2 border-primary bg-primary/10" />
              </>
            )}
          </div>
          {!isCollapsed && (
            <div className="flex flex-col ml-1 whitespace-nowrap overflow-hidden animate-in fade-in duration-500">
              <h2 className="text-xl font-black tracking-tighter text-primary leading-none">
                OFPPT
              </h2>
              <span className="text-[9px] font-bold uppercase tracking-tight text-muted-foreground/60 leading-tight">
                Gestion Formations
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-1 flex-1 overflow-y-auto w-full pr-1 custom-scrollbar">
        {filteredNavItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            title={isCollapsed ? item.title : ""}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all group",
                isCollapsed
                  ? "justify-center px-0 h-10 w-10 mx-auto"
                  : "px-3 py-2.5",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )
            }
          >
            <item.icon
              className={cn(
                "h-4 w-4 shrink-0",
                isCollapsed ? "h-5 w-5" : "h-4 w-4",
              )}
            />
            {!isCollapsed && (
              <span className="truncate animate-in fade-in slide-in-from-left-2 duration-300">
                {item.title}
              </span>
            )}
          </NavLink>
        ))}
      </div>

      <div className="mt-auto pt-4 border-t w-full">
        <NavLink
          to="/settings"
          title={isCollapsed ? "Paramètres" : ""}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
              isCollapsed
                ? "justify-center px-0 h-10 w-10 mx-auto"
                : "px-3 py-2",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )
          }
        >
          <Settings
            className={cn(
              "h-4 w-4 shrink-0",
              isCollapsed ? "h-5 w-5" : "h-4 w-4",
            )}
          />
          {!isCollapsed && (
            <span className="animate-in fade-in duration-300">Paramètres</span>
          )}
        </NavLink>
      </div>
    </nav>
  );
}
