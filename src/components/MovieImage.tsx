import React from "react";
import Image from "next/image";

interface MovieImageProps {
  posterPath: string;
  title: string;
}

/**
 * Hiển thị ảnh poster phim
 */
const MovieImage: React.FC<MovieImageProps> = ({ posterPath, title }) => {
  const imageUrl = posterPath
    ? `https://image.tmdb.org/t/p/w500${posterPath}`
    : "/no-image.png";
  return (
    <div className="w-full h-64 relative bg-zinc-200 dark:bg-zinc-800">
      <Image
        src={imageUrl}
        alt={title}
        fill
        className="object-cover object-top rounded"
        sizes="(max-width: 768px) 100vw, 320px"
        loading="lazy"
        unoptimized={imageUrl === "/no-image.png"}
      />
    </div>
  );
};

export default MovieImage; 