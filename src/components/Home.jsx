// Home.jsx
import React, { useEffect, useState } from "react";
import { auth, db } from "../config/firebaseConfig";
import useFinanceStore from "../store/useFinanceStore";
import { setUpActions } from "../data/setUpActions";
import { doc, setDoc } from "firebase/firestore";

// Modals
import AddIncomeModal from "../components/modals/AddIncomeModal";
import AddExpenseModal from "../components/modals/AddExpenseModal";
import SetBudgetModal from "../components/modals/SetBudgetModal";

const Home = () => {
  const {
    expenses,
    income,
    budget,
    subscribeFinance,
    addExpense,
    addIncome,
    setBudget,
  } = useFinanceStore();

  const [activeModal, setActiveModal] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUserId(user.uid);

        // Ensure user doc exists
        await setDoc(
          doc(db, "users", user.uid),
          { createdAt: new Date() },
          { merge: true }
        );

        // 🔄 Subscribe to finance
        const unsubscribeFinance = subscribeFinance(user.uid);

        // Cleanup when logout or unmount
        return () => unsubscribeFinance && unsubscribeFinance();
      } else {
        setUserId(null);
      }
    });

    return () => unsubscribeAuth();
  }, [subscribeFinance]);

  const hasData =
    (expenses && expenses.length > 0) ||
    (income && income.length > 0) ||
    (budget && budget.amount);

  const openModal = (type) => setActiveModal(type);

  return (
    <div className="lg:pl-70 pt-10 space-y-6">
      {hasData ? (
        <div className="text-center text-gray-400">
          <p>Your spending overview, recent transactions, and charts will appear here.</p>
        </div>
      ) : (
        <div className="bg-black/70 border border-white/20 rounded-lg py-8 px-6 text-center">
          <h2 className="text-2xl font-semibold text-white mb-4">
            Welcome to Expensio 🎉
          </h2>
          <p className="text-gray-400 mb-6">
            Looks like you’re new here! Let’s set up your account by adding
            your income, budget, and first expense.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-2xl mx-auto">
            {setUpActions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => openModal(action.type)}
                className="flex items-center justify-center space-x-3 bg-zinc-900/70 
                           hover:bg-zinc-800 rounded-lg p-4 text-white transition-colors w-full"
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
      )}

      {/* Modals */}
      {activeModal === "income" && (
        <AddIncomeModal
          onClose={() => setActiveModal(null)}
          onSave={(data) => {
            if (userId) addIncome(userId, data);
            setActiveModal(null);
          }}
        />
      )}

      {activeModal === "expense" && (
        <AddExpenseModal
          onClose={() => setActiveModal(null)}
          onSave={(data) => {
            if (userId) addExpense(userId, data);
            setActiveModal(null);
          }}
        />
      )}

      {activeModal === "budget" && (
        <SetBudgetModal
          onClose={() => setActiveModal(null)}
          onSave={(data) => {
            if (userId) setBudget(userId, data);
            setActiveModal(null);
          }}
        />
      )}
    </div>
  );
};

export default Home;
