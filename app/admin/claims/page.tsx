import Link from "next/link";
import { StatusBadge } from "@/components/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";

export default async function AdminClaimsPage() {
  await requireAdmin();
  const claims = await prisma.claimRequest.findMany({
    include: { post: true, claimant: true },
    orderBy: { updatedAt: "desc" },
    take: 100
  });

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Post</TableHead>
          <TableHead>Claimant</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Proof</TableHead>
          <TableHead>Owner note</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {claims.map((claim) => (
          <TableRow key={claim.id}>
            <TableCell>
              <Link href={`/posts/${claim.postId}`} className="font-medium hover:underline">
                {claim.post.title}
              </Link>
            </TableCell>
            <TableCell>{claim.claimant.name ?? claim.claimant.email}</TableCell>
            <TableCell>
              <StatusBadge status={claim.status} />
            </TableCell>
            <TableCell className="max-w-xs text-muted-foreground">{claim.proofOfOwnership}</TableCell>
            <TableCell className="max-w-xs text-muted-foreground">{claim.ownerNote ?? "None"}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
