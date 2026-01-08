import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate, useNavigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DoctorList from './pages/DoctorList';
import BookAppointment from './pages/BookAppointment';
import Profile from './pages/Profile';
import MyAppointments from './pages/MyAppointments';
import MedicalRecords from './pages/MedicalRecords';

// Admin Imports
import AdminDashboard from './pages/AdminDashboard';
import { AdminDataProvider } from './pages/AdminDataContext';
import DoctorManagement from './pages/DoctorManagement';
import PatientManagement from './pages/PatientManagement';
import AppointmentsManagement from './pages/AppointmentsManagement';
import RegisterPatient from './pages/RegisterPatient';
import RegisterDoctor from './pages/RegisterDoctor';

import './styles/main.css';

function AppContent() {
  const [adminLoggedIn, setAdminLoggedIn] = useState(() => {
    return localStorage.getItem('userRole') === 'admin';
  });

  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  // Handler for login success
  const handleLoginSuccess = (role) => {
    if (role === 'Admin') {
      setAdminLoggedIn(true);
    }
  };

  if (adminLoggedIn) {
    return (
      <AdminDataProvider>
        <Routes>
          <Route path="/admin" element={<AdminDashboard setAdminLoggedIn={setAdminLoggedIn} />} />
          <Route path="/admin/doctors" element={<DoctorManagement setAdminLoggedIn={setAdminLoggedIn} />} />
          <Route path="/admin/patients" element={<PatientManagement setAdminLoggedIn={setAdminLoggedIn} />} />
          <Route path="/admin/appointments" element={<AppointmentsManagement setAdminLoggedIn={setAdminLoggedIn} />} />
          <Route path="/admin/register-patient" element={<RegisterPatient setAdminLoggedIn={setAdminLoggedIn} />} />
          <Route path="/admin/register-doctor" element={<RegisterDoctor setAdminLoggedIn={setAdminLoggedIn} />} />
          <Route path="*" element={<Navigate to="/admin" />} />
        </Routes>
      </AdminDataProvider>
    );
  }

  return (
    <>
      {isLoginPage ? (
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLoginSuccess} />} />
        </Routes>
      ) : (
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/doctors" element={<DoctorList />} />
            <Route path="/book" element={<BookAppointment />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/my-appointments" element={<MyAppointments />} />
            <Route path="/medical-records" element={<MedicalRecords />} />
            {/* Redirect /admin to login if not logged in */}
            <Route path="/admin/*" element={<Navigate to="/login" />} />
          </Routes>
        </Layout>
      )}
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
