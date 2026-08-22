import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Share Supabase for Posts & Flyers
const shareSupabaseUrl = import.meta.env.VITE_SUPABASE_SHARE_URL
const shareSupabaseAnonKey = import.meta.env.VITE_SUPABASE_SHARE_ANON_KEY

export const shareSupabase = createClient(shareSupabaseUrl, shareSupabaseAnonKey)
