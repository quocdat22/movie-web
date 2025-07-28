"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import MovieList from "@/components/MovieList";
import { Movie } from "@/lib/types";
import { useAuth } from "@/hooks/useAuth";

export default function RecommendedPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchRecommendedMovies = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        // Gọi API route nội bộ để lấy danh sách ID phim được gợi ý
        const response = await fetch(`/api/recommendations?user_id=${user.id}&top_k=10`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'no-store',
        });
        
        const responseData = await response.json();
        
        if (!response.ok) {
          const errorText = responseData.error || `Lỗi khi lấy dữ liệu phim gợi ý (${response.status})`;
          console.error(errorText);
          setError(errorText);
          throw new Error(errorText);
        }
        
        if (responseData.error) {
          setError(responseData.error);
          throw new Error(responseData.error);
        }
        
        const movieIds = responseData;
        
        if (!movieIds || movieIds.length === 0) {
          setMovies([]);
          setLoading(false);
          return;
        }
        
        // Lấy thông tin chi tiết của các phim từ database
        const supabase = createClient();
        const { data, error } = await supabase
          .from("movies")
          .select("*")
          .in("id", movieIds);

        if (error) {
          const errorText = `Lỗi khi lấy thông tin phim: ${error.message}`;
          console.error(errorText, error);
          setError(errorText);
          return;
        }

        setMovies(data as Movie[]);
      } catch (error) {
        console.error("Error fetching recommendations:", error);
        // Fallback: Hiển thị các phim có rating cao nhất
        try {
          const supabase = createClient();
          const { data, error } = await supabase
            .from("movies")
            .select("*")
            .order("rating", { ascending: false })
            .limit(10);

          if (error) {
            const errorText = `Lỗi khi lấy phim thay thế: ${error.message}`;
            console.error(errorText, error);
            setError(errorText);
            return;
          }

          setMovies(data as Movie[]);
          // Thông báo cho người dùng rằng đang hiển thị phim thay thế
          setError("Không thể lấy phim gợi ý, đang hiển thị phim phổ biến thay thế");
        } catch (fallbackError) {
          console.error("Fallback error:", fallbackError);
          setError("Không thể lấy dữ liệu phim. Vui lòng thử lại sau.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendedMovies();
  }, [user]);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Phim gợi ý</h1>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : !user ? (
        <div className="text-center p-8 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Vui lòng đăng nhập</h2>
          <p>Bạn cần đăng nhập để xem các phim được gợi ý dành riêng cho bạn.</p>
        </div>
      ) : movies.length === 0 && !error ? (
        <div className="text-center p-8 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Không có phim gợi ý</h2>
          <p>Hiện tại chúng tôi chưa có phim gợi ý nào cho bạn. Hãy xem và đánh giá thêm phim để nhận gợi ý tốt hơn.</p>
        </div>
      ) : (
        <>
          {error && (
            <div className="mb-6 p-4 border border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-700 rounded-md text-yellow-700 dark:text-yellow-400">
              <p className="font-medium">Lưu ý:</p>
              <p>{error}</p>
            </div>
          )}
          {movies.length > 0 && <MovieList movies={movies} showLoadMore={false} />}
        </>
      )}
    </div>
  );
}