import React from 'react';
import { ColorOption } from '../types';
import { COLOR_PALETTE } from '../constants';

interface ColorSelectorProps {
  selectedColor: ColorOption | null;
  onSelect: (color: ColorOption) => void;
}

// Helper untuk menentukan warna text (hitam/putih) berdasarkan background hex
const getContrastColor = (hex: string) => {
  const r = parseInt(hex.substr(1, 2), 16);
  const g = parseInt(hex.substr(3, 2), 16);
  const b = parseInt(hex.substr(5, 2), 16);
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return (yiq >= 128) ? '#000000' : '#FFFFFF';
};

export const ColorSelector: React.FC<ColorSelectorProps> = ({ selectedColor, onSelect }) => {
  
  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hex = e.target.value;
    onSelect({
      id: 'custom',
      name: 'Custom',
      hex: hex,
      textColor: getContrastColor(hex)
    });
  };

  // Cek apakah warna yang dipilih adalah custom (tidak ada di palette default)
  const isCustomSelected = selectedColor?.id === 'custom';

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6">
      <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 text-sm font-bold mr-3">2</span>
        Pilih Warna Baru
      </h2>
      
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
        {/* Render Preset Palette */}
        {COLOR_PALETTE.map((color) => {
          const isSelected = selectedColor?.id === color.id;
          return (
            <button
              key={color.id}
              onClick={() => onSelect(color)}
              className={`
                relative group flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200
                ${isSelected ? 'bg-slate-50 ring-2 ring-indigo-500 ring-offset-2' : 'hover:bg-slate-50'}
              `}
            >
              <div 
                className="w-12 h-12 rounded-full shadow-inner border border-slate-200 mb-2 transition-transform duration-200 group-hover:scale-110"
                style={{ backgroundColor: color.hex }}
              />
              <span className={`text-xs font-medium ${isSelected ? 'text-indigo-600' : 'text-slate-600'}`}>
                {color.name}
              </span>
              
              {isSelected && (
                <div className="absolute top-2 right-2 w-4 h-4 bg-indigo-500 rounded-full border-2 border-white flex items-center justify-center">
                   <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                   </svg>
                </div>
              )}
            </button>
          );
        })}

        {/* Render Custom Color Button */}
        <div className={`
          relative group flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 cursor-pointer overflow-hidden
          ${isCustomSelected ? 'bg-slate-50 ring-2 ring-indigo-500 ring-offset-2' : 'hover:bg-slate-50'}
        `}>
          {/* Color Picker Input (Expanded to cover the entire button area for better hit target) */}
          <input 
             type="color" 
             className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
             onChange={handleCustomColorChange}
             value={isCustomSelected ? selectedColor.hex : "#818cf8"}
             title="Pilih warna custom"
          />

          <div className="relative w-12 h-12 rounded-full shadow-inner border border-slate-200 mb-2 overflow-hidden flex items-center justify-center bg-gradient-to-br from-pink-300 via-purple-300 to-indigo-300">
             {/* Plus Icon or Custom Color Preview */}
             {isCustomSelected ? (
                <div 
                  className="w-full h-full" 
                  style={{ backgroundColor: selectedColor.hex }} 
                />
             ) : (
                <svg className="w-6 h-6 text-white drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
             )}
          </div>
          <span className={`text-xs font-medium ${isCustomSelected ? 'text-indigo-600' : 'text-slate-600'}`}>
            Custom
          </span>

          {isCustomSelected && (
            <div className="absolute top-2 right-2 w-4 h-4 bg-indigo-500 rounded-full border-2 border-white flex items-center justify-center pointer-events-none z-20">
               <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
               </svg>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};