
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { NotificationsProvider } from "./contexts/NotificationsContext";
import Index from "./pages/Index";
import ValueMyCar from "./pages/ValueMyCar";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import CarListing from "./pages/CarListing";
import AddListing from "./pages/AddListing";
import Admin from "./pages/Admin";
import Dashboard from "./pages/Dashboard";
import ThreadsPage from "./pages/ThreadsPage";
import SearchResults from "./pages/SearchResults";
import SnapAI from "./pages/SnapAI";
import AboutUs from "./pages/AboutUs";
import ContactUs from "./pages/ContactUs";
import Account from "./pages/Account";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <NotificationsProvider>
        <TooltipProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/value-my-car" element={<ValueMyCar />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/listing/:id" element={<CarListing />} />
              <Route path="/add-listing" element={<AddListing />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/threads/:id" element={<ThreadsPage />} />
              <Route path="/search" element={<SearchResults />} />
              <Route path="/snap-ai" element={<SnapAI />} />
              <Route path="/about-us" element={<AboutUs />} />
              <Route path="/contact-us" element={<ContactUs />} />
              <Route path="/account" element={<Account />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </NotificationsProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
