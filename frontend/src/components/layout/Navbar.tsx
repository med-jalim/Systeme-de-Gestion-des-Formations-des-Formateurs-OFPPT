import { Menu, User, Bell, ChevronLeft, ChevronRight } from "lucide-react";
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

interface NavbarProps {
  onToggleSidebar?: () => void;
  isCollapsed?: boolean;
}

export function Navbar({ onToggleSidebar, isCollapsed }: NavbarProps) {
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
                <AvatarImage src="" alt="@ofppt_user" />
                <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
                  YN
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal p-2">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  Youssef Naciri
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  youssef.naciri@ofppt.ma
                </p>
                <p className="text-[10px] mt-1 uppercase font-bold text-primary">
                  Admin Central
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-xs">
              <User className="mr-2 h-3 w-3" />
              <span>Profil</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-xs text-red-600 focus:text-red-600">
              Déconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
