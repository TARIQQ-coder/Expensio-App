import React, { useState, useMemo, useEffect } from "react";
import { FaPlus } from "react-icons/fa";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import useFinanceStore from "../store/useFinanceStore";
import { useAuth } from "../context/AuthContext";
import SetBudgetModal from "../components/modals/SetBudgetModal";

const BudgetPage = () => {
  const { budgets, expenses, subscribeFinance } = useFinanceStore();
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);

  // Get current month (YYYY-MM)
  const yearMonth = new Date().toISOString().slice(0, 7);
  const monthData = budgets[yearMonth] || { total: 0, categories: {} };
  const categories = monthData.categories || {};

  // Subscribe to Firestore on mount
  useEffect(() => {
    if (user?.uid) {
      const unsub = subscribeFinance(user.uid, yearMonth);
      return () => unsub && unsub();
    }
  }, [user, yearMonth, subscribeFinance]);

  // Total monthly budget
  const totalMonthlyBudget = monthData.total || 0;

  // Total expenses
  const totalExpenses = useMemo(() => {
    return expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  }, [expenses]);

  const remainingMonthlyBudget = totalMonthlyBudget - totalExpenses;

  // Category Budgets
  const categoryBudgets = useMemo(() => {
    const categoryMap = {};

    // Initialize with budgeted categories
    Object.entries(categories).forEach(([category, amount]) => {
      categoryMap[category] = {
        budgetAmount: amount || 0,
        spent: 0,
        currency: monthData.currency || "GHS",
      };
    });

    // Add expenses
    expenses.forEach((expense) => {
      const category = expense.category || "Other";
      if (categoryMap[category]) {
        categoryMap[category].spent += expense.amount || 0;
      } else {
        // Include new categories from expenses even if not budgeted
        categoryMap[category] = {
          budgetAmount: 0,
          spent: expense.amount || 0,
          currency: monthData.currency || "GHS",
        };
      }
    });

    // Sort alphabetically (optional)
    return Object.entries(categoryMap)
      .map(([category, data]) => ({
        name: category,
        budgetAmount: data.budgetAmount,
        spent: data.spent,
        remaining: data.budgetAmount - data.spent,
        currency: data.currency,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [categories, expenses, monthData.currency]);

  // Modal handlers
  const handleOpenModal = (budget = null) => {
    setEditingBudget(budget);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBudget(null);
  };

  return (
    <div className="p-6 space-y-6 text-white">
      {isModalOpen && (
        <SetBudgetModal onClose={handleCloseModal} editingBudget={editingBudget} />
      )}

      {/* Budget Overview */}
      <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-lg py-5 shadow-lg">
        <div className="flex justify-between items-center mb-4 border-b-2 pb-1 pl-4 pr-5 border-white/20">
          <h2 className="text-lg font-semibold">Monthly Budget Overview</h2>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-white"
          >
            <FaPlus size={16} /> Set Budget
          </button>
        </div>
        <div className="px-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <span className="text-gray-300">Total Budget</span>
            <p className="font-bold text-xl">
              GHS {totalMonthlyBudget.toFixed(2)}
            </p>
          </div>
          <div>
            <span className="text-gray-300">Total Spent</span>
            <p className="font-bold text-xl">
              GHS {totalExpenses.toFixed(2)}
            </p>
          </div>
          <div>
            <span className="text-gray-300">Remaining Budget</span>
            <p
              className={`font-bold text-xl ${
                remainingMonthlyBudget < 0 ? "text-red-400" : "text-green-400"
              }`}
            >
              GHS {remainingMonthlyBudget.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Category Budgets */}
      <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-lg py-5 shadow-lg">
        <h2 className="text-lg font-semibold mb-4 border-b-2 pb-1 pl-4 border-white/20">
          Category Budgets
        </h2>
        <div className="overflow-x-auto px-5">
          <table className="w-full text-left text-sm">
            <thead className="text-gray-400">
              <tr>
                <th>Category</th>
                <th>Budget</th>
                <th>Spent</th>
                <th>Remaining</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {categoryBudgets.map((budget) => (
                <tr key={budget.name}>
                  <td>{budget.name}</td>
                  <td>
                    {budget.currency} {budget.budgetAmount.toFixed(2)}
                  </td>
                  <td>
                    {budget.currency} {budget.spent.toFixed(2)}
                  </td>
                  <td
                    className={budget.remaining < 0 ? "text-red-400" : "text-green-400"}
                  >
                    {budget.currency} {budget.remaining.toFixed(2)}
                  </td>
                  <td>
                    <button
                      onClick={() =>
                        handleOpenModal({
                          category: budget.name,
                          amount: budget.budgetAmount,
                          currency: budget.currency,
                          period: "Monthly",
                          startDate: new Date(),
                        })
                      }
                      className="text-blue-400 hover:text-blue-300"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Budget Allocation Chart */}
      <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-lg py-5 shadow-lg">
        <h2 className="text-lg font-semibold mb-4 border-b-2 pb-1 pl-4 border-white/20">
          Budget Allocation
        </h2>
        <div className="px-5">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryBudgets}>
              <XAxis dataKey="name" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip />
              <Bar dataKey="budgetAmount" fill="#4ade80" name="Budget" />
              <Bar dataKey="spent" fill="#a855f7" name="Spent" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default BudgetPage;
