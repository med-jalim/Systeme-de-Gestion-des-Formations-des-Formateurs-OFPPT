import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Building,
  GraduationCap,
  Settings,
} from "lucide-react";

const sidebarNavItems = [
  { title: "Tableau de Bord", href: "/dashboard", icon: LayoutDashboard },
  { title: "Plans de Formation", href: "/plans", icon: CalendarDays },
  { title: "Formations & Thèmes", href: "/formations", icon: GraduationCap },
  { title: "Hébergements", href: "/accommodations", icon: Building },
  { title: "Utilisateurs (Admin)", href: "/users", icon: Users },
];

interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  isCollapsed?: boolean;
}

export function Sidebar({ className, isCollapsed, ...props }: SidebarProps) {
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

      <div className="space-y-1 flex-1 overflow-y-auto w-full">
        {sidebarNavItems.map((item) => (
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
