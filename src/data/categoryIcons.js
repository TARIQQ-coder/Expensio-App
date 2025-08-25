// src/data/categoryIcon.js
import { FaWallet,FaHouseUser } from "react-icons/fa";
import { MdShoppingCart } from "react-icons/md";
import { Utensils, Car, Music } from "lucide-react";


const categoryIcons = {
  Transport: Car,
  Food: Utensils,
  Shopping: MdShoppingCart,
  Other: FaWallet,
  Housing: FaHouseUser,
  Entertainment: Music,
};

export default categoryIcons;