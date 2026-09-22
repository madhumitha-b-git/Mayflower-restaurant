import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://bnebpktyrccybccdeokj.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJuZWJwa3R5cmNjeWJjY2Rlb2tqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3NzI1NzQsImV4cCI6MjEwNDM0ODU3NH0.2vQ-uVtoNptaaoLWWT01SezROC6aAyuyZXJ_Xlt43pc';

const supabaseUrl =
  (import.meta.env.VITE_SUPABASE_URL as string) || DEFAULT_SUPABASE_URL;
const supabaseAnonKey =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || DEFAULT_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const isSupabaseConfigured = true;
