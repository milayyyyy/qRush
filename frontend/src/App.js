import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Components
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import AttendeeDashboard from './pages/AttendeeDashboard';
import OrganizerDashboard from './pages/OrganizerDashboard';
import StaffDashboard from './pages/StaffDashboard';
import EventsPage from './pages/EventsPage';
import EventDetails from './pages/EventDetails';
import TicketView from './pages/TicketView';
import CreateEvent from './pages/CreateEvent';
import QRScanner from './pages/QRScanner';
import { Toaster } from './components/ui/sonner';

// Mock authentication context
const AuthContext = React.createContext();

export const useAuth = () => React.useContext(AuthContext);

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mock authentication - simulate checking for existing session
  useEffect(() => {
    const savedUser = localStorage.getItem('qrush_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('qrush_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('qrush_user');
  };

  const authValue = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading QRush...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={authValue}>
      <Router>
        <div className="App min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/:id" element={<EventDetails />} />

            {/* Protected Routes */}
            <Route 
              path="/dashboard" 
              element={
                user ? (
                  user.role === 'attendee' ? <AttendeeDashboard /> :
                  user.role === 'organizer' ? <OrganizerDashboard /> :
                  user.role === 'staff' ? <StaffDashboard /> :
                  <Navigate to="/auth" />
                ) : (
                  <Navigate to="/auth" />
                )
              } 
            />
            <Route 
              path="/ticket/:ticketId" 
              element={user ? <TicketView /> : <Navigate to="/auth" />} 
            />
            <Route 
              path="/create-event" 
              element={
                user && user.role === 'organizer' ? 
                <CreateEvent /> : 
                <Navigate to="/dashboard" />
              } 
            />
            <Route 
              path="/scan" 
              element={
                user && user.role === 'staff' ? 
                <QRScanner /> : 
                <Navigate to="/dashboard" />
              } 
            />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
          <Toaster />
        </div>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;