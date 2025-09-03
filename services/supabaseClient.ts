import { createClient } from '@supabase/supabase-js';
import { SUPABASE_CONFIG } from '../config';

const supabaseUrl = SUPABASE_CONFIG.URL;
const supabaseAnonKey = SUPABASE_CONFIG.ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    const errorMessage = 'Kesalahan Konfigurasi: Variabel lingkungan SUPABASE_URL atau SUPABASE_ANON_KEY tidak diatur. Aplikasi tidak dapat terhubung ke database. Harap atur variabel ini di environment hosting Anda (misalnya, Netlify).';
    
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