import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FaMoneyBill, FaChartPie, FaChartBar, FaWallet,FaEye } from "react-icons/fa";
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
  const navigate = useNavigate();

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
        <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-lg py-5 shadow-lg">
  <h2 className="text-lg font-semibold mb-4 border-b-2 pb-1 pl-4 border-white/20">
    Pending Tasks
  </h2>
  <ul className="space-y-2 text-gray-300 px-5">
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
        <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-lg py-5 shadow-lg ">
          <h2 className="text-lg font-semibold mb-4 border-b-2 pb-1 pl-4 border-white/20">Recent Expenses</h2>
          <div className="overflow-x-auto px-5">
            <table className="w-full text-left text-sm">
              <thead className="text-gray-400 ">
                <tr>
                  <th>Item</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 ">
                {expenses
                  .slice(-5)
                  .reverse()
                  .map((exp) => (
                    <tr key={exp.id}>
                      <td>{exp.title || "—"}</td>
                      <td>{exp.category || "—"}</td>
                      <td>
                        {exp.date
                          ? new Date(
                              exp.date.seconds * 1000
                            ).toLocaleDateString()
                          : "—"}
                      </td>
                      <td>GHS {exp.amount?.toFixed(2) || "0.00"}</td>
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
          className="flex flex-col items-center bg-pink-600/20 hover:bg-pink-600/30 p-4 rounded-lg"
        >
          <FaMoneyBill size={24} className="mb-2" /> + Add Expense
        </button>

        {/* Add Income */}
        <button
          onClick={() => navigate("/dashboard/income", { state: { openModal: true } })}
          className="flex flex-col items-center bg-green-600/20 hover:bg-green-600/30 p-4 rounded-lg"
        >
          <FaWallet size={24} className="mb-2" /> + Add Income
        </button>

        {/* View Budget */}
        <button
          onClick={() => navigate("/dashboard/budget")}
          className="flex flex-col items-center bg-blue-600/20 hover:bg-blue-600/30 p-4 rounded-lg"
        >
          <FaChartPie size={24} className="mb-2" /> 
          <span className="flex items-center gap-2">
            <FaEye /> View Budget
          </span>
        </button>

        {/* View Reports */}
        <button
          onClick={() => navigate("/dashboard/reports")}
          className="flex flex-col items-center bg-purple-600/20 hover:bg-purple-600/30 p-4 rounded-lg"
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
          <h2 className="text-lg font-semibold mb-4 border-b-2 pb-1 pl-4 border-white/20">Day-to-Day Expenses</h2>
          <div className="px-5">
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
    </div>
  );
};

export default Home;
