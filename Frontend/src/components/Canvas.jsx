
import React, { useEffect, useRef, useState } from 'react';



function generateStars(count, width, height) {
  return Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
  }));
}

const STORAGE_KEY = 'constellation_list';

export default function Canvas({ starCount }) {
  const [stars, setStars] = useState([]);
  const [selected, setSelected] = useState([]);
  const [lines, setLines] = useState([]);
  const [name, setName] = useState('');
  const [tempName, setTempName] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);
  const [savedList, setSavedList] = useState([]);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [canvasSize, setCanvasSize] = useState({ width: window.innerWidth, height: window.innerHeight - 100 });
  const [draggingStar, setDraggingStar] = useState(null);
  const [color, setColor] = useState('#38bdf8');

  const GRID_SIZE = 20;
  const canvasRef = useRef(null);

  const clampOffset = (val, max) => Math.min(Math.max(val, -max), max);

  useEffect(() => {
    const stars = generateStars(starCount, canvasSize.width, canvasSize.height);
    setStars(stars);
    setSelected([]);
    setLines([]);
    setName('');
    setTempName('');
    setShowNameInput(false);
  }, [starCount]);

  useEffect(() => {
    const handleResize = () => {
      setCanvasSize({ width: window.innerWidth, height: window.innerHeight - 100 });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.lineWidth = 1.2;
    ctx.setLineDash([3, 2]);
    ctx.strokeStyle = color;
    ctx.fillStyle = 'white';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';

    lines.forEach(([a, b], idx) => {
      const ax = stars[a].x * zoom + offset.x;
      const ay = stars[a].y * zoom + offset.y;
      const bx = stars[b].x * zoom + offset.x;
      const by = stars[b].y * zoom + offset.y;

      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      ctx.stroke();

      const mx = (ax + bx) / 2;
      const my = (ay + by) / 2;
      ctx.fillText(`${a}-${b}`, mx, my - 5);
    });

    ctx.setLineDash([]);

    if (name) {
      ctx.font = `16px Poppins, sans-serif`;
      ctx.fillStyle = color;
      ctx.fillText(`✨ ${name}`, 20, 30);
    }

    ctx.restore();
  }, [stars, lines, name, zoom, offset, canvasSize, color]);

  const snapToGrid = (x, y) => ({
    x: Math.round(x / GRID_SIZE) * GRID_SIZE,
    y: Math.round(y / GRID_SIZE) * GRID_SIZE,
  });

  const handleSelect = (index) => {
    if (selected.length === 1 && selected[0] !== index) {
      setLines([...lines, [selected[0], index]]);
      setSelected([]);
      if (!name && lines.length === 0) setShowNameInput(true);
    } else {
      setSelected([index]);
    }
  };

  const handleUndo = () => {
    if (lines.length > 0) setLines(prev => prev.slice(0, -1));
  };

  const saveToLocalStorage = () => {
    const newConstellation = { stars, lines, name: name || `Unnamed-${Date.now()}`, color };
    const list = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    list.push(newConstellation);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    alert('Constellation saved!');
    setSavedList(list);
  };

  const loadFromLocalStorage = () => {
    const list = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    setSavedList(list);
    if (list.length > 0) {
      const last = list[list.length - 1];
      setStars(last.stars);
      setLines(last.lines);
      setName(last.name);
      setColor(last.color || '#38bdf8');
      setSelected([]);
    } else {
      alert('No saved constellation found.');
    }
  };

  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (tempName.trim()) {
      setName(tempName.trim());
      setShowNameInput(false);
    }
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const newZoom = Math.max(0.5, Math.min(2, zoom - e.deltaY * 0.001));
    setZoom(newZoom);
  };

  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - offset.x) / zoom;
    const y = (e.clientY - rect.top - offset.y) / zoom;

    const hitIndex = stars.findIndex(star => Math.hypot(star.x - x, star.y - y) < 10);
    if (hitIndex >= 0) {
      setDraggingStar(hitIndex);
    } else {
      setDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e) => {
    if (dragging && dragStart) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      setOffset(prev => ({
        x: clampOffset(prev.x + dx, canvasSize.width),
        y: clampOffset(prev.y + dy, canvasSize.height),
      }));
      setDragStart({ x: e.clientX, y: e.clientY });
    }

    if (draggingStar !== null) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - offset.x) / zoom;
      const y = (e.clientY - rect.top - offset.y) / zoom;
      const snapped = snapToGrid(x, y);
      setStars(prev => {
        const updated = [...prev];
        updated[draggingStar] = snapped;
        return updated;
      });
    }
  };

  const handleMouseUp = () => {
    setDragging(false);
    setDraggingStar(null);
    setDragStart(null);
  };

  return (
    <div
      className="relative w-full h-full overflow-hidden touch-none"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 z-0"
      />

      {stars.map((star, i) => (
        <div
          key={i}
          onMouseDown={(e) => {
            e.stopPropagation();
            handleSelect(i);
          }}
          title={`Star ${i + 1}\n(${Math.round(star.x)}, ${Math.round(star.y)})`}
          className={`absolute z-10 animate-pulse cursor-pointer transition-transform duration-150 ${selected.includes(i) ? 'ring-2 ring-cyan-400 scale-125' : 'hover:ring hover:ring-blue-300'}`}
          style={{
            top: `${star.y * zoom + offset.y}px`,
            left: `${star.x * zoom + offset.x}px`,
            width: '20px',
            height: '20px',
            marginTop: '-10px',
            marginLeft: '-10px',
            backgroundImage: 'radial-gradient(circle at center, #ffffff, #aaa)',
            clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
            animation: 'twinkle 1.5s infinite ease-in-out',
          }}
        />
      ))}

      {showNameInput && (
        <form
          onSubmit={handleNameSubmit}
          className="absolute top-10 left-1/2 -translate-x-1/2 bg-white text-black p-4 rounded shadow-md z-50 flex gap-2"
        >
          <input
            type="text"
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            placeholder="Enter constellation name"
            className="border border-gray-300 px-2 py-1 rounded"
            autoFocus
          />
          <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded">
            Save
          </button>
        </form>
      )}

      <div className="absolute top-2 right-2 flex flex-wrap gap-2 z-20 text-sm">
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-8 h-8 p-0 border border-white rounded cursor-pointer"
          title="Pick line color"
        />
        <button
          onClick={handleUndo}
          className="bg-yellow-600 hover:bg-yellow-700 text-white px-2 py-1 rounded shadow"
        >Undo</button>
        <button
          onClick={saveToLocalStorage}
          className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded shadow"
        >Save</button>
        <button
          onClick={loadFromLocalStorage}
          className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded shadow"
        >Load</button>
        {savedList.length > 0 && (
          <select
            onChange={(e) => {
              const selected = savedList.find(c => c.name === e.target.value);
              if (selected) {
                setStars(selected.stars);
                setLines(selected.lines);
                setName(selected.name);
                setColor(selected.color || '#38bdf8');
              }
            }}
            className="px-2 py-1 rounded bg-white text-black shadow"
          >
            <option>Select constellation</option>
            {savedList.map((c, i) => (
              <option key={i} value={c.name}>{c.name}</option>
            ))}
          </select>
        )}
      </div>

      <style jsx>{`
        @keyframes twinkle {
          0% { opacity: 0.4; transform: scale(0.95); }
          50% { opacity: 1; transform: scale(1.05); }
          100% { opacity: 0.4; transform: scale(0.95); }
        }
      `}</style>
    </div>
  );
}