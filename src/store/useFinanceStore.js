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
  deleteField,
} from "firebase/firestore";

const useFinanceStore = create((set) => ({
  expenses: [],
  income: [],
  budgets: {}, // { "2025-08": { total: 1000, categories: { Food: 300, Rent: 500 }, currency: "GHS" } }

  // ➕ Add expense
  addExpense: async (uid, expense) => {
    if (!uid) return;
    try {
      await addDoc(collection(db, "users", uid, "expenses"), {
        ...expense,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("🔥 Error adding expense:", err);
    }
  },

  // ✏️ Update expense
  updateExpense: async (uid, expenseId, updatedExpense) => {
    if (!uid || !expenseId) return;
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

  // 🗑️ Delete expense
  deleteExpense: async (uid, expenseId) => {
    if (!uid || !expenseId) return;
    try {
      await deleteDoc(doc(db, "users", uid, "expenses", expenseId));
    } catch (err) {
      console.error("🔥 Error deleting expense:", err);
    }
  },

  // ➕ Add income
  addIncome: async (uid, income) => {
    if (!uid) return;
    try {
      await addDoc(collection(db, "users", uid, "income"), {
        ...income,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("🔥 Error adding income:", err);
    }
  },

  // 🏦 Set category budget
  setCategoryBudget: async (
    uid,
    yearMonth,
    category,
    amount,
    currency = "GHS",
    period = "Monthly",
    startDate = new Date()
  ) => {
    if (!uid || !yearMonth || !category) return;
    try {
      const budgetRef = doc(db, "users", uid, "budgets", yearMonth);

      await setDoc(
        budgetRef,
        {
          categories: { [category]: amount },
          currency,
          period,
          startDate,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      set((state) => ({
        budgets: {
          ...state.budgets,
          [yearMonth]: {
            ...(state.budgets[yearMonth] || {}),
            categories: {
              ...(state.budgets[yearMonth]?.categories || {}),
              [category]: amount,
            },
            currency,
            period,
            startDate,
          },
        },
      }));
    } catch (err) {
      console.error("🔥 Error setting category budget:", err);
    }
  },

  // 🏦 Set total monthly budget
  setTotalBudget: async (uid, yearMonth, amount, currency = "GHS") => {
    if (!uid || !yearMonth) return;
    try {
      const budgetRef = doc(db, "users", uid, "budgets", yearMonth);
      await setDoc(
        budgetRef,
        {
          total: amount,
          currency,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      set((state) => ({
        budgets: {
          ...state.budgets,
          [yearMonth]: {
            ...(state.budgets[yearMonth] || {}),
            total: amount,
            currency,
          },
        },
      }));
    } catch (err) {
      console.error("🔥 Error setting total budget:", err);
    }
  },

  // 🗑️ Remove total monthly budget
  removeTotalBudget: async (uid, yearMonth) => {
    if (!uid || !yearMonth) return;
    try {
      const budgetRef = doc(db, "users", uid, "budgets", yearMonth);

      await updateDoc(budgetRef, {
        total: deleteField(),
        updatedAt: serverTimestamp(),
      });

      set((state) => {
        const existing = state.budgets[yearMonth] || {};
        const { total, ...rest } = existing;
        return {
          budgets: {
            ...state.budgets,
            [yearMonth]: rest,
          },
        };
      });
    } catch (err) {
      console.error("🔥 Error removing total budget:", err);
    }
  },

  // 🔄 Subscribe to all finance data
  subscribeFinance: (uid, yearMonth) => {
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

    // Budgets
    let budUnsub = null;
    if (yearMonth) {
      budUnsub = onSnapshot(doc(db, "users", uid, "budgets", yearMonth), (snap) => {
        if (snap.exists()) {
          set((state) => ({
            budgets: {
              ...state.budgets,
              [yearMonth]: snap.data(),
            },
          }));
        }
      });
    }

    // Cleanup
    return () => {
      expUnsub();
      incUnsub();
      if (budUnsub) budUnsub();
    };
  },

  // 🗑️ Remove a category budget
  removeCategoryBudget: async (uid, yearMonth, category) => {
    if (!uid || !yearMonth || !category) return;
    try {
      const budgetRef = doc(db, "users", uid, "budgets", yearMonth);

      await updateDoc(budgetRef, {
        [`categories.${category}`]: deleteField(),
        updatedAt: serverTimestamp(),
      });

      set((state) => {
        const existing = state.budgets[yearMonth]?.categories || {};
        const { [category]: _, ...rest } = existing;
        return {
          budgets: {
            ...state.budgets,
            [yearMonth]: {
              ...state.budgets[yearMonth],
              categories: rest,
            },
          },
        };
      });
    } catch (err) {
      console.error("🔥 Error removing category budget:", err);
    }
  },
}));

export default useFinanceStore;
