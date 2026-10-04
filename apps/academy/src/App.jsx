import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import PhoneAuth from './pages/PhoneAuth';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Webinar from './pages/Webinar';
import OnlineCourse from './pages/OnlineCourse';
import HybridCourse from './pages/HybridCourse';
import OnlineClass from './pages/OnlineClass';
import OfflineCourse from './pages/OfflineCourse';
import useAuth from './hooks/useAuth';
import { apiEnroll } from './api/endpoints';
import theme from './theme';

function App() {
  const { user, setUser, logout } = useAuth();
  const [toast, setToast] = useState({ open: false, msg: '', severity: 'success' });
  const isLoggedIn = !!user;

  const showToast = (msg, type = 'success') => {
    const severity = type === 'error' ? 'error' : type === 'info' ? 'info' : 'success';
    setToast({ open: true, msg, severity });
  };

  const handleCloseToast = (_, reason) => {
    if (reason === 'clickaway') return;
    setToast(t => ({ ...t, open: false }));
  };

  const onLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('pmc_user', JSON.stringify(userData));
    showToast(`Welcome back, ${userData.name}!`);
  };

  const onLogout = () => {
    logout();
    showToast('You have been signed out.', 'info');
  };

  const handleEnroll = async ({ courseId, courseTitle, price, courseType }) => {
    try {
      await apiEnroll({ courseId, courseType, courseTitle, price });
      showToast(`Enrolled in "${courseTitle}" successfully!`);
    } catch (err) {
      if (err.message === 'Already enrolled in this course') {
        showToast(`Already enrolled in "${courseTitle}"`, 'info');
      } else {
        showToast(err.message || 'Enrollment failed. Try again.', 'error');
      }
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter basename="/academy-app">
        <Navbar user={user} onLogout={onLogout} />

        <Routes>
          {/* Phone + OTP login — same mechanism for both, admin variant just
              redirects/gates differently after verifying. */}
          <Route path="/login"    element={isLoggedIn ? <Navigate to="/online-course" replace /> : <PhoneAuth variant="user" onLogin={onLogin} />} />
          <Route path="/register" element={isLoggedIn ? <Navigate to="/online-course" replace /> : <PhoneAuth variant="user" onLogin={onLogin} />} />
          <Route path="/admin/login" element={(isLoggedIn && user.role === 'admin') ? <Navigate to="/online-course" replace /> : <PhoneAuth variant="admin" onLogin={onLogin} />} />
          <Route path="/forgot-password" element={isLoggedIn ? <Navigate to="/" replace /> : <ForgotPassword />} />
          <Route path="/reset-password"  element={isLoggedIn ? <Navigate to="/" replace /> : <ResetPassword />} />
          <Route path="/"         element={<Home user={user} />} />
          {/* Browsing is open to everyone — no login wall. Online Course itself
              shows the right thing per role: guest browse+buy, user's own
              purchases/certificates, or admin's upload/manage tools. */}
          <Route path="/webinar"        element={<Webinar       onEnroll={handleEnroll} />} />
          <Route path="/online-course"  element={<OnlineCourse user={user} />} />
          <Route path="/hybrid-course"  element={<HybridCourse  onEnroll={handleEnroll} />} />
          <Route path="/online-class"   element={<OnlineClass   onEnroll={handleEnroll} />} />
          <Route path="/offline-course" element={<OfflineCourse onEnroll={handleEnroll} />} />
        </Routes>

        <Snackbar
          open={toast.open}
          autoHideDuration={3500}
          onClose={handleCloseToast}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseToast} severity={toast.severity} variant="filled" sx={{ minWidth: 280, borderRadius: 2 }}>
            {toast.msg}
          </Alert>
        </Snackbar>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
