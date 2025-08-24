// Sidebar.jsx
import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { 
  FaHome, 
  FaMoneyBill, 
  FaWallet, 
  FaChartPie, 
  FaCog, 
  FaBars, 
  FaTimes,
  FaChartArea 
} from "react-icons/fa";
import { TbArrowsTransferUpDown } from "react-icons/tb";

const Sidebar = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Floating toggle button (mobile only) */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 right-4 z-50 p-2 rounded-md bg-black text-white shadow-md"
      >
        {isOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-black text-gray-300 py-6 px-6 flex flex-col justify-between transform transition-transform duration-300 z-40
        ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        {/* Top Section - Profile */}
        <div>
          <div className="flex flex-col items-center mb-10">
            <h2 className="text-white font-medium text-2xl uppercase tracking-wide">
              {user?.displayName || user?.name || "Guest"}
            </h2>
            <p className="text-gray-400 truncate max-w-[180px] text-center">
              {user?.email || "No email"}
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col space-y-4">
            {[
              { to: "/dashboard", icon: <FaHome />, label: "Home" },
              { to: "/dashboard/expenses", icon: <FaMoneyBill />, label: "Expenses" },
              { to: "/dashboard/income", icon: <FaWallet />, label: "Income" },
              { to: "/dashboard/budget", icon: <FaChartPie />, label: "Budget" },
              { to: "/dashboard/reports", icon: <FaChartArea />, label: "Reports" },
              { to: "/dashboard/settings", icon: <FaCog />, label: "Settings" },
            ].map(({ to, icon, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setIsOpen(false)} // close sidebar on mobile when navigating
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2 rounded-lg transition ${
                    isActive
                      ? "bg-white/15 text-teal-400 border border-[0_0_10px_#14b8a6]"
                      : "hover:bg-gray-900"
                  }`
                }
              >
                {icon} {label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Bottom Logo */}
        <div className="flex flex-col items-center">
          <TbArrowsTransferUpDown className="text-3xl text-teal-400 mb-1 rotate-90" />
          <h1 className="font-bold text-lg bg-gradient-to-r from-teal-100 via-teal-400 to-teal-900 bg-clip-text text-transparent tracking-wide">
            EXP<span className="text-2xl">e</span>
            <span className="text-2xl">n</span>SIO
          </h1>
        </div>
      </div>

      {/* Dark overlay when sidebar is open (mobile only) */}
      {isOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 bg-black/50 lg:hidden z-30"
        />
      )}
    </>
  );
};

export default Sidebar;
