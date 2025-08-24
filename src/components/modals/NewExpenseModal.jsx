import React from "react";
import { X } from "lucide-react"; // or use react-icons if you prefer

const NewExpenseModal = ({ onClose }) => {
  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
      onClick={onClose} // close when clicking outside modal
    >
      <div
        className="bg-black/90 border border-white/10 rounded-lg p-6 max-w-5xl mx-auto w-full lg:mr-20"
        onClick={(e) => e.stopPropagation()} // prevent close when clicking inside modal
      >
        {/* Header with title + close button */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-white">New Expense</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            <X size={22} />
          </button>
        </div>

        {/* Form */}
        <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Expense Title */}
          <div>
            <label className="block  mb-1 text-gray-200">Expense Title*</label>
            <input
              type="text"
              className="w-full p-2 rounded bg-gray-900 text-white outline-none"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block mb-1 text-gray-200">Date*</label>
            <input
              type="date"
              className="w-full p-2 rounded bg-gray-900 text-white outline-none"
            />
          </div>

          {/* Amount + Currency */}
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block mb-1 text-gray-200">Amount*</label>
              <input
                type="number"
                className="w-full p-2 rounded bg-gray-900 text-white outline-none"
              />
            </div>
            <div>
              <label className="block  mb-1 text-gray-200">Currency</label>
              <select className="p-2 rounded bg-gray-800 border border-gray-700 text-white">
                <option>USD</option>
                <option>EUR</option>
                <option>GHS</option>
              </select>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block mb-1 text-gray-200">Category*</label>
            <select className="w-full p-2 rounded bg-gray-800 border border-gray-700 text-white">
              <option>Food</option>
              <option>Transport</option>
              <option>Housing</option>
              <option>Entertainment</option>
              <option>Other</option>
            </select>
          </div>

          {/* Notes */}
          <div className="md:col-span-2">
            <label className="block  mb-1 text-gray-200">Notes</label>
            <textarea
              className="w-full p-2 rounded bg-gray-800 border border-gray-700 text-white outline-none"
              rows="3"
            />
          </div>

          {/* Upload Receipt */}
          <div className="md:col-span-2 flex justify-center items-center border border-dashed border-gray-600 rounded-lg p-6 cursor-pointer hover:bg-gray-800">
            <span className="text-gray-400">+ Upload a receipt</span>
          </div>
        </form>

        {/* Actions */}
        <div className="flex justify-end mt-6">
          <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg">
            Save Expense
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewExpenseModal;
