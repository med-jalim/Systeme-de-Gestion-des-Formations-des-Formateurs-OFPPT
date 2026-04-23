import { Menu, User, Bell, ChevronLeft, ChevronRight, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "./Sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/providers/AuthProvider";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";

interface NavbarProps {
  onToggleSidebar?: () => void;
  isCollapsed?: boolean;
}

export function Navbar({ onToggleSidebar, isCollapsed }: NavbarProps) {
  const { user, logout } = useAuth();

  // Fetch full user profile to get the dynamic avatar from DB/R2
  const { data: dbProfile } = useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const res = await axiosInstance.get("/profile");
      return res.data;
    },
    // Only fetch if authenticated
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  // Helper to format role name nicely
  const getRoleLabel = (role: string) => {
    const roles: Record<string, string> = {
      admin: "Administrateur",
      responsable_cdc: "Responsable CDC",
      responsable_formation: "Responsable de Formation",
      responsable_dr: "Responsable DR",
      formateur_animateur: "Formateur Animateur",
      formateur_participant: "Formateur Participant",
    };
    return roles[role] || role;
  };

  const initials = user ? `${user.firstName?.charAt(0) || ""}${user.lastName?.charAt(0) || ""}`.toUpperCase() : "U";
  const avatarUrl = dbProfile?.avatar?.url;

  return (
    <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-2">
        {/* Desktop Collapse Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="hidden md:flex h-8 w-8 text-muted-foreground hover:text-primary transition-colors"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>

        {/* Mobile Sidebar Trigger */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="md:hidden shrink-0 h-8 w-8"
            >
              <Menu className="h-4 w-4" />
              <span className="sr-only">Toggle Sidebar</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72">
            <Sidebar />
          </SheetContent>
        </Sheet>

        {/* Breadcrumb Area */}
        <div className="flex flex-col ml-1">
          <span className="font-bold text-xs tracking-tight text-primary uppercase">
            OFPPT SGFF
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative h-8 w-8 text-muted-foreground hover:text-foreground"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-600 border border-background"></span>
        </Button>

        {/* User Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-8 w-8 rounded-full ml-1"
            >
              <Avatar className="h-8 w-8 border">
                <AvatarImage src={avatarUrl || ""} alt="@ofppt_user" />
                <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal p-2">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none truncate">
                  {user?.fullName || "Utilisateur"}
                </p>
                <p className="text-xs leading-none text-muted-foreground truncate" title={user?.email}>
                  {user?.email}
                </p>
                <p className="text-[10px] mt-1 uppercase font-bold text-primary">
                  {user?.roles?.[0] ? getRoleLabel(user.roles[0]) : "Utilisateur Standard"}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-xs cursor-pointer" asChild>
              <Link to="/settings" className="flex items-center w-full">
                <User className="mr-2 h-3 w-3" />
                <span>Mon Profil</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-xs cursor-pointer" asChild>
              <Link to="/settings" className="flex items-center w-full">
                <Settings className="mr-2 h-3 w-3" />
                <span>Paramètres</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-xs text-red-600 focus:text-red-700 cursor-pointer">
              <LogOut className="mr-2 h-3 w-3" />
              <span>Déconnexion</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
