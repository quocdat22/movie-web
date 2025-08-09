# Copilot Instructions for Movie Web App

## Architecture Overview

This is a **Next.js 15 App Router** movie discovery app with **Supabase authentication** and **TMDB API integration**. The app follows atomic component design and server-side rendering patterns.

### Core Data Flow
- **TMDB API** → Movie data, images, search, trailers
- **Supabase** → User auth, favorites storage, comments
- **External ML API** → Movie recommendations (`recommend-movie-content-based.onrender.com`)

## Key Patterns & Conventions

### Supabase Client Pattern
Always use the appropriate client for the context:
- `@/lib/supabase/client` - Client components only
- `@/lib/supabase/server` - Server components (uses modern async cookie handling)
- `@/lib/supabase/middleware` - Middleware session refresh

```tsx
// Server component
import { createClient } from '@/lib/supabase/server'
const supabase = createClient()

// Client component  
import { createClient } from '@/lib/supabase/client'
const supabase = createClient()
```

### Component Architecture
Components follow atomic design with specific responsibilities:
- **MovieCard** - Link wrapper with hover effects
- **MovieImage/MovieTitle/MovieRating** - Atomic display components
- **MovieList** - Data fetching + infinite scroll pattern
- **FavoriteButton** - Supabase integration for user favorites

### State Management
- **FavoritesContext** - Global favorites state with Supabase sync
- **useAuth hook** - User session management
- Auth state changes automatically sync across components via Supabase listeners

### TMDB Integration
All TMDB calls use `NEXT_PUBLIC_TMDB_API_KEY`:
```tsx
const API_URL = `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&page=${page}`
// Images: https://image.tmdb.org/t/p/w500${poster_path}
```

### Authentication Flow
1. **Middleware** (`src/middleware.ts`) refreshes sessions on all routes
2. **Auth callbacks** handle OAuth redirects via `/auth/callback/route.ts`
3. **Environment-specific redirects** use `NEXT_PUBLIC_SITE_URL`

## Development Workflow

### Setup Requirements
```bash
# Install with Turbopack for faster dev
npm run dev

# Required environment variables
NEXT_PUBLIC_TMDB_API_KEY=your_key
NEXT_PUBLIC_SUPABASE_URL=your_url  
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000  # Critical for auth redirects
```

### UI System
- **shadcn/ui** components in `src/components/ui/`
- **Tailwind v4** with CSS variables for theming
- **Radix UI** primitives for complex components
- **next-themes** for dark/light mode with system preference

### Error Handling Patterns
- Server actions return null on fetch failures (see `getMovieData`)
- Client components show loading states during async operations
- Toast notifications via **Sonner** for user feedback

## Integration Points

### External Services
- **TMDB API** - Movie data, requires API key, rate limited
- **ML Recommendation API** - Content-based filtering at `recommend-movie-content-based.onrender.com`
- **Supabase** - Auth + database with RLS policies

### Database Schema (Supabase)
- `favorites` table: `user_id`, `movie_id`, `movie_title`, `poster_path`
- Auth handled by Supabase built-in user management

### File Organization
- `/src/app/` - App Router pages and API routes
- `/src/components/` - Reusable UI components  
- `/src/lib/` - Utilities, types, Supabase clients
- `/src/context/` - React context providers
- `/src/hooks/` - Custom React hooks

When adding features, maintain the atomic component pattern and ensure proper client/server boundary handling for Supabase operations.
