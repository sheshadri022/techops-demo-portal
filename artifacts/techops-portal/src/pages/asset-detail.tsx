import { useParams, Link, useLocation } from "wouter";
import { 
  useGetAsset, 
  getGetAssetQueryKey,
  useListTickets,
  useUpdateAsset,
  useListEmployees,
  useAssignAsset
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { useState } from "react";
import { 
  Monitor, ArrowLeft, Edit, Clock, ShieldCheck, 
  MapPin, Tag, User, Hash, HardDrive, Wrench, TicketIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function AssetDetail() {
  const { id } = useParams<{ id: string }>();
  const assetId = parseInt(id, 10);
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");

  const { data: asset, isLoading: loadingAsset } = useGetAsset(assetId, { 
    query: { enabled: !!assetId, queryKey: getGetAssetQueryKey(assetId) } 
  });
  
  const { data: tickets, isLoading: loadingTickets } = useListTickets();
  const { data: employees } = useListEmployees();
  
  const assignAsset = useAssignAsset();
  const updateAsset = useUpdateAsset();

  const relatedTickets = tickets?.filter(t => t.relatedAssetId === assetId) || [];

  const handleAssign = () => {
    if (!selectedEmployeeId) return;
    
    const empId = parseInt(selectedEmployeeId, 10);
    assignAsset.mutate(
      { id: assetId, data: { assignedToId: empId } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetAssetQueryKey(assetId) });
          setIsAssignOpen(false);
          toast({
            title: "Asset Assigned",
            description: "The asset has been successfully assigned.",
          });
        },
        onError: () => {
          toast({
            title: "Assignment Failed",
            description: "Could not assign the asset.",
            variant: "destructive"
          });
        }
      }
    );
  };

  const handleUnassign = () => {
    assignAsset.mutate(
      { id: assetId, data: { assignedToId: null } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetAssetQueryKey(assetId) });
          toast({
            title: "Asset Unassigned",
            description: "The asset is now available.",
          });
        }
      }
    );
  };

  const handleStatusChange = (status: string) => {
    updateAsset.mutate(
      { id: assetId, data: { status } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetAssetQueryKey(assetId) });
          toast({
            title: "Status Updated",
            description: `Asset status changed to ${status}.`,
          });
        }
      }
    );
  };

  if (loadingAsset) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-[400px] md:col-span-2" />
          <Skeleton className="h-[400px]" />
        </div>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="max-w-5xl mx-auto text-center py-20">
        <HardDrive className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold">Asset Not Found</h2>
        <p className="text-muted-foreground mt-2 mb-6">The hardware asset you're looking for doesn't exist.</p>
        <Button onClick={() => setLocation("/assets")}>Back to Assets</Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => setLocation("/assets")} className="shrink-0">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            {asset.name}
            <Badge 
              variant={
                asset.status === 'available' ? 'default' : 
                asset.status === 'assigned' ? 'secondary' : 
                asset.status === 'maintenance' ? 'destructive' : 'outline'
              }
              className="text-sm px-3 py-0.5 capitalize"
            >
              {asset.status}
            </Badge>
          </h1>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            <Hash className="h-4 w-4" /> {asset.serialNumber} • <Tag className="h-4 w-4 ml-2" /> {asset.category}
          </p>
        </div>
        <div className="ml-auto flex gap-3">
          <Select value={asset.status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Update status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="assigned">Assigned</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="retired">Retired</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" /> Edit
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Hardware Specifications</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-1">
                    <Monitor className="h-4 w-4" /> Brand & Model
                  </dt>
                  <dd className="text-base font-medium">{asset.brand || 'Unknown'} {asset.model || ''}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-1">
                    <ShieldCheck className="h-4 w-4" /> Condition
                  </dt>
                  <dd className="text-base font-medium">{asset.condition || 'Not specified'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-1">
                    <MapPin className="h-4 w-4" /> Location
                  </dt>
                  <dd className="text-base font-medium">{asset.location || 'Not specified'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-1">
                    <Clock className="h-4 w-4" /> Purchase Info
                  </dt>
                  <dd className="text-base font-medium">
                    {format(new Date(asset.purchaseDate), 'MMM d, yyyy')}
                    {asset.purchasePrice && ` • $${asset.purchasePrice.toLocaleString()}`}
                  </dd>
                </div>
                {asset.warrantyExpiry && (
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-1">
                      <ShieldCheck className="h-4 w-4 text-amber-500" /> Warranty Expiry
                    </dt>
                    <dd className="text-base font-medium">{format(new Date(asset.warrantyExpiry), 'MMM d, yyyy')}</dd>
                  </div>
                )}
              </dl>
              
              {asset.notes && (
                <>
                  <Separator className="my-6" />
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Notes</h4>
                    <p className="text-sm whitespace-pre-wrap bg-muted/30 p-4 rounded-md border">{asset.notes}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TicketIcon className="h-5 w-5" /> Related Tickets
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingTickets ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : relatedTickets.length > 0 ? (
                <div className="space-y-4">
                  {relatedTickets.map(ticket => (
                    <div key={ticket.id} className="flex justify-between items-center p-3 border rounded-md hover:bg-muted/50 transition-colors">
                      <div>
                        <Link href={`/tickets/${ticket.id}`} className="font-medium hover:underline hover:text-primary block">
                          {ticket.title}
                        </Link>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(ticket.createdAt), 'MMM d, yyyy')} • {ticket.category}
                        </span>
                      </div>
                      <Badge variant={ticket.status === 'open' ? 'destructive' : 'outline'}>
                        {ticket.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No support tickets associated with this asset.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="shadow-sm border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-primary" /> Assignment
              </CardTitle>
            </CardHeader>
            <CardContent>
              {asset.assignedToId ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 bg-card p-3 rounded-md border shadow-sm">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {asset.assignedToName?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <Link href={`/employees/${asset.assignedToId}`} className="font-medium hover:underline block">
                        {asset.assignedToName}
                      </Link>
                      <span className="text-xs text-muted-foreground">Current Owner</span>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={handleUnassign}
                    disabled={assignAsset.isPending}
                  >
                    Revoke Assignment
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 text-center">
                  <div className="p-4 bg-card rounded-md border border-dashed text-muted-foreground mb-4">
                    This asset is currently in inventory and available for assignment.
                  </div>
                  <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full">Assign Asset</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Assign Asset</DialogTitle>
                        <DialogDescription>
                          Select an employee to assign {asset.name} to.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="py-4">
                        <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an employee..." />
                          </SelectTrigger>
                          <SelectContent>
                            {employees?.map(emp => (
                              <SelectItem key={emp.id} value={emp.id.toString()}>
                                {emp.name} ({emp.department})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <DialogFooter>
                        <Button 
                          onClick={handleAssign} 
                          disabled={!selectedEmployeeId || assignAsset.isPending}
                        >
                          {assignAsset.isPending ? "Assigning..." : "Assign"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
