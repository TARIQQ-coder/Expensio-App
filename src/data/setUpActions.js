import { FaWallet } from "react-icons/fa";
import { MdFlight } from "react-icons/md";
import { MdOutlineShoppingCartCheckout } from "react-icons/md";

export const setUpActions = [
  {
    label: "Add Income",
    type: "income",
    icon: FaWallet,
    bg: "bg-green-600",
  },
  {
    label: "Add Expense",
    type: "expense",
    icon: MdOutlineShoppingCartCheckout,
    bg: "bg-red-600",
  },
  {
    label: "Set Budget",
    type: "budget",
    icon: MdFlight,
    bg: "bg-blue-600",
  },
];
