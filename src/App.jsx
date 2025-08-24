import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SignUp from './components/SignUp';
import LogIn from './components/LogIn';
import DashboardLayout from './components/DashboardLayout';
import Home from './components/Home'; 
import ExpensesPage from './pages/ExpensesPage';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SignUp />} />   {/* Default page */}
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<LogIn />} />
        <Route path="/dashboard" element={<DashboardLayout />}>
          {/* Nested routes for dashboard */}
          <Route index element={<Home />} />
          <Route path="expenses" element={<ExpensesPage />} />
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