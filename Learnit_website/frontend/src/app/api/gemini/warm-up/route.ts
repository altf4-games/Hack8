import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API with your API key
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || 'AIzaSyAZMjzJiFYIbd0DiqNX_HykaUxwxGvrLE4');
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (!body.warmup) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
    
    // Warm up the API connection with a minimal request
    await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: 'Hello' }] }],
      generationConfig: {
        maxOutputTokens: 10,
      },
    });
    
    return NextResponse.json({ success: true, message: 'Connection pre-warmed' });
  } catch (error) {
    console.error('Error warming up API connection:', error);
    return NextResponse.json({ success: false, error: 'Failed to warm up connection' }, { status: 500 });
  }
} 