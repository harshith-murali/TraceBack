import { Skeleton } from "@/components/ui/skeleton";

export default function PostDetailLoading() {
  return (
    <div className="container grid gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="grid gap-6">
        <div>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="mt-3 h-10 w-2/3" />
          <Skeleton className="mt-3 h-4 w-96 max-w-full" />
        </div>
        <Skeleton className="aspect-[4/3] w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
      <div className="grid h-fit gap-4">
        <Skeleton className="h-44 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
}
