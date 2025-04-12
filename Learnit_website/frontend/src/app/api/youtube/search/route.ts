import { NextResponse } from 'next/server';
import { auth } from '@/lib/firebaseConfig';

export async function POST(request: Request) {
  try {
    // Check if user is authenticated
    const authToken = request.headers.get('Authorization')?.split('Bearer ')[1];
    if (!authToken) {
      // Allow the request without authentication for demo purposes
      // In production, you might want to restrict this
      console.log('No auth token provided, but continuing for demo');
    }

    // Parse the request body
    const body = await request.json();
    const { query } = body;

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    // Use FireCrawl API to search for YouTube videos
    // For demo purposes, we'll make a simplified YouTube search
    // In production, use the actual FireCrawl API with your API key
    
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&key=${process.env.NEXT_PUBLIC_YOUTUBE_API_KEY}&maxResults=9`;
    
    const response = await fetch(searchUrl);
    
    if (!response.ok) {
      throw new Error('Failed to fetch videos from YouTube API');
    }
    
    const data = await response.json();
    
    // Transform the YouTube API response to match our expected format
    const videos = data.items.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnailUrl: item.snippet.thumbnails.high.url || item.snippet.thumbnails.default.url,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt
    }));

    return NextResponse.json({ videos });
  } catch (error) {
    console.error('Error in YouTube search API:', error);
    return NextResponse.json(
      { error: 'Failed to search for videos' },
      { status: 500 }
    );
  }
} 