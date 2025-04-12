import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// Import the Google Generative AI library
// For production, you would need to install the @google/generative-ai package
// npm install @google/generative-ai

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    const { text, type, title } = body;

    if (!text) {
      return NextResponse.json(
        { error: 'Text content is required' },
        { status: 400 }
      );
    }

    // Get the Gemini API key from environment variables
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error('NEXT_PUBLIC_GEMINI_API_KEY is not defined');
      return NextResponse.json(
        { error: 'API key is not configured' },
        { status: 500 }
      );
    }

    // Prepare prompt based on content type
    let prompt = '';
    
    if (type === 'youtube') {
      prompt = `You are an educational assistant summarizing a YouTube video. 
      
      The title of the video is: "${title}"
      
      Below is the transcript of the video. Create a visually appealing, well-structured summary optimized for a SEMI-FULLSCREEN DISPLAY following these guidelines:
      
      1. Start with a captivating title using "# " format (use the video title or create a more concise one).
      2. Add a brief overview (2-3 sentences) of what the video covers, formatted with some visual separation.
      3. Create 3-4 clear subheadings using "## " format that organize the main topics.
      4. Under each subheading:
         - Use elegant bullet points (• ) with proper spacing and indentation
         - Format each bullet with adequate whitespace between points
         - Use **bold text** for important concepts and *italics* for emphasis
         - Keep points visually distinct with clean breaks between them
         - Use short paragraphs with 2-3 sentences maximum
      5. End with a "## Key Takeaways" section containing 3-4 well-formatted bullet points.
      
      IMPORTANT FORMATTING REQUIREMENTS:
      - Include empty lines between major sections for visual breathing room
      - Use horizontal dividers (---) between major sections if appropriate
      - Consider using emoji sparingly for visual interest (📌, 🔑, 💡, ✅) at key points
      - Format timestamps or references in \`code format\` for visual distinction
      - Structure the content to fit comfortably in a semi-fullscreen card-like display
      - Create visual hierarchy with proper spacing and formatting
      - Optimize readability by keeping paragraphs and bullet points concise
      
      TRANSCRIPT:
      ${text.substring(0, 15000)}`; // Limit text to avoid token limits
    } else {
      // Default prompt for other content types
      prompt = `Please create a visually appealing, well-structured summary of the following text, optimized for a SEMI-FULLSCREEN DISPLAY:
      
      1. Start with a captivating title using "# " format that captures the main topic.
      2. Add a brief overview (2-3 sentences) of the main topic with visual separation.
      3. Create 3-4 clear subheadings using "## " format that organize the key themes.
      4. Under each subheading:
         - Use elegant bullet points (• ) with proper spacing and indentation
         - Format each bullet with adequate whitespace between points
         - Use **bold text** for important concepts and *italics* for emphasis
         - Keep points visually distinct with clean breaks between them
         - Use short paragraphs with 2-3 sentences maximum
      5. End with a "## Key Takeaways" section with 3-4 well-formatted bullet points.
      
      IMPORTANT FORMATTING REQUIREMENTS:
      - Include empty lines between major sections for visual breathing room
      - Use horizontal dividers (---) between major sections if appropriate
      - Consider using emoji sparingly for visual interest (📌, 🔑, 💡, ✅) at key points
      - Format technical terms or references in \`code format\` for visual distinction
      - Structure the content to fit comfortably in a semi-fullscreen card-like display
      - Create visual hierarchy with proper spacing and formatting
      - Optimize readability by keeping paragraphs and bullet points concise
      
      TEXT TO SUMMARIZE:
      ${text.substring(0, 15000)}`;
    }

    try {
      // Initialize the Gemini API
      console.log("Using GoogleGenerativeAI library with model: gemini-2.0-flash");
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash",
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      });
      
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
      const summary = response.text();
      
      return NextResponse.json({ summary });
    } catch (error) {
      console.error('Error using Gemini API:', error);
      
      // Add detailed error information
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.log(`Gemini API error details: ${errorMessage}`);
      
      // Return a fallback summary instead of throwing an error
      return NextResponse.json({ 
        summary: "Unable to generate summary. Please try again later.",
        error: errorMessage 
      });
    }
  } catch (error) {
    console.error('Error in summarize API:', error);
    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    );
  }
}