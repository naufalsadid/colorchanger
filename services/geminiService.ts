import { GoogleGenAI } from "@google/genai";

/**
 * Sends the image and color prompt to Gemini to generate the new image.
 * 
 * @param imageBase64 The source image in base64 format (stripped of data prefix)
 * @param colorName The name of the target color
 * @param mimeType The mime type of the original image
 * @param additionalInstruction Optional custom instruction from user (e.g., "only change the sleeves")
 * @returns The base64 string of the generated image
 */
export const replaceProductColor = async (
  imageBase64: string,
  colorName: string,
  mimeType: string,
  additionalInstruction?: string
): Promise<string> => {
  // Mengambil API Key langsung dari environment variable
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("API Key tidak ditemukan. Pastikan environment variable process.env.API_KEY telah dikonfigurasi.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Construct dynamic prompt
  let prompt = `Tugas: Edit gambar produk fashion/item berikut.`;
  
  if (additionalInstruction && additionalInstruction.trim().length > 0) {
    // Jika user memberikan instruksi spesifik
    prompt += ` Instruksi Spesifik: Ubah warna menjadi ${colorName} HANYA sesuai permintaan ini: "${additionalInstruction}".`;
    prompt += ` Jangan ubah bagian lain yang tidak diminta.`;
  } else {
    // Default behavior
    prompt += ` Ubah warna keseluruhan produk utama pada gambar ini menjadi ${colorName}.`;
  }

  prompt += ` Pastikan bentuk, pencahayaan, tekstur kain/material, dan detail tetap 100% realistis dan menyatu dengan gambar asli. Return only the image.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType || 'image/jpeg', // Fallback MIME type
              data: imageBase64,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        safetySettings: [], 
      }
    });

    // Validasi response structure untuk menghindari TypeError
    if (!response || !response.candidates || response.candidates.length === 0) {
      throw new Error("Tidak ada kandidat hasil yang diterima dari Gemini (Response Empty).");
    }

    const candidate = response.candidates[0];
    
    // Validasi content existence
    if (!candidate.content || !candidate.content.parts) {
       throw new Error("Gemini tidak mengembalikan konten gambar.");
    }

    const parts = candidate.content.parts;
    let generatedImageBase64 = '';

    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
        generatedImageBase64 = part.inlineData.data;
        break;
      }
    }

    if (!generatedImageBase64) {
      // Jika tidak ada inlineData, cek apakah ada text error/refusal
      const textPart = parts.find(p => p.text);
      if (textPart && textPart.text) {
          console.warn("Model returned text instead of image:", textPart.text);
      }
      throw new Error("Gemini tidak mengembalikan data gambar. Coba lagi atau gunakan gambar yang lebih jelas.");
    }

    return generatedImageBase64;

  } catch (error: any) {
    console.error("Gemini API Error Detail:", error);
    throw new Error(error.message || "Terjadi kesalahan sistem saat memproses gambar.");
  }
};