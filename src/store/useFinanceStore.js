// src/store/useFinanceStore.js
import { create } from "zustand";
import { db } from "../config/firebaseConfig";
import {
  collection,
  addDoc,
  setDoc,
  onSnapshot,
  doc,
  query,
} from "firebase/firestore";

const useFinanceStore = create((set) => ({
  expenses: [],
  income: [],
  budget: null,

  // ➕ Add expense
  addExpense: async (uid, expense) => {
    if (!uid) {
      console.error("❌ addExpense called without a valid userId!");
      return;
    }
    try {
      await addDoc(collection(db, "users", uid, "expenses"), {
        ...expense,
        createdAt: new Date(),
      });
    } catch (err) {
      console.error("🔥 Error adding expense:", err);
    }
  },

  // ➕ Add income
  addIncome: async (uid, income) => {
    if (!uid) return;
    try {
      await addDoc(collection(db, "users", uid, "income"), {
        ...income,
        createdAt: new Date(),
      });
    } catch (err) {
      console.error("🔥 Error adding income:", err);
    }
  },

  // ➕ Set budget
  setBudget: async (uid, budget) => {
    if (!uid) return;
    try {
      await setDoc(doc(db, "users", uid, "budget", "main"), {
        ...budget,
        createdAt: new Date(),
      });
    } catch (err) {
      console.error("🔥 Error setting budget:", err);
    }
  },

  // 🔄 Subscribe ONLY to expenses
  subscribeExpenses: (uid) => {
    if (!uid) return;

    const expUnsub = onSnapshot(
      query(collection(db, "users", uid, "expenses")),
      (snapshot) => {
        set({
          expenses: snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })),
        });
      }
    );

    return () => expUnsub();
  },

  // 🔄 Subscribe to all finance data (expenses, income, budget)
  subscribeFinance: (uid) => {
    if (!uid) return;

    // Expenses
    const expUnsub = onSnapshot(
      query(collection(db, "users", uid, "expenses")),
      (snapshot) => {
        set({
          expenses: snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })),
        });
      }
    );

    // Income
    const incUnsub = onSnapshot(
      query(collection(db, "users", uid, "income")),
      (snapshot) => {
        set({
          income: snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })),
        });
      }
    );

    // Budget (only one doc: "main")
    const budUnsub = onSnapshot(
      doc(db, "users", uid, "budget", "main"),
      (snapshot) => {
        set({ budget: snapshot.exists() ? snapshot.data() : null });
      }
    );

    return () => {
      expUnsub();
      incUnsub();
      budUnsub();
    };
  },
}));

export default useFinanceStore;
