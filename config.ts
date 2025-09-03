/**
 * =================================================================
 * KONFIGURASI APLIKASI UTAMA
 * =================================================================
 * File ini berisi semua variabel konfigurasi utama yang digunakan
 * di seluruh aplikasi. Tujuannya adalah untuk memusatkan pengaturan
 * agar mudah dikelola dan diubah.
 * =================================================================
 */

// --- Informasi Umum Aplikasi ---
export const APP_CONFIG = {
  APP_NAME: 'Analisis Operasional Tambang',
  COMPANY_NAME: 'PT. Bahtera Berkah Abadi Grup',
  FOOTER_TEXT: `© ${new Date().getFullYear()} PT. BBAG Mining Analytics. All Rights Reserved.`,
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
// Kredensial Supabase diambil dari environment variables untuk keamanan.
// Saat mendeploy ke layanan seperti Netlify, pastikan untuk mengatur
// SUPABASE_URL dan SUPABASE_ANON_KEY di pengaturan environment situs Anda.
export const SUPABASE_CONFIG = {
  URL: process.env.SUPABASE_URL as string,
  ANON_KEY: process.env.SUPABASE_ANON_KEY as string,
};

// --- Pengaturan Model AI (Gemini) ---
// API Key Gemini juga diambil dari environment variable API_KEY.
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