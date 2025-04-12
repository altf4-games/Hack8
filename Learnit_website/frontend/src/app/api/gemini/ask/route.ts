import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    const { question, context, title } = body;

    if (!question) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }

    if (!context) {
      return NextResponse.json(
        { error: 'Context is required' },
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

    // Prepare prompt for Gemini
    const prompt = `You are an educational assistant answering questions about a YouTube video.
    
    The title of the video is: "${title || 'Unknown'}"
    
    Below is the transcript of the video that you should use as context to answer the question.
    Please provide a detailed, accurate answer based only on the information in the transcript.
    If the answer is not in the transcript, please say "I don't have enough information in the video transcript to answer this question."
    
    TRANSCRIPT:
    ${context.substring(0, 15000)}
    
    QUESTION:
    ${question}
    
    ANSWER:`;

    try {
      // Initialize the Gemini API
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      
      // Configure safety settings
      const safetySettings = [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
      ];
      
      // Generate content with proper configuration
      const generationConfig = {
        temperature: 0.3, // Lower temperature for more factual responses
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 800,
      };
      
      // Execute the generation
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig,
        safetySettings,
      });
      
      const response = result.response;
      const answer = response.text();
      
      return NextResponse.json({ answer });
    } catch (error) {
      console.error('Error using GoogleGenerativeAI library:', error);
      
      // Fallback to direct API call if the library approach fails
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.3, // Lower temperature for more factual responses
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 800,
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Gemini API error:', errorData);
        throw new Error('Failed to generate answer with Gemini');
      }

      const data = await response.json();
      
      // Parse the response from Gemini
      let answer = 'I was unable to generate an answer to your question. Please try rephrasing it.';
      
      if (data.candidates && data.candidates.length > 0 && 
          data.candidates[0].content && 
          data.candidates[0].content.parts && 
          data.candidates[0].content.parts.length > 0) {
        answer = data.candidates[0].content.parts[0].text || answer;
      }

      return NextResponse.json({ answer });
    }
  } catch (error) {
    console.error('Error in ask API:', error);
    return NextResponse.json(
      { error: 'Failed to generate answer' },
      { status: 500 }
    );
  }
} 