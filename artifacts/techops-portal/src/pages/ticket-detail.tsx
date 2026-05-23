import { useParams, Link, useLocation } from "wouter";
import { 
  useGetTicket, 
  getGetTicketQueryKey,
  useUpdateTicket,
  useCloseTicket
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { 
  ArrowLeft, Clock, Monitor, User, AlertTriangle, 
  CheckCircle2, MessageSquare, Paperclip, Send, Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function TicketDetail() {
  const { id } = useParams<{ id: string }>();
  const ticketId = parseInt(id, 10);
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: ticket, isLoading } = useGetTicket(ticketId, { 
    query: { enabled: !!ticketId, queryKey: getGetTicketQueryKey(ticketId) } 
  });
  
  const updateTicket = useUpdateTicket();
  const closeTicket = useCloseTicket();

  const handleStatusChange = (status: string) => {
    if (status === 'closed') {
      closeTicket.mutate(
        { id: ticketId },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getGetTicketQueryKey(ticketId) });
            toast({ title: "Ticket Closed", description: "The ticket has been resolved and closed." });
          }
        }
      );
    } else {
      updateTicket.mutate(
        { id: ticketId, data: { status } },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getGetTicketQueryKey(ticketId) });
            toast({ title: "Status Updated", description: `Ticket status changed to ${status}.` });
          }
        }
      );
    }
  };

  const handlePriorityChange = (priority: string) => {
    updateTicket.mutate(
      { id: ticketId, data: { priority } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetTicketQueryKey(ticketId) });
          toast({ title: "Priority Updated", description: `Ticket priority changed to ${priority}.` });
        }
      }
    );
  };

  const getPriorityBadge = (priority: string) => {
    switch(priority?.toLowerCase()) {
      case 'urgent': return <Badge variant="destructive" className="flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Urgent</Badge>;
      case 'high': return <Badge variant="default" className="bg-orange-500 hover:bg-orange-600">High</Badge>;
      case 'medium': return <Badge variant="secondary">Medium</Badge>;
      case 'low': return <Badge variant="outline">Low</Badge>;
      default: return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const getStatusColor = (status: string) => {
    switch(status?.toLowerCase()) {
      case 'open': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'in_progress': return 'bg-blue-500/10 text-blue-700 border-blue-500/20';
      case 'resolved': return 'bg-green-500/10 text-green-700 border-green-500/20';
      case 'closed': return 'bg-muted text-muted-foreground border-border';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-[600px] md:col-span-2" />
          <Skeleton className="h-[400px]" />
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="max-w-5xl mx-auto text-center py-20">
        <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold">Ticket Not Found</h2>
        <p className="text-muted-foreground mt-2 mb-6">The support ticket you're looking for doesn't exist.</p>
        <Button onClick={() => setLocation("/tickets")}>Back to Tickets</Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => setLocation("/tickets")} className="shrink-0">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 text-sm text-muted-foreground mb-1">
            <span className="font-mono">TKT-{ticket.id.toString().padStart(4, '0')}</span>
            <span>•</span>
            <span>{format(new Date(ticket.createdAt), 'MMM d, yyyy h:mm a')}</span>
            <span>•</span>
            <span>{ticket.category}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground truncate">
            {ticket.title}
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="bg-muted/30 border-b pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                    {ticket.requesterName?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <p className="font-medium">{ticket.requesterName || 'Unknown User'}</p>
                    <p className="text-xs text-muted-foreground">Reported Issue</p>
                  </div>
                </div>
                {getPriorityBadge(ticket.priority)}
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap text-sm">
                {ticket.description}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-dashed">
            <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
              <Textarea 
                placeholder="Type a reply or internal note..." 
                className="resize-none min-h-[100px] border-muted bg-muted/20"
              />
              <div className="flex sm:flex-col gap-2 justify-end">
                <Button className="w-full sm:w-auto" data-testid="button-reply">
                  <Send className="h-4 w-4 mr-2" /> Reply
                </Button>
                <Button variant="outline" className="w-full sm:w-auto">
                  <Paperclip className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader className={`border-b pb-4 ${getStatusColor(ticket.status)}`}>
              <CardTitle className="text-lg flex justify-between items-center">
                Status
                <span className="capitalize">{ticket.status.replace('_', ' ')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Update Status</label>
                <Select value={ticket.status} onValueChange={handleStatusChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Update Priority</label>
                <Select value={ticket.priority} onValueChange={handlePriorityChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Settings className="h-4 w-4 text-muted-foreground" /> Ticket Details
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4 text-sm">
              <div>
                <span className="text-muted-foreground block mb-1 text-xs">Assignee</span>
                <div className="flex items-center gap-2 font-medium">
                  {ticket.assignedToName ? (
                    <>
                      <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-xs text-primary">
                        {ticket.assignedToName.charAt(0)}
                      </div>
                      <Link href={`/employees/${ticket.assignedToId}`} className="hover:underline">{ticket.assignedToName}</Link>
                    </>
                  ) : (
                    <span className="text-muted-foreground italic">Unassigned</span>
                  )}
                </div>
              </div>
              
              <Separator />
              
              <div>
                <span className="text-muted-foreground block mb-1 text-xs">Related Asset</span>
                {ticket.relatedAssetId ? (
                  <Link href={`/assets/${ticket.relatedAssetId}`} className="flex items-center gap-2 hover:bg-muted/50 p-2 -mx-2 rounded-md transition-colors">
                    <div className="h-8 w-8 rounded bg-accent/20 flex items-center justify-center text-accent-foreground">
                      <Monitor className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="block font-medium hover:underline">{ticket.relatedAssetName}</span>
                      <span className="text-xs text-muted-foreground">View hardware info</span>
                    </div>
                  </Link>
                ) : (
                  <span className="text-muted-foreground italic">No asset linked</span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
