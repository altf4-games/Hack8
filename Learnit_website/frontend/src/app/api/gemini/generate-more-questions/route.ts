import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    const { transcript, videoTitle, type, quantity, videoId } = body;

    if (!transcript) {
      return NextResponse.json(
        { error: 'Transcript is required' },
        { status: 400 }
      );
    }

    if (!type) {
      return NextResponse.json(
        { error: 'Question type is required' },
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

    // Prepare prompt based on question type
    let prompt = '';
    let jsonStructure = '';
    
    switch (type) {
      case 'flashcards':
        jsonStructure = '[{"question": "Question text", "answer": "Answer text"}]';
        prompt = `Generate ${quantity} new flashcards (question-answer pairs) based on the YouTube video transcript below.`;
        break;
      case 'mcqs':
        jsonStructure = '[{"question": "Question text", "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "correctAnswer": 0}]';
        prompt = `Generate ${quantity} new multiple-choice questions with 4 options each based on the YouTube video transcript below.`;
        break;
      case 'matching':
        jsonStructure = '[{"id": 1, "question": "Match the following terms with their definitions", "leftItems": ["Term 1", "Term 2", "Term 3", "Term 4"], "rightItems": ["Definition 1", "Definition 2", "Definition 3", "Definition 4"], "correctMatches": [0, 1, 2, 3]}]';
        prompt = `Generate ${quantity} new matching questions with 4 pairs each based on the YouTube video transcript below.`;
        break;
      case 'trueFalse':
        jsonStructure = '[{"id": 1, "question": "Statement text", "isTrue": true, "explanation": "Explanation why true/false"}]';
        prompt = `Generate ${quantity} new true/false questions based on the YouTube video transcript below.`;
        break;
      case 'fillInBlanks':
        jsonStructure = '[{"id": "fib-1", "question": "Fill in the blanks", "textWithBlanks": "Text with [BLANK_0] and [BLANK_1]", "correctAnswers": ["answer1", "answer2"], "completeText": "Full text with answer1 and answer2"}]';
        prompt = `Generate ${quantity} new fill-in-the-blank questions based on the YouTube video transcript below.`;
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid question type' },
          { status: 400 }
        );
    }

    // Complete the prompt
    const fullPrompt = `${prompt}
    
    The title of the video is: "${videoTitle || 'Educational Video'}"
    
    Use only information that is explicitly mentioned in the transcript. Make sure the questions cover different topics than what might have been covered in previous questions.
    
    Format your response as a JSON array with the following structure:
    ${jsonStructure}
    
    IMPORTANT: Return only valid JSON without any additional text or formatting.
    
    TRANSCRIPT:
    ${transcript.substring(0, 15000)}`; // Limiting transcript length to avoid token limits

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
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      };
      
      // Execute the generation
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
        generationConfig,
        safetySettings,
      });
      
      const response = result.response;
      const contentText = response.text();
      
      // Parse JSON from the response
      try {
        // Find JSON content in the response
        const jsonRegex = /\[[\s\S]*\]/;
        const jsonMatch = contentText.match(jsonRegex);
        
        let questions;
        if (jsonMatch) {
          questions = JSON.parse(jsonMatch[0]);
        } else {
          // If no JSON found, try parsing the whole response
          questions = JSON.parse(contentText);
        }
        
        // Make sure we have an array
        if (!Array.isArray(questions)) {
          questions = Object.values(questions);
        }
        
        return NextResponse.json({
          questions: questions || []
        });
      } catch (error) {
        console.error('Error parsing questions data:', error);
        console.log('Raw response from library approach:', contentText);
        throw new Error('Failed to parse questions data from library response');
      }
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
                  text: fullPrompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Gemini API error:', errorData);
        throw new Error(`Failed to generate more ${type} with Gemini`);
      }

      const data = await response.json();
      
      // Parse the response from Gemini
      let contentText = '';
      
      if (data.candidates && data.candidates.length > 0 && 
          data.candidates[0].content && 
          data.candidates[0].content.parts && 
          data.candidates[0].content.parts.length > 0) {
        contentText = data.candidates[0].content.parts[0].text || '';
      }

      // Extract the JSON part from the response
      let questions;
      try {
        // Find JSON content in the response - sometimes Gemini might add markdown code blocks
        const jsonRegex = /\[[\s\S]*\]/;
        const jsonMatch = contentText.match(jsonRegex);
        
        if (jsonMatch) {
          questions = JSON.parse(jsonMatch[0]);
        } else {
          // If no JSON found, try parsing the whole response
          questions = JSON.parse(contentText);
        }
        
        // Make sure we have an array
        if (!Array.isArray(questions)) {
          questions = Object.values(questions);
        }
        
        return NextResponse.json({
          questions: questions || []
        });
      } catch (error) {
        console.error('Error parsing questions data:', error);
        console.log('Raw response:', contentText);
        
        return NextResponse.json({
          error: 'Failed to parse questions data',
          questions: []
        }, { status: 500 });
      }
    }
  } catch (error) {
    console.error('Error in generate-more-questions API:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate more questions',
        questions: []
      },
      { status: 500 }
    );
  }
} 