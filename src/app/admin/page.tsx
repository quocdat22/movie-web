'use client'

import { redirect } from 'next/navigation'
import { isUserAdmin } from '@/lib/auth-server'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users, Star, MessageCircle, Film, TrendingUp, Activity, RefreshCw } from 'lucide-react'
import { useState, useEffect } from 'react'

interface AnalyticsData {
  totalUsers: number
  totalFavorites: number
  totalComments: number
  totalMovies: number
  recentUsers: Array<{
    id: string
    full_name: string
    created_at: string
    role: string
  }>
  popularMovies: Array<{
    movie_id: number
    movie_title: string
    favorite_count: number
  }>
  recentComments: Array<{
    id: number
    content: string
    movie_id: number
    user_name: string
    created_at: string
    sentiment: string
  }>
  sentimentStats: {
    positive: number
    negative: number
    neutral: number
  }
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

function StatCard({ title, value, description, icon: Icon }: {
  title: string
  value: string | number
  description: string
  icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

export default function AdminPage() {
  const [updateLoading, setUpdateLoading] = useState(false)
  const [updateMessage, setUpdateMessage] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  // Check admin status and load data on client side
  useEffect(() => {
    const checkAdminAndLoadData = async () => {
      try {
        // Check if user is admin
        const adminStatus = await fetch('/api/auth/check-admin')
        const { isAdmin: adminResult } = await adminStatus.json()
        
        if (!adminResult) {
          window.location.href = '/'
          return
        }
        
        setIsAdmin(true)
        
        // Load analytics data
        const analyticsResponse = await fetch('/api/admin/analytics')
        const analyticsData = await analyticsResponse.json()
        setAnalytics(analyticsData)
      } catch (error) {
        console.error('Error checking admin or loading data:', error)
        window.location.href = '/'
      } finally {
        setLoading(false)
      }
    }
    
    checkAdminAndLoadData()
  }, [])

  const updateMovies = async () => {
    setUpdateLoading(true)
    setUpdateMessage('🔄 Đang kết nối với server...')
    
    try {
      // Create AbortController for timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 120000) // 120 seconds timeout
      
      const response = await fetch('/api/admin/update-movies', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`HTTP error! status: ${response.status} - ${errorData.error || response.statusText}`)
      }
      
      setUpdateMessage('📊 Đang xử lý dữ liệu...')
      const result = await response.json()
      
      if (result.success) {
        // Try to parse the data from the external API
        let externalData
        try {
          externalData = typeof result.data === 'string' ? JSON.parse(result.data) : result.data
        } catch {
          externalData = result.data
        }
        
        const newMoviesCount = externalData?.function_response?.newMoviesAdded || 0
        const totalMovies = externalData?.total_movies || 'N/A'
        
        if (newMoviesCount > 0) {
          setUpdateMessage(`✅ Cập nhật phim thành công! Đã thêm ${newMoviesCount} phim mới. Tổng: ${totalMovies} phim.`)
        } else {
          setUpdateMessage(`✅ Cập nhật thành công! Không có phim mới để thêm. Tổng: ${totalMovies} phim trong database.`)
        }
      } else {
        setUpdateMessage(`❌ Lỗi: ${result.details || 'Không thể cập nhật phim'}`)
      }
    } catch (error) {
      console.error('Error updating movies:', error)
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      const errorName = error instanceof Error ? error.name : ''
      
      if (errorName === 'AbortError') {
        setUpdateMessage('⏰ Timeout: Server mất quá nhiều thời gian để phản hồi. Vui lòng thử lại.')
      } else if (errorMessage.includes('Failed to fetch')) {
        setUpdateMessage('🌐 Lỗi kết nối: Không thể kết nối với server. Kiểm tra internet và thử lại.')
      } else if (errorMessage.includes('HTTP error')) {
        setUpdateMessage(`🚫 Lỗi server: ${errorMessage}`)
      } else {
        setUpdateMessage(`❌ Lỗi không xác định: ${errorMessage}. Vui lòng thử lại.`)
      }
    } finally {
      setUpdateLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2">Đang tải...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin || !analytics) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Tổng quan và phân tích dữ liệu website</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={updateMovies} 
            disabled={updateLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${updateLoading ? 'animate-spin' : ''}`} />
            {updateLoading ? 'Đang cập nhật...' : 'Cập nhật phim'}
          </Button>
        </div>
      </div>

      {updateMessage && (
        <div
          className={`mb-4 p-3 rounded-md text-sm ${
            updateLoading
              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
              : updateMessage.includes('✅')
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}
        >
          {updateMessage}
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Tổng người dùng"
          value={analytics.totalUsers}
          description="Số lượng tài khoản đã đăng ký"
          icon={Users}
        />
        <StatCard
          title="Yêu thích"
          value={analytics.totalFavorites}
          description="Tổng số phim được yêu thích"
          icon={Star}
        />
        <StatCard
          title="Bình luận"
          value={analytics.totalComments}
          description="Tổng số bình luận"
          icon={MessageCircle}
        />
        <StatCard
          title="Phim"
          value={analytics.totalMovies}
          description="Số phim trong database"
          icon={Film}
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="users">Người dùng</TabsTrigger>
          <TabsTrigger value="movies">Phim phổ biến</TabsTrigger>
          <TabsTrigger value="comments">Bình luận</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Phân tích cảm xúc
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Tích cực</span>
                    <Badge variant="default">{analytics.sentimentStats.positive}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Tiêu cực</span>
                    <Badge variant="destructive">{analytics.sentimentStats.negative}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Trung tính</span>
                    <Badge variant="secondary">{analytics.sentimentStats.neutral}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Người dùng gần đây</CardTitle>
              <CardDescription>
                Danh sách người dùng hoạt động gần đây
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{user.full_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                      {user.role === 'admin' ? 'Admin' : 'User'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Phim phổ biến nhất
              </CardTitle>
              <CardDescription>
                Những phim được yêu thích nhiều nhất
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.popularMovies.map((movie) => (
                  <div key={movie.movie_id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{movie.movie_title}</p>
                      <p className="text-sm text-muted-foreground">ID: {movie.movie_id}</p>
                    </div>
                    <Badge variant="outline">
                      {movie.favorite_count} lượt thích
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bình luận gần đây</CardTitle>
              <CardDescription>
                Danh sách bình luận mới nhất từ người dùng
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.recentComments.map((comment) => (
                  <div key={comment.id} className="border-l-4 border-primary pl-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm">{comment.content}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">
                            {comment.user_name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Movie ID: {comment.movie_id}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(comment.created_at).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                      </div>
                      <Badge 
                        variant={
                          comment.sentiment === 'positive' ? 'default' :
                          comment.sentiment === 'negative' ? 'destructive' : 'secondary'
                        }
                      >
                        {comment.sentiment === 'positive' ? 'Tích cực' :
                         comment.sentiment === 'negative' ? 'Tiêu cực' : 'Trung tính'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
