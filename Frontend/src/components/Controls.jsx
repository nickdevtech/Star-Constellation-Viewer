
import React, { useState } from 'react';
import { Sun, Moon, RotateCcw } from 'lucide-react';

export default function Controls({
  starCount,
  setStarCount,
  onReset,
  onToggleTheme,
  isDarkMode
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div className="w-full px-6 py-4 bg-slate-800/70 backdrop-blur-sm text-white border-b border-slate-700 shadow-md flex flex-wrap items-center justify-between gap-6 z-50">

      {/* Star Count Control */}
      <div className="flex items-center gap-4 relative">
        <label className="text-sm font-semibold tracking-wide whitespace-nowrap">
          ✨ Star Count:
        </label>
        <input
          type="range"
          min="10"
          max="500"
          value={starCount}
          onChange={(e) => setStarCount(Number(e.target.value))}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className="w-48 accent-blue-500 cursor-pointer transition"
        />
        {hovered && (
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-sm bg-blue-600 text-white px-2 py-1 rounded shadow">
            {starCount}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={onReset}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-violet-700 hover:from-purple-700 hover:to-violet-800 px-4 py-1.5 rounded-lg text-sm font-medium shadow hover:shadow-lg transition-all"
        >
          <RotateCcw size={16} />
          Reset
        </button>
        <button
          onClick={onToggleTheme}
          className="flex items-center gap-2 bg-gradient-to-r from-slate-600 to-gray-700 hover:from-slate-700 hover:to-gray-800 px-4 py-1.5 rounded-lg text-sm font-medium shadow hover:shadow-lg transition-all"
        >
          {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
          {isDarkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
      </div>
    </div>
  );
}
