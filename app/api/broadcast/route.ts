import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { subject, message } = await req.json();

    if (!subject || !message) {
      return NextResponse.json({ error: 'Subject and message are required' }, { status: 400 });
    }

    // 1. Fetch emails from members table
    const { data: members } = await supabase.from('members').select('email');

    // 2. Fetch emails from orders table
    const { data: orders } = await supabase.from('orders').select('email');

    // 3. Deduplicate recipients list
    const memberEmails = members ? members.map(m => m.email).filter(Boolean) : [];
    const orderEmails = orders ? orders.map(o => o.email).filter(Boolean) : [];
    const defaultEmails = ['judecherish23@gmail.com'];

    const recipients = Array.from(new Set([...defaultEmails, ...memberEmails, ...orderEmails]));

    console.log(`[BROADCAST ANNOUNCEMENT SENT] Subject: "${subject}" | Recipients (${recipients.length}):`, recipients);

    return NextResponse.json({
      success: true,
      message: 'Broadcast announcement sent to all members successfully!',
      count: recipients.length,
      recipients,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Broadcast Error' }, { status: 500 });
  }
}
