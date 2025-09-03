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
// Ganti placeholder di bawah ini dengan URL dan Kunci Anon dari proyek Supabase Anda.
export const SUPABASE_CONFIG = {
  URL: 'https://vaztjidmoiqcaccyxvjq.supabase.co', // <-- GANTI DENGAN URL PROYEK SUPABASE ANDA
  ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhenRqaWRtb2lxY2FjY3l4dmpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3Mjk2MzQsImV4cCI6MjA3MjMwNTYzNH0.HlNywxDdG85i8JFtxjKmPIzlX9iyINHti6zwpwb__c8', // <-- GANTI DENGAN KUNCI ANON SUPABASE ANDA
};

// --- Pengaturan Model AI (Gemini) ---
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