import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import type { Post, PostImage, User } from "@prisma/client";
import { MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { TypeBadge } from "@/components/type-badge";
import { cloudinaryImage } from "@/lib/cloudinary";
import { formatCategory } from "@/lib/utils";

type PostCardPost = Post & {
  images: PostImage[];
  owner?: Pick<User, "name" | "imageUrl">;
};

export function PostCard({ post }: { post: PostCardPost }) {
  const image = post.images[0];

  return (
    <Link href={`/posts/${post.id}`} className="group block">
      <Card className="h-full overflow-hidden transition hover:-translate-y-0.5 hover:border-primary/50">
        <div className="relative aspect-[4/3] bg-muted">
          {image ? (
            <Image
              src={cloudinaryImage(image.url, 640, 480)}
              alt={image.alt ?? post.title}
              fill
              className="object-cover transition group-hover:scale-[1.02]"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          ) : null}
          <div className="absolute left-3 top-3 flex gap-2">
            <TypeBadge type={post.type} />
            <StatusBadge status={post.status} />
          </div>
        </div>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="line-clamp-1 text-base font-semibold">{post.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{formatCategory(post.category)}</p>
            </div>
            <span className="shrink-0 text-xs text-muted-foreground">
              {formatDistanceToNow(post.createdAt, { addSuffix: true })}
            </span>
          </div>
          <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{post.description}</p>
          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            <span className="line-clamp-1">{post.location}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
