import React from "react";
import { FaWallet } from "react-icons/fa";
import { MdFlight } from "react-icons/md";
import { MdOutlineShoppingCartCheckout } from "react-icons/md";
import { IoMdTime } from "react-icons/io";
import { RiExchangeDollarFill } from "react-icons/ri";

import { expenses } from "../data/expenses.js";



const Home = () => {
  

  return (
    <div className="lg:pl-70 pt-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Pending Tasks Card */}
        <div className="bg-black/65 text-white py-4 rounded-lg shadow-lg border border-white/30 col-span-1 h-full flex flex-col">
          <h3 className="text-xl font-semibold mb-2 border-b-2 pl-4 border-white/30 pb-1">
            Pending Tasks
          </h3>
          <ul className="space-y-2 px-4 flex-grow">
            <li className="flex items-center h-12">
              <IoMdTime className="text-purple-500 mr-2 w-4 h-4" />
              <span>Pending Approvals</span>
              <span className="ml-auto ">5</span>
            </li>
            <li className="flex items-center h-12">
              <MdFlight className="text-purple-500 mr-2 w-4 h-4" />
              <span>New Trips Registered</span>
              <span className="ml-auto ">1</span>
            </li>
            <li className="flex items-center h-12">
              <FaWallet className="text-purple-500 mr-2 w-4 h-4" />
              <span>Unreported Expenses</span>
              <span className="ml-auto">4</span>
            </li>
            <li className="flex items-center h-12">
              <MdOutlineShoppingCartCheckout className="text-purple-500 mr-2 w-4 h-4" />
              <span>Upcoming Expenses</span>
              <span className="ml-auto">€0.00</span>
            </li>
            <li className="flex items-center h-12">
              <RiExchangeDollarFill className="text-purple-500 mr-2 w-4 h-4" />
              <span>Unreported Advances</span>
              <span className="ml-auto">€0.00</span>
            </li>
          </ul>
        </div>

        {/* Recent Expenses Card */}
        <div className="bg-black/65 text-white py-4 rounded-lg border border-white/30 col-span-2 ">
          <h2 className="text-xl font-semibold mb-2 border-b-2 pl-4 border-white/30 pb-1">
            Recent Expenses
          </h2>
          <div className=" overflow-x-auto">
            <table className="w-full ">
              <thead>
                <tr>
                  <th className="p-2 text-left">Subject</th>
                  <th className="p-2 text-left">Employee</th>
                  <th className="p-2 text-left">Team</th>
                  <th className="p-2 text-left">Amount</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense, index) => (
                  <tr key={index} className="">
                    <td className="p-2">{expense.subject}</td>
                    <td className="p-2">{expense.employee}</td>
                    <td className="p-2">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm ${
                          expense.team === "Marketing"
                            ? "bg-purple-700"
                            : expense.team === "Sales"
                            ? "bg-pink-700"
                            : expense.team === "Operations"
                            ? "bg-orange-600"
                            : expense.team === "Finance"
                            ? "bg-green-700"
                            : ""
                        }`}
                      >
                        {expense.team}
                      </span>
                    </td>
                    <td className="p-2">{expense.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
