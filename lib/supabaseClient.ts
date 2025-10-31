import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0
    ? process.env.NEXT_PUBLIC_SUPABASE_URL
    : "https://placeholder.supabase.co";

const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 0
    ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    : "public-anon-key";

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true
  }
});
