"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import MovieCard from '@/components/MovieCard';
import { Button } from '@/components/ui/button';
import { AuthModal } from '@/components/AuthModal';
import { Trash } from "lucide-react";
import { toast } from "sonner";

interface FavoriteMovie {
    id: number;
    movie_id: number;
    movie_title: string;
    movie_poster_path: string;
    // We need to construct the movie object to match what MovieCard expects
    title: string;
    poster_path: string;
    vote_average: number; // MovieCard might need this, let's provide a default
    release_date: string; // MovieCard might need this, let's provide a default
}

export default function FavoritesPage() {
    const supabase = createClient();
    const [user, setUser] = useState<User | null>(null);
    const [favorites, setFavorites] = useState<FavoriteMovie[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            if (user) {
                const { data, error } = await supabase
                    .from('favorites')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                if (error) {
                    console.error('Error fetching favorites:', error);
                } else {
                    // Map the data to fit the MovieCard props
                    const formattedFavorites = data.map(fav => ({
                        ...fav,
                        // id: fav.id, // giữ nguyên id của bản ghi favorites
                        title: fav.movie_title,
                        poster_path: fav.movie_poster_path,
                        vote_average: 0, // Default value
                        release_date: '' // Default value
                    }));
                    setFavorites(formattedFavorites);
                }
            }
            setLoading(false);
        };
        fetchUserData();

        const { data: authListener } = supabase.auth.onAuthStateChange(
            (event, session) => {
              if (event === 'SIGNED_IN') {
                setUser(session?.user ?? null);
                fetchUserData();
              }
              if (event === 'SIGNED_OUT') {
                setUser(null);
                setFavorites([]);
              }
            }
        );

        return () => {
            authListener.subscription.unsubscribe();
        };

    }, [supabase]);

    const handleDeleteFavorite = async (favoriteId: number) => {
        setLoading(true);
        const { error } = await supabase
            .from('favorites')
            .delete()
            .eq('id', favoriteId);

        if (error) {
            console.error('Error deleting favorite:', error);
            toast.error('Xóa phim yêu thích thất bại!');
        } else {
            setFavorites((prev) => prev.filter((fav) => fav.id !== favoriteId));
            toast.success('Đã xóa phim khỏi danh sách yêu thích!');
        }
        setLoading(false);
    };

    if (loading) {
        return <div className="container mx-auto py-8 text-center">Loading your favorites...</div>;
    }

    if (!user) {
        return (
            <div className="container mx-auto py-8 text-center">
                <h1 className="text-2xl font-bold mb-4">Please Log In</h1>
                <p className="mb-6">You need to be logged in to see your favorite movies.</p>
                <AuthModal>
                    <Button>Log In / Sign Up</Button>
                </AuthModal>
            </div>
        );
    }
    
    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-6">Your Favorite Movies</h1>
            {favorites.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {favorites.map((movie) => (
                        <div key={movie.id} className="relative group">
                            <button
                                className="absolute top-2 right-2 z-10 p-1 rounded-full bg-white/80 hover:bg-red-500 hover:text-white transition-colors shadow group-hover:opacity-100 opacity-70"
                                title="Xóa khỏi yêu thích"
                                type="button"
                                onClick={() => handleDeleteFavorite(movie.id)}
                            >
                                <Trash size={18} />
                            </button>
                            <MovieCard movie={movie} />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-10">
                    <p>You haven&apos;t added any movies to your favorites yet.</p>
                </div>
            )}
        </div>
    );
} 