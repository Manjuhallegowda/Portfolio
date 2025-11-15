import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Supabase URL or Service Role Key is not set in environment variables.');
  // In a real production app, you might want to throw an error or exit the process here.
  // For development, we'll just log and return null.
  // throw new Error('Supabase credentials are required!');
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

export default supabase;
