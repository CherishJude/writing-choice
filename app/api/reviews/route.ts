import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET all reviews
export async function GET() {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ reviews: data });
}

// POST a new review (authenticated users only)
export async function POST(req: Request) {
  const { rating, review_text } = await req.json();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'You must be logged in to review.' }, { status: 401 });
  }

  const { error } = await supabase
    .from('reviews')
    .insert({
      user_email: user.email,
      rating,
      review_text
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}