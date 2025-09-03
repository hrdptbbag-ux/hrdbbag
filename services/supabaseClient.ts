import { createClient } from '@supabase/supabase-js';
import { SUPABASE_CONFIG } from '../config';

const supabaseUrl = SUPABASE_CONFIG.URL;
const supabaseAnonKey = SUPABASE_CONFIG.ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes("MASUKKAN_URL_SUPABASE_ANDA")) {
    const errorMessage = 'Kesalahan Konfigurasi: Kredensial Supabase tidak diatur. Buka file `index.html`, temukan objek `window.APP_ENV`, dan ganti nilai placeholder dengan kredensial Supabase Anda. Untuk production, gunakan Snippet Injection di Netlify seperti yang dijelaskan di komentar file tersebut.';
    
    // Menampilkan pesan di UI jika memungkinkan, atau lempar error
    const rootEl = document.getElementById('root');
    if (rootEl) {
        rootEl.innerHTML = `
            <div class="text-center p-10 max-w-2xl mx-auto">
                <div class="bg-red-900/50 border border-red-700 rounded-lg p-6">
                    <h3 class="text-xl font-bold text-red-300 mb-4">Terjadi Kesalahan Konfigurasi Kredensial</h3>
                    <pre class="text-left text-red-300 whitespace-pre-wrap font-mono text-sm bg-slate-900 p-4 rounded-md">${errorMessage}</pre>
                </div>
            </div>
        `;
    }
    throw new Error(errorMessage);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
