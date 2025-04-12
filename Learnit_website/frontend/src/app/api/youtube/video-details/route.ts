import { NextResponse } from 'next/server';
import { getSubtitles } from 'youtube-captions-scraper';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

export async function POST(request: Request) {
  try {
    const { videoId } = await request.json();

    if (!videoId) {
      return NextResponse.json({ error: 'Video ID is required' }, { status: 400 });
    }

    // Fetch video details from YouTube API
    const videoDetailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${process.env.NEXT_PUBLIC_YOUTUBE_API_KEY}`;
    const videoResponse = await fetch(videoDetailsUrl);
    const videoData = await videoResponse.json();

    if (!videoData.items?.[0]) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    const snippet = videoData.items[0].snippet;

    // Get video transcript
    let transcript = '';
    try {
      const subtitles = await getSubtitles({ videoID: videoId });
      transcript = subtitles.map(sub => sub.text).join(' ');
    } catch (error) {
      console.error('Transcript error:', error);
      transcript = 'Transcript not available for this video.';
    }

    // Generate summary using Gemini
    let summary = '';
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      const prompt = `Summarize this YouTube video about ${snippet.title}:\n\n${transcript}\n\nProvide a concise summary focusing on the main points and key takeaways.`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      summary = response.text();
    } catch (error) {
      console.error('Summary generation error:', error);
      summary = 'Summary generation failed. Please try again later.';
    }

    return NextResponse.json({
      videoId,
      title: snippet.title,
      channelTitle: snippet.channelTitle,
      description: snippet.description,
      thumbnailUrl: snippet.thumbnails.high?.url || snippet.thumbnails.default?.url,
      transcript,
      summary
    });

  } catch (error) {
    console.error('Video details error:', error);
    return NextResponse.json({ error: 'Failed to fetch video details' }, { status: 500 });
  }
}