'use client';

import React, { useState } from 'react';

import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface MovieRatingProps {
  initialRating: number;
  voteCount: number;
  movieId: number;
  onRate?: (rating: number) => void;
}


const MovieRating: React.FC<MovieRatingProps> = ({ initialRating, voteCount, movieId, onRate }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userRated, setUserRated] = useState<number | null>(null);
  const [loadingUserRating, setLoadingUserRating] = useState(false);
  const supabase = createClient();
  const { user } = useAuth();


  const handleOpenModal = async () => {
    setShowModal(true);
    setSubmitted(false);
    setError(null);
    if (user) {
      setLoadingUserRating(true);
      const { data, error: fetchError } = await supabase
        .from('movie_rating')
        .select('rating')
        .eq('movie_id', movieId)
        .eq('user_id', user.id)
        .single();
      if (!fetchError && data && typeof data.rating === 'number') {
        setSelectedRating(data.rating);
        setUserRated(data.rating);
      } else {
        setSelectedRating(null);
        setUserRated(null);
      }
      setLoadingUserRating(false);
    } else {
      setSelectedRating(null);
      setUserRated(null);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleSelect = (rating: number) => {
    setSelectedRating(rating);
  };

  const handleSubmit = async () => {
    setError(null);
    if (!selectedRating) return;
    if (!user) {
      setError('Bạn cần đăng nhập để đánh giá.');
      return;
    }
    setIsSubmitting(true);
    try {
      // Kiểm tra đã có đánh giá chưa
      const { data: existing, error: fetchError } = await supabase
        .from('movie_rating')
        .select('id')
        .eq('movie_id', movieId)
        .eq('user_id', user.id)
        .single();

      let updateError = null;
      if (existing && existing.id) {
        // Đã có, update
        const { error } = await supabase
          .from('movie_rating')
          .update({ rating: selectedRating })
          .eq('id', existing.id);
        updateError = error;
      } else {
        // Chưa có, insert
        const { error } = await supabase.from('movie_rating').insert({
          movie_id: movieId,
          user_id: user.id,
          rating: selectedRating,
        });
        updateError = error;
      }
      if (updateError) {
        setError('Có lỗi xảy ra, vui lòng thử lại.');
      } else {
        setSubmitted(true);
        setUserRated(selectedRating);
        if (onRate) onRate(selectedRating);
      }
    } catch (e) {
      setError('Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center md:items-start">
      <button
        type="button"
        className="flex items-center gap-2 px-4 py-2 rounded bg-zinc-800 hover:bg-zinc-700 transition-colors"
        tabIndex={0}
        aria-label="Xem đánh giá phim"
        onClick={handleOpenModal}
      >
        <span className="text-xl font-bold text-white">
          {initialRating.toFixed(1)}
        </span>
        <span className="text-sm text-zinc-300 font-medium underline">Đánh giá</span>
      </button>
      <p className="text-sm text-zinc-400 mt-1 pl-1">{voteCount} lượt đánh giá</p>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-zinc-900 rounded-lg shadow-lg p-6 w-80 relative animate-fade-in">
            <button
              className="absolute top-2 right-2 text-zinc-400 hover:text-white text-xl"
              onClick={handleCloseModal}
              aria-label="Đóng"
            >
              ×
            </button>
            <h2 className="text-lg font-bold mb-4 text-center">Đánh giá phim</h2>
            {submitted ? (
              <div className="text-green-400 text-center font-semibold py-6">Cảm ơn bạn đã đánh giá!</div>
            ) : (
              <>
                {error && <div className="text-red-400 text-center mb-2 text-sm">{error}</div>}
                {loadingUserRating ? (
                  <div className="text-zinc-400 text-center mb-4">Đang tải...</div>
                ) : (
                  <>
                    <div className="flex justify-center gap-2 mb-4">
                      {[...Array(10)].map((_, i) => (
                        <button
                          key={i + 1}
                          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold transition-colors
                            ${selectedRating === i + 1 ? 'bg-yellow-500 border-yellow-500 text-white' : 'bg-zinc-800 border-zinc-600 text-zinc-200 hover:bg-yellow-500 hover:border-yellow-500 hover:text-white'}`}
                          onClick={() => handleSelect(i + 1)}
                          disabled={isSubmitting}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                    <button
                      className="w-full py-2 rounded bg-yellow-500 hover:bg-yellow-600 text-white font-semibold disabled:opacity-60"
                      onClick={handleSubmit}
                      disabled={selectedRating === null || isSubmitting}
                    >
                      {userRated !== null ? (isSubmitting ? 'Đang cập nhật...' : 'Cập nhật đánh giá') : (isSubmitting ? 'Đang gửi...' : 'Gửi đánh giá')}
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieRating;
