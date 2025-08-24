// src/pages/ExpensesPage.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Scissors } from "lucide-react"; // example icon
import useFinanceStore from "../store/useFinanceStore";
import { useAuth } from "../context/AuthContext";
import NewExpenseModal from "../components/modals/NewExpenseModal";

const ExpensesPage = () => {
  const [showModal, setShowModal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const { user } = useAuth();
  const { expenses, subscribeFinance } = useFinanceStore();

  // Auto-open modal if redirected with state
  useEffect(() => {
    if (location.state?.openModal) {
      setShowModal(true);
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate, location.pathname]);

  // 🔄 Subscribe to expenses in real-time
  useEffect(() => {
    if (user?.uid) {
      const unsubscribe = subscribeFinance(user.uid);
      return () => unsubscribe && unsubscribe(); // cleanup
    }
  }, [user, subscribeFinance]);

  return (
    <div className="p-6">
      {/* Add Expense Button */}
      <button
        onClick={() => setShowModal(true)}
        className="px-4 py-2 bg-pink-600 rounded-lg mb-6 hover:bg-pink-700 transition"
      >
        + Add Expense
      </button>

      {/* Expenses List */}
      <div className="space-y-4">
        {expenses.length === 0 ? (
          <p className="text-gray-400">No expenses recorded yet.</p>
        ) : (
          expenses.map((expense) => (
            <div
              key={expense.id}
              className="flex items-center justify-between bg-gray-900 rounded-xl px-4 py-3 shadow"
            >
              {/* Left section: Checkbox + Icon + Info */}
              <div className="flex items-center gap-3">
                <input type="checkbox" className="accent-pink-600" />
                <Scissors className="w-5 h-5 text-teal-500" />
                <div>
                  <p className="text-gray-100 font-medium">{expense.title}</p>
                  <p className="text-gray-400 text-sm">
                    {expense.date
                      ? new Date(expense.date.seconds * 1000).toLocaleDateString()
                      : "—"}
                  </p>
                </div>
              </div>

              {/* Middle section: Category */}
              <p className="text-gray-300">{expense.category || "—"}</p>

              {/* Amount */}
              <p className="text-gray-100 font-semibold">
                {expense.currency || "₵"}
                {expense.amount}
              </p>

              {/* Notes */}
              <p className="text-gray-400">{expense.notes || "—"}</p>

              {/* Status badge */}
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  expense.status === "Submitted"
                    ? "bg-green-600 text-white"
                    : "bg-pink-700 text-white"
                }`}
              >
                {expense.status || "Not Submitted"}
              </span>
            </div>
          ))
        )}
      </div>

      {/* New Expense Modal */}
      {showModal && <NewExpenseModal onClose={() => setShowModal(false)} />}
    </div>
  );
};

export default ExpensesPage;
