// src/data/categoryIcon.js
import { FaWallet,FaHouseUser, FaHandshake, FaGift } from "react-icons/fa";
import { MdShoppingCart } from "react-icons/md";
import { Utensils, Car, Music,Lightbulb } from "lucide-react";
import { IoMdCash } from "react-icons/io";



export const expenseIcons = {
  Transport: Car,
  Food: Utensils,
  Shopping: MdShoppingCart,
  Utilities: Lightbulb,
  Other: FaWallet,
  Housing: FaHouseUser,
  Entertainment: Music,
};


export const incomeIcons = {
  Salary: IoMdCash,
  Business: FaHandshake,
  Gifts: FaGift,
  Bonus: IoMdCash,
  Other: FaWallet,
}
