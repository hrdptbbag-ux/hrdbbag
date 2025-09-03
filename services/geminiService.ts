import { GoogleGenAI } from "@google/genai";
import { OperationalData } from '../types';
import { GEMINI_CONFIG } from "../config";

let ai: GoogleGenAI | null = null;
let geminiInitializationError: string | null = null;

const apiKey = window.APP_ENV?.API_KEY;

if (!apiKey || apiKey.includes("MASUKKAN_KUNCI_API_GEMINI_ANDA")) {
    geminiInitializationError = "Kesalahan Konfigurasi: Kunci API Gemini tidak diatur. Mohon periksa konfigurasi di file `index.html` pada objek `window.APP_ENV`.";
} else {
    try {
        ai = new GoogleGenAI({ apiKey });
    } catch (e: any) {
        console.error("Gemini Initialization Error:", e);
        geminiInitializationError = `Gagal menginisialisasi Gemini client: ${e.message}`;
        ai = null;
    }
}

export const generateProductionAnalysis = async (
  operationalData: OperationalData[]
): Promise<string> => {
  if (geminiInitializationError) {
    return geminiInitializationError;
  }
  if (!ai) {
    return "Kesalahan Kritis: Gemini client tidak berhasil diinisialisasi.";
  }

  const prompt = `
    Anda adalah seorang Manajer Operasional Tambang senior di PT. Bahtera Berkah Abadi Grup.
    Tugas Anda adalah menganalisis data log operasional harian berikut dan memberikan laporan singkat, tajam, dan profesional.

    Fokus Analisis:
    1.  **Ringkasan Kinerja Umum:** Berikan gambaran umum tentang kinerja operasional selama periode ini. Apakah target secara umum tercapai?
    2.  **Identifikasi Performa Terbaik & Terendah:** Sebutkan tanggal dengan pencapaian target (PENCAPAIAN) tertinggi dan terendah.
    3.  **Analisis Penyebab:** Untuk hari dengan performa terendah, berikan kemungkinan penyebabnya berdasarkan data yang ada (misalnya, jam Breakdown 'BD' atau Standby 'STB' yang tinggi).
    4.  **Rekomendasi Strategis:** Berikan satu rekomendasi konkret yang dapat ditindaklanjuti untuk meningkatkan efisiensi atau mengatasi masalah yang teridentifikasi.

    Sajikan dalam format poin-poin yang jelas dan mudah dibaca.

    Data Log Operasional Harian:
    ${JSON.stringify(operationalData, null, 2)}
  `;

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_CONFIG.MODEL,
      contents: prompt,
    });
    return response.text;
  } catch (error: any) {
    console.error("Error calling Gemini API:", error);
    if (error.message && (error.message.includes('API key not valid') || error.message.includes('permission denied'))) {
        return "Terjadi kesalahan autentikasi dengan API Gemini. Pastikan Kunci API yang Anda masukkan di `index.html` sudah benar, aktif, dan memiliki izin yang sesuai.";
    }
    return "Terjadi kesalahan saat mencoba menganalisis data. Silakan coba lagi nanti.";
  }
};