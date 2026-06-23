import Link from "next/link";
import { BarChart3, ClipboardList, Flag, GitCompareArrows, Handshake } from "lucide-react";
import { Button } from "@/components/ui/button";

const links = [
  { href: "/admin", label: "Overview", icon: BarChart3 },
  { href: "/admin/posts", label: "Posts", icon: ClipboardList },
  { href: "/admin/reports", label: "Reports", icon: Flag },
  { href: "/admin/claims", label: "Claims", icon: Handshake },
  { href: "/admin/matches", label: "Matches", icon: GitCompareArrows }
];

export function AdminNav() {
  return (
    <div className="flex flex-wrap gap-2">
      {links.map((link) => {
        const Icon = link.icon;
        return (
          <Button key={link.href} asChild variant="outline" size="sm">
            <Link href={link.href}>
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          </Button>
        );
      })}
    </div>
  );
}
