import Link from "next/link";
import { StatusBadge } from "@/components/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";

export default async function AdminMatchesPage() {
  await requireAdmin();
  const matches = await prisma.matchSuggestion.findMany({
    include: { lostPost: true, foundPost: true },
    orderBy: { confidence: "desc" },
    take: 100
  });

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Confidence</TableHead>
          <TableHead>Lost post</TableHead>
          <TableHead>Found post</TableHead>
          <TableHead>State</TableHead>
          <TableHead>Signals</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {matches.map((match) => (
          <TableRow key={match.id}>
            <TableCell className="font-semibold">{match.confidence}%</TableCell>
            <TableCell>
              <Link href={`/posts/${match.lostPostId}`} className="hover:underline">
                {match.lostPost.title}
              </Link>
            </TableCell>
            <TableCell>
              <Link href={`/posts/${match.foundPostId}`} className="hover:underline">
                {match.foundPost.title}
              </Link>
            </TableCell>
            <TableCell>
              <div className="flex gap-2">
                <StatusBadge status={match.lostPost.status} />
                <StatusBadge status={match.foundPost.status} />
              </div>
            </TableCell>
            <TableCell className="max-w-sm text-xs text-muted-foreground">{JSON.stringify(match.signals)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
