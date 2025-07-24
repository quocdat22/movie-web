import React from "react";

interface MovieTitleProps {
  title: string;
}

/**
 * Hiển thị tiêu đề phim
 */
const MovieTitle: React.FC<MovieTitleProps> = ({ title }) => (
  <h2 className="text-base font-semibold mb-1 line-clamp-2" title={title}>
    {title}
  </h2>
);

export default MovieTitle; 