import { useParams, Link, useLocation } from "wouter";
import { 
  useGetEmployee, 
  getGetEmployeeQueryKey,
  useListAssets,
  useListTickets,
  useUpdateEmployee
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { 
  ArrowLeft, Mail, Phone, Building, Briefcase, 
  Monitor, TicketIcon, Edit, UserX, UserCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

export default function EmployeeDetail() {
  const { id } = useParams<{ id: string }>();
  const empId = parseInt(id, 10);
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: employee, isLoading: loadingEmp } = useGetEmployee(empId, { 
    query: { enabled: !!empId, queryKey: getGetEmployeeQueryKey(empId) } 
  });
  
  const { data: assets, isLoading: loadingAssets } = useListAssets();
  const { data: tickets, isLoading: loadingTickets } = useListTickets();
  
  const updateEmployee = useUpdateEmployee();

  const assignedAssets = assets?.filter(a => a.assignedToId === empId) || [];
  const requestedTickets = tickets?.filter(t => t.requesterId === empId) || [];

  const toggleStatus = () => {
    if (!employee) return;
    const newStatus = employee.status === 'active' ? 'inactive' : 'active';
    
    updateEmployee.mutate(
      { id: empId, data: { status: newStatus } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetEmployeeQueryKey(empId) });
          toast({
            title: "Status Updated",
            description: `Employee marked as ${newStatus}.`,
          });
        }
      }
    );
  };

  if (loadingEmp) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-20 w-1/2" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-[300px]" />
          <Skeleton className="h-[500px] md:col-span-2" />
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="max-w-5xl mx-auto text-center py-20">
        <UserX className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold">Employee Not Found</h2>
        <p className="text-muted-foreground mt-2 mb-6">The profile you're looking for doesn't exist.</p>
        <Button onClick={() => setLocation("/employees")}>Back to Directory</Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => setLocation("/employees")} className="shrink-0">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl">
            {employee.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
              {employee.name}
              <Badge variant={employee.status === 'active' ? 'default' : 'secondary'} className="text-sm">
                {employee.status}
              </Badge>
            </h1>
            <p className="text-muted-foreground mt-1">{employee.role} in {employee.department}</p>
          </div>
        </div>
        <div className="ml-auto flex gap-3">
          <Button variant="outline" onClick={toggleStatus} disabled={updateEmployee.isPending}>
            {employee.status === 'active' ? <UserX className="mr-2 h-4 w-4" /> : <UserCheck className="mr-2 h-4 w-4" />}
            Mark {employee.status === 'active' ? 'Inactive' : 'Active'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Contact & Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                  <Mail className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-muted-foreground text-xs">Email</p>
                  <p className="font-medium truncate">{employee.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                  <Phone className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-muted-foreground text-xs">Phone</p>
                  <p className="font-medium truncate">{employee.phone || 'Not provided'}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3 text-sm">
                <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                  <Building className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-muted-foreground text-xs">Department</p>
                  <p className="font-medium">{employee.department}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                  <Briefcase className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-muted-foreground text-xs">Role</p>
                  <p className="font-medium">{employee.role}</p>
                </div>
              </div>
              <Separator />
              <div className="text-xs text-muted-foreground text-center pt-2">
                Added {format(new Date(employee.createdAt), 'MMMM d, yyyy')}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Tabs defaultValue="assets" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="assets" className="flex gap-2">
                <Monitor className="h-4 w-4" /> Assigned Hardware ({assignedAssets.length})
              </TabsTrigger>
              <TabsTrigger value="tickets" className="flex gap-2">
                <TicketIcon className="h-4 w-4" /> Support History ({requestedTickets.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="assets" className="space-y-4 m-0">
              {loadingAssets ? (
                <Skeleton className="h-[200px] w-full" />
              ) : assignedAssets.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {assignedAssets.map(asset => (
                    <Link key={asset.id} href={`/assets/${asset.id}`} className="block">
                      <Card className="hover:border-primary/50 hover:shadow-md transition-all h-full">
                        <CardContent className="p-4 flex flex-col h-full">
                          <div className="flex justify-between items-start mb-2">
                            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                              {asset.category}
                            </Badge>
                            <span className="text-xs font-mono text-muted-foreground">{asset.serialNumber}</span>
                          </div>
                          <h3 className="font-semibold text-lg leading-tight mb-1">{asset.name}</h3>
                          {asset.brand && (
                            <p className="text-sm text-muted-foreground mb-4">{asset.brand} {asset.model}</p>
                          )}
                          <div className="mt-auto pt-4 border-t border-dashed flex items-center justify-between text-xs text-muted-foreground">
                            <span>Assigned</span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <Card className="border-dashed shadow-none bg-transparent">
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <Monitor className="h-10 w-10 text-muted-foreground/30 mb-4" />
                    <p className="font-medium text-foreground">No assigned hardware</p>
                    <p className="text-sm text-muted-foreground mt-1 mb-4">This employee currently has no assets assigned.</p>
                    <Button variant="outline" onClick={() => setLocation('/assets')}>Go to Assets to Assign</Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="tickets" className="m-0 space-y-4">
              {loadingTickets ? (
                <Skeleton className="h-[200px] w-full" />
              ) : requestedTickets.length > 0 ? (
                <div className="space-y-3">
                  {requestedTickets.map(ticket => (
                    <Link key={ticket.id} href={`/tickets/${ticket.id}`} className="block">
                      <Card className="hover:bg-muted/30 transition-colors">
                        <CardContent className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-mono text-xs text-muted-foreground">TKT-{ticket.id.toString().padStart(4, '0')}</span>
                              <Badge variant={ticket.status === 'open' ? 'destructive' : ticket.status === 'resolved' ? 'secondary' : 'outline'} className="text-[10px] px-1.5 py-0">
                                {ticket.status}
                              </Badge>
                            </div>
                            <h4 className="font-medium text-base">{ticket.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{ticket.description}</p>
                          </div>
                          <div className="text-xs text-muted-foreground whitespace-nowrap bg-muted/50 px-2 py-1 rounded">
                            {format(new Date(ticket.createdAt), 'MMM d, yyyy')}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <Card className="border-dashed shadow-none bg-transparent">
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <TicketIcon className="h-10 w-10 text-muted-foreground/30 mb-4" />
                    <p className="font-medium text-foreground">No support history</p>
                    <p className="text-sm text-muted-foreground mt-1">This employee has not submitted any tickets.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
