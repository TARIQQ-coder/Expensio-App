// src/components/ConfirmToast.jsx
import React from "react";
import { toast } from "react-toastify";

const ConfirmToast = ({ message, onConfirm, toastId }) => {
  const handleConfirm = async () => {
    try {
      toast.dismiss(toastId);
      await onConfirm(); // ✅ wait for deletion
      toast.success("✅ Expense deleted successfully!");
    } catch (error) {
      toast.error("❌ Failed to delete expense");
      console.error(error);
    }
  };

  const handleCancel = () => {
    toast.dismiss(toastId);
    toast.info("❌ Deletion cancelled");
  };

  return (
    <div className="flex flex-col gap-2">
      <p>{message}</p>
      <div className="flex gap-2 justify-end">
        <button
          onClick={handleConfirm}
          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Yes
        </button>
        <button
          onClick={handleCancel}
          className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          No
        </button>
      </div>
    </div>
  );
};

export const showConfirmToast = (message, onConfirm) => {
  const id = "confirm-toast";
  toast(
    <ConfirmToast message={message} onConfirm={onConfirm} toastId={id} />,
    {
      toastId: id,
      autoClose: false,
      closeOnClick: false,
      draggable: false,
      position: "top-center",
    }
  );
};
