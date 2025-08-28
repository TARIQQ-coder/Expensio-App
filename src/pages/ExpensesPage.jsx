import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
import { FaFilter } from "react-icons/fa";
import useFinanceStore from "../store/useFinanceStore";
import { useAuth } from "../context/AuthContext";
import NewExpenseModal from "../components/modals/NewExpenseModal";
import { showConfirmToast } from "../components/ConfirmToast";
import { expenseIcons } from "../data/categoryIcons";

const ExpensesPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [showMonthGrid, setShowMonthGrid] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(""); // Empty string for all expenses
  const monthGridRef = useRef(null);
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

  // Subscribe to expenses (all or filtered by selected month)
  useEffect(() => {
    if (user?.uid) {
      const unsubscribe = subscribeFinance(user.uid, selectedMonth || undefined);
      return () => unsubscribe && unsubscribe();
    }
  }, [user, selectedMonth, subscribeFinance]);

  // Close month picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (monthGridRef.current && !monthGridRef.current.contains(event.target)) {
        setShowMonthGrid(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleEdit = (expense) => {
    setEditingExpense(expense);
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

  // Generate months for the current year
  const months = [
    { value: "", label: "All Expenses" },
    ...Array.from({ length: 12 }, (_, i) => {
      const month = new Date(new Date().getFullYear(), i, 1);
      return {
        value: month.toISOString().slice(0, 7),
        label: month.toLocaleString("default", { month: "short" }),
      };
    }),
  ];

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6 border-b pb-2">
        <h1 className="text-2xl font-bold text-gray-100">
          Expenses {selectedMonth ? `- ${new Date(selectedMonth + "-01").toLocaleString("default", {
            month: "long",
            year: "numeric",
          })}` : ""}
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowMonthGrid(!showMonthGrid)}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 text-white"
            title="Filter by month"
          >
            <FaFilter size={16} />
            <span>{selectedMonth ? new Date(selectedMonth + "-01").toLocaleString("default", { month: "short" }) : "All"}</span>
          </button>
          <button
            onClick={() => {
              setEditingExpense(null);
              setShowModal(true);
            }}
            className="px-4 py-2 bg-[#0acfbf] rounded-lg hover:bg-[#0cfce8] transition cursor-pointer"
          >
            + New Expense
          </button>
        </div>
      </div>

      {/* Month Picker Grid */}
      {showMonthGrid && (
        <div className="relative mb-6">
          <div
            ref={monthGridRef}
            className="absolute z-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4 grid grid-cols-3 gap-2"
          >
            {months.map((m) => (
              <button
                key={m.value || "all"}
                onClick={() => {
                  setSelectedMonth(m.value);
                  setShowMonthGrid(false);
                }}
                className={`px-3 py-1 rounded ${
                  selectedMonth === m.value
                    ? "bg-emerald-600 text-white"
                    : "bg-white/10 text-gray-200 hover:bg-white/20"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      )}

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
                const dateObj = expense.createdAt
                  ? new Date(expense.createdAt.seconds * 1000)
                  : null;

                const rowColor =
                  index % 2 === 0 ? "bg-[#1b1b1b]" : "bg-[#28282a]";

                // Get the icon component for the expense category
                const Icon =
                  expenseIcons[expense.category] || expenseIcons["Other"];

                return (
                  <tr
                    key={expense.id}
                    className={`${rowColor} rounded-xl shadow`}
                  >
                    {/* DETAILS with Category Icon */}
                    <td className="px-4 py-4 text-gray-100 font-medium max-w-[300px]">
                      <div className="flex items-center gap-2 truncate">
                        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-[#124241]">
                          <Icon
                            className="w-4 h-4 text-white"
                            aria-label={expense.category || "Other"}
                          />
                        </div>
                        <span className="truncate">{expense.title}</span>
                      </div>
                    </td>

                    {/* CATEGORY */}
                    <td className="px-4 py-3 text-gray-300">
                      {expense.category || "—"}
                    </td>

                    {/* AMOUNT */}
                    <td className="px-4 py-3 text-gray-100 font-semibold tracking-wide">
                      {expense.currency || "₵"}{" "}
                      {(expense.amount ?? 0).toFixed(2)}
                    </td>

                    {/* DATE */}
                    <td className="px-4 py-3 text-gray-400">
                      {dateObj ? dateObj.toLocaleDateString() : "—"}
                    </td>

                    {/* ACTIONS */}
                    <td className="px-4 pt-5 flex gap-4">
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
          editingExpense={editingExpense}
        />
      )}
    </div>
  );
};

export default ExpensesPage;