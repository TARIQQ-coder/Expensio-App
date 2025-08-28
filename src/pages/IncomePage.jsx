import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
import { FaFilter,FaPlus } from "react-icons/fa";
import useFinanceStore from "../store/useFinanceStore";
import { useAuth } from "../context/AuthContext";
import NewIncomeModal from "../components/modals/NewIncomeModal";
import { showConfirmToast } from "../components/ConfirmToast";
import { incomeIcons } from "../data/categoryIcons";

const IncomePage = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingIncome, setEditingIncome] = useState(null);
  const [showMonthGrid, setShowMonthGrid] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(""); // Empty string for all income
  const monthGridRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const { user } = useAuth();
  const { income, subscribeFinance, deleteIncome } = useFinanceStore();

  // Auto-open modal if redirected with state
  useEffect(() => {
    if (location.state?.openModal) {
      setShowModal(true);
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate, location.pathname]);

  // Subscribe to income (all or filtered by selected month)
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

  const handleEdit = (incomeItem) => {
    setEditingIncome(incomeItem);
    setShowModal(true);
  };

  const handleDelete = (incomeId) => {
    showConfirmToast("Are you sure you want to delete this income?", async () => {
      await deleteIncome(user.uid, incomeId);
    });
  };

  // Generate months for the current year
  const months = [
    { value: "", label: "All Income" },
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
          Income {selectedMonth ? `- ${new Date(selectedMonth + "-01").toLocaleString("default", {
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
              setEditingIncome(null);
              setShowModal(true);
            }}
            className=" bg-[#0acfbf] rounded-lg hover:bg-[#0cfce8] transition cursor-pointer font-semibold flex items-center gap-2 px-4 py-2 text-black"
          >
            <FaPlus size={16} />
            <span> New Income</span>
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

      {/* Income Table */}
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
            {income.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-gray-400 text-center py-4">
                  No income recorded yet.
                </td>
              </tr>
            ) : (
              income.map((inc, index) => {
                const dateObj = inc.createdAt ? new Date(inc.createdAt.seconds * 1000) : null;
                const rowColor = index % 2 === 0 ? "bg-[#1b1b1b]" : "bg-[#28282a]";
                const Icon = incomeIcons[inc.category] || incomeIcons["Other"];

                return (
                  <tr key={inc.id} className={`${rowColor} rounded-xl shadow`}>
                    {/* DETAILS with Category Icon */}
                    <td className="px-4 py-4 text-gray-100 font-medium max-w-[300px]">
                      <div className="flex items-center gap-2 truncate">
                        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-[#124241]">
                          <Icon className="w-4 h-4 text-white" aria-label={inc.category || "Other"} />
                        </div>
                        <span className="truncate">{inc.title}</span>
                      </div>
                    </td>

                    {/* CATEGORY */}
                    <td className="px-4 py-3 text-gray-300">{inc.category || "—"}</td>

                    {/* AMOUNT */}
                    <td className="px-4 py-3 text-gray-100 font-semibold tracking-wide">
                      {inc.currency || "₵"} {(inc.amount ?? 0).toFixed(2)}
                    </td>

                    {/* DATE */}
                    <td className="px-4 py-3 text-gray-400">
                      {dateObj ? dateObj.toLocaleDateString() : "—"}
                    </td>

                    {/* ACTIONS */}
                    <td className="px-4 pt-5 flex gap-4">
                      <button
                        onClick={() => handleEdit(inc)}
                        className="text-blue-400 hover:text-blue-600"
                      >
                        <Pencil className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(inc.id)}
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

      {/* New Income Modal */}
      {showModal && (
        <NewIncomeModal
          onClose={() => setShowModal(false)}
          editingIncome={editingIncome}
        />
      )}
    </div>
  );
};

export default IncomePage;