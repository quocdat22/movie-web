"use client";
import React, { useEffect, useState, useCallback } from "react";
import MovieCard from "@/components/MovieCard";
import { Button } from "./ui/button";

interface Movie {
  id: number;
  title: string;
  poster_path: string;
  vote_average: number;
  release_date: string;
}

const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;

/**
 * Hiển thị danh sách phim lấy từ TMDB với chức năng "Load More"
 */
const MovieList: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const fetchMovies = useCallback(async (pageNum: number) => {
    const isFirstPage = pageNum === 1;
    if(isFirstPage) setLoading(true);
    else setLoadingMore(true);
    
    setError("");
    
    try {
      const API_URL = `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=en-US&page=${pageNum}`;
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Could not fetch movies");
      const data = await res.json();
      setMovies((prevMovies) => [...prevMovies, ...data.results]);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "An error occurred");
      } else {
        setError("An error occurred");
      }
    } finally {
      if(isFirstPage) setLoading(false);
      else setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchMovies(1);
  }, [fetchMovies]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchMovies(nextPage);
  };


  if (loading) return <div>Loading movies...</div>;
  if (error && movies.length === 0) return <div className="text-red-500">{error}</div>;

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {movies.map((movie) => (
          <MovieCard key={`${movie.id}-${Math.random()}`} movie={movie} />
        ))}
      </div>
      <div className="text-center mt-8">
        <Button onClick={handleLoadMore} disabled={loadingMore}>
          {loadingMore ? 'Loading...' : 'Load More'}
        </Button>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>
    </>
  );
};

export default MovieList; 