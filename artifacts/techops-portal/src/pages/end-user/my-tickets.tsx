import { useState } from "react";
import { Link } from "wouter";
import { useListTickets } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, ChevronRight, Inbox } from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  open: "bg-blue-100 text-blue-700 border-blue-200",
  in_progress: "bg-amber-100 text-amber-700 border-amber-200",
  resolved: "bg-green-100 text-green-700 border-green-200",
  closed: "bg-gray-100 text-gray-600 border-gray-200",
};

const PRIORITY_STYLES: Record<string, string> = {
  low: "bg-slate-100 text-slate-600 border-slate-200",
  medium: "bg-sky-100 text-sky-700 border-sky-200",
  high: "bg-orange-100 text-orange-700 border-orange-200",
  urgent: "bg-red-100 text-red-700 border-red-200",
};

export default function MyTickets() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { data: tickets, isLoading } = useListTickets();

  const filtered = (tickets ?? []).filter(
    (t) => statusFilter === "all" || t.status === statusFilter
  );

  const statuses = [
    { key: "all", label: "All" },
    { key: "open", label: "Open" },
    { key: "in_progress", label: "In Progress" },
    { key: "resolved", label: "Resolved" },
    { key: "closed", label: "Closed" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Tickets</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Track your support requests</p>
        </div>
        <Link href="/submit-ticket">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" data-testid="button-new-ticket">
            <Plus className="h-4 w-4 mr-2" />
            New Ticket
          </Button>
        </Link>
      </div>

      {/* Status filters */}
      <div className="flex gap-2 flex-wrap">
        {statuses.map((s) => (
          <button
            key={s.key}
            onClick={() => setStatusFilter(s.key)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
              statusFilter === s.key
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
            }`}
            data-testid={`filter-${s.key}`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Tickets list */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Inbox className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <p className="text-lg font-semibold text-muted-foreground">No tickets found</p>
          <p className="text-sm text-muted-foreground/60 mt-1 mb-4">Submit a request and we'll get on it.</p>
          <Link href="/submit-ticket">
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Submit a Request
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((ticket) => (
            <Link key={ticket.id} href={`/my-tickets/${ticket.id}`}>
              <Card className="hover:border-primary/40 hover:shadow-sm transition-all cursor-pointer" data-testid={`ticket-row-${ticket.id}`}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm text-foreground truncate">{ticket.title}</span>
                      <Badge variant="outline" className={`text-xs flex-shrink-0 ${PRIORITY_STYLES[ticket.priority] ?? ""}`}>
                        {ticket.priority}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>#{ticket.id}</span>
                      <span>{ticket.category}</span>
                      <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <Badge variant="outline" className={`text-xs ${STATUS_STYLES[ticket.status] ?? ""}`}>
                      {ticket.status.replace("_", " ")}
                    </Badge>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
