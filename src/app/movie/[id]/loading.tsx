import { Skeleton } from "@/components/ui/skeleton";

export default function MovieDetailLoading() {
    const MovieBannerSkeleton = () => (
        <Skeleton className="h-64 md:h-96 w-full" />
    );

    const MovieInfoSkeleton = () => (
        <div className="container mx-auto px-4 -mt-16 md:-mt-24 pb-8 relative z-10">
            <div className="md:flex gap-8">
                <div className="flex-shrink-0 w-48 md:w-64 mx-auto md:mx-0">
                    <Skeleton className="h-72 md:h-96 w-full rounded-lg" />
                </div>
                <div className="pt-6 text-center md:text-left flex-1">
                    <Skeleton className="h-10 w-3/4 mb-2" />
                    <Skeleton className="h-5 w-1/2 mb-4" />
                    <div className="flex gap-2 justify-center md:justify-start mt-2">
                        <Skeleton className="h-6 w-16 rounded" />
                        <Skeleton className="h-6 w-20 rounded" />
                        <Skeleton className="h-6 w-24 rounded" />
                    </div>
                    <div className="mt-4 space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                    </div>
                    <div className="mt-6 flex justify-center md:justify-start gap-4">
                        <Skeleton className="h-10 w-32" />
                        <Skeleton className="h-10 w-32" />
                    </div>
                </div>
            </div>
        </div>
    );

    const MovieCastSkeleton = () => (
        <div className="container mx-auto px-4 py-8">
            <Skeleton className="h-8 w-48 mb-4" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-4">
                {Array.from({ length: 14 }).map((_, i) => (
                    <div key={i} className="text-center">
                        <Skeleton className="w-24 h-24 rounded-full mx-auto mb-2" />
                        <Skeleton className="h-4 w-20 mx-auto mb-1" />
                        <Skeleton className="h-3 w-16 mx-auto" />
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div>
            <MovieBannerSkeleton />
            <MovieInfoSkeleton />
            <MovieCastSkeleton />
        </div>
    );
} 