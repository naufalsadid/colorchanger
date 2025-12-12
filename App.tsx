import React, { useState, useRef } from 'react';
import { ColorSelector } from './components/ColorSelector';
import { ColorOption, GenerationState } from './types';
import { replaceProductColor } from './services/geminiService';

const App: React.FC = () => {
  // State for API Key removed as it's now handled via process.env
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string>('image/jpeg');
  const [selectedColor, setSelectedColor] = useState<ColorOption | null>(null);
  const [customInstruction, setCustomInstruction] = useState<string>(''); // New State
  
  const [generationState, setGenerationState] = useState<GenerationState>({
    isLoading: false,
    resultImage: null,
    error: null,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        // Fallback to jpeg if type is missing to avoid API errors
        setImageMimeType(file.type || 'image/jpeg');
        setGenerationState({ isLoading: false, resultImage: null, error: null });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    // API Key check removed from UI logic
    if (!selectedImage || !selectedColor) return;

    setGenerationState({ isLoading: true, resultImage: null, error: null });

    try {
      // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64Data = selectedImage.split(',')[1];
      
      // Determine color name to send (use hex for custom colors to be precise)
      const colorPrompt = selectedColor.id === 'custom' 
        ? `Warna Hex ${selectedColor.hex}` 
        : selectedColor.name;

      const resultBase64 = await replaceProductColor(
        base64Data,
        colorPrompt,
        imageMimeType,
        customInstruction // Pass the custom instruction
      );

      setGenerationState({
        isLoading: false,
        resultImage: `data:image/png;base64,${resultBase64}`,
        error: null,
      });

      // Scroll to result
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);

    } catch (error: any) {
      setGenerationState({
        isLoading: false,
        resultImage: null,
        error: error.message || "Gagal menghasilkan gambar.",
      });
    }
  };

  const handleDownload = () => {
    if (generationState.resultImage) {
      const link = document.createElement('a');
      link.href = generationState.resultImage;
      link.download = `produk-warna-${selectedColor?.name.toLowerCase().replace(/\s/g, '-')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">AI UGC – Pengganti Warna Produk</h1>
        <p className="text-slate-500">Ubah warna produk Anda secara instan menggunakan Gemini AI</p>
      </div>

      {/* Step 1: Upload Foto */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 text-sm font-bold mr-3">1</span>
          Upload Foto Produk
        </h2>

        <div 
          onClick={() => fileInputRef.current?.click()}
          className={`
            border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors
            ${selectedImage ? 'border-indigo-300 bg-indigo-50/30' : 'border-slate-300 hover:bg-slate-50 hover:border-indigo-400'}
          `}
        >
          {selectedImage ? (
            <div className="relative w-full max-w-sm">
              <img src={selectedImage} alt="Preview" className="w-full h-auto rounded-lg shadow-md" />
              <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all flex items-center justify-center rounded-lg group">
                 <span className="bg-white px-4 py-2 rounded-full shadow-sm text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity text-slate-700">Ganti Foto</span>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-slate-700 font-medium">Klik untuk upload foto</p>
              <p className="text-slate-400 text-sm mt-1">Format JPG, PNG (Max 5MB)</p>
            </div>
          )}
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />
        </div>
      </div>

      {/* Step 2: Pilih Warna */}
      <ColorSelector selectedColor={selectedColor} onSelect={setSelectedColor} />

      {/* Step 3: Instruksi Tambahan (Baru) */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 text-sm font-bold mr-3">3</span>
          Instruksi Khusus (Opsional)
        </h2>
        <p className="text-sm text-slate-500 mb-3">
          Jelaskan bagian mana yang ingin diubah jika Anda tidak ingin mengubah keseluruhan produk.
        </p>
        <textarea
          value={customInstruction}
          onChange={(e) => setCustomInstruction(e.target.value)}
          placeholder="Contoh: Hanya ubah warna pada bagian lengan baju, biarkan logo tetap original..."
          className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-sm h-24 resize-y"
        />
      </div>

      {/* Action Button */}
      <div className="mb-6">
        <button
          onClick={handleGenerate}
          disabled={!selectedImage || !selectedColor || generationState.isLoading}
          className={`
            w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform active:scale-[0.99]
            flex items-center justify-center
            ${(!selectedImage || !selectedColor) 
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
              : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-500/30'}
          `}
        >
          {generationState.isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Memproses... Mohon tunggu
            </>
          ) : (
            "Ganti Warna dengan AI"
          )}
        </button>
        {(!selectedImage || !selectedColor) && (
          <p className="text-center text-sm text-slate-400 mt-2">
            {!selectedImage ? "Silakan upload foto terlebih dahulu" : "Pilih warna yang diinginkan"}
          </p>
        )}
      </div>

      {/* Step 4: Hasil / Error */}
      {generationState.error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-center mb-6">
          <p className="font-medium">Terjadi Kesalahan</p>
          <p className="text-sm">{generationState.error}</p>
        </div>
      )}

      {generationState.resultImage && (
        <div ref={resultRef} className="bg-white p-6 rounded-2xl shadow-lg border border-indigo-100 animate-fade-in">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-600 text-sm font-bold mr-3">✓</span>
            Hasil Edit
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6 items-start">
            <div className="space-y-2">
               <p className="text-sm font-medium text-slate-500">Foto Asli</p>
               <img src={selectedImage!} alt="Original" className="w-full rounded-xl border border-slate-200" />
            </div>
            <div className="space-y-2">
               <p className="text-sm font-medium text-indigo-600">Hasil AI ({selectedColor?.name})</p>
               <img src={generationState.resultImage} alt="Generated" className="w-full rounded-xl shadow-md border border-indigo-200" />
               
               <button 
                 onClick={handleDownload}
                 className="w-full mt-4 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors flex items-center justify-center"
               >
                 <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                 </svg>
                 Download Foto
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;