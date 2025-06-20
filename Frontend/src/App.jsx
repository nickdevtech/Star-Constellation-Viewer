import React, { useState } from 'react';
import Canvas from './components/Canvas';
import Controls from './components/Controls';
import './index.css';

export default function App() {
  const [starCount, setStarCount] = useState(100);
  const [resetKey, setResetKey] = useState(0);
  const [darkMode, setDarkMode] = useState(false);

  const handleReset = () => {
    setResetKey(prev => prev + 1);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark', !darkMode);
  };

  return (
    <div className={`w-full h-screen flex flex-col items-center justify-center ${darkMode ? 'bg-black text-white' : 'bg-white text-black'}`}>
      <Controls
        starCount={starCount}
        setStarCount={setStarCount}
        onReset={handleReset}
        onToggleTheme={toggleDarkMode}
        isDarkMode={darkMode}
      />
      <Canvas starCount={starCount} key={resetKey} />
    </div>
  );
}