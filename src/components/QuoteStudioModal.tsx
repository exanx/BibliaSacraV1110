import React, { useState, useEffect, useRef } from 'react';
import { useBible } from '../context/BibleContext';
import { BIBLE_BOOKS, FAMOUS_QUOTE_VERSES, DEFAULT_TRANSLATIONS } from '../constants/bibleData';
import { fetchQuoteText, resolveTranslation } from '../services/bibleApi';
import { X, Download, Sparkles, Image as ImageIcon, Loader2 } from 'lucide-react';

const PRESET_BG_COLORS = [
  '#000000', '#111827', '#1e1b4b', '#1e293b', '#14271d', '#2c1810', '#ffffff', '#faedd0'
];

const PRESET_PHOTOS = [
  { name: 'None (Solid)', url: '' },
  { name: 'Starry Night', url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Mountain Sunrise', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Forest Mist', url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Ocean Waves', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Vintage Candle', url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=80' }
];

export const QuoteStudioModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    currentBook,
    currentChapter,
    settings,
    showToast
  } = useBible();

  const [book, setBook] = useState<string>(currentBook);
  const [chapter, setChapter] = useState<string>(currentChapter);
  const [fromVerse, setFromVerse] = useState<string>('1');
  const [toVerse, setToVerse] = useState<string>('1');
  const [translation, setTranslation] = useState<string>(settings.translation);
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '9:16' | '16:9'>('1:1');
  const [fontFamily, setFontFamily] = useState<string>('Crimson Pro');
  const [bgColor, setBgColor] = useState<string>('#111111');
  const [textColor, setTextColor] = useState<string>('#FFFFFF');
  const [bgImageUrl, setBgImageUrl] = useState<string>('');

  const [quoteText, setQuoteText] = useState<string>('');
  const [isFetchingText, setIsFetchingText] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Inspiration verses pool
  const [inspireList, setInspireList] = useState<typeof FAMOUS_QUOTE_VERSES>([]);

  useEffect(() => {
    // Shuffle 6 random inspiration verses
    const shuffled = [...FAMOUS_QUOTE_VERSES].sort(() => 0.5 - Math.random()).slice(0, 6);
    setInspireList(shuffled);
  }, [activeModal]);

  // Fetch verse text when reference or translation changes
  useEffect(() => {
    if (activeModal !== 'quote') return;

    let isMounted = true;
    setIsFetchingText(true);

    fetchQuoteText(book, chapter, fromVerse, toVerse, translation, settings.customBibles)
      .then((txt) => {
        if (isMounted) {
          setQuoteText(txt);
          setIsFetchingText(false);
        }
      })
      .catch((e) => {
        if (isMounted) {
          setQuoteText('For God so loved the world, as to give his only begotten Son...');
          setIsFetchingText(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [book, chapter, fromVerse, toVerse, translation, activeModal, settings.customBibles]);

  if (activeModal !== 'quote') return null;

  const totalChapters =
    BIBLE_BOOKS["Old Testament"][book] ||
    BIBLE_BOOKS["New Testament"][book] ||
    1;

  const handleInspirationClick = (item: (typeof FAMOUS_QUOTE_VERSES)[0]) => {
    setBook(item.book);
    setChapter(item.chapter);
    setFromVerse(item.from);
    setToVerse(item.to);
    showToast(`Loaded ${item.book} ${item.chapter}:${item.from === item.to ? item.from : `${item.from}–${item.to}`}`);
  };

  const currentTranslationObj = resolveTranslation(translation, settings.customBibles);
  const verseRefStr = `${book} ${chapter}:${fromVerse === toVerse ? fromVerse : `${fromVerse}–${toVerse}`}`;

  // Download high-resolution Canvas
  const handleDownloadImage = async () => {
    setIsGenerating(true);
    try {
      let canvasW = 1200;
      let canvasH = 1200;
      if (aspectRatio === '9:16') {
        canvasW = 1080;
        canvasH = 1920;
      } else if (aspectRatio === '16:9') {
        canvasW = 1920;
        canvasH = 1080;
      }

      const canvas = document.createElement('canvas');
      canvas.width = canvasW;
      canvas.height = canvasH;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context not available');

      // Draw background image or solid color
      if (bgImageUrl) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        await new Promise((res, rej) => {
          img.onload = res;
          img.onerror = () => rej(new Error('Failed to load background photo'));
          img.src = bgImageUrl;
        });

        const hRatio = canvasW / img.width;
        const vRatio = canvasH / img.height;
        const ratio = Math.max(hRatio, vRatio);
        const shiftX = (canvasW - img.width * ratio) / 2;
        const shiftY = (canvasH - img.height * ratio) / 2;
        ctx.drawImage(img, 0, 0, img.width, img.height, shiftX, shiftY, img.width * ratio, img.height * ratio);

        // Dark overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
        ctx.fillRect(0, 0, canvasW, canvasH);
      } else {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvasW, canvasH);
      }

      // Format text layout
      const pad = aspectRatio === '9:16' ? 120 : 100;
      const maxTextW = canvasW - pad * 2;

      let fontSize = aspectRatio === '9:16' ? 64 : 58;
      let lineHeight = fontSize * 1.5;
      ctx.font = `italic ${fontSize}px "${fontFamily}", serif`;

      const words = quoteText.split(' ');
      let lines: string[] = [];
      let curLine = '';

      for (let w of words) {
        const test = curLine + w + ' ';
        if (ctx.measureText(test).width > maxTextW && curLine) {
          lines.push(curLine);
          curLine = w + ' ';
        } else {
          curLine = test;
        }
      }
      lines.push(curLine);

      // Center vertically
      const totalTextH = lines.length * lineHeight + 120;
      let startY = (canvasH - totalTextH) / 2;

      // Draw quotes mark
      ctx.textAlign = 'center';
      ctx.font = `60px "${fontFamily}", serif`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.fillText('“', canvasW / 2, startY - 40);

      // Draw lines
      ctx.font = `italic ${fontSize}px "${fontFamily}", serif`;
      ctx.fillStyle = textColor;
      for (let l of lines) {
        ctx.fillText(l.trim(), canvasW / 2, startY);
        startY += lineHeight;
      }

      // Small separator line
      startY += 20;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(canvasW / 2 - 40, startY);
      ctx.lineTo(canvasW / 2 + 40, startY);
      ctx.stroke();

      // Draw Reference
      startY += 35;
      ctx.font = '600 32px Inter, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.fillText(`— ${verseRefStr} (${currentTranslationObj.shortName || 'DRB'})`, canvasW / 2, startY);

      // Watermark pill
      const wmText = 'Biblia Sacra • Free Bible Reader';
      ctx.font = '500 20px Inter, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.fillText(wmText, canvasW / 2, canvasH - 45);

      // Trigger download
      const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/png'));
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `quote_${book.toLowerCase()}_${chapter}_${fromVerse}.png`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('Quote image downloaded!');
      }
    } catch (e: any) {
      console.warn('Canvas export failed:', e);
      showToast('Error generating quote image.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 z-50 transition-opacity"
      onClick={() => setActiveModal(null)}
    >
      <div
        className="glass-panel modal-enter w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-white/5 bg-white/40 dark:bg-black/40">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-primary" />
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Quote Studio</h3>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="p-1.5 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content: Split Preview & Controls */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-6 p-5">
          {/* Live Preview Column */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center bg-gray-100/60 dark:bg-black/40 rounded-2xl p-6 min-h-[360px] border border-gray-200/50 dark:border-white/5">
            <div
              className="relative rounded-2xl shadow-2xl p-6 flex flex-col justify-between overflow-hidden text-center transition-all duration-300 border border-white/10"
              style={{
                width: aspectRatio === '9:16' ? '220px' : aspectRatio === '16:9' ? '340px' : '280px',
                height: aspectRatio === '9:16' ? '390px' : aspectRatio === '16:9' ? '192px' : '280px',
                backgroundColor: bgColor,
                color: textColor,
                fontFamily: `"${fontFamily}", serif`
              }}
            >
              {bgImageUrl && (
                <>
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url('${bgImageUrl}')` }}
                  />
                  <div className="absolute inset-0 bg-black/60" />
                </>
              )}

              <div className="relative z-10 my-auto">
                <span className="text-2xl opacity-25 select-none block mb-1">“</span>
                {isFetchingText ? (
                  <Loader2 className="w-6 h-6 animate-spin mx-auto opacity-60 my-4" />
                ) : (
                  <p className="text-xs sm:text-sm font-medium leading-relaxed italic line-clamp-6">
                    {quoteText}
                  </p>
                )}
              </div>

              <div className="relative z-10 pt-2 border-t border-white/20 mt-auto">
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-85">
                  — {verseRefStr} ({currentTranslationObj.shortName || 'DRB'})
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 text-[11px] font-mono text-gray-400">
              <span>{aspectRatio} Card</span>
              <span>•</span>
              <span>{fontFamily}</span>
            </div>
          </div>

          {/* Controls Column */}
          <div className="lg:col-span-6 space-y-4">
            {/* Inspiration Chips */}
            <div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span>Quick Inspiration</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {inspireList.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleInspirationClick(item)}
                    className="text-[10px] font-semibold px-2 py-1 rounded-md btn-secondary hover:text-primary transition-colors cursor-pointer"
                  >
                    {item.book} {item.chapter}:{item.from === item.to ? item.from : `${item.from}–${item.to}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Book / Chapter / Verse Pickers */}
            <div className="grid grid-cols-4 gap-2">
              <div className="col-span-2">
                <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Book</label>
                <select
                  value={book}
                  onChange={(e) => setBook(e.target.value)}
                  className="glass-input w-full p-2 rounded-lg text-xs outline-none"
                >
                  {Object.keys({ ...BIBLE_BOOKS["Old Testament"], ...BIBLE_BOOKS["New Testament"] }).map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Ch</label>
                <select
                  value={chapter}
                  onChange={(e) => setChapter(e.target.value)}
                  className="glass-input w-full p-2 rounded-lg text-xs outline-none"
                >
                  {Array.from({ length: totalChapters }, (_, i) => (i + 1).toString()).map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Verse</label>
                <input
                  type="number"
                  min={1}
                  value={fromVerse}
                  onChange={(e) => {
                    setFromVerse(e.target.value);
                    if (parseInt(toVerse, 10) < parseInt(e.target.value, 10)) {
                      setToVerse(e.target.value);
                    }
                  }}
                  className="glass-input w-full p-2 rounded-lg text-xs outline-none"
                />
              </div>
            </div>

            {/* Aspect Ratio */}
            <div>
              <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1.5">Aspect Ratio</label>
              <div className="flex gap-2">
                {(['1:1', '9:16', '16:9'] as const).map((ratio) => (
                  <button
                    key={ratio}
                    type="button"
                    onClick={() => setAspectRatio(ratio)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      aspectRatio === ratio
                        ? 'btn-primary shadow-sm'
                        : 'btn-secondary hover:border-primary/40'
                    }`}
                  >
                    {ratio === '1:1' ? 'Square (1:1)' : ratio === '9:16' ? 'Story (9:16)' : 'Wide (16:9)'}
                  </button>
                ))}
              </div>
            </div>

            {/* Typography Font */}
            <div>
              <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Font Family</label>
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="glass-input w-full p-2 rounded-lg text-xs outline-none cursor-pointer"
              >
                <optgroup label="Serif">
                  <option value="Crimson Pro">Crimson Pro</option>
                  <option value="Lora">Lora</option>
                  <option value="Merriweather">Merriweather</option>
                  <option value="Playfair Display">Playfair Display</option>
                  <option value="Tinos">Tinos</option>
                </optgroup>
                <optgroup label="Sans-Serif">
                  <option value="Inter">Inter</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Open Sans">Open Sans</option>
                  <option value="Lato">Lato</option>
                  <option value="Nunito">Nunito</option>
                  <option value="Oswald">Oswald</option>
                </optgroup>
                <optgroup label="Handwriting">
                  <option value="Caveat">Caveat</option>
                </optgroup>
              </select>
            </div>

            {/* Background Color & Photo */}
            <div>
              <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1.5">Card Background</label>
              <div className="flex items-center gap-2 mb-2">
                {PRESET_BG_COLORS.map((hex) => (
                  <button
                    key={hex}
                    type="button"
                    onClick={() => {
                      setBgColor(hex);
                      setBgImageUrl('');
                    }}
                    style={{ backgroundColor: hex }}
                    className={`w-6 h-6 rounded-full border border-gray-300 dark:border-white/20 transition-transform cursor-pointer ${
                      bgColor === hex && !bgImageUrl ? 'scale-125 ring-2 ring-primary ring-offset-2' : ''
                    }`}
                  />
                ))}
              </div>

              {/* Photos Dropdown */}
              <select
                value={bgImageUrl}
                onChange={(e) => setBgImageUrl(e.target.value)}
                className="glass-input w-full p-2 rounded-lg text-xs outline-none cursor-pointer"
              >
                {PRESET_PHOTOS.map((p) => (
                  <option key={p.name} value={p.url}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/30 flex justify-between items-center">
          <p className="text-[11px] text-gray-400">High-resolution PNG export with crisp typography</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="btn-secondary px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isGenerating || isFetchingText}
              onClick={handleDownloadImage}
              className="btn-primary px-5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download Image</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
