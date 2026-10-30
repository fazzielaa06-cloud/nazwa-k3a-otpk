import React, { useState } from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title: string;
  itemName: string;
  itemType: string;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  itemName,
  itemType,
}) => {
  const [deleting, setDeleting] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setDeleting(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-red-100 overflow-hidden text-slate-800">
        <div className="p-6">
          <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
            Apakah Anda yakin ingin menghapus {itemType} <span className="font-mono font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-200">{itemName}</span> secara permanen dari database sistem terminal?
          </p>
          <p className="text-[11px] text-slate-500 mt-2 italic">
            Tindakan ini tidak dapat dibatalkan dan akan dicatat dalam Audit Trail Keamanan Operasional.
          </p>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-xl transition"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={deleting}
            className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md shadow-red-600/20 flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
          >
            {deleting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Hapus Permanen</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
