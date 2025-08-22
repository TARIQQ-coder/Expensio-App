// src/store/useExpensesStore.js
import { create } from "zustand";
import { db } from "../config/firebaseConfig";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  where
} from "firebase/firestore";

const useExpensesStore = create((set, get) => ({
  expenses: [],

  fetchExpenses: (userId) => {
    if (!userId) return;

    const q = query(collection(db, "expenses"), where("userId", "==", userId));

    // Listen in real-time
    onSnapshot(q, (snapshot) => {
      const expensesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      set({ expenses: expensesData });
    });
  },

  addExpense: async (expense, userId) => {
    if (!userId) return;
    try {
      await addDoc(collection(db, "expenses"), {
        ...expense,
        userId,
        createdAt: new Date(),
      });
    } catch (error) {
      console.error("Error adding expense:", error);
    }
  },
}));

export default useExpensesStore;
