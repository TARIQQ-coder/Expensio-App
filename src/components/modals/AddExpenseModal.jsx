// src/components/modals/AddExpenseModal.jsx
import React, { useState } from "react";

const AddExpenseModal = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    subject: "",
    amount: "",
    category: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Saving expense:", formData);
    if (onSave) {
      onSave(formData); // ✅ Pass data back to Home
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
      <div className="bg-zinc-900 text-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Add Expense</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Subject"
            className="w-full p-2 rounded bg-zinc-800"
            value={formData.subject}
            onChange={(e) =>
              setFormData({ ...formData, subject: e.target.value })
            }
          />
          <input
            type="number"
            placeholder="Amount"
            className="w-full p-2 rounded bg-zinc-800"
            value={formData.amount}
            onChange={(e) =>
              setFormData({ ...formData, amount: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="Category"
            className="w-full p-2 rounded bg-zinc-800"
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
          />
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 rounded hover:bg-purple-500"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddExpenseModal;
