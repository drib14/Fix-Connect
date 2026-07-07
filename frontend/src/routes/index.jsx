import React from 'react';
import { Navigate, createBrowserRouter } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../store/authSlice';

// Layout
import DashboardLayout from '../layouts/DashboardLayout';

// Pages
import Landing from '../pages/Landing/Landing';
import Login from '../pages/Login';
import Register from '../pages/Register';
import ForgotPassword from '../pages/ForgotPassword';
import Home from '../pages/Home/Home';
import Categories from '../pages/Categories/Categories';
import ServiceDetail from '../pages/Service/ServiceDetail';
import BookService from '../pages/BookService/BookService';
import BookingHistory from '../pages/BookingHistory/BookingHistory';
import BookingDetails from '../pages/BookingDetails/BookingDetails';
import Messages from '../pages/Messages/Messages';
import Notifications from '../pages/Notifications/Notifications';
import Profile from '../pages/Profile/Profile';
import Settings from '../pages/Settings/Settings';
import NotFound from '../pages/NotFound';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Public/Guest Route Wrapper (Redirects authenticated users to home)
const GuestRoute = ({ children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  return !isAuthenticated ? children : <Navigate to="/home" replace />;
};

export const router = createBrowserRouter([
  // Guest Routes
  {
    path: '/',
    element: <Landing />,
  },
  {
    path: '/login',
    element: (
      <GuestRoute>
        <Login />
      </GuestRoute>
    ),
  },
  {
    path: '/register',
    element: (
      <GuestRoute>
        <Register />
      </GuestRoute>
    ),
  },
  {
    path: '/forgot-password',
    element: (
      <GuestRoute>
        <ForgotPassword />
      </GuestRoute>
    ),
  },

  // Protected Dashboard Routes
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: 'home',
        element: <Home />,
      },
      {
        path: 'categories',
        element: <Categories />,
      },
      {
        path: 'services/:id',
        element: <ServiceDetail />,
      },
      {
        path: 'book/:id',
        element: <BookService />,
      },
      {
        path: 'bookings',
        element: <BookingHistory />,
      },
      {
        path: 'bookings/:id',
        element: <BookingDetails />,
      },
      {
        path: 'messages',
        element: <Messages />,
      },
      {
        path: 'notifications',
        element: <Notifications />,
      },
      {
        path: 'profile',
        element: <Profile />,
      },
      {
        path: 'settings',
        element: <Settings />,
      },
    ],
  },

  // Catch-all 404
  {
    path: '*',
    element: <NotFound />,
  },
]);

export default router;
