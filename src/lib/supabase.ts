import { createClient } from '@supabase/supabase-js';

// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
// const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

const supabaseUrl = "https://skpqhotnmtrkjssdbqzg.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNrcHFob3RubXRya2pzc2RicXpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4ODEwMjUsImV4cCI6MjA5MjQ1NzAyNX0.9CDYY3M5uNCSxBqNFEIbD4208XOaJcCeP8iVMVZCdNc";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});
