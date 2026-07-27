import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import nodemailer from 'nodemailer';

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

    if (recipients.length === 0) {
      return NextResponse.json({ error: 'No recipient emails found' }, { status: 404 });
    }

    // 4. Configure Nodemailer Transporter using Gmail App Password
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'judecherish23@gmail.com',
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    // 5. Send Email Broadcast
    await transporter.sendMail({
      from: '"WritingChoice Admin" <judecherish23@gmail.com>',
      to: 'judecherish23@gmail.com', // Admin primary copy
      bcc: recipients, // BCC keeps all user email addresses private from each other
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 12px; background-color: #ffffff;">
          <div style="background-color: #1a1a2e; padding: 15px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
            <h2 style="color: #00f2fe; margin: 0; font-size: 20px;">WritingChoice Update</h2>
          </div>
          <h3 style="color: #111; margin-top: 0;">${subject}</h3>
          <p style="white-space: pre-wrap; line-height: 1.6; color: #444; font-size: 14px;">${message}</p>
          <br/>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 11px; color: #888; text-align: center; margin: 0;">
            You are receiving this official update because you are a registered member or client of WritingChoice.
          </p>
        </div>
      `,
    });

    console.log(`[BROADCAST ANNOUNCEMENT SENT] Subject: "${subject}" | Recipients (${recipients.length}):`, recipients);

    return NextResponse.json({
      success: true,
      message: 'Broadcast announcement sent to all members successfully!',
      count: recipients.length,
      recipients,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Broadcast Transmission Error:', err);
    return NextResponse.json({ error: err.message || 'Broadcast Error' }, { status: 500 });
  }
}