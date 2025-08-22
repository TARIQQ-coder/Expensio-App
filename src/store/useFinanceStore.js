// src/store/useFinanceStore.js
import { create } from "zustand";
import { db } from "../config/firebaseConfig";
import {
  collection,
  addDoc,
  setDoc,
  onSnapshot,
  doc,
} from "firebase/firestore";

const useFinanceStore = create((set, get) => ({
  expenses: [],
  income: [],
  budget: null,

  // ➕ Add expense
  addExpense: async (uid, expense) => {
    if (!uid) {
      console.error("❌ addExpense called without a valid userId!");
      throw new Error("User ID is required to add an expense");
    }

    try {
      const ref = await addDoc(collection(db, "users", uid, "expenses"), {
        ...expense,
        createdAt: new Date(),
      });
      console.log("✅ Expense added with ID:", ref.id);
    } catch (err) {
      console.error("🔥 Error adding expense:", err);
    }
  },

  // ➕ Add income
  addIncome: async (uid, income) => {
    await addDoc(collection(db, "users", uid, "income"), {
      ...income,
      createdAt: new Date(),
    });
  },

  // ➕ Set budget
  setBudget: async (uid, budget) => {
    await setDoc(doc(db, "users", uid, "budget", "main"), {
      ...budget,
      createdAt: new Date(),
    });
  },

  // 🔄 Subscribe realtime
  subscribeFinance: (uid) => {
    if (!uid) return;

    // Expenses subscription
    const expUnsub = onSnapshot(
      collection(db, "users", uid, "expenses"),
      (snapshot) => {
        const expenses = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        set({ expenses });
      }
    );

    // Income subscription
    const incUnsub = onSnapshot(
      collection(db, "users", uid, "income"),
      (snapshot) => {
        const income = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        set({ income });
      }
    );

    // Budget subscription (just one doc: "main")
    const budUnsub = onSnapshot(
      doc(db, "users", uid, "budget", "main"),
      (snapshot) => {
        set({ budget: snapshot.exists() ? snapshot.data() : null });
      }
    );

    // Cleanup
    return () => {
      expUnsub();
      incUnsub();
      budUnsub();
    };
  },
}));

export default useFinanceStore;
