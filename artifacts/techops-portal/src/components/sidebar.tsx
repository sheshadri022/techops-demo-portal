import { Link, useLocation } from "wouter";
import { LayoutDashboard, Monitor, Ticket, Users, LogOut, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth";
import { useState } from "react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Assets", href: "/assets", icon: Monitor },
  { name: "Tickets", href: "/tickets", icon: Ticket },
  { name: "Employees", href: "/employees", icon: Users },
];

export function Sidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [showSignOut, setShowSignOut] = useState(false);

  return (
    <div className="flex h-full w-64 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 items-center px-6 border-b border-sidebar-border/50">
        <h1 className="text-xl font-bold font-sans tracking-tight text-sidebar-primary-foreground flex items-center gap-2">
          <div className="w-8 h-8 bg-sidebar-primary rounded flex items-center justify-center">
            <span className="text-primary font-black leading-none tracking-tighter">T</span>
          </div>
          TechOps
        </h1>
      </div>

      <div className="px-4 pt-4 pb-2">
        <p className="text-xs font-semibold text-sidebar-foreground/40 uppercase tracking-widest px-1">IT Admin</p>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {navigation.map((item) => {
          const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
              data-testid={`nav-${item.name.toLowerCase()}`}
            >
              <item.icon
                className={cn(
                  "mr-3 h-5 w-5 flex-shrink-0",
                  isActive ? "text-sidebar-primary" : "text-sidebar-foreground/40 group-hover:text-sidebar-foreground/70"
                )}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User section — initials only, no photo, with sign out */}
      <div className="p-4 border-t border-sidebar-border/50">
        <button
          onClick={() => setShowSignOut(!showSignOut)}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-sidebar-accent/50 transition-colors text-left"
          data-testid="user-menu-toggle"
        >
          <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-primary">{user?.initials ?? "AU"}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">{user?.name ?? "Admin User"}</p>
            <p className="text-xs text-sidebar-foreground/50 truncate">{user?.department ?? "IT Operations"}</p>
          </div>
          <ChevronDown className={cn("h-4 w-4 text-sidebar-foreground/40 flex-shrink-0 transition-transform", showSignOut && "rotate-180")} />
        </button>
        {showSignOut && (
          <div className="mt-1 mx-1">
            <button
              onClick={logout}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-md transition-colors"
              data-testid="button-sign-out"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
