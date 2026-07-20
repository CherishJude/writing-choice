import { createClient } from '@supabase/supabase-js';

// Retrieve values and aggressively filter out bad or undefined Vercel strings
const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseUrl = (rawUrl && rawUrl.startsWith('http') && !rawUrl.includes('undefined')) 
  ? rawUrl 
  : "https://nmfrvwmyvrnpmktkhwaw.supabase.co";

const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseAnonKey = (rawKey && rawKey.length > 20 && !rawKey.includes('undefined')) 
  ? rawKey 
  : "sb_publishable_ni5Ptlzp62tOZ4qK4tKFUg_M6AZNq_5";

// Export the client configuration uniformly across the build environment
export const supabase = createClient(supabaseUrl, supabaseAnonKey);