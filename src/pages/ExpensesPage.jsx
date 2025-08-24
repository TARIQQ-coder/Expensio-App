import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import NewExpenseModal from "../components/modals/NewExpenseModal";
import { useNavigate } from "react-router-dom";

const ExpensesPage = () => {
  const [showModal, setShowModal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // If navigated with { state: { openModal: true } }, auto-open modal
  useEffect(() => {
    if (location.state?.openModal) {
      setShowModal(true);
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate, location.pathname]);

  return (
    <div>
      <button
        onClick={() => setShowModal(true)}
        className="px-4 py-2 bg-pink-600 rounded-lg"
      >
        + Add Expense
      </button>

      {showModal && <NewExpenseModal onClose={() => setShowModal(false)} />}
    </div>
  );
};

export default ExpensesPage;
