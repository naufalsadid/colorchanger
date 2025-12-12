import React from 'react';

interface ApiKeyInputProps {
  apiKey: string;
  setApiKey: (key: string) => void;
}

export const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ apiKey, setApiKey }) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6">
      <label htmlFor="api-key" className="block text-sm font-medium text-slate-700 mb-2">
        Kunci API Gemini (Wajib)
      </label>
      <input
        type="password"
        id="api-key"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        placeholder="Masukkan API Key Gemini Anda di sini..."
        className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-sm"
      />
      <p className="mt-2 text-xs text-slate-500">
        API Key hanya disimpan di browser Anda dan tidak dikirim ke server lain.
      </p>
    </div>
  );
};