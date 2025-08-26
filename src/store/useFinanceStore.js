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
  updateDoc,
  deleteDoc,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

const useFinanceStore = create((set) => ({
  expenses: [],
  income: [],
  budget: null,

  // ------------------ EXPENSES ------------------ //
  addExpense: async (uid, expense) => {
    if (!uid) return console.error("❌ addExpense: missing uid");
    try {
      await addDoc(collection(db, "users", uid, "expenses"), {
        ...expense,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("🔥 Error adding expense:", err);
    }
  },

  updateExpense: async (uid, expenseId, updatedExpense) => {
    if (!uid || !expenseId)
      return console.error("❌ updateExpense missing uid or id");
    try {
      const expRef = doc(db, "users", uid, "expenses", expenseId);
      await updateDoc(expRef, {
        ...updatedExpense,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("🔥 Error updating expense:", err);
    }
  },

  deleteExpense: async (uid, expenseId) => {
    if (!uid || !expenseId)
      return console.error("❌ deleteExpense missing uid or id");
    try {
      await deleteDoc(doc(db, "users", uid, "expenses", expenseId));
    } catch (err) {
      console.error("🔥 Error deleting expense:", err);
    }
  },

  // ------------------ INCOME ------------------ //
  addIncome: async (uid, income) => {
    if (!uid) return console.error("❌ addIncome: missing uid");
    try {
      await addDoc(collection(db, "users", uid, "income"), {
        ...income,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("🔥 Error adding income:", err);
    }
  },

  updateIncome: async (uid, incomeId, updatedIncome) => {
    if (!uid || !incomeId)
      return console.error("❌ updateIncome missing uid or id");
    try {
      const incRef = doc(db, "users", uid, "income", incomeId);
      await updateDoc(incRef, {
        ...updatedIncome,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("🔥 Error updating income:", err);
    }
  },

  deleteIncome: async (uid, incomeId) => {
    if (!uid || !incomeId)
      return console.error("❌ deleteIncome missing uid or id");
    try {
      await deleteDoc(doc(db, "users", uid, "income", incomeId));
    } catch (err) {
      console.error("🔥 Error deleting income:", err);
    }
  },

  // ------------------ BUDGET ------------------ //
  setBudget: async (uid, budget) => {
    if (!uid) return console.error("❌ setBudget: missing uid");
    try {
      await setDoc(doc(db, "users", uid, "budget", "main"), {
        ...budget,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("🔥 Error setting budget:", err);
    }
  },

  // ------------------ SUBSCRIPTIONS ------------------ //
  subscribeExpenses: (uid) => {
    if (!uid) return;

    const expUnsub = onSnapshot(
      query(collection(db, "users", uid, "expenses"), orderBy("createdAt", "asc")),
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

  subscribeFinance: (uid) => {
    if (!uid) return;

    // Expenses
    const expUnsub = onSnapshot(
      query(collection(db, "users", uid, "expenses"), orderBy("createdAt", "asc")),
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
      query(collection(db, "users", uid, "income"), orderBy("createdAt", "asc")),
      (snapshot) => {
        set({
          income: snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })),
        });
      }
    );

    // Budget (single doc)
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
