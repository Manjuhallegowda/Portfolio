import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import BlogPage from './pages/BlogPage';
import BlogsIndexPage from './pages/BlogsIndexPage';
import Admin from './pages/Admin';
import NotFound from './pages/NotFound';
import { AuthProvider } from './hooks/useAuth';
import { LoadingProvider } from './hooks/useLoading';
import LoadingSpinner from './components/LoadingSpinner';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <LoadingProvider>
          <LoadingSpinner />
          <BrowserRouter
            future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
          >
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/blog" element={<BlogsIndexPage />} />
              <Route path="/blog/:slug" element={<BlogPage />} />
              <Route path="/admin" element={<Admin />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </LoadingProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
