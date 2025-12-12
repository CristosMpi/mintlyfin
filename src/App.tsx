import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import CreateEvent from "./pages/CreateEvent";
import MyEvents from "./pages/MyEvents";
import EventDashboard from "./pages/EventDashboard";
import JoinEvent from "./pages/JoinEvent";
import ParticipantWallet from "./pages/ParticipantWallet";
import ParticipantLogin from "./pages/ParticipantLogin";
import Dashboard from "./pages/Dashboard";
import Wallet from "./pages/Wallet";
import VendorMode from "./pages/VendorMode";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/create" element={
              <ProtectedRoute>
                <CreateEvent />
              </ProtectedRoute>
            } />
            <Route path="/my-events" element={
              <ProtectedRoute>
                <MyEvents />
              </ProtectedRoute>
            } />
            <Route path="/event/:eventId/dashboard" element={
              <ProtectedRoute>
                <EventDashboard />
              </ProtectedRoute>
            } />
            <Route path="/join" element={<ParticipantLogin />} />
            <Route path="/join/:eventId" element={<JoinEvent />} />
            <Route path="/wallet/:eventId/:joinCode" element={<ParticipantWallet />} />
            {/* Demo routes */}
            <Route path="/demo/dashboard" element={<Dashboard />} />
            <Route path="/demo/wallet" element={<Wallet />} />
            <Route path="/demo/vendor" element={<VendorMode />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
