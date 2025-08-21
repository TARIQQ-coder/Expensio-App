import React from "react";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import { auth, db } from "../config/firebaseConfig"; 
import { onAuthStateChanged } from "firebase/auth";
import {doc, getDoc} from "firebase/firestore";

const DashboardLayout = () => {

  const [userData, setUserData] = useState(null);

  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
    if (currentUser) {
      let userInfo = {
        displayName: currentUser.displayName,
        email: currentUser.email,
        profilePicture: currentUser.photoURL,
      };

      const docRef = doc(db, "users", currentUser.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        userInfo = { ...userInfo, ...docSnap.data() };
      } else {
        console.log("No such document in Firestore, using auth data only");
      }

      setUserData(userInfo);
    } else {
      setUserData(null);
    }
  });

  return () => unsubscribe();
}, []);

  return (
    <div className="flex">
      <Sidebar user={userData} />
      <div className="flex-1 p-6 bg-gray-100 min-h-screen">
        <Outlet /> {/* This renders the nested dashboard routes */}
      </div>
    </div>
  );
};

export default DashboardLayout;
