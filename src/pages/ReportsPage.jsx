import React, { useEffect, useState, useMemo } from "react";
import { FaFilter } from "react-icons/fa";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import useFinanceStore from "../store/useFinanceStore";
import { useAuth } from "../context/AuthContext";

const COLORS = ["#4ade80", "#a855f7", "#f472b6", "#38bdf8", "#fb923c", "#facc15"];

const ReportsPage = () => {
  const { expenses, income, budgets, subscribeFinance } = useFinanceStore();
  const { user } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState(""); // Empty string for all data
  const [showMonthGrid, setShowMonthGrid] = useState(false);

  // Subscribe to finance data
  useEffect(() => {
    if (user?.uid) {
      const unsubscribe = subscribeFinance(user.uid, selectedMonth || undefined);
      return () => unsubscribe && unsubscribe();
    }
  }, [user, selectedMonth, subscribeFinance]);

  // Calculate totals
  const totalIncome = useMemo(() => {
    return income.reduce((sum, i) => sum + (i.amount || 0), 0);
  }, [income]);

  const totalExpenses = useMemo(() => {
    return expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  }, [expenses]);

  const netSavings = totalIncome - totalExpenses;
  const totalBudget = selectedMonth ? budgets[selectedMonth]?.total || 0 : 0;
  const budgetUtilization = totalBudget > 0 ? (totalExpenses / totalBudget) * 100 : 0;
  const currency = selectedMonth ? budgets[selectedMonth]?.currency || "₵" : "₵";

  // Group expenses by category
  const expenseByCategory = useMemo(() => {
    const map = {};
    expenses.forEach((e) => {
      const category = e.category || "Other";
      map[category] = (map[category] || 0) + (e.amount || 0);
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [expenses]);

  // Group income by category
  const incomeByCategory = useMemo(() => {
    const map = {};
    income.forEach((i) => {
      const category = i.category || "Other";
      map[category] = (map[category] || 0) + (i.amount || 0);
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [income]);

  // Group expenses by date for trend chart
  const expensesOverTime = useMemo(() => {
    const map = {};
    expenses.forEach((e) => {
      const date = e.createdAt
        ? new Date(e.createdAt.seconds * 1000).toLocaleDateString()
        : "Unknown";
      map[date] = (map[date] || 0) + (e.amount || 0);
    });
    return Object.entries(map).map(([date, amount]) => ({ date, amount }));
  }, [expenses]);

  // Generate months for the current year
  const months = [
    { value: "", label: "All Data" },
    ...Array.from({ length: 12 }, (_, i) => {
      const month = new Date(new Date().getFullYear(), i, 1);
      return {
        value: month.toISOString().slice(0, 7),
        label: month.toLocaleString("default", { month: "short" }),
      };
    }),
  ];

  return (
    <div className="p-6 space-y-6 text-white">
      {/* Header with Filter */}
      <div className="flex items-center justify-between mb-6 border-b pb-2">
        <h1 className="text-2xl font-bold">
          Reports {selectedMonth ? `- ${new Date(selectedMonth + "-01").toLocaleString("default", {
            month: "long",
            year: "numeric",
          })}` : ""}
        </h1>
        <button
          onClick={() => setShowMonthGrid(!showMonthGrid)}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20"
          title="Filter by month"
        >
          <FaFilter size={16} />
          <span>{selectedMonth ? new Date(selectedMonth + "-01").toLocaleString("default", { month: "short" }) : "All"}</span>
        </button>
      </div>

      {/* Month Picker Grid */}
      {showMonthGrid && (
        <div className="relative mb-6">
          <div className="absolute z-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4 grid grid-cols-3 gap-2">
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

      {/* Summary Section */}
      <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-lg py-5 shadow-lg">
        <h2 className="text-lg font-semibold mb-4 border-b-2 pb-1 pl-4 border-white/20">
          Financial Summary {selectedMonth ? `- ${new Date(selectedMonth + "-01").toLocaleString("default", { month: "long" })}` : "(All Time)"}
        </h2>
        <ul className="space-y-2 text-gray-300 px-5">
          <li className="flex justify-between">
            <span>Total Income</span>
            <span className="font-bold">{currency} {totalIncome.toFixed(2)}</span>
          </li>
          <li className="flex justify-between">
            <span>Total Expenses</span>
            <span className="font-bold">{currency} {totalExpenses.toFixed(2)}</span>
          </li>
          <li className="flex justify-between">
            <span>Net Savings</span>
            <span className={`font-bold ${netSavings < 0 ? "text-red-400" : "text-green-400"}`}>
              {currency} {netSavings.toFixed(2)}
            </span>
          </li>
          {selectedMonth && (
            <>
              <li className="flex justify-between">
                <span>Total Budget</span>
                <span className="font-bold">{currency} {totalBudget.toFixed(2)}</span>
              </li>
              <li className="flex justify-between">
                <span>Budget Utilization</span>
                <span className={`font-bold ${budgetUtilization > 100 ? "text-red-400" : "text-green-400"}`}>
                  {budgetUtilization.toFixed(2)}%
                </span>
              </li>
            </>
          )}
        </ul>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense by Category (Pie Chart) */}
        <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-lg py-5 shadow-lg">
          <h2 className="text-lg font-semibold mb-4 border-b-2 pb-1 pl-4 border-white/20">
            Expenses by Category
          </h2>
          <div className="px-5">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={expenseByCategory}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {expenseByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${currency} ${value.toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Income by Category (Bar Chart) */}
        <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-lg py-5 shadow-lg">
          <h2 className="text-lg font-semibold mb-4 border-b-2 pb-1 pl-4 border-white/20">
            Income by Category
          </h2>
          <div className="px-5">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={incomeByCategory}>
                <XAxis dataKey="name" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip formatter={(value) => `${currency} ${value.toFixed(2)}`} />
                <Bar dataKey="value" fill="#4ade80" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Spending Over Time (Line Chart) */}
        <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-lg py-5 shadow-lg">
          <h2 className="text-lg font-semibold mb-4 border-b-2 pb-1 pl-4 border-white/20">
            Spending Over Time
          </h2>
          <div className="px-5">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={expensesOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="date" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip formatter={(value) => `${currency} ${value.toFixed(2)}`} />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#a855f7"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;