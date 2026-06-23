import Link from "next/link";
import { reviewReport, setPostVisibility } from "@/actions/admin";
import { StatusBadge } from "@/components/status-badge";
import { SubmitButton } from "@/components/submit-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import { formatCategory } from "@/lib/utils";

export default async function AdminReportsPage() {
  await requireAdmin();
  const reports = await prisma.report.findMany({
    include: { post: true, reporter: true },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }]
  });

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Post</TableHead>
          <TableHead>Reason</TableHead>
          <TableHead>Reporter</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {reports.map((report) => (
          <TableRow key={report.id}>
            <TableCell>
              <Link href={`/posts/${report.postId}`} className="font-medium hover:underline">
                {report.post.title}
              </Link>
              <p className="text-xs text-muted-foreground">{report.details || "No extra details"}</p>
            </TableCell>
            <TableCell>{formatCategory(report.reason)}</TableCell>
            <TableCell>{report.reporter.name ?? report.reporter.email}</TableCell>
            <TableCell>
              <StatusBadge status={report.status} />
            </TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-2">
                <form action={reviewReport} className="flex gap-2">
                  <input type="hidden" name="reportId" value={report.id} />
                  <Select name="status" defaultValue={report.status} className="h-8 w-28">
                    <option value="OPEN">Open</option>
                    <option value="REVIEWED">Reviewed</option>
                    <option value="RESOLVED">Resolved</option>
                  </Select>
                  <SubmitButton size="sm" variant="outline">
                    Save
                  </SubmitButton>
                </form>
                <form action={setPostVisibility} className="flex gap-2">
                  <input type="hidden" name="postId" value={report.postId} />
                  <input type="hidden" name="hidden" value="true" />
                  <Input name="reason" placeholder="Hide reason" className="h-8 w-28" />
                  <SubmitButton size="sm" variant="destructive">
                    Hide post
                  </SubmitButton>
                </form>
                <Button asChild size="sm" variant="ghost">
                  <Link href={`/posts/${report.postId}`}>Open</Link>
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
