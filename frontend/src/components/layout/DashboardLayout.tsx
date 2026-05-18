import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { cn } from "@/lib/utils";

export function DashboardLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Traditional Stable Sidebar */}
      <aside
        className={cn(
          "hidden md:block flex-shrink-0 bg-card border-r border-border transition-all duration-300 ease-in-out",
          isCollapsed ? "w-20" : "w-64",
        )}
      >
        <Sidebar isCollapsed={isCollapsed} />
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          isCollapsed={isCollapsed}
          onToggleSidebar={() => setIsCollapsed(!isCollapsed)}
        />

        <main className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-10">
          <div className="max-w-screen-2xl mx-auto space-y-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
