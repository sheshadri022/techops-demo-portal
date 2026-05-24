import { useState } from "react";
import { useListAssets, useCreateAsset, getListAssetsQueryKey, useListEmployees } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { format } from "date-fns";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, Filter, Monitor } from "lucide-react";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const assetSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  brand: z.string().optional(),
  model: z.string().optional(),
  serialNumber: z.string().min(1, "Serial number is required"),
  status: z.string().default("available"),
  condition: z.string().optional(),
  location: z.string().optional(),
  purchaseDate: z.string().min(1, "Purchase date is required"),
  purchasePrice: z.coerce.number().optional(),
});

type AssetFormValues = z.infer<typeof assetSchema>;

export default function Assets() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isNewOpen, setIsNewOpen] = useState(false);
  
  const queryParams = statusFilter !== "all" ? { status: statusFilter } : {};
  const { data: assets, isLoading } = useListAssets(queryParams);
  const createAsset = useCreateAsset();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<AssetFormValues>({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      name: "",
      category: "",
      brand: "",
      model: "",
      serialNumber: "",
      status: "available",
      condition: "New",
      location: "",
      purchaseDate: new Date().toISOString().split('T')[0],
      purchasePrice: undefined,
    },
  });

  const onSubmit = (data: AssetFormValues) => {
    createAsset.mutate(
      { data },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListAssetsQueryKey() });
          setIsNewOpen(false);
          form.reset();
          toast({
            title: "Asset created",
            description: "The new asset has been added to the inventory.",
          });
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to create asset. Please try again.",
            variant: "destructive",
          });
        }
      }
    );
  };

  const filteredAssets = assets?.filter((asset) => 
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (asset.brand && asset.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (asset.assignedToName && asset.assignedToName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Hardware Fleet</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-lg">Manage and track all company IT assets.</p>
        </div>
        
        <Dialog open={isNewOpen} onOpenChange={setIsNewOpen}>
          <DialogTrigger asChild>
            <Button className="shrink-0" data-testid="button-new-asset">
              <Plus className="mr-2 h-4 w-4" />
              New Asset
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Asset</DialogTitle>
              <DialogDescription>
                Enter the details of the new hardware asset to add it to the inventory.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Asset Name</FormLabel>
                        <FormControl>
                          <Input placeholder="MacBook Pro 16&quot;" {...field} data-testid="input-asset-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-asset-category">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Laptop">Laptop</SelectItem>
                            <SelectItem value="Desktop">Desktop</SelectItem>
                            <SelectItem value="Monitor">Monitor</SelectItem>
                            <SelectItem value="Phone">Phone</SelectItem>
                            <SelectItem value="Tablet">Tablet</SelectItem>
                            <SelectItem value="Peripheral">Peripheral</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="serialNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Serial Number</FormLabel>
                        <FormControl>
                          <Input placeholder="C02XX..." {...field} data-testid="input-asset-serial" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="brand"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Brand</FormLabel>
                        <FormControl>
                          <Input placeholder="Apple, Dell..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="model"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Model</FormLabel>
                        <FormControl>
                          <Input placeholder="M2 Max..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Initial Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="available">Available</SelectItem>
                            <SelectItem value="assigned">Assigned</SelectItem>
                            <SelectItem value="maintenance">Maintenance</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="purchaseDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Purchase Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="purchasePrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Purchase Price ($)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createAsset.isPending} data-testid="button-save-asset">
                    {createAsset.isPending ? "Creating..." : "Save Asset"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center bg-card p-4 rounded-lg border shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search assets by name, serial, or assignee..."
            className="pl-9 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            data-testid="input-search-assets"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="assigned">Assigned</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="retired">Retired</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border rounded-lg bg-card shadow-sm overflow-hidden overflow-x-auto">
        <Table className="min-w-[600px]">
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Asset</TableHead>
              <TableHead>Serial Number</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-[150px]" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-[80px]" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-[80px]" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-[120px]" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : filteredAssets?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Monitor className="h-10 w-10 mb-4 text-muted-foreground/50" />
                    <p className="text-lg font-medium text-foreground">No assets found</p>
                    <p className="text-sm">We couldn't find any assets matching your criteria.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredAssets?.map((asset) => (
                <TableRow key={asset.id} className="group hover:bg-muted/50 transition-colors">
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span>{asset.name}</span>
                      {asset.brand && asset.model && (
                        <span className="text-xs text-muted-foreground font-normal">
                          {asset.brand} {asset.model}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm text-muted-foreground">{asset.serialNumber}</TableCell>
                  <TableCell>{asset.category}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        asset.status === 'available' ? 'default' : 
                        asset.status === 'assigned' ? 'secondary' : 
                        asset.status === 'maintenance' ? 'destructive' : 'outline'
                      }
                      className="capitalize"
                    >
                      {asset.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {asset.assignedToName ? (
                      <Link href={`/employees/${asset.assignedToId}`} className="hover:underline hover:text-primary">
                        {asset.assignedToName}
                      </Link>
                    ) : (
                      <span className="text-muted-foreground italic text-sm">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/assets/${asset.id}`} data-testid={`link-asset-${asset.id}`}>
                        View Details
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
