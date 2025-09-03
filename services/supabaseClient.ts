import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CONFIG } from '../config';

let supabase: SupabaseClient | null = null;
let supabaseInitializationError: string | null = null;

const supabaseUrl = SUPABASE_CONFIG.URL;
const supabaseAnonKey = SUPABASE_CONFIG.ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes("MASUKKAN_URL_SUPABASE_ANDA")) {
    supabaseInitializationError = 'Kesalahan Konfigurasi: Kredensial Supabase tidak diatur. Buka file `index.html`, temukan objek `window.APP_ENV`, dan ganti nilai placeholder dengan kredensial Supabase Anda. Untuk production, gunakan Snippet Injection di Netlify seperti yang dijelaskan di komentar file tersebut.';
} else {
    try {
        supabase = createClient(supabaseUrl, supabaseAnonKey);
    } catch (e: any) {
        console.error("Supabase Initialization Error:", e);
        supabaseInitializationError = `Gagal menginisialisasi Supabase client: ${e.message}`;
        supabase = null;
    }
}

export { supabase, supabaseInitializationError };
