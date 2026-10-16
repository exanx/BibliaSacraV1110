import React, { useState, useEffect } from 'react';
import { useBible } from '../context/BibleContext';
import { X, Search, BookA, Globe, ExternalLink, Loader2 } from 'lucide-react';

export const DictionaryWikiModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    referenceLookupWord,
    referenceLookupMode
  } = useBible();

  const [mode, setMode] = useState<'dict' | 'wiki'>(referenceLookupMode || 'dict');
  const [searchTerm, setSearchTerm] = useState<string>(referenceLookupWord || '');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dictData, setDictData] = useState<any[] | null>(null);
  const [wikiData, setWikiData] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (activeModal === 'dict') {
      setMode(referenceLookupMode || 'dict');
      setSearchTerm(referenceLookupWord || '');
      if (referenceLookupWord) {
        performLookup(referenceLookupWord, referenceLookupMode || 'dict');
      }
    }
  }, [activeModal, referenceLookupWord, referenceLookupMode]);

  if (activeModal !== 'dict') return null;

  const performLookup = async (word: string, currentMode: 'dict' | 'wiki') => {
    const clean = word.replace(/[^a-zA-Z\s\-']/g, '').trim().toLowerCase();
    if (!clean) return;

    setIsLoading(true);
    setErrorMsg(null);
    setDictData(null);
    setWikiData(null);

    try {
      if (currentMode === 'dict') {
        const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(clean)}`);
        if (!res.ok) throw new Error(`No dictionary definition found for "${clean}".`);
        const json = await res.json();
        setDictData(json);
      } else {
        const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(clean)}`);
        if (!res.ok) throw new Error(`No Wikipedia article found for "${clean}".`);
        const json = await res.json();
        if (json.type === 'disambiguation') {
          throw new Error(`"${clean}" has multiple meanings on Wikipedia. Please search for a more specific term.`);
        }
        setWikiData(json);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Lookup failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      performLookup(searchTerm, mode);
    }
  };

  const handleTabSwitch = (newMode: 'dict' | 'wiki') => {
    setMode(newMode);
    if (searchTerm.trim()) {
      performLookup(searchTerm, newMode);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 z-50 transition-opacity"
      onClick={() => setActiveModal(null)}
    >
      <div
        className="glass-panel modal-enter w-full max-w-xl max-h-[88vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header & Tabs */}
        <div className="p-4 border-b border-gray-100 dark:border-white/5 bg-white/40 dark:bg-black/40">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              Reference Lookup
            </h3>
            <button
              onClick={() => setActiveModal(null)}
              className="p-1.5 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mode Tabs */}
          <div className="flex gap-2 p-1 bg-gray-100 dark:bg-white/5 rounded-xl">
            <button
              type="button"
              onClick={() => handleTabSwitch('dict')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'dict'
                  ? 'bg-white dark:bg-white/10 text-primary shadow-xs'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <BookA className="w-3.5 h-3.5" />
              <span>Dictionary</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabSwitch('wiki')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'wiki'
                  ? 'bg-white dark:bg-white/10 text-primary shadow-xs'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Wikipedia</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/20">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={mode === 'dict' ? 'Search English word...' : 'Search Wikipedia topic...'}
              className="glass-input w-full pl-9 pr-16 py-2 rounded-xl text-xs outline-none"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 btn-secondary text-[10px] font-bold px-2 py-1 rounded-md"
            >
              LOOKUP
            </button>
          </form>
        </div>

        {/* Results Area */}
        <div className="p-5 overflow-y-auto flex-1">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-primary animate-spin mb-3 opacity-80" />
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Searching definition...</p>
            </div>
          )}

          {!isLoading && errorMsg && (
            <div className="text-center py-12 text-gray-500 text-xs leading-relaxed max-w-sm mx-auto">
              {errorMsg}
            </div>
          )}

          {!isLoading && !errorMsg && !dictData && !wikiData && (
            <div className="text-center py-12 text-gray-400 text-xs">
              Type any word or name above to view definitions and encyclopedic summaries.
            </div>
          )}

          {/* Dictionary Results */}
          {!isLoading && mode === 'dict' && dictData && dictData[0] && (
            <div className="space-y-4">
              <div className="flex items-baseline justify-between border-b border-gray-100 dark:border-white/5 pb-2">
                <h4 className="text-xl font-bold capitalize text-gray-900 dark:text-white">
                  {dictData[0].word}
                </h4>
                {dictData[0].phonetic && (
                  <span className="text-xs font-mono text-gray-400">{dictData[0].phonetic}</span>
                )}
              </div>

              {dictData[0].meanings.slice(0, 4).map((m: any, mIdx: number) => (
                <div key={mIdx} className="space-y-2">
                  <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-0.5 rounded-md font-mono">
                    {m.partOfSpeech}
                  </span>
                  <ul className="list-disc pl-5 text-xs text-gray-700 dark:text-gray-300 space-y-1.5 leading-relaxed">
                    {m.definitions.slice(0, 3).map((d: any, dIdx: number) => (
                      <li key={dIdx}>
                        <span>{d.definition}</span>
                        {d.example && (
                          <p className="text-[11px] text-gray-400 italic mt-0.5">"{d.example}"</p>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {/* Wikipedia Results */}
          {!isLoading && mode === 'wiki' && wikiData && (
            <div className="space-y-3">
              <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                {wikiData.title}
              </h4>

              {wikiData.thumbnail && (
                <img
                  src={wikiData.thumbnail.source}
                  alt={wikiData.title}
                  className="w-full max-h-56 object-cover rounded-xl border border-gray-200 dark:border-white/10"
                />
              )}

              <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {wikiData.extract}
              </p>

              {wikiData.content_urls?.desktop?.page && (
                <div className="pt-2">
                  <a
                    href={wikiData.content_urls.desktop.page}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-primary hover:underline font-bold text-xs uppercase tracking-wider"
                  >
                    <span>Read complete article on Wikipedia</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
