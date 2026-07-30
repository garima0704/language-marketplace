import Link from "next/link";
import Image from "next/image";
import { Clock } from "lucide-react";

interface VideoCardProps {
  id: string;
  title: string;
  creator: string;
  thumbnail: string;
  avatar: string;
  language: string;
  level: string;
  duration: string;
  rating: number;
  views: string;
}

export default function VideoCard({
  id,
  title,
  creator,
  thumbnail,
  avatar,
  language,
  level,
  duration,
  rating,
  views,
}: VideoCardProps) {
  return (
    <Link
      href={`/videos/${id}`}
      className="group block"
    >
      {/* Thumbnail */}
      <div className="relative overflow-hidden rounded-xl">

        <Image
          src={thumbnail}
          alt={title}
          width={640}
          height={360}
          className="
            aspect-video
            w-full
            object-cover
            transition-transform
            duration-300
            group-hover:scale-105
          "
        />

        {/* Duration */}
        <div
          className="
            absolute
            bottom-2
            right-2
            rounded-md
            bg-black/80
            px-2
            py-1
            text-xs
            font-medium
            text-white
          "
        >
          {duration}
        </div>
      </div>

      {/* Details */}
      <div className="mt-4 flex gap-3">

        <Image
          src={avatar}
          alt={creator}
          width={42}
          height={42}
          className="rounded-full"
        />

        <div className="min-w-0">

          <div className="mb-2 flex flex-wrap gap-2">

            <span className="rounded-full bg-secondary px-2 py-1 text-xs font-medium text-white">
              {language}
            </span>

            <span className="rounded-full bg-soft-green px-2 py-1 text-xs">
              {level}
            </span>

          </div>

          <h3 className="line-clamp-2 font-semibold text-accent group-hover:text-dark transition">
            {title}
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            {creator}
          </p>

          <p className="mt-1 text-xs text-gray-400">
            ⭐ {rating} • {views} views
          </p>

        </div>

      </div>
    </Link>
  );
}