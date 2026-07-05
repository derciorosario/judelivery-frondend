// src/components/common/ConfirmDialog.jsx
import Modal from "./Modal";

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText, cancelText, variant = "danger" }) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
        return "bg-red-500 hover:bg-red-600";
      case "warning":
        return "bg-amber-500 hover:bg-amber-600";
      default:
        return "bg-blue-500 hover:bg-blue-600";
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="space-y-4">
        <p className="text-slate-600 text-center">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors"
          >
            {cancelText || "Cancelar"}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2 rounded-lg text-white font-semibold text-sm transition-colors ${getVariantStyles()}`}
          >
            {confirmText || "Confirmar"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;