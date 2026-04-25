import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from './components/AuthLayout';
import ProtectedRoute from './components/ProtectedRoute';
import { SocketProvider } from './contexts/SocketContext';
import Landing from './pages/Landing';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Bookings from './pages/Bookings';
import BookingDetail from './pages/BookingDetail';
import Earnings from './pages/Earnings';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

function App() {
  return (
    <SocketProvider>
      <Router>
        <Routes>
        {/* Public Landing Page */}
        <Route path="/landing" element={<Landing />} />

        {/* Protected Dashboard/Home Route */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Home />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/booking/:id" element={<BookingDetail />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/worker/earnings" element={<Earnings />} />
        </Route>

        <Route path="/login" element={
          <AuthLayout>
            <Login />
          </AuthLayout>
        } />

        <Route path="/register" element={
          <AuthLayout>
            <Register />
          </AuthLayout>
        } />

        <Route path="/forgot-password" element={
          <AuthLayout>
            <ForgotPassword />
          </AuthLayout>
        } />

        <Route path="/reset-password" element={
          <AuthLayout>
            <ResetPassword />
          </AuthLayout>
        } />

        </Routes>
      </Router>
    </SocketProvider>
  );
}

export default App;