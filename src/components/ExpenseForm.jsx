// src/components/ExpenseForm.jsx
import React, { useState } from "react";
import useExpensesStore from "../store/useExpensesStore";

const ExpenseForm = () => {
  const { addExpense } = useExpensesStore();

  const [form, setForm] = useState({
    subject: "",
    employee: "",
    team: "Marketing",
    amount: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subject || !form.employee || !form.amount) {
      alert("Please fill all fields");
      return;
    }

    await addExpense({
      subject: form.subject,
      employee: form.employee,
      team: form.team,
      amount: parseFloat(form.amount),
    });

    // Reset form after submission
    setForm({ subject: "", employee: "", team: "Marketing", amount: "" });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-black/65 text-white p-4 rounded-lg shadow-lg border border-white/30 space-y-4"
    >
      <h2 className="text-lg font-semibold">Add New Expense</h2>

      <div>
        <label className="block text-sm">Subject</label>
        <input
          type="text"
          name="subject"
          value={form.subject}
          onChange={handleChange}
          className="w-full p-2 rounded bg-gray-900 border border-gray-700"
        />
      </div>

      <div>
        <label className="block text-sm">Employee</label>
        <input
          type="text"
          name="employee"
          value={form.employee}
          onChange={handleChange}
          className="w-full p-2 rounded bg-gray-900 border border-gray-700"
        />
      </div>

      <div>
        <label className="block text-sm">Team</label>
        <select
          name="team"
          value={form.team}
          onChange={handleChange}
          className="w-full p-2 rounded bg-gray-900 border border-gray-700"
        >
          <option>Marketing</option>
          <option>Sales</option>
          <option>Operations</option>
          <option>Finance</option>
        </select>
      </div>

      <div>
        <label className="block text-sm">Amount</label>
        <input
          type="number"
          name="amount"
          value={form.amount}
          onChange={handleChange}
          className="w-full p-2 rounded bg-gray-900 border border-gray-700"
        />
      </div>

      <button
        type="submit"
        className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg"
      >
        Add Expense
      </button>
    </form>
  );
};

export default ExpenseForm;
