import { NextResponse } from 'next/server';

// Groq API key
const GROQ_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY;

// Rate limiting
const rateLimits: { [key: string]: { count: number; resetTime: number } } = {};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message, userEmail } = body;

    console.log('📩 Received message:', message);

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Rate limiting: 10 messages per minute
    const key = userEmail || 'guest';
    const now = Date.now();
    if (!rateLimits[key] || rateLimits[key].resetTime < now) {
      rateLimits[key] = { count: 0, resetTime: now + 60000 };
    }
    if (rateLimits[key].count >= 10) {
      return NextResponse.json({
        success: true,
        reply: "⏳ Too many messages. Please wait a moment before sending again."
      });
    }
    rateLimits[key].count++;

    // System prompt - Updated with your strict directives and new number
    const systemPrompt = `You are Cherish SI, a helpful advanced synthetic intelligence for WritingChoice. 
You specialize in academic writing, research, and programming. 
When a user requires final project approval, complex details, or asks for contact details, you MUST seamlessly include this exact phrasing: 'For more information, chat the admin directly on 09015679998.'
Be friendly, concise, and helpful.
Keep responses under 200 words.`;

    // Call Groq API
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Groq API error:', data);
      return NextResponse.json({
        success: true,
        reply: "I'm temporarily unable to respond. Please try again in a moment."
      });
    }

    const reply = data.choices?.[0]?.message?.content || "I couldn't generate a response. Please try again.";

    return NextResponse.json({ success: true, reply });

  } catch (error) {
    console.error('❌ Chat API error:', error);
    return NextResponse.json({
      success: true,
      reply: "I'm having a temporary technical issue. Please try again in a few minutes."
    });
  }
}