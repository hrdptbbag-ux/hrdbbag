import { GoogleGenAI } from "@google/genai";
import { OperationalData } from '../types';
import { GEMINI_CONFIG } from "../config";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateProductionAnalysis = async (
  operationalData: OperationalData[]
): Promise<string> => {
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
    // Fix: Added curly braces to the catch block to correctly handle errors.
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "Terjadi kesalahan saat mencoba menganalisis data. Silakan coba lagi nanti.";
  }
};