import React from "react";
import MovieImage from "./MovieImage";
import MovieTitle from "./MovieTitle";
import Link from "next/link";

interface Movie {
  id: number;
  title: string;
  poster_path: string;
  vote_average: number;
  release_date: string;
}

interface MovieCardProps {
  movie: Movie;
}

/**
 * Card hiển thị thông tin phim nguyên tử, có thể click để xem chi tiết
 */
const MovieCard: React.FC<MovieCardProps> = ({ movie }) => {
  return (
    <Link href={`/movie/${movie.id}`} className="block group">
        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow group-hover:shadow-lg transition-shadow flex flex-col overflow-hidden h-full">
        <MovieImage posterPath={movie.poster_path} title={movie.title} />
        <div className="p-3 flex flex-col flex-1">
            <MovieTitle title={movie.title} />
        </div>
        </div>
    </Link>
  );
};

export default MovieCard; 