import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "@tanstack/react-router";
import {
  BarChart2,
  LayoutDashboard,
  MessageSquare,
  Settings,
  Sparkles,
  UploadCloud,
  X,
} from "lucide-react";

interface NavLink {
  label: string;
  path: string;
  icon: React.ReactNode;
  ocid: string;
}

const navLinks: NavLink[] = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: <LayoutDashboard className="w-5 h-5" />,
    ocid: "nav.dashboard.link",
  },
  {
    label: "Upload Data",
    path: "/upload-data",
    icon: <UploadCloud className="w-5 h-5" />,
    ocid: "nav.upload_data.link",
  },
  {
    label: "AI Assistant",
    path: "/assistant",
    icon: <MessageSquare className="w-5 h-5" />,
    ocid: "nav.assistant.link",
  },
  {
    label: "Data Analysis",
    path: "/data-analysis",
    icon: <BarChart2 className="w-5 h-5" />,
    ocid: "nav.data_analysis.link",
  },
  {
    label: "Settings",
    path: "/settings",
    icon: <Settings className="w-5 h-5" />,
    ocid: "nav.settings.link",
  },
];

interface SidebarProps {
  onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const location = useLocation();

  return (
    <aside
      className="w-64 h-screen flex flex-col glass-dark border-r border-border/20 relative"
      data-ocid="sidebar.panel"
    >
      {/* Close button (mobile only) */}
      {onClose && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 lg:hidden"
          onClick={onClose}
          aria-label="Close sidebar"
        >
          <X className="w-4 h-4" />
        </Button>
      )}

      {/* Logo */}
      <div className="px-6 py-6 flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center genie-glow"
          style={{ background: "oklch(var(--primary) / 0.15)" }}
        >
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <div>
          <div className="font-display font-bold text-base leading-none gradient-text">
            Badshah
          </div>
          <div className="font-display text-xs text-muted-foreground mt-0.5">
            Intelligence
          </div>
        </div>
      </div>

      <Separator className="mx-4 opacity-20" />

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navLinks.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              onClick={onClose}
              data-ocid={link.ocid}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-smooth group",
                isActive
                  ? "bg-primary/15 text-primary genie-glow"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-foreground",
              )}
            >
              <span
                className={cn(
                  "transition-smooth",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground group-hover:text-foreground",
                )}
              >
                {link.icon}
              </span>
              {link.label}
            </Link>
          );
        })}
      </nav>

      <Separator className="mx-4 opacity-20" />

      {/* User info */}
      <div className="px-3 py-4 space-y-2">
        <div className="flex items-center gap-3 px-3 py-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ background: "oklch(var(--primary) / 0.2)" }}
          >
            <span className="text-primary">✦</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-foreground truncate">
              Mere Aaka
            </div>
            <div className="text-xs text-muted-foreground">Aaka</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 pb-4 text-center">
        <p className="text-xs text-muted-foreground/50">
          © {new Date().getFullYear()} Badshah Intelligence
        </p>
      </div>
    </aside>
  );
}
