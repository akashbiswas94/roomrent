import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import { LoadingState } from './components/LoadingState';

// Lazy-loaded pages for performance
const HomePage = lazy(() => import('./pages/HomePage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const RentalDetailPage = lazy(() => import('./pages/RentalDetailPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const MyRatingsPage = lazy(() => import('./pages/MyRatingsPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <div className="app">
        <Navbar />
        <main className="app__main">
          <Suspense fallback={<LoadingState message="Loading page…" />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/rental/:id" element={<RentalDetailPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/my-ratings" element={<MyRatingsPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </main>
        <footer className="app__footer">
          <div className="container">
            <p>AussieRent &copy; 2026 · Data sourced from Kaggle · Built with React</p>
            <p className="footer__disclaimer">
              This application is for educational purposes. QUT CAB230 Assignment.
            </p>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  </AuthProvider>
);

export default App;
