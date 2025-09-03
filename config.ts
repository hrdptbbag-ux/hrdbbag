/**
 * =================================================================
 * KONFIGURASI APLIKASI UTAMA
 * =================================================================
 * File ini berisi semua variabel konfigurasi utama yang digunakan
 * di seluruh aplikasi. Tujuannya adalah untuk memusatkan pengaturan
 * agar mudah dikelola dan diubah.
 * =================================================================
 */

// Menambahkan deklarasi global untuk objek environment variables
// yang akan di-inject ke dalam window.
declare global {
  interface Window {
    APP_ENV: {
      API_KEY: string;
      SUPABASE_URL: string;
      SUPABASE_ANON_KEY: string;
    };
  }
}


// --- Informasi Umum Aplikasi ---
export const APP_CONFIG = {
  APP_NAME: 'HRD PT. BBAG',
  COMPANY_NAME: 'PT. Bahtera Berkah Abadi Grup',
  FOOTER_TEXT: `© ${new Date().getFullYear()} PT. BBAG HRD System. All Rights Reserved.`,
};

// --- Pengaturan Kredensial Admin ---
// PERINGATAN: Ini adalah metode autentikasi yang sangat sederhana
// dan hanya cocok untuk prototipe atau penggunaan internal terbatas.
// Untuk produksi, gunakan sistem autentikasi yang aman.
export const ADMIN_CREDENTIALS = {
  USERNAME: 'hrd.ptbbag@gmail.com',
  PASSWORD: '12345',
};

// --- Pengaturan Database (Supabase) ---
// Kredensial Supabase diambil dari objek window.APP_ENV untuk kompatibilitas browser.
// Lihat instruksi di index.html untuk cara mengkonfigurasi variabel ini
// baik untuk development lokal maupun deployment di Netlify.
export const SUPABASE_CONFIG = {
  URL: window.APP_ENV?.SUPABASE_URL,
  ANON_KEY: window.APP_ENV?.SUPABASE_ANON_KEY,
};

// --- Pengaturan Model AI (Gemini) ---
// Kunci API Gemini juga diambil dari objek window.APP_ENV.
export const GEMINI_CONFIG = {
  MODEL: 'gemini-2.5-flash',
};

// --- Pengaturan Default & UI ---
export const UI_CONFIG = {
  // Warna yang digunakan dalam grafik
  CHART_COLORS: {
    VOLUME: '#22d3ee',   // Cyan
    TARGET: '#facc15',   // Yellow
  },
  // Jumlah entri yang ditampilkan di tabel dasbor
  DASHBOARD_TABLE_ROWS: 5,
};

// --- Pengaturan Data Default ---
export const DATA_CONFIG = {
  // Nilai target m³ default untuk form input baru
  DEFAULT_TARGET_M3: 1050,
};