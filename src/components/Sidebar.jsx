// Sidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import { 
  FaHome, 
  FaMoneyBill, 
  FaPlane, 
  FaCheckCircle, 
  FaCog, 
  FaPhone 
} from "react-icons/fa";
import { TbArrowsTransferUpDown } from "react-icons/tb";

const Sidebar = ({ user }) => {
  return (
    <div className="flex flex-col h-screen w-64 bg-black text-gray-300 py-2 px-6 justify-between">
      
      {/* Top Section - Profile */}
      <div>
        <div className="flex flex-col items-center mb-10">
          <h2 className="text-white font-medium text-2xl uppercase tracking-wide">
            {user?.displayName || user?.name || "Guest"}
          </h2>
          <p className=" text-gray-400 truncate max-w-[180px] text-center">
            {user?.email || "No email"}
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col space-y-4">
          {[
            { to: "/dashboard", icon: <FaHome />, label: "Home" },
            { to: "/dashboard/expenses", icon: <FaMoneyBill />, label: "Expenses" },
            { to: "/dashboard/trips", icon: <FaPlane />, label: "Trips" },
            { to: "/dashboard/approvals", icon: <FaCheckCircle />, label: "Approvals" },
            { to: "/dashboard/settings", icon: <FaCog />, label: "Settings" },
            { to: "/dashboard/support", icon: <FaPhone />, label: "Support" },
          ].map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 rounded-lg transition ${
                  isActive
                    ? "bg-white/15 text-teal-400 border border-[0_0_10px_#14b8a6] "
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
          EXP<span className="text-2xl">e</span><span className="text-2xl">n</span>SIO
        </h1>
      </div>
    </div>
  );
};

export default Sidebar;
