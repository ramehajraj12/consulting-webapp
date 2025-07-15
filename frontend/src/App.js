import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import "./App.css";

// Auth Context
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Pages
import HomePage from "./pages/HomePage";
import ServicesPage from "./pages/ServicesPage";
import TrainingPage from "./pages/TrainingPage";
import ConsultationPage from "./pages/ConsultationPage";
import BlogPage from "./pages/BlogPage";
import ClientPortalPage from "./pages/ClientPortalPage";
import ContactPage from "./pages/ContactPage";

// Dashboard Pages
import ClientDashboardPage from "./pages/ClientDashboardPage";
import ConsultantDashboardPage from "./pages/ConsultantDashboardPage";

// Auth Components
import LoginForm from "./components/auth/LoginForm";
import RegisterForm from "./components/auth/RegisterForm";

// Layout
import Layout from "./components/Layout";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
            
            {/* Protected Dashboard Routes */}
            <Route
              path="/client-dashboard"
              element={
                <ProtectedRoute requiredRole="client">
                  <ClientDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/consultant-dashboard"
              element={
                <ProtectedRoute requiredRole="consultant">
                  <ConsultantDashboardPage />
                </ProtectedRoute>
              }
            />
            
            {/* Public Routes with Layout */}
            <Route
              path="/*"
              element={
                <Layout>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/services" element={<ServicesPage />} />
                    <Route path="/training" element={<TrainingPage />} />
                    <Route path="/consultation" element={
                      <ProtectedRoute>
                        <ConsultationPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/blog" element={<BlogPage />} />
                    <Route path="/client-portal" element={
                      <ProtectedRoute>
                        <ClientPortalPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/contact" element={<ContactPage />} />
                  </Routes>
                </Layout>
              }
            />
          </Routes>
          <Toaster />
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;