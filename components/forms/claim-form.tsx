"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useActionState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createClaimRequest } from "@/actions/claims";
import { SubmitButton } from "@/components/submit-button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { initialActionState } from "@/lib/action-state";
import { claimSchema } from "@/lib/validators";

type ClaimValues = z.infer<typeof claimSchema>;

export function ClaimForm({ postId }: { postId: string }) {
  const [state, formAction, pending] = useActionState(createClaimRequest, initialActionState);
  const {
    register,
    trigger,
    formState: { errors }
  } = useForm<ClaimValues>({
    resolver: zodResolver(claimSchema),
    defaultValues: { postId, message: "", proofOfOwnership: "", contactPreference: "" }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Send claim request</CardTitle>
        <CardDescription>Share proof only the true owner would know. Supporting images are optional.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          action={formAction}
          onSubmit={async (event) => {
            const valid = await trigger();
            if (!valid) event.preventDefault();
          }}
          aria-busy={pending}
          className="grid gap-4"
        >
          {state.error ? (
            <Alert className="border-destructive/40">
              <AlertTitle>Could not submit claim</AlertTitle>
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          ) : null}
          <fieldset disabled={pending} className="contents">
          <input type="hidden" {...register("postId")} value={postId} />
          <Field label="Message" error={errors.message?.message}>
            <Textarea {...register("message")} />
          </Field>
          <Field label="Proof of ownership" error={errors.proofOfOwnership?.message}>
            <Textarea {...register("proofOfOwnership")} />
          </Field>
          <Field label="Contact preference" error={errors.contactPreference?.message}>
            <Input {...register("contactPreference")} placeholder="Email, phone, or campus meeting preference" />
          </Field>
          <Field label="Supporting images">
            <Input name="supportingImages" type="file" accept="image/jpeg,image/png,image/webp,image/heic" multiple />
          </Field>
          <SubmitButton pendingText="Submitting...">Submit claim</SubmitButton>
          </fieldset>
        </form>
      </CardContent>
    </Card>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
