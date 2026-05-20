import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gjggozjvmccutafucbwa.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqZ2dvemp2bWNjdXRhZnVjYndhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxOTk3MTksImV4cCI6MjA5NDc3NTcxOX0.Sy8xZPyi3mOMgA_n9tqaSWBYhWwPUZ6q_Xi_rYUMsR8'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
