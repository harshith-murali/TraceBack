"use client";

import type { Post, PostImage } from "@prisma/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useActionState } from "react";
import { useForm } from "react-hook-form";
import { ImagePlus } from "lucide-react";
import { PendingOverlay } from "@/components/pending-overlay";
import { SubmitButton } from "@/components/submit-button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { categories, campusAreas } from "@/lib/constants";
import { initialActionState, type ActionState } from "@/lib/action-state";
import { postSchema } from "@/lib/validators";
import { formatCategory } from "@/lib/utils";

type ExistingPost = Post & { images: PostImage[] };

export function PostForm({
  action,
  post
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  post?: ExistingPost;
}) {
  const [state, formAction, pending] = useActionState(action, initialActionState);
  const {
    register,
    trigger,
    watch,
    formState: { errors }
  } = useForm<Record<string, string>>({
    resolver: zodResolver(postSchema) as never,
    defaultValues: {
      type: post?.type ?? "LOST",
      title: post?.title ?? "",
      description: post?.description ?? "",
      category: post?.category ?? "OTHER",
      location: post?.location ?? "",
      campusArea: post?.campusArea ?? "Library",
      eventDate: post?.eventDate ? new Date(post.eventDate).toISOString().slice(0, 16) : "",
      contactInfo: post?.contactInfo ?? "",
      reward: post?.reward ?? "",
      identifyingDetails: post?.identifyingDetails ?? ""
    }
  });

  const type = watch("type");

  return (
    <form
      action={formAction}
      onSubmit={async (event) => {
        const valid = await trigger();
        if (!valid) event.preventDefault();
      }}
      aria-busy={pending}
      className="grid gap-5"
    >
      <PendingOverlay show={pending} label={post ? "Uploading changes..." : "Uploading images and creating post..."} />
      {state.error ? (
        <Alert className="border-destructive/40">
          <AlertTitle>Could not save post</AlertTitle>
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}
      <fieldset disabled={pending} className="contents">
      <Card>
        <CardHeader>
          <CardTitle>{post ? "Edit post" : "Create post"}</CardTitle>
          <CardDescription>Use precise details. Private identifiers are visible only to you and admins.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Post type" error={errors.type?.message}>
              <Select {...register("type")}>
                <option value="LOST">Lost item</option>
                <option value="FOUND">Found item</option>
              </Select>
            </Field>
            <Field label="Category" error={errors.category?.message}>
              <Select {...register("category")}>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {formatCategory(category)}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <Field label="Title" error={errors.title?.message}>
            <Input {...register("title")} placeholder="Black laptop sleeve, student ID card..." />
          </Field>

          <Field label="Description" error={errors.description?.message}>
            <Textarea {...register("description")} placeholder="Describe what was lost or found, without exposing private identifiers." />
          </Field>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Specific location" error={errors.location?.message}>
              <Input {...register("location")} placeholder="Library 2nd floor reading room" />
            </Field>
            <Field label="Campus area" error={errors.campusArea?.message}>
              <Select {...register("campusArea")}>
                {campusAreas.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Date and time" error={errors.eventDate?.message}>
              <Input type="datetime-local" {...register("eventDate")} />
            </Field>
            <Field label="Contact info" error={errors.contactInfo?.message}>
              <Input {...register("contactInfo")} placeholder="Email, phone, or preferred contact channel" />
            </Field>
          </div>

          {type === "LOST" ? (
            <Field label="Reward" error={errors.reward?.message}>
              <Input {...register("reward")} placeholder="Optional" />
            </Field>
          ) : null}

          <Field label="Private identifying details" error={errors.identifyingDetails?.message}>
            <Textarea {...register("identifyingDetails")} placeholder="Serial number, marks, hidden text, or exact contents." />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Images</CardTitle>
          <CardDescription>Upload clear photos. First image becomes the listing preview.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {post?.images.length ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {post.images.map((image) => (
                <label key={image.id} className="flex items-center gap-3 rounded-md border p-3 text-sm">
                  <input type="checkbox" name="deleteImageIds" value={image.id} />
                  Remove existing image
                </label>
              ))}
            </div>
          ) : null}
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
            <ImagePlus className="h-6 w-6" />
            <span>{post ? "Add replacement or extra images" : "Upload at least one image"}</span>
            <Input name="images" type="file" accept="image/jpeg,image/png,image/webp,image/heic" multiple className="mt-2 max-w-sm" />
          </label>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => history.back()}>
          Cancel
        </Button>
        <SubmitButton pendingText={post ? "Saving..." : "Creating..."}>{post ? "Save changes" : "Create post"}</SubmitButton>
      </div>
      </fieldset>
    </form>
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
