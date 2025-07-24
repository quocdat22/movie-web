"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Video {
    key: string;
    site: string;
    type: string;
}

interface WatchTrailerButtonProps {
    videos: Video[];
}

export const WatchTrailerButton: React.FC<WatchTrailerButtonProps> = ({ videos }) => {
    const [open, setOpen] = useState(false);
    const officialTrailer = videos.find(video => video.type === 'Trailer' && video.site === 'YouTube');

    if (!officialTrailer) {
        return null;
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>Xem Trailer</Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl h-auto">
                <DialogHeader>
                    <DialogTitle>Trailer chính thức</DialogTitle>
                </DialogHeader>
                <div className="aspect-video">
                    <iframe
                        width="100%"
                        height="100%"
                        src={`https://www.youtube.com/embed/${officialTrailer.key}`}
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                </div>
            </DialogContent>
        </Dialog>
    );
}; 