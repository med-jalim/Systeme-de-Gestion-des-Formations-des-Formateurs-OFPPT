import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/AuthProvider";
import type { AppRole } from "@/providers/AuthProvider";
import logo from "@/assets/logo.jpg";
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
  roles?: AppRole[]; 
};

const SIDEBAR_ITEMS: NavItem[] = [
  { title: "Tableau de Bord", href: "/dashboard", icon: LayoutDashboard },
  { title: "Plans de Formation", href: "/plans", icon: CalendarDays, roles: ["responsable_dr", "responsable_cdc", "responsable_formation"] },
  { title: "Catalogue Formations", href: "/formations", icon: GraduationCap },
  { title: "Directions Régionales", href: "/directions", icon: Network, roles: [] },
  { title: "Centres", href: "/centres", icon: Building2, roles: ["responsable_dr", "responsable_cdc"] },
  { title: "Sites de Formation", href: "/sites", icon: MapPin, roles: ["responsable_dr", "responsable_cdc"] },
  { title: "Logistique & Hébergement", href: "/accommodations", icon: Hotel, roles: ["responsable_dr", "responsable_cdc"] },
  { title: "Gestion Utilisateurs", href: "/users", icon: Users, roles: [] },
];

export function Sidebar({ isCollapsed }: { isCollapsed?: boolean }) {
  const { hasRole, isAdmin } = useAuth();

  const filteredNavItems = SIDEBAR_ITEMS.filter((item) => {
    if (isAdmin()) return true;
    if (!item.roles) return true;
    if (item.roles.length === 0) return false; 
    return hasRole(item.roles);
  });

  return (
    <nav className="flex flex-col h-full bg-white border-r border-border py-6">
      {/* Institutional Branding */}
      <div className={cn(
        "mb-10 flex items-center justify-center transition-all duration-300 px-4",
        isCollapsed ? "px-0" : ""
      )}>
        <div className="flex items-center gap-3">
           <img src={logo} alt="OFPPT" className="h-10 w-auto object-contain" />
           {!isCollapsed && (
             <div className="flex flex-col">
                <span className="text-sm font-bold text-primary tracking-tight">SGFF</span>
                <span className="text-[9px] font-medium text-slate-500 uppercase tracking-wider">Formation OFPPT</span>
             </div>
           )}
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 px-3 space-y-1">
        {filteredNavItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 py-2 px-3 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-slate-100 text-primary"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )
            }
          >
            <item.icon className={cn(
              "h-4 w-4 shrink-0 transition-colors",
              "group-hover:text-primary"
            )} />
            {!isCollapsed && <span className="truncate">{item.title}</span>}
          </NavLink>
        ))}
      </div>

      {/* Footer Settings */}
      <div className="px-3 pt-4 mt-auto border-t border-border">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 py-2 px-3 rounded-md text-sm font-medium transition-colors",
              isActive ? "bg-slate-100 text-primary" : "text-slate-600 hover:bg-slate-50"
            )
          }
        >
          <Settings className="h-4 w-4" />
          {!isCollapsed && <span>Paramètres</span>}
        </NavLink>
      </div>
    </nav>
  );
}
