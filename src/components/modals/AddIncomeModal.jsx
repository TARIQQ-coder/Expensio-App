// src/components/modals/AddIncomeModal.jsx
import React, { useState } from "react";

const AddIncomeModal = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    source: "",
    amount: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSave) onSave(formData); // ✅ send to Home
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
      <div className="bg-zinc-900 text-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Add Income</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Source"
            className="w-full p-2 rounded bg-zinc-800"
            value={formData.source}
            onChange={(e) =>
              setFormData({ ...formData, source: e.target.value })
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
              className="px-4 py-2 bg-green-600 rounded hover:bg-green-500"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddIncomeModal;
