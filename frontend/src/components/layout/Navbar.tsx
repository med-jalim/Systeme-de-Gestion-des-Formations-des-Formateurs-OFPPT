import { Menu, Bell, ChevronLeft, ChevronRight, LogOut, Search, User } from "lucide-react";
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
import { useAuth } from "@/providers/AuthProvider";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface NavbarProps {
  onToggleSidebar?: () => void;
  isCollapsed?: boolean;
}

export function Navbar({ onToggleSidebar, isCollapsed }: NavbarProps) {
  const { user, logout } = useAuth();
  const initials = user ? `${user.firstName?.charAt(0) || ""}${user.lastName?.charAt(0) || ""}`.toUpperCase() : "U";

  return (
    <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-card sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="hidden md:flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>

        <Sheet>
          <SheetTrigger className="md:hidden p-2 hover:bg-muted rounded-md">
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64 border-r border-border">
            <Sidebar />
          </SheetContent>
        </Sheet>

        <div className="hidden lg:flex items-center gap-3 px-3 py-1.5 bg-muted/50 border border-border rounded-md group">
          <Search className="h-3.5 w-3.5 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Rechercher..." 
            className="bg-transparent border-none outline-none text-xs w-64 placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="h-9 w-9 flex items-center justify-center text-muted-foreground hover:bg-muted rounded-md relative">
          <Bell className="h-4 w-4" />
          <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-primary" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger className="outline-none">
            <div className="flex items-center gap-3 p-1 rounded-full hover:bg-muted transition-all cursor-pointer">
              <Avatar className="h-8 w-8 border border-border shadow-sm">
                <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
                   {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:flex flex-col items-start pr-2">
                <span className="text-xs font-bold leading-none">{user?.fullName}</span>
                <span className="text-[10px] text-muted-foreground mt-1 capitalize">
                  {user?.role?.replace('_', ' ')}
                </span>
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 mt-2 rounded-lg border border-border p-1" align="end">
            <DropdownMenuLabel className="px-3 py-2">
              <p className="text-xs font-bold">{user?.fullName}</p>
              <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/settings" className="flex items-center py-2 px-3 text-xs cursor-pointer">
                <User className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                Mon Profil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={logout} className="flex items-center py-2 px-3 text-xs text-red-600 focus:text-red-700 cursor-pointer">
              <LogOut className="mr-2 h-3.5 w-3.5" />
              Déconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
