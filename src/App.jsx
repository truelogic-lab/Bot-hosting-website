import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Public Components
import Banner from './components/Banner';
import Header from './components/Header';
import Hero from './components/Hero';
import Stats from './components/Stats';
import Pricing from './components/Pricing';
import HowItWorks from './components/HowItWorks';
import Footer from './components/Footer';

// Public Pages
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';

// Dashboard Pages
import Dashboard from './pages/Dashboard';
import BuyTokens from './pages/BuyTokens';
import DeployBot from './pages/DeployBot';
import MyBots from './pages/MyBots';
import Transactions from './pages/Transactions';
import Support from './pages/Support';
import HostingPanels from './pages/HostingPanels';
import TokenBalance from './pages/TokenBalance';

const LandingPage = () => (
  <div className="min-h-screen bg-white flex flex-col">
    <Banner />
    <Header />
    <main className="flex-grow">
      <Hero />
      <Stats />
      <Pricing />
      <HowItWorks />
    </main>
    <Footer />
  </div>
);

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          {/* Protected Dashboard Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/dashboard/buy" element={<ProtectedRoute><BuyTokens /></ProtectedRoute>} />
          <Route path="/dashboard/deploy" element={<ProtectedRoute><DeployBot /></ProtectedRoute>} />
          <Route path="/dashboard/bots" element={<ProtectedRoute><MyBots /></ProtectedRoute>} />
          <Route path="/dashboard/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
          <Route path="/dashboard/support" element={<ProtectedRoute><Support /></ProtectedRoute>} />
          <Route path="/dashboard/panels" element={<ProtectedRoute><HostingPanels /></ProtectedRoute>} />
          <Route path="/dashboard/tokens" element={<ProtectedRoute><TokenBalance /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
