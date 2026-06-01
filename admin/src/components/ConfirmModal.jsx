import { AlertCircle } from 'lucide-react';

export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, isDangerous = false }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-sm w-full shadow-xl">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-2 rounded-lg ${isDangerous ? 'bg-red-50' : 'bg-yellow-50'}`}>
              <AlertCircle 
                size={24} 
                className={isDangerous ? 'text-red-600' : 'text-yellow-600'} 
              />
            </div>
            <h2 className="text-lg font-semibold text-neutral-primary">{title}</h2>
          </div>
          
          <p className="text-neutral-text text-sm mb-6">{message}</p>
          
          <div className="flex gap-3 justify-end">
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-lg border border-neutral-border text-neutral-primary hover:bg-neutral-bg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className={`px-4 py-2 rounded-lg text-white font-medium transition-colors ${
                isDangerous
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-primary-gold hover:bg-primary-gold-hover text-neutral-primary'
              }`}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
