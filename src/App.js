import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min'; // Includes Popper.js and Bootstrap JS
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import ExpandedResult from './pages/ExpandedResult';
import Login from './pages/Login';
import Signup from './pages/Signup';
import PrivateRoute from './utils/PrivateRoute';



function App() {
  return (
    <div className="App">
      <Header />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/expanded-result/:resultId" element={<PrivateRoute><ExpandedResult /></PrivateRoute>} />
      </Routes>
    </div>
  );
}

export default App;
