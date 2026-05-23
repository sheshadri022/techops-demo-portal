import { useListAssets } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Monitor, Package } from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  available: "bg-green-100 text-green-700 border-green-200",
  assigned: "bg-blue-100 text-blue-700 border-blue-200",
  maintenance: "bg-amber-100 text-amber-700 border-amber-200",
  retired: "bg-gray-100 text-gray-600 border-gray-200",
};

export default function MyAssets() {
  const { data: assets, isLoading } = useListAssets({ status: "assigned" });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Equipment</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Hardware currently assigned to you</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 rounded-lg" />)}
        </div>
      ) : !assets || assets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Package className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <p className="text-lg font-semibold text-muted-foreground">No equipment assigned</p>
          <p className="text-sm text-muted-foreground/60 mt-1">Contact IT if you're missing hardware.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {assets.map((asset) => (
            <Card key={asset.id} className="hover:shadow-sm transition-shadow" data-testid={`asset-card-${asset.id}`}>
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Monitor className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-foreground text-sm">{asset.name}</p>
                        {asset.brand && asset.model && (
                          <p className="text-xs text-muted-foreground mt-0.5">{asset.brand} {asset.model}</p>
                        )}
                      </div>
                      <Badge variant="outline" className={`text-xs flex-shrink-0 ${STATUS_STYLES[asset.status] ?? ""}`}>
                        {asset.status}
                      </Badge>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <div><span className="font-medium text-foreground/60">Serial</span><br />{asset.serialNumber}</div>
                      {asset.location && <div><span className="font-medium text-foreground/60">Location</span><br />{asset.location}</div>}
                      {asset.warrantyExpiry && (
                        <div><span className="font-medium text-foreground/60">Warranty</span><br />{asset.warrantyExpiry}</div>
                      )}
                      <div><span className="font-medium text-foreground/60">Category</span><br />{asset.category}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
