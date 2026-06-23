import Link from "next/link";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function NotFound() {
  return (
    <div className="container py-16">
      <EmptyState
        icon={<SearchX className="h-5 w-5" />}
        title="Nothing found here"
        description="The page or listing you opened is not available."
        action={
          <Button asChild>
            <Link href="/posts">Browse posts</Link>
          </Button>
        }
      />
    </div>
  );
}
