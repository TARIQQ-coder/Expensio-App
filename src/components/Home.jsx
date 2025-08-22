import React, { useEffect } from "react";
import { FaWallet } from "react-icons/fa";
import { MdShoppingCart, MdTrendingUp } from "react-icons/md";
import { IoMdTime } from "react-icons/io";
import { RiCalendarEventFill } from "react-icons/ri";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { formatCurrency } from "../utils/formatCurrency";
import useExpensesStore from "../store/useExpensesStore";
import { auth } from "../config/firebaseConfig";
import { actions } from "../data/actions";

const Home = () => {
  const { expenses, fetchExpenses } = useExpensesStore();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchExpenses(user.uid);
      }
    });
    return () => unsubscribe();
  }, [fetchExpenses]);

  // Calculate summary stats
  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const monthlyBudget = 2000;
  const remaining = monthlyBudget - totalSpent;
  const biggestExpense = expenses.length
    ? expenses.reduce((max, exp) => (exp.amount > max.amount ? exp : max), expenses[0])
    : null;

  // Prepare chart data
  const categoryData = expenses.reduce((acc, exp) => {
    const category = exp.category || "Other";
    if (!acc[category]) acc[category] = 0;
    acc[category] += exp.amount;
    return acc;
  }, {});

  const chartData = Object.keys(categoryData).map((cat) => ({
    name: cat,
    value: categoryData[cat],
  }));

  const COLORS = ["#8b5cf6", "#ec4899", "#f97316", "#22c55e", "#3b82f6", "#eab308"];

  return (
    <div className="lg:pl-70 pt-10 space-y-6">
      {/* Top Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Spending Overview */}
        <div className="bg-black/65 text-white py-4 rounded-lg shadow-lg border border-white/30 col-span-1 h-full flex flex-col">
          <h3 className="text-xl font-semibold mb-2 border-b-2 pl-4 border-white/30 pb-1">
            Spending Overview
          </h3>
          <ul className="space-y-2 px-4 flex-grow">
            <li className="flex items-center h-12">
              <FaWallet className="text-purple-500 mr-2 w-4 h-4" />
              <span>Total Spent</span>
              <span className="ml-auto">{formatCurrency(totalSpent)}</span>
            </li>
            <li className="flex items-center h-12">
              <MdShoppingCart className="text-purple-500 mr-2 w-4 h-4" />
              <span>Monthly Budget</span>
              <span className="ml-auto">{formatCurrency(monthlyBudget)}</span>
            </li>
            <li className="flex items-center h-12">
              <IoMdTime className="text-purple-500 mr-2 w-4 h-4" />
              <span>Remaining</span>
              <span
                className={`ml-auto ${
                  remaining < 0 ? "text-red-400" : "text-green-400"
                }`}
              >
                {formatCurrency(remaining)}
              </span>
            </li>
            <li className="flex items-center h-12">
              <MdTrendingUp className="text-purple-500 mr-2 w-4 h-4" />
              <span>Biggest Expense</span>
              <span className="ml-auto">
                {biggestExpense ? formatCurrency(biggestExpense.amount) : "—"}
              </span>
            </li>
            <li className="flex items-center h-12">
              <RiCalendarEventFill className="text-purple-500 mr-2 w-4 h-4" />
              <span>Upcoming Bills</span>
              <span className="ml-auto">€0.00</span>
            </li>
          </ul>
        </div>

        {/* Recent Transactions */}
        <div className="bg-black/65 text-white py-4 rounded-lg border border-white/30 col-span-2">
          <h2 className="text-xl font-semibold mb-2 border-b-2 pl-4 border-white/30 pb-1">
            Recent Transactions
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="p-2 text-left">Date</th>
                  <th className="p-2 text-left">Category</th>
                  <th className="p-2 text-left">Description</th>
                  <th className="p-2 text-left">Amount</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense.id}>
                    <td className="p-2">
                      {new Date(expense.date).toLocaleDateString()}
                    </td>
                    <td className="p-2">{expense.category || "General"}</td>
                    <td className="p-2">{expense.subject}</td>
                    <td className="p-2">{formatCurrency(expense.amount)}</td>
                  </tr>
                ))}
                {expenses.length === 0 && (
                  <tr>
                    <td colSpan="4" className="p-2 text-center text-gray-400">
                      No transactions yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Quick Access */}
      <div className="bg-black/70 border border-white/20 rounded-lg py-4">
        <h2 className="text-lg font-semibold text-white mb-4 border-b-2 pl-4 border-white/30 pb-1">
          Quick Access
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-4">
          {actions.map((action, idx) => (
            <button
              key={idx}
              className="flex items-center space-x-3 bg-zinc-900/70 hover:bg-zinc-800 
                     rounded-lg p-4 text-white transition-colors w-full"
            >
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full ${action.bg}`}
              >
                <action.icon size={20} />
              </div>
              <span className="font-medium">+ {action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Expenses by Category Chart */}
      <div className="bg-black/70 border border-white/20 rounded-lg py-4">
        <h2 className="text-lg font-semibold text-white mb-4 border-b-2 pl-4 border-white/30 pb-1">
          Expenses by Category
        </h2>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-gray-400">No data to display.</p>
        )}
      </div>
    </div>
  );
};

export default Home;
