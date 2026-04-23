import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/contexts/AppContext";
import Header from "@/components/Header";
import AuthModal from "@/components/AuthModal";
import EditProfileModal from "@/components/EditProfileModal";
import ProfileGuard from "@/components/ProfileGuard";
import Index from "./pages/Index";
import SearchResults from "./pages/SearchResults";
import Dashboard from "./pages/Dashboard";
import MedicineDetail from "./pages/MedicineDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppProvider>
        <Toaster position="bottom-right" richColors />
        <BrowserRouter>
          <Header />
          <AuthModal />
          <EditProfileModal />
          <ProfileGuard />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/medicine/:id" element={<MedicineDetail />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;