import React, { useMemo } from "react";
import { FaWallet } from "react-icons/fa";
import { MdFlight, MdOutlineShoppingCartCheckout } from "react-icons/md";
import { IoReceiptOutline } from "react-icons/io5";
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

const Home = () => {
  const { expenses, income, budget } = useFinanceStore();

  // --- Helpers ---
  const totalIncome = useMemo(
    () => income.reduce((sum, i) => sum + (i.amount || 0), 0),
    [income]
  );

  const totalExpenses = useMemo(
    () => expenses.reduce((sum, e) => sum + (e.amount || 0), 0),
    [expenses]
  );

  const remainingBudget = budget - totalExpenses;

  // 📌 Group expenses by "date" for trend chart
  const expensesOverTime = useMemo(() => {
    const map = {};
    expenses.forEach((e) => {
      const date = e.date
        ? new Date(e.date.seconds * 1000).toLocaleDateString()
        : "Unknown";
      map[date] = (map[date] || 0) + (e.amount || 0);
    });
    return Object.entries(map).map(([date, amount]) => ({ date, amount }));
  }, [expenses]);

  // 📌 Group expenses by "category"
  const categorySpending = useMemo(() => {
    const map = {};
    expenses.forEach((e) => {
      const category = e.category || "Other";
      map[category] = (map[category] || 0) + (e.amount || 0);
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [expenses]);

  return (
    <div className="p-6 space-y-6 text-white">
      {/* 🔹 Top Row: Pending Tasks + Recent Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Tasks */}
        <div className="bg-black/70 border border-white/10 rounded-lg p-5">
          <h2 className="text-lg font-semibold mb-4">Pending Tasks</h2>
          <ul className="space-y-2 text-gray-300">
            <li className="flex justify-between">
              <span>Total Income</span>{" "}
              <span className="font-bold">€{totalIncome.toFixed(2)}</span>
            </li>
            <li className="flex justify-between">
              <span>Total Expenses</span>{" "}
              <span className="font-bold">€{totalExpenses.toFixed(2)}</span>
            </li>
            <li className="flex justify-between">
              <span>Remaining Budget</span>{" "}
              <span className="font-bold">€{remainingBudget.toFixed(2)}</span>
            </li>
            <li className="flex justify-between">
              <span>Number of Expenses</span>{" "}
              <span className="font-bold">{expenses.length}</span>
            </li>
          </ul>
        </div>

        {/* Recent Expenses */}
        <div className="bg-black/70 border border-white/10 rounded-lg p-5">
          <h2 className="text-lg font-semibold mb-4">Recent Expenses</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-gray-400">
                <tr>
                  <th>Subject</th>
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
                      <td>{exp.subject || "—"}</td>
                      <td>{exp.category || "—"}</td>
                      <td>
                        {exp.date
                          ? new Date(exp.date.seconds * 1000).toLocaleDateString()
                          : "—"}
                      </td>
                      <td>€{exp.amount?.toFixed(2) || "0.00"}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 🔹 Middle Row: Quick Access */}
      <div className="bg-black/70 border border-white/10 rounded-lg p-5">
        <h2 className="text-lg font-semibold mb-4">Quick Access</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center bg-pink-600/20 hover:bg-pink-600/30 p-4 rounded-lg">
            <FaWallet size={24} className="mb-2" /> + New expense
          </button>
          <button className="flex flex-col items-center bg-purple-600/20 hover:bg-purple-600/30 p-4 rounded-lg">
            <IoReceiptOutline size={24} className="mb-2" /> + Add receipt
          </button>
          <button className="flex flex-col items-center bg-emerald-600/20 hover:bg-emerald-600/30 p-4 rounded-lg">
            <MdOutlineShoppingCartCheckout size={24} className="mb-2" /> + Create report
          </button>
          <button className="flex flex-col items-center bg-red-600/20 hover:bg-red-600/30 p-4 rounded-lg">
            <MdFlight size={24} className="mb-2" /> + Create trip
          </button>
        </div>
      </div>

      {/* 🔹 Bottom Row: Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending Over Time */}
        <div className="bg-black/70 border border-white/10 rounded-lg p-5">
          <h2 className="text-lg font-semibold mb-4">Spending Over Time</h2>
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

        {/* Category Spending */}
        <div className="bg-black/70 border border-white/10 rounded-lg p-5">
          <h2 className="text-lg font-semibold mb-4">Day-to-Day Expenses</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={categorySpending}>
              <XAxis dataKey="name" stroke="#888" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#a855f7" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Home;
