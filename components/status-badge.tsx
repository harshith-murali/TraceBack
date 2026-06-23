import { Badge } from "@/components/ui/badge";

export function StatusBadge({ status }: { status: string }) {
  const variant =
    status === "OPEN" ? "success" : status === "MATCHED" ? "warning" : status === "RETURNED" ? "secondary" : "destructive";

  return <Badge variant={variant}>{status.toLowerCase()}</Badge>;
}
