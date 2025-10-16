"use client";

import Modal from "./Modal";

interface ConfirmDialogProps {
  title: string;
  description: string;
  openDialog: boolean;
  handleCloseDialog: () => void;
  handleConfirmChange: (event: React.MouseEvent) => void;
}

export default function ConfirmDialog({
  title,
  description,
  openDialog,
  handleCloseDialog,
  handleConfirmChange,
}: ConfirmDialogProps) {
  return (
    <>
      {openDialog && (
        <Modal onClose={handleCloseDialog}>
          <h2 className="p-4 text-lg font-semibold text-left border-b border-light-gray-3 border-dashed">
            {title}
          </h2>
          <div className="px-6 py-4">
            <p className="text-left">{description}</p>
          </div>
          <div className="w-full p-4 flex justify-end items-center gap-2">
            <button
              onClick={handleConfirmChange}
              className="bg-dark-blue rounded-full text-white px-4 py-2"
            >
              Confirm
            </button>
            <button
              onClick={handleCloseDialog}
              className="bg-transparent text-dark border border-dark-blue rounded-full px-4 py-2"
            >
              Cancel
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
