import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SignUp from './components/SignUp';
import LogIn from './components/LogIn';
import DashboardLayout from './components/DashboardLayout';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SignUp />} />   {/* Default page */}
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<LogIn />} />
        <Route path="/dashboard" element={<DashboardLayout />}>
          {/* Nested routes for dashboard */}
          <Route path="expenses" element={<div>Expenses Page</div>} />
          <Route path="trips" element={<div>Trips Page</div>} />
          <Route path="approvals" element={<div>Approvals Page</div>} />
          <Route path="settings" element={<div>Settings Page</div>} />
          <Route path="support" element={<div>Support Page</div>} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App