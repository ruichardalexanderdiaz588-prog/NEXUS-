import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tgscziwfhmkkcswjsibs.supabase.co';
const supabaseAnonKey = 'sb_publishable_pNp-OpuwzRXFcUnTQGd69g_-Ogm3UfX';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
