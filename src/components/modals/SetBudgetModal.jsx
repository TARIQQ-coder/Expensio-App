// src/components/modals/SetBudgetModal.jsx
import React, { useState } from "react";

const SetBudgetModal = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    amount: "",
    period: "monthly", // default value
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSave) onSave(formData); // ✅ send to Home
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
      <div className="bg-zinc-900 text-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Set Budget</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="number"
            placeholder="Amount"
            className="w-full p-2 rounded bg-zinc-800"
            value={formData.amount}
            onChange={(e) =>
              setFormData({ ...formData, amount: e.target.value })
            }
          />
          <select
            className="w-full p-2 rounded bg-zinc-800"
            value={formData.period}
            onChange={(e) =>
              setFormData({ ...formData, period: e.target.value })
            }
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
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
              className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-500"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SetBudgetModal;
