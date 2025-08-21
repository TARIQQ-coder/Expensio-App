// src/store/useExpensesStore.js
import { create } from "zustand";
import { db } from "../config/firebaseConfig";
import { collection, addDoc, getDocs, onSnapshot } from "firebase/firestore";

const expensesCollectionRef = collection(db, "expenses");

const useExpensesStore = create((set) => ({
  expenses: [],

  // Fetch once
  fetchExpenses: async () => {
    try {
      const data = await getDocs(expensesCollectionRef);
      const expenses = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      set({ expenses });
    } catch (err) {
      console.error("Error fetching expenses:", err);
    }
  },

  // Subscribe realtime
  subscribeExpenses: () => {
    return onSnapshot(expensesCollectionRef, (snapshot) => {
      const expenses = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      set({ expenses });
    });
  },

  // Add new expense
  addExpense: async (expense) => {
    try {
      await addDoc(expensesCollectionRef, expense);
    } catch (err) {
      console.error("Error adding expense:", err);
    }
  },
}));

export default useExpensesStore;
