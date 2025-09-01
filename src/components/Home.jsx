import React, { useMemo, useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaMoneyBill, FaChartPie, FaChartBar, FaWallet, FaEye, FaRegCalendarAlt } from "react-icons/fa";
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
} from "recharts";
import useFinanceStore from "../store/useFinanceStore";
import { useAuth } from "../context/AuthContext";

const Home = () => {
  const { expenses, income, budgets, subscribeFinance } = useFinanceStore();
  const { user } = useAuth();
  const navigate = useNavigate();

  const currentMonth = new Date().toISOString().slice(0, 7); // e.g., "2025-08"
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [showMonthGrid, setShowMonthGrid] = useState(false);
  const monthGridRef = useRef(null);

  // Subscribe to finance data for the selected month
  useEffect(() => {
    if (user?.uid) {
      const unsub = subscribeFinance(user.uid, selectedMonth);
      return () => unsub && unsub();
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

  // Get the total budget and currency for the selected month
  const totalMonthlyBudget = budgets[selectedMonth]?.total || 0;
  const currency = budgets[selectedMonth]?.currency || "GHS";

  // Calculate total income for the selected month
  const totalIncome = useMemo(() => {
    return income.reduce((sum, i) => sum + (i.amount || 0), 0);
  }, [income]);

  // Calculate total expenses for the selected month
  const totalExpenses = useMemo(() => {
    return expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  }, [expenses]);

  // Calculate remaining budget for the selected month
  const remainingBudget = totalMonthlyBudget - totalExpenses;

  // Group expenses by date for trend chart (selected month only)
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

  // Group expenses by category (selected month only)
  const categorySpending = useMemo(() => {
    const map = {};
    expenses.forEach((e) => {
      const category = e.category || "Other";
      map[category] = (map[category] || 0) + (e.amount || 0);
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [expenses]);

  // Generate months for the current year
  const months = Array.from({ length: 12 }, (_, i) => {
    const month = new Date(new Date().getFullYear(), i, 1);
    return {
      value: month.toISOString().slice(0, 7),
      label: month.toLocaleString("default", { month: "short" }),
    };
  });

  return (
    <div className="p-6 space-y-6 text-white">
      {/* Month Picker with Calendar Icon */}
      <div className="relative mb-6">
        <button
          onClick={() => setShowMonthGrid(!showMonthGrid)}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20"
        >
          <FaRegCalendarAlt />
          {new Date(selectedMonth + "-01").toLocaleString("default", {
            month: "long",
            year: "numeric",
          })}
        </button>

        {showMonthGrid && (
          <div
            ref={monthGridRef}
            className="absolute z-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4 mt-2 grid grid-cols-3 gap-2"
          >
            {months.map((m) => (
              <button
                key={m.value}
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
        )}
      </div>

      {/* 🔹 Top Row: Summary + Recent Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Summary */}
        <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-lg py-5 shadow-lg">
          <h2 className="text-lg font-semibold mb-4 border-b-2 pb-1 pl-4 border-white/20">
            Summary - {new Date(selectedMonth + "-01").toLocaleString("default", {
              month: "long",
              year: "numeric",
            })}
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
              <span>Remaining Budget</span>
              <span className={`font-bold ${remainingBudget < 0 ? "text-red-400" : "text-green-400"}`}>
                {currency} {remainingBudget.toFixed(2)}
              </span>
            </li>
            <li className="flex justify-between">
              <span>Number of Expenses</span>
              <span className="font-bold">{expenses.length}</span>
            </li>
          </ul>
        </div>

        {/* Recent Expenses */}
        <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-lg py-5 shadow-lg">
          <h2 className="text-lg font-semibold mb-4 border-b-2 pb-1 pl-4 border-white/20">Recent Expenses</h2>
          <div className="overflow-x-auto px-5">
            <table className="w-full text-left text-sm">
              <thead className="text-gray-400">
                <tr>
                  <th>Item</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {expenses
                  .slice(-5)
                  .reverse()
                  .map((exp) => (
                    <tr key={exp.id}>
                      <td>{exp.title || "—"}</td>
                      <td>{exp.category || "—"}</td>
                      <td>
                        {exp.createdAt
                          ? new Date(
                              exp.createdAt.seconds * 1000
                            ).toLocaleDateString()
                          : "—"}
                      </td>
                      <td>{currency} {exp.amount?.toFixed(2) || "0.00"}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-lg py-5 shadow-lg">
        <h2 className="text-lg font-semibold mb-4 border-b-2 pb-1 pl-4 border-white/20">Quick Access</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-5">
          {/* Add Expense */}
          <button
            onClick={() => navigate("/dashboard/expenses", { state: { openModal: true } })}
            className="flex flex-col items-center bg-pink-600/20 hover:bg-pink-600/30 p-4 rounded-lg cursor-pointer"
          >
            <FaMoneyBill size={24} className="mb-2" /> + Add Expense
          </button>

          {/* Add Income */}
          <button
            onClick={() => navigate("/dashboard/income", { state: { openModal: true } })}
            className="flex flex-col items-center bg-green-600/20 hover:bg-green-600/30 p-4 rounded-lg cursor-pointer"
          >
            <FaWallet size={24} className="mb-2" /> + Add Income
          </button>

          {/* View Budget */}
          <button
            onClick={() => navigate("/dashboard/budget")}
            className="flex flex-col items-center bg-blue-600/20 hover:bg-blue-600/30 p-4 rounded-lg cursor-pointer"
          >
            <FaChartPie size={24} className="mb-2" />
            <span className="flex items-center gap-2">
              <FaEye /> View Budget
            </span>
          </button>

          {/* View Reports */}
          <button
            onClick={() => navigate("/dashboard/reports")}
            className="flex flex-col items-center bg-purple-600/20 hover:bg-purple-600/30 p-4 rounded-lg cursor-pointer"
          >
            <FaChartBar size={24} className="mb-2" />
            <span className="flex items-center gap-2">
              <FaEye /> View Reports
            </span>
          </button>
        </div>
      </div>

      {/* 🔹 Bottom Row: Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending Over Time */}
        <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-lg py-5 shadow-lg">
          <h2 className="text-lg font-semibold mb-4 border-b-2 pb-1 pl-4 border-white/20">Spending Over Time</h2>
          <div className="px-5">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={expensesOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="date" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#4ade80"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Spending */}
        <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-lg py-5 shadow-lg">
          <h2 className="text-lg font-semibold mb-4 border-b-2 pb-1 pl-4 border-white/20">Category Expenses</h2>
          <div className="px-5">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={categorySpending}>
                <XAxis dataKey="name" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip />
                <Bar dataKey="value" fill="#a855f7" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;