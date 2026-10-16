import React from 'react';
import { useBible } from '../context/BibleContext';
import { AlertTriangle, AlertCircle } from 'lucide-react';

export const ConfirmModal: React.FC = () => {
  const { confirmState, closeConfirm } = useBible();

  if (!confirmState || !confirmState.isOpen) return null;

  const { opts } = confirmState;
  const isWarning = opts.type === 'warning';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity"
      onClick={() => closeConfirm(false)}
    >
      <div
        className="glass-panel modal-enter w-full max-w-sm rounded-2xl shadow-2xl p-5 border border-gray-200/80 dark:border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              isWarning
                ? 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400'
                : 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400'
            }`}
          >
            {isWarning ? <AlertTriangle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
              {opts.title}
            </h3>
          </div>
        </div>

        <p className="text-xs text-gray-600 dark:text-gray-300 mb-5 leading-relaxed">
          {opts.message}
        </p>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => closeConfirm(false)}
            className="btn-secondary px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer"
          >
            {opts.cancelText || 'Cancel'}
          </button>
          <button
            type="button"
            onClick={() => closeConfirm(true)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-sm cursor-pointer ${
              isWarning
                ? 'bg-amber-600 hover:bg-amber-700'
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {opts.confirmText || 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
};
