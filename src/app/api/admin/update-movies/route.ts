import { NextRequest, NextResponse } from 'next/server'
import { isUserAdmin } from '@/lib/auth-server'

export async function POST(request: NextRequest) {
  try {
    // Check if user is admin
    const isAdmin = await isUserAdmin()
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Create AbortController for timeout (2 minutes)
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 120000)

    try {
      // Call external API
      const response = await fetch('https://recommend-movie-content-based.onrender.com/update-movies', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`External API error: ${response.status} ${response.statusText}`)
      }

      // Get response data
      const data = await response.text()
      
      return NextResponse.json({ 
        success: true, 
        message: 'Movies updated successfully',
        data: data 
      })
    } catch (fetchError) {
      clearTimeout(timeoutId)
      
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return NextResponse.json(
          { 
            error: 'Request timeout',
            details: 'External service took too long to respond'
          },
          { status: 408 }
        )
      }
      
      throw fetchError
    }

  } catch (error) {
    console.error('Error updating movies:', error)
    return NextResponse.json(
      { 
        error: 'Failed to update movies',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
