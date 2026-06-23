import { Skeleton } from "@/components/ui/skeleton";

export default function NewPostLoading() {
  return <PostFormSkeleton />;
}

function PostFormSkeleton() {
  return (
    <div className="container max-w-4xl py-8">
      <Skeleton className="h-9 w-48" />
      <Skeleton className="mt-2 h-4 w-96 max-w-full" />
      <div className="mt-6 grid gap-5">
        <Skeleton className="h-[520px] w-full" />
        <Skeleton className="h-56 w-full" />
        <div className="flex justify-end gap-3">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    </div>
  );
}
