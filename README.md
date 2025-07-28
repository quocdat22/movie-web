This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Environment Variables

This project requires the following environment variables:

```
# TMDB API Key
NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_api_key

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Site URL (important for authentication redirects)
NEXT_PUBLIC_SITE_URL=your_production_url
```

### Authentication Configuration

For authentication to work properly in both development and production environments:

1. Create a `.env.local` file for development with:
   ```
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

2. In production (Vercel), set the environment variable:
   ```
   NEXT_PUBLIC_SITE_URL=https://your-production-domain.com
   ```

3. In Supabase Authentication settings, add both URLs to the "Redirect URLs" list:
   - `http://localhost:3000/auth/callback` (for development)
   - `https://your-production-domain.com/auth/callback` (for production)
