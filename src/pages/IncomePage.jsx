import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
import { FaFilter, FaPlus } from "react-icons/fa";
import useFinanceStore from "../store/useFinanceStore";
import { useAuth } from "../context/AuthContext";
import NewIncomeModal from "../components/modals/NewIncomeModal";
import { showConfirmToast } from "../components/ConfirmToast";
import { toast } from "react-toastify";
import { incomeIcons } from "../data/categoryIcons";

const currencySymbols = {
  GHS: "₵",
  USD: "$",
  EUR: "€",
  GBP: "£",
};

const IncomePage = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingIncome, setEditingIncome] = useState(null);
  const [showMonthGrid, setShowMonthGrid] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [deletingIds, setDeletingIds] = useState([]);
  const monthGridRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { income, subscribeFinance, deleteIncome, settings } = useFinanceStore();

  // Auto-open modal if redirected with state
  useEffect(() => {
    if (location.state?.openModal) {
      setShowModal(true);
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate, location.pathname]);

  // Subscribe to income
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

  const handleDelete = async (incomeId) => {
    console.log("Delete button clicked for incomeId:", incomeId); // Debug log
    if (!user?.uid) {
      toast.error("User not authenticated. Please log in.", {
        position: "top-center",
        autoClose: 3000,
        toastClassName: "bg-gray-900 text-white font-medium rounded-lg shadow-lg",
      });
      return;
    }

    setDeletingIds((prev) => [...prev, incomeId]);
    try {
      showConfirmToast(
        "Are you sure you want to delete this income?",
        async () => {
          try {
            await deleteIncome(user.uid, incomeId);
            toast.success("Income deleted successfully!", {
              position: "top-center",
              autoClose: 2000,
              toastClassName: "bg-gray-900 text-white font-medium rounded-lg shadow-lg",
            });
          } catch (error) {
            console.error("Error deleting income:", error);
            let message = "Failed to delete income. Please try again.";
            if (error.code === "permission-denied") {
              message = "You don't have permission to delete this income.";
            } else if (error.code === "not-found") {
              message = "Income not found.";
            } else if (error.code === "network-request-failed") {
              message = "Network error. Please check your connection.";
            }
            toast.error(message, {
              position: "top-center",
              autoClose: 3000,
              toastClassName: "bg-gray-900 text-white font-medium rounded-lg shadow-lg",
            });
          } finally {
            setDeletingIds((prev) => prev.filter((id) => id !== incomeId));
          }
        },
        () => {
          setDeletingIds((prev) => prev.filter((id) => id !== incomeId));
        }
      );
    } catch (error) {
      console.error("Error showing confirm toast:", error);
      toast.error("Failed to show confirmation dialog. Please try again.", {
        position: "top-center",
        autoClose: 3000,
        toastClassName: "bg-gray-900 text-white font-medium rounded-lg shadow-lg",
      });
      setDeletingIds((prev) => prev.filter((id) => id !== incomeId));
    }
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
          Income{" "}
          {selectedMonth
            ? `- ${new Date(selectedMonth + "-01").toLocaleString("default", {
                month: "long",
                year: "numeric",
              })}`
            : ""}
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowMonthGrid(!showMonthGrid)}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 text-white"
            title="Filter by month"
            aria-label="Filter income by month"
          >
            <FaFilter size={16} />
            <span>
              {selectedMonth
                ? new Date(selectedMonth + "-01").toLocaleString("default", {
                    month: "short",
                  })
                : "All"}
            </span>
          </button>
          <button
            onClick={() => {
              setEditingIncome(null);
              setShowModal(true);
            }}
            className="bg-[#0acfbf] rounded-lg hover:bg-[#0cfce8] transition cursor-pointer font-semibold flex items-center gap-2 px-4 py-2 text-black"
            aria-label="Add new income"
          >
            <FaPlus size={16} />
            <span>New Income</span>
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
                const dateObj = inc.date
                  ? new Date(inc.date.seconds ? inc.date.seconds * 1000 : inc.date)
                  : null;
                const rowColor = index % 2 === 0 ? "bg-[#1b1b1b]" : "bg-[#28282a]";
                const Icon = incomeIcons[inc.category] || incomeIcons["Other"];

                return (
                  <tr key={inc.id} className={`${rowColor} rounded-xl shadow`}>
                    <td className="px-4 py-4 text-gray-100 font-medium max-w-[300px]">
                      <div className="flex items-center gap-2 truncate">
                        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-[#124241]">
                          <Icon
                            className="w-4 h-4 text-white"
                            aria-label={inc.category || "Other"}
                          />
                        </div>
                        <span className="truncate">{inc.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-300">
                      {inc.category || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-100 font-semibold tracking-wide">
                      {currencySymbols[inc.currency] ||
                        currencySymbols[settings.defaultCurrency] ||
                        "₵"}{" "}
                      {(inc.amount ?? 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      {dateObj ? dateObj.toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 pt-5 flex gap-4">
                      <button
                        onClick={() => handleEdit(inc)}
                        className="text-blue-400 hover:text-blue-600 cursor-pointer"
                        aria-label="Edit income"
                      >
                        <Pencil className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(inc.id)}
                        disabled={deletingIds.includes(inc.id)}
                        className={`${
                          deletingIds.includes(inc.id)
                            ? "text-gray-600 cursor-not-allowed"
                            : "text-red-400 hover:text-red-600 cursor-pointer"
                        }`}
                        aria-label="Delete income"
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