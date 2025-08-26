// src/components/modals/NewIncomeModal.jsx
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import useFinanceStore from "../../store/useFinanceStore";
import { useAuth } from "../../context/AuthContext";

const NewIncomeModal = ({ onClose, editingIncome }) => {
  const { addIncome, updateIncome } = useFinanceStore();
  const { user } = useAuth();

  // State with default values
  const [form, setForm] = useState({
    title: "",
    date: "",
    amount: "",
    currency: "GHS",
    category: "Salary",
  });

  // ✅ If editingIncome is provided, pre-fill the form
  useEffect(() => {
    if (editingIncome) {
      setForm({
        title: editingIncome.title || "",
        date: editingIncome.date
          ? new Date(
              editingIncome.date.seconds
                ? editingIncome.date.seconds * 1000 // Firestore timestamp
                : editingIncome.date
            )
              .toISOString()
              .split("T")[0]
          : "",
        amount: editingIncome.amount || "",
        currency: editingIncome.currency || "GHS",
        category: editingIncome.category || "Salary",
      });
    }
  }, [editingIncome]);

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
      if (editingIncome) {
        await updateIncome(user.uid, editingIncome.id, {
          ...form,
          amount: Number(form.amount),
          date: new Date(form.date),
        });
      } else {
        await addIncome(user.uid, {
          ...form,
          amount: Number(form.amount),
          date: new Date(form.date),
          createdAt: new Date(),
        });
      }
      onClose();
    } catch (error) {
      console.error("Error saving income:", error);
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
            {editingIncome ? "Edit Income" : "Add New Income"}
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
                className="p-2 rounded bg-gray-800 text-white cursor-pointer"
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
              <option>Salary</option>
              <option>Business</option>
              <option>Gift</option>
              <option>Bonus</option>
              <option>Other</option>
            </select>
          </div>

          {/* Save button */}
          <div className="md:col-span-2 flex justify-end mt-6">
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-white"
            >
              {editingIncome ? "Update Income" : "Save Income"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewIncomeModal;
