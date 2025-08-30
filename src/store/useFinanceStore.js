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
  where,
  Timestamp,
  getDocs,
} from "firebase/firestore";

const useFinanceStore = create((set, get) => ({
  expenses: [],
  income: [],
  budgets: {}, // { "2025-08": { total: 1000, categories: { Food: 300, Rent: 500 }, currency: "GHS" } }
  settings: { defaultCurrency: "GHS" }, // Default currency

  // ➕ Add expense
  addExpense: async (uid, expense) => {
    if (!uid) throw new Error("User ID is required");
    try {
      await addDoc(collection(db, "users", uid, "expenses"), {
        ...expense,
        currency: expense.currency || get().settings.defaultCurrency, // Use defaultCurrency if not provided
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("🔥 Error adding expense:", err);
      throw err;
    }
  },

  // ✏️ Update expense
  updateExpense: async (uid, expenseId, updatedExpense) => {
    if (!uid || !expenseId) throw new Error("User ID and expense ID are required");
    try {
      const expRef = doc(db, "users", uid, "expenses", expenseId);
      await updateDoc(expRef, {
        ...updatedExpense,
        currency: updatedExpense.currency || get().settings.defaultCurrency, // Use defaultCurrency if not provided
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("🔥 Error updating expense:", err);
      throw err;
    }
  },

  // 🗑️ Delete expense
  deleteExpense: async (uid, expenseId) => {
    if (!uid || !expenseId) throw new Error("User ID and expense ID are required");
    try {
      await deleteDoc(doc(db, "users", uid, "expenses", expenseId));
    } catch (err) {
      console.error("🔥 Error deleting expense:", err);
      throw err;
    }
  },

  // ➕ Add income
  addIncome: async (uid, income) => {
    if (!uid) throw new Error("User ID is required");
    try {
      await addDoc(collection(db, "users", uid, "income"), {
        ...income,
        currency: income.currency || get().settings.defaultCurrency, // Use defaultCurrency if not provided
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("🔥 Error adding income:", err);
      throw err;
    }
  },

  // ✏️ Update income
  updateIncome: async (uid, incomeId, updatedIncome) => {
    if (!uid || !incomeId) throw new Error("User ID and income ID are required");
    try {
      const incRef = doc(db, "users", uid, "income", incomeId);
      await updateDoc(incRef, {
        ...updatedIncome,
        currency: updatedIncome.currency || get().settings.defaultCurrency, // Use defaultCurrency if not provided
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("🔥 Error updating income:", err);
      throw err;
    }
  },

  // 🗑️ Delete income
  deleteIncome: async (uid, incomeId) => {
    if (!uid || !incomeId) throw new Error("User ID and income ID are required");
    try {
      await deleteDoc(doc(db, "users", uid, "income", incomeId));
    } catch (err) {
      console.error("🔥 Error deleting income:", err);
      throw err;
    }
  },

  // 🏦 Set category budget
  setCategoryBudget: async (
    uid,
    yearMonth,
    category,
    amount,
    currency,
    period = "Monthly",
    startDate = new Date()
  ) => {
    if (!uid || !yearMonth || !category) throw new Error("User ID, yearMonth, and category are required");
    try {
      const budgetRef = doc(db, "users", uid, "budgets", yearMonth);
      await setDoc(
        budgetRef,
        {
          categories: { [category]: amount },
          currency: currency || get().settings.defaultCurrency, // Use defaultCurrency if not provided
          period,
          startDate: Timestamp.fromDate(new Date(startDate)),
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
            currency: currency || get().settings.defaultCurrency,
            period,
            startDate: new Date(startDate),
          },
        },
      }));
    } catch (err) {
      console.error("🔥 Error setting category budget:", err);
      throw err;
    }
  },

  // 🏦 Set total monthly budget
  setTotalBudget: async (uid, yearMonth, amount, currency) => {
    if (!uid || !yearMonth) throw new Error("User ID and yearMonth are required");
    try {
      const budgetRef = doc(db, "users", uid, "budgets", yearMonth);
      await setDoc(
        budgetRef,
        {
          total: amount,
          currency: currency || get().settings.defaultCurrency, // Use defaultCurrency if not provided
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
            currency: currency || get().settings.defaultCurrency,
          },
        },
      }));
    } catch (err) {
      console.error("🔥 Error setting total budget:", err);
      throw err;
    }
  },

  // 🗑️ Remove total monthly budget
  removeTotalBudget: async (uid, yearMonth) => {
    if (!uid || !yearMonth) throw new Error("User ID and yearMonth are required");
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
      throw err;
    }
  },

  // 🗑️ Remove a category budget
  removeCategoryBudget: async (uid, yearMonth, category) => {
    if (!uid || !yearMonth || !category) throw new Error("User ID, yearMonth, and category are required");
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
      throw err;
    }
  },

  // 🔄 Update currency for all budgets
  updateAllBudgetsCurrency: async (uid, newCurrency) => {
    if (!uid) throw new Error("User ID is required");
    try {
      const budgetsRef = collection(db, "users", uid, "budgets");
      const budgetsSnapshot = await getDocs(budgetsRef);

      const updatePromises = budgetsSnapshot.docs.map(async (budgetDoc) => {
        const budgetRef = doc(db, "users", uid, "budgets", budgetDoc.id);
        await updateDoc(budgetRef, {
          currency: newCurrency,
          updatedAt: serverTimestamp(),
        });
      });
      await Promise.all(updatePromises);

      set((state) => {
        const updatedBudgets = {};
        Object.keys(state.budgets).forEach((yearMonth) => {
          updatedBudgets[yearMonth] = {
            ...state.budgets[yearMonth],
            currency: newCurrency,
          };
        });
        return { budgets: updatedBudgets };
      });
    } catch (err) {
      console.error("🔥 Error updating budgets currency:", err);
      throw err;
    }
  },

  // 🔄 Update currency for all expenses and income
  updateAllExpensesAndIncomeCurrency: async (uid, newCurrency) => {
    if (!uid) throw new Error("User ID is required");
    try {
      // Update expenses
      const expensesRef = collection(db, "users", uid, "expenses");
      const expensesSnapshot = await getDocs(expensesRef);
      const expensePromises = expensesSnapshot.docs.map(async (expenseDoc) => {
        const expenseRef = doc(db, "users", uid, "expenses", expenseDoc.id);
        await updateDoc(expenseRef, {
          currency: newCurrency,
          updatedAt: serverTimestamp(),
        });
      });

      // Update income
      const incomeRef = collection(db, "users", uid, "income");
      const incomeSnapshot = await getDocs(incomeRef);
      const incomePromises = incomeSnapshot.docs.map(async (incomeDoc) => {
        const incomeRef = doc(db, "users", uid, "income", incomeDoc.id);
        await updateDoc(incomeRef, {
          currency: newCurrency,
          updatedAt: serverTimestamp(),
        });
      });

      await Promise.all([...expensePromises, ...incomePromises]);

      // Update local state
      set((state) => ({
        expenses: state.expenses.map((expense) => ({
          ...expense,
          currency: newCurrency,
        })),
        income: state.income.map((inc) => ({
          ...inc,
          currency: newCurrency,
        })),
      }));
    } catch (err) {
      console.error("🔥 Error updating expenses and income currency:", err);
      throw err;
    }
  },

  // 🔄 Subscribe to finance data for a specific month (or all data if yearMonth is not provided)
  subscribeFinance: (uid, yearMonth) => {
    if (!uid) throw new Error("User ID is required");
    const [year, month] = yearMonth ? yearMonth.split("-") : [null, null];
    const startOfMonth = yearMonth
      ? Timestamp.fromDate(new Date(year, month - 1, 1))
      : null;
    const endOfMonth = yearMonth
      ? Timestamp.fromDate(new Date(year, month, 0, 23, 59, 59, 999))
      : null;

    const expensesQuery = yearMonth
      ? query(
          collection(db, "users", uid, "expenses"),
          where("createdAt", ">=", startOfMonth),
          where("createdAt", "<=", endOfMonth),
          orderBy("createdAt", "asc")
        )
      : query(collection(db, "users", uid, "expenses"), orderBy("createdAt", "asc"));

    const expUnsub = onSnapshot(expensesQuery, (snapshot) => {
      set({
        expenses: snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })),
      });
    });

    const incomeQuery = yearMonth
      ? query(
          collection(db, "users", uid, "income"),
          where("createdAt", ">=", startOfMonth),
          where("createdAt", "<=", endOfMonth),
          orderBy("createdAt", "asc")
        )
      : query(collection(db, "users", uid, "income"), orderBy("createdAt", "asc"));

    const incUnsub = onSnapshot(incomeQuery, (snapshot) => {
      set({
        income: snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })),
      });
    });

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
        } else {
          set((state) => ({
            budgets: {
              ...state.budgets,
              [yearMonth]: { total: 0, categories: {}, currency: get().settings.defaultCurrency },
            },
          }));
        }
      });
    }

    return () => {
      expUnsub();
      incUnsub();
      if (budUnsub) budUnsub();
    };
  },

  // ⚙️ Update user settings (e.g., defaultCurrency)
  updateUserSettings: async (uid, settings) => {
    if (!uid) throw new Error("User ID is required");
    try {
      const settingsRef = doc(db, "users", uid, "settings", "preferences");
      await setDoc(settingsRef, {
        ...settings,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      set((state) => ({
        settings: {
          ...state.settings,
          ...settings,
        },
      }));
      // If defaultCurrency is updated, sync budgets, expenses, and income
      if (settings.defaultCurrency) {
        await get().updateAllBudgetsCurrency(uid, settings.defaultCurrency);
        await get().updateAllExpensesAndIncomeCurrency(uid, settings.defaultCurrency);
      }
    } catch (err) {
      console.error("🔥 Error updating user settings:", err);
      throw err;
    }
  },

  // 🔄 Subscribe to user settings
  subscribeUserSettings: (uid) => {
    if (!uid) throw new Error("User ID is required");
    const settingsRef = doc(db, "users", uid, "settings", "preferences");
    const unsub = onSnapshot(settingsRef, (snap) => {
      if (snap.exists()) {
        set({ settings: snap.data() });
      } else {
        set({ settings: { defaultCurrency: "GHS" } }); // Default settings
      }
    });
    return unsub;
  },
}));

export default useFinanceStore;