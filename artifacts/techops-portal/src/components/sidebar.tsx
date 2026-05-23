import { Link, useLocation } from "wouter";
import { LayoutDashboard, Monitor, Ticket, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Assets", href: "/assets", icon: Monitor },
  { name: "Tickets", href: "/tickets", icon: Ticket },
  { name: "Employees", href: "/employees", icon: Users },
];

export function Sidebar() {
  const [location] = useLocation();

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
      <nav className="flex-1 space-y-1 px-3 py-4">
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
      <div className="p-4 border-t border-sidebar-border/50">
        <div className="flex items-center gap-3 px-3 py-2 text-sm text-sidebar-foreground/70">
          <div className="w-8 h-8 bg-sidebar-accent rounded-full flex items-center justify-center overflow-hidden">
            <img src="https://i.pravatar.cc/150?u=admin" alt="Admin avatar" className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="font-medium text-sidebar-foreground">Admin User</p>
            <p className="text-xs opacity-70">admin@techops.local</p>
          </div>
        </div>
      </div>
    </div>
  );
}
