// src/components/Budget/SetBudgetModal.jsx
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import useFinanceStore from "../../store/useFinanceStore";
import { useAuth } from "../../context/AuthContext";

const SetBudgetModal = ({ onClose, editingBudget }) => {
  const { setCategoryBudget, setTotalBudget, budgets } = useFinanceStore();
  const { user } = useAuth();

  const [form, setForm] = useState({
    category: "Food",
    amount: "",
    currency: "GHS",
    period: "Monthly",
    startDate: "",
  });
  const [error, setError] = useState("");

  // Pre-fill form if editing
  useEffect(() => {
    if (editingBudget) {
      setForm({
        category: editingBudget.category || "Food",
        amount: editingBudget.amount || "",
        currency: editingBudget.currency || "GHS",
        period: editingBudget.period || "Monthly",
        startDate: editingBudget.startDate
          ? new Date(
              editingBudget.startDate.seconds
                ? editingBudget.startDate.seconds * 1000
                : editingBudget.startDate
            )
              .toISOString()
              .split("T")[0]
          : "",
      });
    }
  }, [editingBudget]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(""); // clear error on change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.uid) {
      setError("No user logged in!");
      return;
    }

    const yearMonth = form.startDate
      ? new Date(form.startDate).toISOString().slice(0, 7)
      : "";

    const existingCategories = budgets[yearMonth]?.categories || {};
    const isDuplicate =
      form.category !== "Total" &&
      existingCategories[form.category] &&
      (!editingBudget || editingBudget.category !== form.category);

    if (isDuplicate) {
      setError(
        `A ${form.period.toLowerCase()} budget for ${form.category} already exists.`
      );
      return;
    }

    try {
      if (form.category === "Total") {
        await setTotalBudget(user.uid, yearMonth, Number(form.amount), form.currency);
      } else {
        await setCategoryBudget(
          user.uid,
          yearMonth,
          form.category,
          Number(form.amount),
          form.currency,
          form.period,
          form.startDate
        );
      }

      onClose(); // close modal after save
    } catch (err) {
      console.error("🔥 Error saving budget:", err);
      setError("Failed to save budget. Please try again.");
    }
  };

  const isTotal = form.category === "Total";

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
            {editingBudget
              ? isTotal
                ? "Edit Total Monthly Budget"
                : "Edit Category Budget"
              : isTotal
              ? "Set Total Monthly Budget"
              : "Set New Category Budget"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            <X size={22} />
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-2 bg-red-600/20 text-red-400 rounded-lg text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {/* Category (hidden for Total) */}
          {!isTotal && (
            <div>
              <label className="block mb-1 text-gray-300">Category*</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                required
                className="w-full p-2 rounded bg-gray-800 text-white"
              >
                <option>Food</option>
                <option>Transportation</option>
                <option>Housing</option>
                <option>Entertainment</option>
                <option>Utilities</option>
                <option>Other</option>
              </select>
            </div>
          )}

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
                min="0"
                step="0.01"
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

          {/* Period (skip for Total) */}
          {!isTotal && (
            <div>
              <label className="block mb-1 text-gray-300">Period*</label>
              <select
                name="period"
                value={form.period}
                onChange={handleChange}
                required
                className="w-full p-2 rounded bg-gray-800 text-white"
              >
                <option>Weekly</option>
                <option>Monthly</option>
                <option>Yearly</option>
              </select>
            </div>
          )}

          {/* Start Date (skip for Total) */}
          {!isTotal && (
            <div>
              <label className="block mb-1 text-gray-300">Start Date*</label>
              <input
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                required
                className="w-full p-2 rounded bg-gray-800 text-white outline-none"
              />
            </div>
          )}

          {/* Save */}
          <div className="md:col-span-2 flex justify-end mt-6">
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-white"
            >
              {editingBudget ? "Update Budget" : "Save Budget"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SetBudgetModal;
