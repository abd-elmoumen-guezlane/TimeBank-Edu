import { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Fenêtre modale centrée avec overlay.
 * Fermeture : bouton, clic overlay, touche Escape.
 */
export default function Modal({ isOpen, onClose, title, children, wide = false }) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby={title ? 'modal-title' : undefined}>
      <button type="button" className="absolute inset-0 bg-black/50" aria-label="Fermer la fenêtre" onClick={onClose} />
      <div className={`relative z-[91] w-full rounded-xl border border-gray-200 bg-white p-5 shadow-xl dark:border-gray-700/80 dark:bg-gray-900 dark:shadow-2xl dark:shadow-black/40 ${wide ? 'max-w-2xl' : 'max-w-lg'}`}>
        <div className="mb-4 flex items-start justify-between gap-3">
          {title ? (
            <h2 id="modal-title" className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h2>
          ) : (
            <span />
          )}
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800" aria-label="Fermer">
            <X size={20} />
          </button>
        </div>
        <div className="text-sm text-gray-700 dark:text-gray-200">{children}</div>
      </div>
    </div>
  );
}
