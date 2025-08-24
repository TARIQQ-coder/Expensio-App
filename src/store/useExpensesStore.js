import useExpensesStore from "../store/useExpensesStore";
import { useAuth } from "../context/AuthContext"; // or however you get userId

const NewExpenseModal = ({ onClose }) => {
  const addExpense = useExpensesStore((state) => state.addExpense);
  const { user } = useAuth(); // get the logged in user

  const handleSubmit = async (e) => {
    e.preventDefault();

    const expense = {
      title: e.target.title.value,
      date: e.target.date.value,
      amount: parseFloat(e.target.amount.value),
      currency: e.target.currency.value,
      category: e.target.category.value,
      notes: e.target.notes.value,
    };

    await addExpense(expense, user?.uid); // ✅ save to Firestore
    onClose(); // close modal after save
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input name="title" type="text" />
        <input name="date" type="date" />
        <input name="amount" type="number" />
        <select name="currency">...</select>
        <select name="category">...</select>
        <textarea name="notes" />
        <button type="submit">Save Expense</button>
      </form>
    </div>
  );
};
