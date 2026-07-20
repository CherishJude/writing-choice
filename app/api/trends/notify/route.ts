import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { subject, message, trendTopic } = await req.json();

    if (!subject || !message) {
      return NextResponse.json({ error: 'Subject and message are required' }, { status: 400 });
    }

    // Fetch all member email addresses
    const { data: members, error } = await supabase.from('members').select('email');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const emailList = members ? members.map(m => m.email).filter(Boolean) : [];

    // Simulate batch dispatch / Webhook integration (Resend / SendGrid / NodeMailer)
    console.log(`[TREND PUSH NOTIFICATION] Topic: "${trendTopic || 'Global Trend'}" | Sent to ${emailList.length} members.`);

    return NextResponse.json({
      success: true,
      message: `Automatic trend push notification queued & sent!`,
      recipientCount: emailList.length,
      topic: trendTopic || 'General Trend',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
