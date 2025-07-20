// src/App.tsx
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Index from "./pages/Index";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import Discover from "./pages/Discover";
import Categories from "./pages/Categories";
import UserProfile from "./pages/UserProfile";
import NotFound from "./pages/NotFound";
import Tnc from "./pages/Tnc";
import Privacy from "./pages/Privacy";
import Attendee from "./pages/Attendee";
import Host from "./pages/Host";

import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./lib/firebase";


const queryClient = new QueryClient();

// —————— Protected Route HOC ——————
const ProtectedRoute = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// —————— Main App ——————
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />

      <BrowserRouter>
        <Routes>
          {/* Home route */}
          <Route path="/" element={<Index />} />

          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/tnc" element={<Tnc />} />
          <Route path="/privacy" element={<Privacy />} />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/attendee"
            element={
              <ProtectedRoute>
                <Attendee />
              </ProtectedRoute>
            }
          />
          <Route
            path="/host"
            element={
              <ProtectedRoute>
                <Host />
              </ProtectedRoute>
            }
          />

          {/* Catch‑all 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;