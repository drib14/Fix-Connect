import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GlobalStyles } from './styles/GlobalStyles';
import Loader from './components/Loader';

// Lazy loading pages for suspense skeleton loader
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Workers = lazy(() => import('./pages/Workers'));
const Terms = lazy(() => import('./pages/Terms'));
const Booking = lazy(() => import('./pages/Booking'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const BookingTracking = lazy(() => import('./pages/BookingTracking'));
const Profile = lazy(() => import('./pages/Profile'));
const ApplyWorker = lazy(() => import('./pages/ApplyWorker'));

function App() {
  return (
    <Router>
      <GlobalStyles />
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/workers" element={<Workers />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/book" element={<Booking />} />
          <Route path="/apply" element={<ApplyWorker />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/booking/:id" element={<BookingTracking />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
