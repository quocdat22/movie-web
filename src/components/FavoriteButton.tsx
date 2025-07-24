"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, Loader2 } from 'lucide-react';
import { AuthModal } from './AuthModal';
import { useFavorites } from '@/context/FavoritesContext';
import { useAuth } from '@/hooks/useAuth'; // We will create this custom hook

interface FavoriteButtonProps {
    movieId: number;
    movieTitle: string;
    posterPath: string;
}

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({ movieId, movieTitle, posterPath }) => {
    const { favoriteIds, addFavorite, removeFavorite, loading: favoritesLoading } = useFavorites();
    const { user, loading: authLoading } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isFavorited = favoriteIds.has(movieId);
    
    const handleFavoriteToggle = async () => {
        if (!user) return;
        setIsSubmitting(true);

        try {
            if (isFavorited) {
                await removeFavorite(movieId);
            } else {
                await addFavorite(movieId, movieTitle, posterPath);
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const isLoading = authLoading || favoritesLoading;

    if (isLoading) {
        return <Button variant="secondary" disabled><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Favorite</Button>;
    }

    if (!user) {
        return (
            <AuthModal>
                <Button variant="secondary"><Heart className="mr-2 h-4 w-4" /> Favorite</Button>
            </AuthModal>
        );
    }

    return (
        <Button variant={isFavorited ? "default" : "secondary"} onClick={handleFavoriteToggle} disabled={isSubmitting}>
            {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <Heart className={`mr-2 h-4 w-4 ${isFavorited ? 'fill-red-500' : ''}`} />
            )}
            {isSubmitting ? 'Processing...' : isFavorited ? 'Favorited' : 'Favorite'}
        </Button>
    );
}; 