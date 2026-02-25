import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fcbwvqlusiplwrqaualn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjYnd2cWx1c2lwbHdycWF1YWxuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzMzgwNTAsImV4cCI6MjA4MDkxNDA1MH0.ge4VLkjA56L2OJpvFg_wneAGHAYNll3BntC0YY_vVn0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// CRITICAL FIX: Using the correct, working webhook URL from the reference project.
export const N8N_WEBHOOK_URL = 'https://n8n-main-service.onrender.com/webhook/442e9fbf-fb12-422f-b517-59eea10aedfb';
