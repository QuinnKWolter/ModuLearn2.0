import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import BaseLayout from './layouts/BaseLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import License from './pages/License';
import Contact from './pages/Contact';
import About from './pages/About';
import Dashboard from './pages/Dashboard';
import Account from './pages/Account';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import CourseManagePage from './pages/CourseManagePage';
import StudentSessionPage from './pages/StudentSessionPage';
import ModulePage from './pages/ModulePage';

const App = () => {
  return (
    <AuthProvider>
      <HelmetProvider>
        <Router>
          <Navbar />
          <BaseLayout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/license" element={<License />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/about" element={<About />} />
              <Route path="/account" element={<Account />} />
              
              {/* Protected routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                {/* Add more protected routes here */}
              </Route>
              
              <Route path="/courses/:courseId/manage" element={<CourseManagePage />} />
              <Route path="/sessions/:sessionId" element={<StudentSessionPage />} />
              <Route path="/modules/:moduleId" element={<ModulePage />} />

              <Route path="/" element={<Navigate to="/login" replace />} />
            </Routes>
          </BaseLayout>
        </Router>
      </HelmetProvider>
    </AuthProvider>
  );
};

export default App;
