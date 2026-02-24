import { createClient } from '@supabase/supabase-js';

// 🔧 REEMPLAZÁ estos valores con los de tu proyecto Supabase
// Los encontrás en: Supabase → Settings → API
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || 'TU_SUPABASE_URL';
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || 'TU_SUPABASE_ANON_KEY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
