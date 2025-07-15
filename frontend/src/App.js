import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import "./App.css";

// Pages
import HomePage from "./pages/HomePage";
import ServicesPage from "./pages/ServicesPage";
import TrainingPage from "./pages/TrainingPage";
import ConsultationPage from "./pages/ConsultationPage";
import BlogPage from "./pages/BlogPage";
import ClientPortalPage from "./pages/ClientPortalPage";
import ContactPage from "./pages/ContactPage";

// Layout
import Layout from "./components/Layout";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/training" element={<TrainingPage />} />
            <Route path="/consultation" element={<ConsultationPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/client-portal" element={<ClientPortalPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Routes>
        </Layout>
        <Toaster />
      </BrowserRouter>
    </div>
  );
}

export default App;