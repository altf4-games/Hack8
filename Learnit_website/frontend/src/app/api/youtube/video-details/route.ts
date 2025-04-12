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
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-2.0-flash',
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      });
      
      const prompt = `Summarize this YouTube video about ${snippet.title}:

Below is the transcript of the video. Create a visually appealing, well-structured summary optimized for a display following these guidelines:

1. Start with a captivating title using "# " format (use the video title or create a more concise one).
2. Add a brief overview (2-3 sentences) of what the video covers, formatted with some visual separation.
3. Create 3-4 clear subheadings using "## " format that organize the main topics.
4. Under each subheading:
   - Use elegant bullet points (• ) with proper spacing and indentation
   - Format each bullet with adequate whitespace between points
   - Use **bold text** for important concepts and *italics* for emphasis
   - Keep points visually distinct with clean breaks between them
5. End with a "## Key Takeaways" section containing 3-4 well-formatted bullet points.

IMPORTANT FORMATTING REQUIREMENTS:
- Include empty lines between major sections for visual breathing room
- Use horizontal dividers (---) between major sections if appropriate
- Consider using emoji sparingly for visual interest (📌, 🔑, 💡, ✅) at key points
- Structure the content to fit comfortably in a display

TRANSCRIPT:
${transcript.substring(0, 15000)}`;
      
      const chat = model.startChat({
        history: [],
        generationConfig: {
          maxOutputTokens: 1024,
        },
      });

      // Execute the generation with a timeout of 30 seconds
      const result = await Promise.race([
        chat.sendMessage(prompt),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Gemini API timeout after 30 seconds")), 30000)
        ),
      ]);
      
      // Handle the timeout case
      if (result instanceof Error) throw result;
      
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