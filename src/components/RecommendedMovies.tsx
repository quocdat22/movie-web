import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface RecommendedMovie {
    id: number;
    title: string;
    poster_path: string;
}

interface RecommendedMoviesProps {
    recommendedMovies: RecommendedMovie[];
}

export const RecommendedMovies = ({ recommendedMovies }: RecommendedMoviesProps) => {
    if (!recommendedMovies || recommendedMovies.length === 0) {
        return (
            <div className="container mx-auto px-4 py-8">
                <h2 className="text-2xl font-bold mb-4">Phim gợi ý</h2>
                <p className="text-zinc-400 text-center">Không có phim được gợi ý.</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h2 className="text-2xl font-bold mb-4">Phim gợi ý</h2>
            <div className="flex flex-row gap-4 overflow-x-auto whitespace-nowrap pb-2 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-900">
                {recommendedMovies.map((movie: RecommendedMovie) => (
                    <Link key={movie.id} href={`/movie/${movie.id}`} className="flex-shrink-0 w-32 text-center">
                        <div className="w-32 h-48 rounded-lg mx-auto mb-2 bg-zinc-800 relative overflow-hidden">
                            <Image
                                src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '/no-image.png'}
                                alt={movie.title}
                                fill
                                className="object-cover rounded-lg"
                                sizes="128px"
                            />
                        </div>
                        <p className="font-semibold text-sm truncate text-white">{movie.title}</p>
                    </Link>
                ))}
            </div>
        </div>
    );
}; 