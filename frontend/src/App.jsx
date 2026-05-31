import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import JobDetails from './pages/JobDetails';
import PostJob from './pages/PostJob';

// 1. Initialize TanStack Query Client for client-side API state caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Prevents aggressive background refetches
      retry: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Router>
          <Layout>
            <Routes>
              {/* Home dashboard */}
              <Route path="/" element={<Home />} />
              
              {/* Specific job details screen */}
              <Route path="/jobs/:guid" element={<JobDetails />} />
              
              {/* Manual post job screen */}
              <Route path="/admin/post" element={<PostJob />} />
              
              {/* Catch all redirect to main board */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
