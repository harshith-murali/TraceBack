import Link from "next/link";
import { ClipboardList, Handshake, LayoutDashboard, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const links = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/posts", label: "My Posts", icon: ClipboardList },
  { href: "/dashboard/claims", label: "My Claims", icon: Handshake },
  { href: "/dashboard/matches", label: "Matches", icon: Sparkles }
];

export function DashboardNav() {
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
