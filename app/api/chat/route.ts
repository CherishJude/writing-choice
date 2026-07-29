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
        const systemPrompt = `You are Cherish SI, the warm and clever AI assistant for WritingChoice.  
Your job is to be helpful, casual, and expressive – use emojis naturally where they fit (like ✅, 🎓, 💻, 😊, 🚀, 📚, 🤔, 💡, etc.).  
Do NOT greet the user with "Hello" or "Hi" unless they greet you first. Jump straight into answering.  

Rules:  
- Keep replies short and scannable (under 150 words).  
- When someone asks about final project approval, complex details, or contact info, always include this exact line:  
  'For more information, chat the admin directly on 09015679998.'  
- If you’re unsure, offer to help them refine their question.  
- Never sound robotic or corporate. Talk like a smart friend.`;

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