import React, { useEffect } from "react";
import { toast } from "react-toastify";

const ConfirmToast = ({ message, onConfirm, onCancel, toastId }) => {
  // Debug log to confirm message prop
  useEffect(() => {
    console.log("ConfirmToast rendered with message:", message);
  }, [message]);

  const handleConfirm = async () => {
    try {
      toast.dismiss(toastId);
      await onConfirm();
      toast.success("Item deleted successfully!", {
        position: "top-center",
        autoClose: 2000,
        toastClassName: "bg-gray-900 text-white font-medium rounded-lg shadow-lg",
      });
    } catch (error) {
      console.error("Error during confirm action:", error);
      let errorMessage = "Failed to delete item. Please try again.";
      if (error.code === "permission-denied") {
        errorMessage = "You don't have permission to delete this item.";
      } else if (error.code === "not-found") {
        errorMessage = "Item not found.";
      } else if (error.code === "network-request-failed") {
        errorMessage = "Network error. Please check your connection.";
      }
      toast.error(errorMessage, {
        position: "top-center",
        autoClose: 3000,
        toastClassName: "bg-gray-900 text-white font-medium rounded-lg shadow-lg",
      });
    }
  };

  const handleCancel = () => {
    toast.dismiss(toastId);
    onCancel?.();
    toast.info("Deletion cancelled", {
      position: "top-center",
      autoClose: 2000,
      toastClassName: "bg-gray-900 text-white font-medium rounded-lg shadow-lg",
    });
  };

  // Fallback message if none provided
  const displayMessage = message || "Are you sure you want to delete this item?";

  return (
    <div className="p-4 flex flex-col gap-2 bg-gray-900 rounded-lg shadow-lg">
      <p className="text-white text-base font-medium" aria-live="polite">
        {displayMessage}
      </p>
      <div className="flex gap-2 justify-end">
        <button
          onClick={handleConfirm}
          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
          aria-label="Confirm deletion"
        >
          Yes
        </button>
        <button
          onClick={handleCancel}
          className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
          aria-label="Cancel deletion"
        >
          No
        </button>
      </div>
    </div>
  );
};

export const showConfirmToast = (message, onConfirm, onCancel) => {
  console.log("showConfirmToast called with message:", message); // Debug log
  const id = "confirm-toast";
  toast(
    <ConfirmToast
      message={message}
      onConfirm={onConfirm}
      onCancel={onCancel}
      toastId={id}
    />,
    {
      toastId: id,
      autoClose: false,
      closeOnClick: false,
      draggable: false,
      position: "top-center",
      className: "bg-gray-900 text-white font-medium rounded-lg shadow-lg",
    }
  );
};