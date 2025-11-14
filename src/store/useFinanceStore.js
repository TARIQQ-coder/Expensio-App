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
  budgets: {}, // { "2025-08": { total: 1000, categories: { Food: 300 }, currency: "GHS" } }
  settings: { defaultCurrency: "GHS" },

  // ➕ Add expense
  addExpense: async (uid, expense) => {
    if (!uid) throw new Error("User ID is required");
    if (!expense.date) throw new Error("Expense date is required");

    try {
      await addDoc(collection(db, "users", uid, "expenses"), {
        ...expense,
        date: Timestamp.fromDate(new Date(expense.date)), // <-- USER DATE
        currency: expense.currency || get().settings.defaultCurrency,
        createdAt: serverTimestamp(), // audit only
      });
    } catch (err) {
      console.error("Error adding expense:", err);
      throw err;
    }
  },

  // ✏️ Update expense
  updateExpense: async (uid, expenseId, updatedExpense) => {
    if (!uid || !expenseId) throw new Error("User ID and expense ID are required");

    try {
      const expRef = doc(db, "users", uid, "expenses", expenseId);
      const updateData = {
        ...updatedExpense,
        currency: updatedExpense.currency || get().settings.defaultCurrency,
        updatedAt: serverTimestamp(),
      };

      // Only update date if provided (and convert to Timestamp)
      if (updatedExpense.date) {
        updateData.date = Timestamp.fromDate(new Date(updatedExpense.date));
      }

      await updateDoc(expRef, updateData);
    } catch (err) {
      console.error("Error updating expense:", err);
      throw err;
    }
  },

  // 🗑️ Delete expense
  deleteExpense: async (uid, expenseId) => {
    if (!uid || !expenseId) throw new Error("User ID and expense ID are required");
    try {
      await deleteDoc(doc(db, "users", uid, "expenses", expenseId));
    } catch (err) {
      console.error("Error deleting expense:", err);
      throw err;
    }
  },

  // ➕ Add income
  addIncome: async (uid, income) => {
    if (!uid) throw new Error("User ID is required");
    if (!income.date) throw new Error("Income date is required");

    try {
      await addDoc(collection(db, "users", uid, "income"), {
        ...income,
        date: Timestamp.fromDate(new Date(income.date)), // <-- USER DATE
        currency: income.currency || get().settings.defaultCurrency,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("Error adding income:", err);
      throw err;
    }
  },

  // ✏️ Update income
  updateIncome: async (uid, incomeId, updatedIncome) => {
    if (!uid || !incomeId) throw new Error("User ID and income ID are required");

    try {
      const incRef = doc(db, "users", uid, "income", incomeId);
      const updateData = {
        ...updatedIncome,
        currency: updatedIncome.currency || get().settings.defaultCurrency,
        updatedAt: serverTimestamp(),
      };

      if (updatedIncome.date) {
        updateData.date = Timestamp.fromDate(new Date(updatedIncome.date));
      }

      await updateDoc(incRef, updateData);
    } catch (err) {
      console.error("Error updating income:", err);
      throw err;
    }
  },

  // 🗑️ Delete income
  deleteIncome: async (uid, incomeId) => {
    if (!uid || !incomeId) throw new Error("User ID and income ID are required");
    try {
      await deleteDoc(doc(db, "users", uid, "income", incomeId));
    } catch (err) {
      console.error("Error deleting income:", err);
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
          currency: currency || get().settings.defaultCurrency,
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
      console.error("Error setting category budget:", err);
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
          currency: currency || get().settings.defaultCurrency,
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
      console.error("Error setting total budget:", err);
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
            [yearMonth]: Object.keys(rest).length > 0 ? rest : delete state.budgets[yearMonth],
          },
        };
      });
    } catch (err) {
      console.error("Error removing total budget:", err);
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
        const newCategories = Object.keys(rest).length > 0 ? rest : deleteField();

        return {
          budgets: {
            ...state.budgets,
            [yearMonth]: {
              ...state.budgets[yearMonth],
              categories: newCategories === deleteField() ? {} : newCategories,
            },
          },
        };
      });
    } catch (err) {
      console.error("Error removing category budget:", err);
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
      console.error("Error updating budgets currency:", err);
      throw err;
    }
  },

  // 🔄 Update currency for all expenses and income
  updateAllExpensesAndIncomeCurrency: async (uid, newCurrency) => {
    if (!uid) throw new Error("User ID is required");
    try {
      const expensesRef = collection(db, "users", uid, "expenses");
      const expensesSnapshot = await getDocs(expensesRef);
      const expensePromises = expensesSnapshot.docs.map(async (expenseDoc) => {
        const expenseRef = doc(db, "users", uid, "expenses", expenseDoc.id);
        await updateDoc(expenseRef, {
          currency: newCurrency,
          updatedAt: serverTimestamp(),
        });
      });

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
      console.error("Error updating expenses and income currency:", err);
      throw err;
    }
  },

  // 🔄 Subscribe to finance data for a specific month (or all data if yearMonth is not provided)
  subscribeFinance: (uid, yearMonth) => {
    if (!uid) throw new Error("User ID is required");

    let expUnsub, incUnsub, budUnsub;

    if (yearMonth) {
      const [year, month] = yearMonth.split("-");
      const startOfMonth = Timestamp.fromDate(new Date(year, month - 1, 1));
      const endOfMonth = Timestamp.fromDate(new Date(year, month, 0, 23, 59, 59, 999));

      // Expenses: filter by user-selected `date`
      const expensesQuery = query(
        collection(db, "users", uid, "expenses"),
        where("date", ">=", startOfMonth),
        where("date", "<=", endOfMonth),
        orderBy("date", "asc")
      );

      expUnsub = onSnapshot(expensesQuery, (snapshot) => {
        set({
          expenses: snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              date: data.date?.toDate(), // convert Timestamp → JS Date
            };
          }),
        });
      });

      // Income: same logic
      const incomeQuery = query(
        collection(db, "users", uid, "income"),
        where("date", ">=", startOfMonth),
        where("date", "<=", endOfMonth),
        orderBy("date", "asc")
      );

      incUnsub = onSnapshot(incomeQuery, (snapshot) => {
        set({
          income: snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              date: data.date?.toDate(),
            };
          }),
        });
      });

      // Budget for this month
      budUnsub = onSnapshot(doc(db, "users", uid, "budgets", yearMonth), (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          set((state) => ({
            budgets: {
              ...state.budgets,
              [yearMonth]: {
                ...data,
                startDate: data.startDate?.toDate(),
              },
            },
          }));
        } else {
          set((state) => ({
            budgets: {
              ...state.budgets,
              [yearMonth]: {
                total: 0,
                categories: {},
                currency: get().settings.defaultCurrency,
              },
            },
          }));
        }
      });
    } else {
      // No yearMonth → listen to all expenses/income
      const expensesQuery = query(collection(db, "users", uid, "expenses"), orderBy("date", "asc"));
      expUnsub = onSnapshot(expensesQuery, (snapshot) => {
        set({
          expenses: snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              date: data.date?.toDate(),
            };
          }),
        });
      });

      const incomeQuery = query(collection(db, "users", uid, "income"), orderBy("date", "asc"));
      incUnsub = onSnapshot(incomeQuery, (snapshot) => {
        set({
          income: snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              date: data.date?.toDate(),
            };
          }),
        });
      });
    }

    return () => {
      expUnsub?.();
      incUnsub?.();
      budUnsub?.();
    };
  },

  // ⚙️ Update user settings
  updateUserSettings: async (uid, settings) => {
    if (!uid) throw new Error("User ID is required");
    try {
      const settingsRef = doc(db, "users", uid, "settings", "preferences");
      await setDoc(
        settingsRef,
        {
          ...settings,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      set((state) => ({
        settings: {
          ...state.settings,
          ...settings,
        },
      }));

      if (settings.defaultCurrency) {
        await get().updateAllBudgetsCurrency(uid, settings.defaultCurrency);
        await get().updateAllExpensesAndIncomeCurrency(uid, settings.defaultCurrency);
      }
    } catch (err) {
      console.error("Error updating user settings:", err);
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
        set({ settings: { defaultCurrency: "GHS" } });
      }
    });
    return unsub;
  },
}));

export default useFinanceStore;