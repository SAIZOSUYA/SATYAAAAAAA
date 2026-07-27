const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = (process.env.SUPABASE_URL || '').trim();
const supabaseKey = (process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

let supabase = null;
let isSupabaseConfigured = false;

if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    isSupabaseConfigured = true;
    console.log('Supabase Integration Loaded: Connected to Supabase Cloud Database.');
  } catch (err) {
    console.warn('Supabase initialization failed, running in local database fallback mode:', err.message);
  }
} else {
  console.log('Supabase credentials (SUPABASE_URL & SUPABASE_ANON_KEY) not provided. Running local database mode.');
}

module.exports = {
  supabase,
  isSupabaseConfigured
};
