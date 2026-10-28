import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { RocketComponent } from '../types/rocket';

interface DeleteConfirmModalProps {
  component: RocketComponent | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  component,
  isOpen,
  onClose,
  onConfirm
}) => {
  if (!isOpen || !component) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md bg-white border border-zinc-300 rounded-xl p-6 shadow-2xl space-y-4"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-zinc-100 border border-zinc-300 flex items-center justify-center text-black">
              <AlertTriangle className="w-5 h-5 text-black" />
            </div>
            <div>
              <h3 className="text-base font-bold text-black">Confirm Record Deletion</h3>
              <p className="text-xs font-mono text-zinc-500">Security Clearance Action</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-black p-1 rounded-md hover:bg-zinc-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-3 text-xs space-y-1">
          <div className="text-zinc-500 font-mono text-[11px]">Hardware Component:</div>
          <div className="text-black font-bold">{component.name}</div>
          <div className="text-zinc-700 font-mono text-[11px]">{component.category} • {component.designation || 'No designation'}</div>
        </div>

        <p className="text-xs text-zinc-600 leading-relaxed">
          Are you sure you want to remove this hardware component from the educational catalog? This record will be erased from local storage immediately.
        </p>

        <div className="flex items-center justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-mono font-medium text-black hover:bg-zinc-100 bg-white border border-zinc-300 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg text-xs font-mono font-semibold text-white bg-black hover:bg-zinc-800 transition-colors flex items-center space-x-1.5 shadow-sm"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Component</span>
          </button>
        </div>
      </div>
    </div>
  );
};
