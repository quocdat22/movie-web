/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'image.tmdb.org',
            },
            {
                protocol: 'https',
                hostname: 'isauyjttwwcremyzlgti.supabase.co',
            },
        ],
    },
};

export default nextConfig;
