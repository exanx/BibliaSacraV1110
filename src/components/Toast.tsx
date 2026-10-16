import React from 'react';
import { useBible } from '../context/BibleContext';

export const Toast: React.FC = () => {
  const { toastMessage, isOnline } = useBible();

  return (
    <>
      {/* Offline Status Banner */}
      {!isOnline && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-amber-600 text-white text-xs font-semibold py-1.5 px-4 rounded-full shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span>Offline Mode — Reading from device cache</span>
        </div>
      )}

      {/* Action Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 glass-panel !bg-black/85 dark:!bg-white/95 text-white dark:text-gray-900 text-xs font-semibold px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 animate-in fade-in zoom-in-95 duration-150 border border-white/10 dark:border-black/10">
          <span>{toastMessage}</span>
        </div>
      )}
    </>
  );
};
