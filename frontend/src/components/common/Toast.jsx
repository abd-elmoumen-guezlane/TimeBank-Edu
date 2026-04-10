import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';

const ToastContext = createContext(null);

/** Conteneur d’une notification éphémère (coin bas-droit). */
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  const icons = {
    success: <CheckCircle2 size={18} className="text-green-600 flex-shrink-0" aria-hidden />,
    error: <AlertCircle size={18} className="text-red-600 flex-shrink-0" aria-hidden />,
    info: <Info size={18} className="text-blue-600 flex-shrink-0" aria-hidden />,
  };
  const borders = {
    success: 'border-green-200 bg-green-50',
    error: 'border-red-200 bg-red-50',
    info: 'border-blue-200 bg-blue-50',
  };

  return (
    <div
      role="status"
      className={`fixed bottom-4 right-4 z-[100] flex max-w-sm items-start gap-3 rounded-xl border px-4 py-3 shadow-lg ${borders[type] || borders.info}`}
    >
      {icons[type] || icons.info}
      <p className="flex-1 text-sm font-medium text-gray-800 dark:text-gray-100">{message}</p>
      <button type="button" onClick={onClose} className="rounded-lg p-1 text-gray-500 hover:bg-black/5 dark:hover:bg-white/10" aria-label="Fermer">
        <X size={16} />
      </button>
    </div>
  );
}

/** Fournit showToast à toute l’application. */
export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
  }, []);

  const hideToast = useCallback(() => setToast(null), []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <Toast key={toast.id} message={toast.message} type={toast.type} onClose={hideToast} />
      )}
    </ToastContext.Provider>
  );
}

/** Hook pour afficher des toasts (no-op si hors ToastProvider). */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) return { showToast: () => {} };
  return ctx;
}
