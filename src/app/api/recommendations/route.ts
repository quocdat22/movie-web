import { NextRequest, NextResponse } from 'next/server';

// Hàm fetch với timeout
const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeout = 10000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('user_id');
  const topK = searchParams.get('top_k') || '10';

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    const recommendUrl = `https://recommend-movie-content-based.onrender.com/recommend/user-collaborative?user_id=${userId}&top_k=${topK}`;
    
    const response = await fetchWithTimeout(recommendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    }, 10000);

    if (!response.ok) {
      const errorText = `API trả về lỗi: ${response.status} ${response.statusText}`;
      console.error(errorText);
      return NextResponse.json({ error: errorText }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    let errorMessage = 'Lỗi không xác định khi lấy dữ liệu phim gợi ý.';
    if (error instanceof Error) {
      errorMessage = error.name === 'AbortError' 
        ? 'Yêu cầu bị hủy do quá thời gian chờ (timeout)' 
        : `Lỗi khi lấy dữ liệu phim gợi ý: ${error.message}`;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    
    console.error('Error fetching recommendations:', errorMessage, error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}