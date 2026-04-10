import Modal from './Modal';

/**
 * Dialogue de confirmation (danger / action sensible).
 */
export default function ConfirmDialog({ isOpen, onConfirm, onCancel, title, message, confirmLabel = 'Confirmer', danger }) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title}>
      {message && <p className="mb-4 text-gray-600 dark:text-gray-300">{message}</p>}
      <div className="flex flex-wrap justify-end gap-2">
        <button type="button" onClick={onCancel} className="btn-secondary py-2 text-sm">
          Annuler
        </button>
        <button type="button" onClick={onConfirm} className={`py-2 text-sm font-semibold rounded-lg px-4 text-white ${danger ? 'bg-red-600 hover:bg-red-700' : 'bg-primary-600 hover:bg-primary-700'}`}>
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
