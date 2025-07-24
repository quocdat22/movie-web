"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

interface FavoritesContextType {
    favoriteIds: Set<number>;
    addFavorite: (movieId: number, movieTitle: string, posterPath: string) => Promise<void>;
    removeFavorite: (movieId: number) => Promise<void>;
    loading: boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const useFavorites = () => {
    const context = useContext(FavoritesContext);
    if (!context) {
        throw new Error('useFavorites must be used within a FavoritesProvider');
    }
    return context;
};

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
    const supabase = createClient();
    const [user, setUser] = useState<User | null>(null);
    const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
    const [loading, setLoading] = useState(true);

    const fetchFavoriteIds = useCallback(async (userId: string) => {
        setLoading(true);
        const { data, error } = await supabase
            .from('favorites')
            .select('movie_id')
            .eq('user_id', userId);
        
        if (error) {
            console.error('Error fetching favorite IDs:', error);
            setFavoriteIds(new Set());
        } else {
            const ids = new Set(data.map(fav => fav.movie_id));
            setFavoriteIds(ids);
        }
        setLoading(false);
    }, [supabase]);

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            const currentUser = session?.user ?? null;
            setUser(currentUser);
            if (currentUser) {
                fetchFavoriteIds(currentUser.id);
            } else {
                setFavoriteIds(new Set());
                setLoading(false);
            }
        });

        // Initial check
        const checkInitialUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
             if (user) {
                setUser(user);
                await fetchFavoriteIds(user.id);
            } else {
                setLoading(false);
            }
        }
        checkInitialUser();

        return () => subscription.unsubscribe();
    }, [supabase, fetchFavoriteIds]);

    const addFavorite = async (movieId: number, movieTitle: string, posterPath: string) => {
        if (!user) throw new Error("User not logged in");
        
        const { error } = await supabase
            .from('favorites')
            .insert({ user_id: user.id, movie_id: movieId, movie_title: movieTitle, movie_poster_path: posterPath });

        if (error) throw error;

        setFavoriteIds(prev => new Set(prev).add(movieId));
    };

    const removeFavorite = async (movieId: number) => {
        if (!user) throw new Error("User not logged in");

        const { error } = await supabase
            .from('favorites')
            .delete()
            .match({ user_id: user.id, movie_id: movieId });

        if (error) throw error;
        
        setFavoriteIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(movieId);
            return newSet;
        });
    };

    const value = { favoriteIds, addFavorite, removeFavorite, loading };

    return (
        <FavoritesContext.Provider value={value}>
            {children}
        </FavoritesContext.Provider>
    );
}; 