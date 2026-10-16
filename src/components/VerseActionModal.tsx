import React, { useState, useEffect } from 'react';
import { useBible } from '../context/BibleContext';
import {
  X,
  Bookmark,
  Copy,
  Image as ImageIcon,
  Volume2,
  BookA,
  Trash2,
  Check,
  Plus
} from 'lucide-react';
import { HighlightItem } from '../types/bible';

const HIGHLIGHT_COLORS: { id: HighlightItem['color']; label: string; bgClass: string; hex: string }[] = [
  { id: 'yellow', label: 'Yellow', bgClass: 'bg-yellow-400', hex: '#facc15' },
  { id: 'green', label: 'Green', bgClass: 'bg-emerald-400', hex: '#34d399' },
  { id: 'blue', label: 'Blue', bgClass: 'bg-sky-400', hex: '#38bdf8' },
  { id: 'pink', label: 'Pink', bgClass: 'bg-pink-400', hex: '#f472b6' },
  { id: 'purple', label: 'Purple', bgClass: 'bg-purple-400', hex: '#c084fc' }
];

export const VerseActionModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    activeVerseRef,
    highlights,
    bookmarks,
    categories,
    setHighlight,
    removeHighlight,
    toggleBookmark,
    addCategory,
    updateNote,
    startVoiceReading,
    openReferenceLookup,
    showToast,
    loadedChapters
  } = useBible();

  const [selectedColor, setSelectedColor] = useState<HighlightItem['color']>('yellow');
  const [selectedCategory, setSelectedCategory] = useState<string>('General');
  const [noteText, setNoteText] = useState<string>('');
  const [newCatInput, setNewCatInput] = useState<string>('');
  const [showAddCat, setShowAddCat] = useState<boolean>(false);

  // Extract verse text from currently loaded chapter
  let verseText = '';
  if (activeVerseRef && loadedChapters.length > 0) {
    const parts = activeVerseRef.match(/(.*?)\s+(\d+):(\d+)/);
    if (parts) {
      const vNum = parts[3];
      const found = loadedChapters[0].verses.find(v => v.verse === vNum);
      if (found) verseText = found.text;
    }
  }

  useEffect(() => {
    if (activeVerseRef && highlights[activeVerseRef] && !highlights[activeVerseRef].deleted) {
      const hl = highlights[activeVerseRef];
      setSelectedColor(hl.color || 'yellow');
      setSelectedCategory(hl.category || 'General');
      setNoteText(hl.note || '');
    } else {
      setSelectedColor('yellow');
      setSelectedCategory('General');
      setNoteText('');
    }
  }, [activeVerseRef, highlights]);

  if (activeModal !== 'verseAction' || !activeVerseRef) {
    return null;
  }

  const isBookmarked = bookmarks[activeVerseRef] && !bookmarks[activeVerseRef].deleted;
  const isHighlighted = highlights[activeVerseRef] && !highlights[activeVerseRef].deleted;

  const handleApplyHighlight = (color: HighlightItem['color']) => {
    setSelectedColor(color);
    setHighlight(activeVerseRef, color, selectedCategory, noteText, verseText);
  };

  const handleRemoveHighlight = () => {
    removeHighlight(activeVerseRef);
  };

  const handleSaveNote = () => {
    updateNote(activeVerseRef, noteText, selectedCategory);
    setActiveModal(null);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`"${verseText}" — ${activeVerseRef}`);
    showToast(`Copied ${activeVerseRef} to clipboard!`);
  };

  const handleListen = () => {
    const parts = activeVerseRef.match(/(.*?)\s+(\d+):(\d+)/);
    const vNum = parts ? parseInt(parts[3], 10) : 1;
    startVoiceReading(vNum);
    setActiveModal(null);
  };

  const handleQuoteMaker = () => {
    setActiveModal('quote');
  };

  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCatInput.trim()) {
      addCategory(newCatInput.trim());
      setSelectedCategory(newCatInput.trim());
      setNewCatInput('');
      setShowAddCat(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity"
      onClick={() => setActiveModal(null)}
    >
      <div
        className="glass-panel modal-enter w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-white/5 bg-white/40 dark:bg-black/40">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">{activeVerseRef}</h3>
            <p className="text-[11px] text-gray-500 truncate max-w-xs">{verseText || 'Verse text'}</p>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="p-1.5 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Highlight Color Swatches */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                Highlight Color
              </label>
              {isHighlighted && (
                <button
                  onClick={handleRemoveHighlight}
                  className="text-xs text-red-500 hover:underline flex items-center gap-1 cursor-pointer font-medium"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear highlight</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              {HIGHLIGHT_COLORS.map((c) => {
                const isSelected = isHighlighted && selectedColor === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => handleApplyHighlight(c.id)}
                    className={`w-9 h-9 rounded-full ${c.bgClass} flex items-center justify-center shadow-sm cursor-pointer transition-transform hover:scale-110 relative ${
                      isSelected ? 'ring-2 ring-offset-2 ring-primary scale-110' : 'opacity-85 hover:opacity-100'
                    }`}
                    title={c.label}
                  >
                    {isSelected && <Check className="w-4 h-4 text-gray-900" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="grid grid-cols-4 gap-2 pt-2 border-t border-gray-100 dark:border-white/5">
            <button
              onClick={() => toggleBookmark(activeVerseRef)}
              className={`p-2 rounded-xl text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                isBookmarked
                  ? 'btn-primary shadow-sm'
                  : 'btn-secondary hover:border-primary/40'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span>{isBookmarked ? 'Saved' : 'Bookmark'}</span>
            </button>

            <button
              onClick={handleCopy}
              className="p-2 rounded-xl btn-secondary text-xs font-semibold flex flex-col items-center justify-center gap-1 hover:border-primary/40 cursor-pointer transition-all"
            >
              <Copy className="w-4 h-4 text-primary" />
              <span>Copy</span>
            </button>

            <button
              onClick={handleListen}
              className="p-2 rounded-xl btn-secondary text-xs font-semibold flex flex-col items-center justify-center gap-1 hover:border-primary/40 cursor-pointer transition-all"
            >
              <Volume2 className="w-4 h-4 text-primary" />
              <span>Listen</span>
            </button>

            <button
              onClick={handleQuoteMaker}
              className="p-2 rounded-xl btn-secondary text-xs font-semibold flex flex-col items-center justify-center gap-1 hover:border-primary/40 cursor-pointer transition-all"
            >
              <ImageIcon className="w-4 h-4 text-primary" />
              <span>Quote</span>
            </button>
          </div>

          {/* Category Selection */}
          <div className="pt-2 border-t border-gray-100 dark:border-white/5">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                Category
              </label>
              <button
                type="button"
                onClick={() => setShowAddCat(!showAddCat)}
                className="text-xs text-primary font-semibold flex items-center gap-1 hover:underline cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Category</span>
              </button>
            </div>

            {showAddCat && (
              <form onSubmit={handleAddCategorySubmit} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newCatInput}
                  onChange={(e) => setNewCatInput(e.target.value)}
                  placeholder="Category name..."
                  className="glass-input flex-1 px-3 py-1.5 rounded-lg text-xs outline-none"
                />
                <button
                  type="submit"
                  className="btn-primary px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Add
                </button>
              </form>
            )}

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="glass-input w-full p-2 rounded-lg text-xs outline-none cursor-pointer"
            >
              {Object.keys(categories)
                .filter(c => !categories[c].deleted)
                .map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
            </select>
          </div>

          {/* Reflection / Note */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
              Reflection / Study Note
            </label>
            <textarea
              rows={3}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Write your reflections or insights on this verse..."
              className="glass-input w-full p-3 rounded-xl text-xs outline-none resize-none leading-relaxed"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/30 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setActiveModal(null)}
            className="btn-secondary px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleSaveNote}
            className="btn-primary px-5 py-2 rounded-xl text-xs font-semibold cursor-pointer shadow-sm"
          >
            Save Note
          </button>
        </div>
      </div>
    </div>
  );
};
