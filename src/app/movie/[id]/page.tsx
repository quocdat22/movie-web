import React from 'react';
import Image from 'next/image';
import { WatchTrailerButton } from '@/components/WatchTrailerButton';
import { FavoriteButton } from '@/components/FavoriteButton';
import { MovieCommentSection } from '@/components/MovieCommentSection';

interface Genre {
    id: number;
    name: string;
}

interface CastMember {
    cast_id: number;
    name: string;
    character: string;
    profile_path: string | null;
}

interface MovieDetailPageParams {
    id: string;
}

interface MovieDetailPageProps {
    params: Promise<MovieDetailPageParams>;
}

async function getMovieData(id: string) {
    const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
    const res = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&language=en-US&append_to_response=credits,videos`);
    if (!res.ok) {
        throw new Error('Failed to fetch movie data');
    }
    return res.json();
}

export default async function MovieDetailPage({ params }: MovieDetailPageProps) {
    const { id } = await params;
    const movie = await getMovieData(id);

    const MovieBanner = () => (
        <div className="relative h-64 md:h-96">
            <Image
                src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
                alt={movie.title}
                fill
                className="w-full h-full object-cover object-center"
                priority
                sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent" />
        </div>
    );

    const MovieInfo = () => (
        <div className="container mx-auto px-4 -mt-16 md:-mt-24 pb-8 relative z-10">
            <div className="md:flex gap-8">
                <div className="flex-shrink-0 w-48 md:w-64 mx-auto md:mx-0 relative h-72 md:h-96">
                    <Image
                        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                        alt={movie.title}
                        fill
                        className="rounded-lg shadow-xl object-cover"
                        sizes="(max-width: 768px) 100vw, 384px"
                        priority
                    />
                </div>
                <div className="pt-6 text-center md:text-left">
                    <h1 className="text-3xl md:text-4xl font-bold">{movie.title}</h1>
                    <div className="flex flex-col sm:flex-row gap-2 items-center sm:items-end justify-center md:justify-start mt-2 mb-2">
                        <span className="flex items-center text-yellow-500 font-semibold text-base">
                            <svg width="18" height="18" fill="currentColor" viewBox="0 0 20 20" className="mr-1"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.38-2.454a1 1 0 00-1.175 0l-3.38 2.454c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z"/></svg>
                            {movie.vote_average.toFixed(1)}
                        </span>
                        <span className="text-sm text-zinc-400">{movie.release_date ? new Date(movie.release_date).getFullYear() : ''}</span>
                    </div>
                    <p className="text-zinc-400 italic">{movie.tagline}</p>
                    <div className="flex gap-2 justify-center md:justify-start mt-2">
                        {movie.genres.map((genre: Genre) => (
                            <span key={genre.id} className="px-2 py-1 bg-zinc-800 text-xs rounded">
                                {genre.name}
                            </span>
                        ))}
                    </div>
                    <p className="mt-4 max-w-2xl">{movie.overview}</p>
                    <div className="mt-6 flex justify-center md:justify-start gap-4">
                        <WatchTrailerButton videos={movie.videos.results} />
                        <FavoriteButton 
                            movieId={movie.id} 
                            movieTitle={movie.title}
                            posterPath={movie.poster_path}
                        />
                    </div>
                </div>
            </div>
        </div>
    );

    const MovieCast = () => (
        <div className="container mx-auto px-4 py-8">
            <h2 className="text-2xl font-bold mb-4">Diễn viên</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-4">
                {movie.credits.cast.slice(0, 14).map((member: CastMember) => (
                    <div key={member.cast_id} className="text-center">
                        <div className="w-24 h-24 rounded-full mx-auto mb-2 bg-zinc-800 relative overflow-hidden">
                            <Image
                                src={member.profile_path ? `https://image.tmdb.org/t/p/w185${member.profile_path}` : '/no-avatar.png'}
                                alt={member.name}
                                fill
                                className="object-cover rounded-full"
                                sizes="96px"
                            />
                        </div>
                        <p className="font-semibold text-sm">{member.name}</p>
                        <p className="text-xs text-zinc-400">{member.character}</p>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div>
            <MovieBanner />
            <MovieInfo />
            <MovieCast />
            <MovieCommentSection movieId={movie.id} />
        </div>
    );
} 