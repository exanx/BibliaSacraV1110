import React, { useState, useEffect } from 'react';
import { useBible } from '../context/BibleContext';
import { Search } from 'lucide-react';

export const WordLookupTooltip: React.FC = () => {
  const { openReferenceLookup } = useBible();
  const [coords, setCoords] = useState<{ x: number; y: number } | null>(null);
  const [selectedWord, setSelectedWord] = useState<string>('');

  useEffect(() => {
    const handleMouseUp = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) {
        setCoords(null);
        setSelectedWord('');
        return;
      }

      const text = selection.toString().trim();
      if (!text || text.length > 50) {
        setCoords(null);
        return;
      }

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) {
        setCoords(null);
        return;
      }

      setSelectedWord(text);
      setCoords({
        x: rect.left + rect.width / 2,
        y: rect.top - 8
      });
    };

    const handleMouseDown = (e: MouseEvent) => {
      // If clicking inside the tooltip, don't dismiss immediately
      const tooltip = document.getElementById('selection-tooltip-react');
      if (tooltip && tooltip.contains(e.target as Node)) {
        return;
      }
      setCoords(null);
    };

    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousedown', handleMouseDown);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  if (!coords || !selectedWord) return null;

  return (
    <div
      id="selection-tooltip-react"
      style={{
        left: `${coords.x}px`,
        top: `${coords.y}px`,
        transform: 'translate(-50%, -100%)'
      }}
      onClick={() => {
        openReferenceLookup(selectedWord, 'dict');
        setCoords(null);
      }}
      className="fixed z-50 glass-panel !bg-white/95 dark:!bg-[#121214]/95 rounded-xl shadow-2xl py-2 px-3.5 text-[11px] font-bold uppercase tracking-wider text-gray-800 dark:text-gray-200 cursor-pointer flex items-center gap-2 hover:text-primary dark:hover:text-primary border border-gray-200/60 dark:border-white/10 group backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150"
    >
      <Search className="w-3.5 h-3.5 text-primary group-hover:scale-110 transition-transform" />
      <span>Lookup "{selectedWord.length > 15 ? `${selectedWord.slice(0, 15)}...` : selectedWord}"</span>
    </div>
  );
};
