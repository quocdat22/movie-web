import React from 'react';
import Image from 'next/image';
import { WatchTrailerButton } from '@/components/WatchTrailerButton';
import { FavoriteButton } from '@/components/FavoriteButton';
import { MovieCommentSection } from '@/components/MovieCommentSection';
import MovieRating from '@/components/MovieRating';
import { RecommendedMovies } from '@/components/RecommendedMovies';

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
    try {
        const res = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&language=en-US&append_to_response=credits,videos`);
        if (!res.ok) {
            console.error(`Failed to fetch movie data: ${res.status} ${res.statusText}`);
            return null;
        }
        return res.json();
    } catch (error) {
        console.error('Error fetching movie data:', error);
        return null;
    }
}

async function getRecommendedMovies(movieId: string) {
    try {
        const res = await fetch(`https://recommend-movie-content-based.onrender.com/recommend?movie_id=${movieId}&top_n=10`);
        const data = await res.json();

        if (!res.ok) {
            console.error(`Failed to fetch recommended movies: ${res.status} ${res.statusText}`);
            return [];
        }

        return data;
    } catch (error) {
        console.error('Error fetching recommended movies:', error);
        return [];
    }
}

export default async function MovieDetailPage({ params }: MovieDetailPageProps) {
    const { id } = await params;
    const movie = await getMovieData(id);
    const recommendedMovies = await getRecommendedMovies(id);

    if (!movie) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <h1 className="text-2xl font-bold mb-4">Không thể tải dữ liệu phim</h1>
                <p className="text-zinc-400">Vui lòng kiểm tra kết nối mạng hoặc thử lại sau.</p>
            </div>
        );
    }

    const MovieBanner = () => (
        <div className="relative h-80 md:h-[32rem] pt-20">
            <Image
                src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
                alt={movie.title}
                fill
                className="w-full h-full object-cover object-top"
                priority
                sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent" />
        </div>
    );

    const MovieInfo = () => (
        <div className="container mx-auto px-4 pb-8 relative z-10">
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
                    <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-end justify-center md:justify-start mt-2 mb-2">
                        <MovieRating initialRating={movie.vote_average} voteCount={movie.vote_count} movieId={movie.id} />
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
            <div className="flex flex-row gap-4 overflow-x-auto whitespace-nowrap pb-2 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-900">
                {movie.credits.cast.slice(0, 14).map((member: CastMember) => (
                    <div key={member.cast_id} className="flex-shrink-0 w-24 text-center">
                        <div className="w-24 h-24 rounded-full mx-auto mb-2 bg-zinc-800 relative overflow-hidden">
                            <Image
                                src={member.profile_path ? `https://image.tmdb.org/t/p/w185${member.profile_path}` : '/no-avatar.png'}
                                alt={member.name}
                                fill
                                className="object-cover rounded-full"
                                sizes="96px"
                            />
                        </div>
                        <p className="font-semibold text-sm truncate">{member.name}</p>
                        <p className="text-xs text-zinc-400 truncate">{member.character}</p>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div>
            <div className="relative">
                <MovieBanner />
                <div className="absolute inset-x-0 bottom-0 top-1/2 flex items-end">
                    <div className="w-full bg-gradient-to-t from-zinc-950/80 via-zinc-950/60 to-transparent px-4 pb-8 pt-8 md:pt-12">
                        <MovieInfo />
                    </div>
                </div>
            </div>
            <RecommendedMovies recommendedMovies={recommendedMovies} />
            <MovieCast />
            <MovieCommentSection movieId={movie.id} />
        </div>
    );
} 