import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SignUp from './components/SignUp';
import LogIn from './components/LogIn';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SignUp />} />   {/* Default page */}
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<LogIn />} />
      </Routes>
    </Router>
  )
}

export default App