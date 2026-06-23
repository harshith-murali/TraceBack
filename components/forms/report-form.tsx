"use client";

import { createReport } from "@/actions/reports";
import { SubmitButton } from "@/components/submit-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { reportReasons } from "@/lib/constants";
import { formatCategory } from "@/lib/utils";

export function ReportForm({ postId }: { postId: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Report post</CardTitle>
        <CardDescription>Reports help moderators keep the campus feed trustworthy.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={createReport} className="grid gap-4">
          <input type="hidden" name="postId" value={postId} />
          <div className="grid gap-2">
            <Label>Reason</Label>
            <Select name="reason" required>
              {reportReasons.map((reason) => (
                <option key={reason} value={reason}>
                  {formatCategory(reason)}
                </option>
              ))}
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Details</Label>
            <Textarea name="details" placeholder="Optional context for moderators" />
          </div>
          <SubmitButton variant="outline">Report</SubmitButton>
        </form>
      </CardContent>
    </Card>
  );
}
