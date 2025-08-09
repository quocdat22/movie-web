import { NextResponse } from 'next/server'
import { isUserAdmin } from '@/lib/auth-server'
import { createClient } from '@/lib/supabase/server'

interface UserStats {
  total_users: number
  total_favorites: number
  total_comments: number
  total_movies: number
}

interface RecentUser {
  id: string
  full_name: string | null
  role: string
  updated_at: string
}

interface CommentWithProfile {
  id: number
  content: string
  movie_id: number
  created_at: string
  sentiment: string | null
  profiles: unknown
}

export async function GET() {
  try {
    const isAdmin = await isUserAdmin()
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const supabase = createClient()

    // Get total counts using admin function
    const { data: stats, error: statsError } = await supabase
      .rpc('get_user_stats_admin')
      .single()

    if (statsError) {
      console.error('Error getting stats:', statsError)
      throw statsError
    }

    // Get recent users using admin function
    const { data: recentUsers, error: usersError } = await supabase
      .rpc('get_recent_users_admin')

    if (usersError) {
      console.error('Error getting recent users:', usersError)
    }

    const userStats = stats as UserStats
    const recentUsersData = recentUsers as RecentUser[] || []

    // Get popular movies (most favorited)
    const { data: popularMovies } = await supabase
      .from('favorites')
      .select('movie_id, movie_title')
      .order('created_at', { ascending: false })

    // Count favorites per movie
    const movieFavoriteCounts = popularMovies?.reduce((acc, fav) => {
      acc[fav.movie_id] = (acc[fav.movie_id] || 0) + 1
      return acc
    }, {} as Record<number, number>) || {}

    const popularMoviesWithCounts = Object.entries(movieFavoriteCounts)
      .map(([movieId, count]) => {
        const movie = popularMovies?.find(m => m.movie_id === parseInt(movieId))
        return {
          movie_id: parseInt(movieId),
          movie_title: movie?.movie_title || 'Unknown',
          favorite_count: count
        }
      })
      .sort((a, b) => b.favorite_count - a.favorite_count)
      .slice(0, 10)

    // Get recent comments with user names
    const { data: recentComments } = await supabase
      .from('comments')
      .select(`
        id,
        content,
        movie_id,
        created_at,
        sentiment,
        profiles!inner(full_name)
      `)
      .order('created_at', { ascending: false })
      .limit(10)

    const formattedComments = (recentComments as CommentWithProfile[])?.map(comment => ({
      id: comment.id,
      content: comment.content,
      movie_id: comment.movie_id,
      created_at: comment.created_at,
      sentiment: comment.sentiment || 'neutral',
      user_name: (comment.profiles as { full_name: string | null })?.full_name || 'Anonymous'
    })) || []

    // Get sentiment statistics
    const { data: sentiments } = await supabase
      .from('comments')
      .select('sentiment')

    const sentimentStats = sentiments?.reduce((acc, comment) => {
      const sentiment = comment.sentiment || 'neutral'
      acc[sentiment as keyof typeof acc] = (acc[sentiment as keyof typeof acc] || 0) + 1
      return acc
    }, { positive: 0, negative: 0, neutral: 0 }) || { positive: 0, negative: 0, neutral: 0 }

    const analyticsData = {
      totalUsers: userStats?.total_users || 0,
      totalFavorites: userStats?.total_favorites || 0,
      totalComments: userStats?.total_comments || 0,
      totalMovies: userStats?.total_movies || 0,
      recentUsers: recentUsersData.map((user: RecentUser) => ({
        id: user.id,
        full_name: user.full_name || 'Anonymous',
        created_at: user.updated_at || '',
        role: user.role || 'user'
      })),
      popularMovies: popularMoviesWithCounts,
      recentComments: formattedComments,
      sentimentStats
    }

    return NextResponse.json(analyticsData)
  } catch (error) {
    console.error('Error getting analytics data:', error)
    return NextResponse.json({ 
      error: 'Failed to get analytics data',
      data: {
        totalUsers: 0,
        totalFavorites: 0,
        totalComments: 0,
        totalMovies: 0,
        recentUsers: [],
        popularMovies: [],
        recentComments: [],
        sentimentStats: { positive: 0, negative: 0, neutral: 0 }
      }
    }, { status: 500 })
  }
}
