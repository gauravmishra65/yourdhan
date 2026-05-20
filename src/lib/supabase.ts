import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gjggozjvmccutafucbwa.supabase.co'
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqZ2dvemp2bWNjdXRhZnVjYndhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxOTk3MTksImV4cCI6MjA5NDc3NTcxOX0.Sy8xZPyi3mOMgA_n9tqaSWBYhWwPUZ6q_Xi_rYUMsR8'

// We leave the client untyped at this layer and use our own DbXxx interfaces
// in supabaseService.ts for full type safety without requiring generated types.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
  global: { headers: { 'x-app-name': 'yourdhan' } },
})

export default supabase
