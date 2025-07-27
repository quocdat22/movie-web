export interface Movie {
  id: number;
  title: string;
  poster_path?: string | null; // Make poster_path optional and allow null
  vote_average: number;
  release_date: string;
} 