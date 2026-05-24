import { Link, useLocation } from "wouter";
import { TicketCheck, Monitor, Plus, LogOut, ChevronDown, X, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth";
import { useState } from "react";
import { Button } from "./ui/button";

const navigation = [
  { name: "My Tickets", href: "/my-tickets", icon: TicketCheck },
  { name: "Submit Request", href: "/submit-ticket", icon: Plus },
  { name: "My Equipment", href: "/my-assets", icon: Monitor },
];

export function EndUserLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [showSignOut, setShowSignOut] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden font-sans">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 flex h-full w-64 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-transform duration-300 ease-in-out",
          "md:static md:translate-x-0 md:z-auto md:transition-none",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between px-6 border-b border-sidebar-border/50">
          <h1 className="text-xl font-bold font-sans tracking-tight text-sidebar-primary-foreground flex items-center gap-2">
            <div className="w-8 h-8 bg-sidebar-primary rounded flex items-center justify-center">
              <span className="text-primary font-black leading-none tracking-tighter">T</span>
            </div>
            TechOps
          </h1>
          <button
            className="md:hidden p-1 rounded text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-4 pt-4 pb-2">
          <p className="text-xs font-semibold text-sidebar-foreground/40 uppercase tracking-widest px-1">Self Service</p>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {navigation.map((item) => {
            const isActive = location === item.href || location.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "group flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
                data-testid={`nav-${item.name.toLowerCase().replace(" ", "-")}`}
              >
                <item.icon
                  className={cn(
                    "mr-3 h-5 w-5 flex-shrink-0",
                    isActive ? "text-sidebar-primary" : "text-sidebar-foreground/40 group-hover:text-sidebar-foreground/70"
                  )}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border/50">
          <button
            onClick={() => setShowSignOut(!showSignOut)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-sidebar-accent/50 transition-colors text-left"
            data-testid="user-menu-toggle"
          >
            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-primary">{user?.initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">{user?.name}</p>
              <p className="text-xs text-sidebar-foreground/50 truncate">{user?.department}</p>
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
      </aside>

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <header className="flex h-16 items-center justify-between border-b bg-card px-4 md:px-8 shadow-sm gap-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden shrink-0 text-muted-foreground hover:text-foreground"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <span className="text-sm text-muted-foreground">Employee Self-Service Portal</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-medium">End User</span>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
