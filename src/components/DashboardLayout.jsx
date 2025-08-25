import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";
import { auth, db } from "../config/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

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
    <div>
      {/* Sidebar always present */}
      <Sidebar user={userData} />

      {/* Main content shifts right on lg screens */}
      <div className="p-6 bg-black min-h-screen lg:ml-64">
        <Outlet /> {/* Nested dashboard routes */}
      </div>
    </div>
  );
};

export default DashboardLayout;
