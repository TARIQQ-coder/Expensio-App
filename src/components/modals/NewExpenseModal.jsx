// src/components/modals/NewExpenseModal.jsx
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import useFinanceStore from "../../store/useFinanceStore";
import { useAuth } from "../../context/AuthContext";

const NewExpenseModal = ({ onClose, editingExpense }) => {
  const { addExpense, updateExpense } = useFinanceStore();
  const { user } = useAuth();

  // State with default values
  const [form, setForm] = useState({
    title: "",
    date: "",
    amount: "",
    currency: "GHS",
    category: "Other",
  });

  // ✅ If editingExpense is provided, pre-fill the form
  useEffect(() => {
  if (editingExpense) {
    setForm({
      title: editingExpense.title || "",
      // ✅ convert Firestore Timestamp → yyyy-mm-dd string
      date: editingExpense.date
        ? new Date(
            editingExpense.date.seconds
              ? editingExpense.date.seconds * 1000 // Firestore timestamp
              : editingExpense.date                // already JS Date
          ).toISOString().split("T")[0]
        : "",
      amount: editingExpense.amount || "",
      currency: editingExpense.currency || "GHS",
      category: editingExpense.category || "Other",
    });
  }
}, [editingExpense]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.uid) {
      console.error("No user logged in!");
      return;
    }

    try {
    if (editingExpense) {
      await updateExpense(user.uid, editingExpense.id, {
        ...form,
        amount: Number(form.amount),
        date: new Date(form.date),   // ✅ save as Date object (timestamp)
      });
    } else {
      await addExpense(user.uid, {
        ...form,
        amount: Number(form.amount),
        date: new Date(form.date),   // ✅ save as Date object (timestamp)
        createdAt: new Date(),       // ✅ still track when added
      });
    }
    onClose();
  } catch (error) {
    console.error("Error saving expense:", error);
  }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 border border-gray-800 rounded-2xl p-6 max-w-3xl w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">
            {editingExpense ? "Edit Expense" : "Add New Expense"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            <X size={22} />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {/* Title */}
          <div>
            <label className="block mb-1 text-gray-300">Title*</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className="w-full p-2 rounded bg-gray-800 text-white outline-none"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block mb-1 text-gray-300">Date*</label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              required
              className="w-full p-2 rounded bg-gray-800 text-white outline-none"
            />
          </div>

          {/* Amount + Currency */}
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block mb-1 text-gray-300">Amount*</label>
              <input
                type="number"
                name="amount"
                value={form.amount}
                onChange={handleChange}
                required
                className="w-full p-2 rounded bg-gray-800 text-white outline-none"
              />
            </div>
            <div>
              <label className="block mb-1 text-gray-300">Currency</label>
              <select
                name="currency"
                value={form.currency}
                onChange={handleChange}
                className="p-2 rounded bg-gray-800 text-white"
              >
                <option>USD</option>
                <option>EUR</option>
                <option>GHS</option>
              </select>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block mb-1 text-gray-300">Category*</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full p-2 rounded bg-gray-800 text-white"
            >
              <option>Food</option>
              <option>Transport</option>
              <option>Housing</option>
              <option>Entertainment</option>
              <option>Other</option>
            </select>
          </div>

          {/* Save button */}
          <div className="md:col-span-2 flex justify-end mt-6">
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-white"
            >
              {editingExpense ? "Update Expense" : "Save Expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewExpenseModal;
