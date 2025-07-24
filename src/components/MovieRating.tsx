import React from "react";

interface MovieRatingProps {
  rating: number;
}

/**
 * Hiển thị điểm đánh giá phim
 */
const MovieRating: React.FC<MovieRatingProps> = ({ rating }) => (
  <div className="flex items-center gap-1 text-yellow-500 text-sm font-medium">
    <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.38-2.454a1 1 0 00-1.175 0l-3.38 2.454c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z"/></svg>
    {rating.toFixed(1)}
  </div>
);

export default MovieRating; 