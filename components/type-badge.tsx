import { Badge } from "@/components/ui/badge";

export function TypeBadge({ type }: { type: "LOST" | "FOUND" | string }) {
  return <Badge variant={type === "LOST" ? "destructive" : "success"}>{type.toLowerCase()}</Badge>;
}
