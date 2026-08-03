import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
  const { data, error } = await supabase.from('orders').insert({
    user_email: 'judecherish23@gmail.com',
    service: 'Test Service',
    tier: 'Test Tier',
    word_count: 100,
    price: 100,
    status: 'pending_verification',
    brief_file_url: 'test.com'
  });
  console.log("Insert result:", { data, error });
}
testInsert();
