import MovieList from "@/components/MovieList";

export default function Home() {
  return (
    <main className="container mx-auto py-8">
      {/* <h1 className="text-3xl font-bold mb-6 text-center">Danh sách phim nổi bật</h1> */}
      <MovieList />
    </main>
  );
}
