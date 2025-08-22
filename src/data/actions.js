import { MdReceiptLong } from "react-icons/md";
import { FaFileAlt } from "react-icons/fa"; 
import { MdFlightTakeoff } from "react-icons/md";
import { IoWalletOutline } from "react-icons/io5";


export const actions = [
    {
      label: "New expense",
      icon: IoWalletOutline,
      bg: "bg-pink-700",
    },
    {
      label: "Add receipt",
      icon: MdReceiptLong,
      bg: "bg-indigo-800",
    },
    {
      label: "Create report",
      icon: FaFileAlt,
      bg: "bg-emerald-700",
    },
    {
      label: "Create trip",
      icon: MdFlightTakeoff,
      bg: "bg-red-700",
    },
  ];