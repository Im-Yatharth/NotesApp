'use client';

import React from 'react';

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
  noteTitle?: string;
  error?: string | null;
}

export default function DeleteConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  noteTitle,
  error = null
}: DeleteConfirmDialogProps) {
  const [localError, setLocalError] = React.useState<string | null>(null);

  const handleConfirm = async () => {
    try {
      setLocalError(null);
      await onConfirm();
      onClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete note';
      setLocalError(errorMessage);
      console.error('Failed to delete note:', error);
    }
  };

  const displayError = error || localError;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Delete Note</h3>
              <p className="text-sm text-gray-500 mt-1">
                Are you sure you want to delete "{noteTitle}"? This action cannot be undone.
              </p>
            </div>
          </div>

          {displayError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{displayError}</p>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? 'Deleting...' : 'Delete Note'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
