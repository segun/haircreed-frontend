import { X } from 'lucide-react';

type ConfirmDialogProps = {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onClose: () => void;
};

export default function ConfirmDialog({ isOpen, title, message, onConfirm, onClose }: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-md p-6 mx-4 bg-white rounded-lg shadow-xl transform transition-all"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 p-1 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-full"
        >
          <X size={18} />
        </button>
        
        <h3 className="text-lg font-semibold text-zinc-900">{title}</h3>
        
        <p className="mt-2 text-sm text-zinc-600">{message}</p>
        
        <div className="mt-6 flex justify-end space-x-3">
          <button 
            onClick={onClose} 
            className="px-4 py-2 text-sm font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-500"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm} 
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
