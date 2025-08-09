import { NextResponse } from 'next/server'
import { isUserAdmin } from '@/lib/auth-server'

export async function GET() {
  try {
    const isAdmin = await isUserAdmin()
    return NextResponse.json({ isAdmin })
  } catch (error) {
    console.error('Error checking admin status:', error)
    return NextResponse.json({ isAdmin: false }, { status: 500 })
  }
}
