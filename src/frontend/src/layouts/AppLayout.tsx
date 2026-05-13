import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Outlet } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export default function AppLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
          onKeyDown={(e) => e.key === "Escape" && setMobileSidebarOpen(false)}
          role="presentation"
        >
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
        </div>
      )}
      {/* Mobile sidebar drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 lg:hidden transition-smooth ${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar onClose={() => setMobileSidebarOpen(false)} />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 glass-dark border-b border-border/20">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileSidebarOpen(true)}
            aria-label="Open sidebar"
            data-ocid="sidebar.open_modal_button"
          >
            {mobileSidebarOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </Button>
          <span className="font-display font-semibold gradient-text text-lg">
            Badshah Intelligence
          </span>
        </header>

        <main className="flex-1 overflow-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
