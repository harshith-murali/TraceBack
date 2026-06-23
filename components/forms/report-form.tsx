"use client";

import { useActionState } from "react";
import { createReport } from "@/actions/reports";
import { PendingOverlay } from "@/components/pending-overlay";
import { SubmitButton } from "@/components/submit-button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { initialActionState } from "@/lib/action-state";
import { reportReasons } from "@/lib/constants";
import { formatCategory } from "@/lib/utils";

export function ReportForm({ postId }: { postId: string }) {
  const [state, formAction, pending] = useActionState(createReport, initialActionState);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Report post</CardTitle>
        <CardDescription>Reports help moderators keep the campus feed trustworthy.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} aria-busy={pending} className="grid gap-4">
          <PendingOverlay show={pending} label="Submitting report..." />
          {state.error ? (
            <Alert className="border-destructive/40">
              <AlertTitle>Could not submit report</AlertTitle>
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          ) : null}
          <fieldset disabled={pending} className="contents">
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
          <SubmitButton variant="outline" pendingText="Reporting...">
            Report
          </SubmitButton>
          </fieldset>
        </form>
      </CardContent>
    </Card>
  );
}
