// src/components/ConfirmToast.jsx
import React from "react";
import { toast } from "react-toastify";

const ConfirmToast = ({ message, onConfirm }) => {
  const id = "confirm-toast"; // unique id so multiple toasts don’t overlap

  const handleConfirm = () => {
    toast.dismiss(id); // close the confirm toast
    onConfirm(); // run delete logic
    toast.success("✅ Expense deleted successfully!"); // show success toast
  };

  const handleCancel = () => {
    toast.dismiss(id);
    toast.info("❌ Deletion cancelled"); // optional info toast
  };

  // Render the toast UI
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
  toast(
    <ConfirmToast message={message} onConfirm={onConfirm} />,
    {
      toastId: "confirm-toast",
      autoClose: false, // stay until user acts
      closeOnClick: false,
      draggable: false,
      position: "top-center",
    }
  );
};

export default ConfirmToast;
