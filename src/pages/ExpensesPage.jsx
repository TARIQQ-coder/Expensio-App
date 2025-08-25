import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
import useFinanceStore from "../store/useFinanceStore";
import { useAuth } from "../context/AuthContext";
import NewExpenseModal from "../components/modals/NewExpenseModal";
import { showConfirmToast } from "../components/ConfirmToast";
import categoryIcons from "../data/categoryIcons";

const ExpensesPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const { user } = useAuth();
  const { expenses, subscribeFinance, deleteExpense } = useFinanceStore();

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

  const handleEdit = (expense) => {
    setEditingExpense(expense); // store full object
    setShowModal(true);
  };

  const handleDelete = (expenseId) => {
    showConfirmToast(
      "Are you sure you want to delete this expense?",
      async () => {
        await deleteExpense(user.uid, expenseId);
      }
    );
  };

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6 border-b pb-2">
        <h1 className="text-2xl font-bold text-gray-100">Expenses</h1>
        <button
          onClick={() => {
            setEditingExpense(null); // reset for new expense
            setShowModal(true);
          }}
          className="px-4 py-2 bg-[#0acfbf] rounded-lg hover:bg-[#0cfce8] transition cursor-pointer"
        >
          + New Expense
        </button>
      </div>

      {/* Expenses Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-y-2">
          <thead>
            <tr className="text-gray-400 text-left text-sm">
              <th className="px-4 py-2 font-semibold">DETAILS</th>
              <th className="px-4 py-2 font-semibold">CATEGORY</th>
              <th className="px-4 py-2 font-semibold">AMOUNT</th>
              <th className="px-4 py-2 font-semibold">DATE</th>
              <th className="px-4 py-2 font-semibold">ACTIONS</th>
            </tr>
          </thead>

          <tbody>
            {expenses.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-gray-400 text-center py-4">
                  No expenses recorded yet.
                </td>
              </tr>
            ) : (
              expenses.map((expense, index) => {
                const dateObj = expense.date
                  ? new Date(expense.date.seconds * 1000)
                  : null;

                const rowColor =
                  index % 2 === 0 ? "bg-[#1b1b1b]" : "bg-[#28282a]";

                // Get the icon component for the expense category
                const Icon = categoryIcons[expense.category] || categoryIcons["Other"];

                return (
                  <tr
                    key={expense.id}
                    className={`${rowColor} rounded-xl shadow`}
                  >
                    {/* DETAILS with Category Icon */}
                    <td className="px-4 py-3 text-gray-100 font-medium max-w-[300px]">
  <div className="flex items-center gap-2 truncate">
    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-[#124241]">
      <Icon className="w-4 h-4 text-white" aria-label={expense.category || "Other"} />
    </div>
    <span className="truncate">{expense.title}</span>
  </div>
</td>

                    {/* CATEGORY */}
                    <td className="px-4 py-3 text-gray-300">
                      {expense.category || "—"}
                    </td>

                    {/* AMOUNT */}
                    <td className="px-4 py-3 text-gray-100 font-semibold">
                      {expense.currency || "₵"}
                      {expense.amount}
                    </td>

                    {/* DATE */}
                    <td className="px-4 py-3 text-gray-400">
                      {dateObj ? dateObj.toLocaleDateString() : "—"}
                    </td>

                    {/* ACTIONS */}
                    <td className="px-4 py-3 flex gap-3">
                      <button
                        onClick={() => handleEdit(expense)}
                        className="text-blue-400 hover:text-blue-600"
                      >
                        <Pencil className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(expense.id)}
                        className="text-red-400 hover:text-red-600"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* New Expense Modal (supports editing) */}
      {showModal && (
        <NewExpenseModal
          onClose={() => setShowModal(false)}
          editingExpense={editingExpense} // 👈 send down for pre-fill
        />
      )}
    </div>
  );
};

export default ExpensesPage;