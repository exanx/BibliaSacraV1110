import React, { useState, useRef } from 'react';
import { useBible } from '../context/BibleContext';
import {
  X,
  Search,
  Download,
  Upload,
  Copy,
  Trash2,
  Highlighter,
  FileText
} from 'lucide-react';
import { HighlightItem } from '../types/bible';

const COLOR_CLASSES: Record<HighlightItem['color'], string> = {
  yellow: 'bg-yellow-400',
  green: 'bg-emerald-400',
  blue: 'bg-sky-400',
  pink: 'bg-pink-400',
  purple: 'bg-purple-400'
};

export const NotesHighlightsModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    highlights,
    categories,
    removeHighlight,
    goToChapter,
    showToast,
    setHighlight
  } = useBible();

  const [colorFilter, setColorFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [notesOnly, setNotesOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (activeModal !== 'highlights') return null;

  const activeHighlights = Object.keys(highlights)
    .filter((ref) => !highlights[ref].deleted)
    .map((ref) => ({ ref, ...highlights[ref] }))
    .filter((item) => {
      if (colorFilter !== 'all' && item.color !== colorFilter) return false;
      if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
      if (notesOnly && (!item.note || !item.note.trim())) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const refMatch = item.ref.toLowerCase().includes(q);
        const noteMatch = (item.note || '').toLowerCase().includes(q);
        const textMatch = (item.verseText || '').toLowerCase().includes(q);
        return refMatch || noteMatch || textMatch;
      }
      return true;
    })
    .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));

  const handleJumpToVerse = (ref: string) => {
    const parts = ref.match(/(.*?)\s+(\d+):(\d+)/);
    if (parts) {
      goToChapter(parts[1], parts[2], parts[3]);
      setActiveModal(null);
    }
  };

  const handleExportMarkdown = () => {
    if (activeHighlights.length === 0) {
      showToast('No notes or highlights to export.');
      return;
    }

    let md = `# Biblia Sacra — Notes & Highlights\n`;
    md += `*Exported on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}*\n`;
    md += `*Total entries: ${activeHighlights.length}*\n\n---\n\n`;

    activeHighlights.forEach((item) => {
      const dateStr = item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : '';
      md += `## ${item.ref}\n`;
      md += `- **Color Tag**: ${item.color}\n`;
      md += `- **Category**: ${item.category || 'General'}\n`;
      if (dateStr) md += `- **Saved**: ${dateStr}\n\n`;
      if (item.verseText) md += `> "${item.verseText}"\n\n`;
      if (item.note && item.note.trim()) md += `### Reflection / Note\n${item.note}\n\n`;
      md += `---\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `biblia_sacra_notes_${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Notes exported as Markdown!');
  };

  const handleCopyAll = () => {
    if (activeHighlights.length === 0) {
      showToast('No notes to copy.');
      return;
    }

    let text = `# Biblia Sacra Notes & Highlights\n\n`;
    activeHighlights.forEach((item) => {
      text += `• ${item.ref} [${item.category || 'General'}]: "${item.verseText || ''}"\n`;
      if (item.note && item.note.trim()) {
        text += `  Reflection: ${item.note.trim()}\n`;
      }
      text += `\n`;
    });

    navigator.clipboard.writeText(text);
    showToast('All notes copied to clipboard!');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;

      // Parse markdown headers
      const lines = content.split('\n');
      let count = 0;
      let curRef = '';
      let curColor: HighlightItem['color'] = 'yellow';
      let curCat = 'General';
      let curNote = '';

      for (const line of lines) {
        const trimmed = line.trim();
        const headerMatch = trimmed.match(/^#{1,3}\s+([1-3]?\s*[A-Za-z]+(?:\s+[A-Za-z]+)*\s+\d+(?::\d+(?:-\d+)?)?)\b/);
        if (headerMatch && !trimmed.toLowerCase().includes('reflection') && !trimmed.toLowerCase().includes('notes')) {
          if (curRef) {
            setHighlight(curRef, curColor, curCat, curNote);
            count++;
          }
          curRef = headerMatch[1].trim();
          curColor = 'yellow';
          curCat = 'General';
          curNote = '';
          continue;
        }

        if (trimmed.startsWith('- **Color Tag**:')) {
          const col = trimmed.split(':')[1]?.trim().toLowerCase();
          if (['yellow', 'green', 'blue', 'pink', 'purple'].includes(col)) {
            curColor = col as any;
          }
        } else if (trimmed.startsWith('- **Category**:')) {
          curCat = trimmed.split(':')[1]?.trim() || 'General';
        } else if (curRef && !trimmed.startsWith('#') && !trimmed.startsWith('---') && !trimmed.startsWith('>')) {
          if (trimmed) curNote += (curNote ? '\n' : '') + trimmed;
        }
      }

      if (curRef) {
        setHighlight(curRef, curColor, curCat, curNote);
        count++;
      }

      showToast(`Imported ${count} notes from Markdown!`);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 z-50 transition-opacity"
      onClick={() => setActiveModal(null)}
    >
      <div
        className="glass-panel modal-enter w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-white/5 bg-white/40 dark:bg-black/40">
          <div className="flex items-center gap-2">
            <Highlighter className="w-5 h-5 text-primary" />
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Notes & Highlights</h3>
            <span className="text-xs font-mono font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              {activeHighlights.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyAll}
              className="p-1.5 rounded-lg btn-secondary text-xs flex items-center gap-1 cursor-pointer"
              title="Copy all notes"
            >
              <Copy className="w-3.5 h-3.5 text-primary" />
              <span className="hidden sm:inline">Copy All</span>
            </button>
            <button
              onClick={handleExportMarkdown}
              className="p-1.5 rounded-lg btn-secondary text-xs flex items-center gap-1 cursor-pointer"
              title="Export as Markdown"
            >
              <Download className="w-3.5 h-3.5 text-primary" />
              <span className="hidden sm:inline">Export MD</span>
            </button>
            <label className="p-1.5 rounded-lg btn-secondary text-xs flex items-center gap-1 cursor-pointer">
              <Upload className="w-3.5 h-3.5 text-primary" />
              <span className="hidden sm:inline">Import</span>
              <input
                type="file"
                ref={fileInputRef}
                accept=".md,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            <button
              onClick={() => setActiveModal(null)}
              className="p-1.5 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="p-4 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/20 flex flex-wrap items-center gap-2.5">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[160px]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter notes..."
              className="glass-input w-full pl-8 pr-3 py-1.5 rounded-lg text-xs outline-none"
            />
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Color Filter */}
          <select
            value={colorFilter}
            onChange={(e) => setColorFilter(e.target.value)}
            className="glass-input p-1.5 rounded-lg text-xs outline-none cursor-pointer"
          >
            <option value="all">All Colors</option>
            <option value="yellow">Yellow</option>
            <option value="green">Green</option>
            <option value="blue">Blue</option>
            <option value="pink">Pink</option>
            <option value="purple">Purple</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="glass-input p-1.5 rounded-lg text-xs outline-none cursor-pointer"
          >
            <option value="all">All Categories</option>
            {Object.keys(categories)
              .filter((c) => !categories[c].deleted)
              .map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
          </select>

          {/* Notes Only Checkbox */}
          <label className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={notesOnly}
              onChange={(e) => setNotesOnly(e.target.checked)}
              className="rounded text-primary focus:ring-primary cursor-pointer"
            />
            <span>With Notes only</span>
          </label>
        </div>

        {/* Content Items */}
        <div className="p-5 overflow-y-auto flex-1 space-y-3">
          {activeHighlights.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="w-10 h-10 text-gray-400 mx-auto mb-3 opacity-60" />
              <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300">No highlights or notes found</h4>
              <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                Click any verse in the reader to highlight with color or write personal reflection notes.
              </p>
            </div>
          ) : (
            activeHighlights.map((item) => (
              <div
                key={item.ref}
                className="glass-input p-4 rounded-xl space-y-2 hover:border-primary/40 transition-colors group"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${COLOR_CLASSES[item.color] || 'bg-yellow-400'}`} />
                    <button
                      type="button"
                      onClick={() => handleJumpToVerse(item.ref)}
                      className="font-bold text-xs text-gray-900 dark:text-white hover:text-primary transition-colors cursor-pointer"
                    >
                      {item.ref}
                    </button>
                    <span className="text-[10px] bg-gray-100 dark:bg-zinc-800 text-gray-500 px-2 py-0.5 rounded-full font-medium">
                      {item.category || 'General'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-400 font-mono">
                      {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : ''}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeHighlight(item.ref)}
                      className="text-gray-400 hover:text-red-500 p-1 rounded transition-colors cursor-pointer"
                      title="Delete highlight"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {item.verseText && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 italic line-clamp-2 pl-2 border-l-2 border-gray-200 dark:border-white/10">
                    "{item.verseText}"
                  </p>
                )}

                {item.note && (
                  <p className="text-xs text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-white/5 p-2.5 rounded-lg leading-relaxed whitespace-pre-wrap">
                    {item.note}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
