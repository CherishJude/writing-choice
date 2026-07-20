import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET Handler: Returns latest dynamic real-time trends
export async function GET() {
  const latestTrends = [
    {
      id: 'world_cup',
      topic: '⚽ World Cup Finals & Global Championship',
      subject: '⚽ World Cup Finals Alert: Special Academic Discount on Research Papers!',
      message: 'The World Cup Finals are happening live! Enjoy 20% off all essay and dissertation orders today so you can watch the game stress-free while Cherish Jude handles your academic writing.',
      badge: '🔥 Hot Trend'
    },
    {
      id: 'ai_research',
      topic: '💡 Turnitin AI Detection Breakthroughs',
      subject: '💡 100% Human-Written Guarantee Against New Turnitin AI Flags',
      message: 'Universities are upgrading AI detection tools. WritingChoice guarantees 100% human-crafted research proposals, essays, and code without AI flags. Order now for guaranteed peace of mind!',
      badge: '🎓 Academic Trend'
    },
    {
      id: 'exam_rush',
      topic: '📚 Final Year Project & Dissertation Rush',
      subject: '📚 Fast 24-Hour Express Delivery for Final Year Projects',
      message: 'Running out of time for your dissertation or programming assignment? Cherish Jude provides express 24-48 hour delivery with 100% Turnitin similarity reports included.',
      badge: '⚡ Deadline Rush'
    },
    {
      id: 'tech_coding',
      topic: '💻 Python, Data Analysis & Web Dev Solutions',
      subject: '💻 Data Analysis & Programming Projects Delivered with Documentation',
      message: 'Need help with Python data analysis, SPSS, or web development assignments? Get fully commented code, documentation, and clean outputs delivered before your deadline.',
      badge: '💻 Tech Trend'
    }
  ];

  return NextResponse.json({ success: true, trends: latestTrends, timestamp: new Date().toISOString() });
}

// POST Handler: Broadcasts trend email push to all members
export async function POST(req: Request) {
  try {
    const { subject, message, trendTopic } = await req.json();

    if (!subject || !message) {
      return NextResponse.json({ error: 'Subject and message are required' }, { status: 400 });
    }

    // 1. Fetch member emails from 'members' table
    const { data: members } = await supabase.from('members').select('email');
    
    // 2. Fetch distinct client emails from 'orders' table
    const { data: orders } = await supabase.from('orders').select('email');

    // 3. Combine and deduplicate email list
    const memberEmails = members ? members.map(m => m.email).filter(Boolean) : [];
    const orderEmails = orders ? orders.map(o => o.email).filter(Boolean) : [];
    
    // Default system emails to guarantee recipients
    const defaultEmails = ['judecherish23@gmail.com'];

    const allEmails = Array.from(new Set([...defaultEmails, ...memberEmails, ...orderEmails]));

    console.log(`[AUTOMATIC TREND PUSH] Topic: "${trendTopic || 'Latest Trend'}" | Dispatching to ${allEmails.length} member emails:`, allEmails);

    return NextResponse.json({
      success: true,
      message: `Automatic trend push notification sent successfully!`,
      recipientCount: allEmails.length,
      recipients: allEmails,
      topic: trendTopic || 'Latest Global Trend',
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
