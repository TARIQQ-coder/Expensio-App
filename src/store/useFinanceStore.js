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

const useFinanceStore = create((set) => ({
  expenses: [],
  income: [],
  budget: null,

  // ➕ Add expense
  addExpense: async (uid, expense) => {
    if (!uid) return;
    await addDoc(collection(db, "users", uid, "expenses"), {
      ...expense,
      createdAt: new Date(),
    });
  },

  // ➕ Add income
  addIncome: async (uid, income) => {
    if (!uid) return;
    await addDoc(collection(db, "users", uid, "income"), {
      ...income,
      createdAt: new Date(),
    });
  },

  // ➕ Set budget
  setBudget: async (uid, budget) => {
    if (!uid) return;
    await setDoc(doc(db, "users", uid, "budget", "main"), {
      ...budget,
      createdAt: new Date(),
    });
  },

  // 🔄 Subscribe realtime
  subscribeFinance: (uid) => {
    if (!uid) return;

    // Expenses
    const expUnsub = onSnapshot(
      collection(db, "users", uid, "expenses"),
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
      collection(db, "users", uid, "income"),
      (snapshot) => {
        set({
          income: snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })),
        });
      }
    );

    // Budget
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
