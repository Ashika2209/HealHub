import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import Chatbot from './Chatbot'
import DoctorDashboard from './pages/DoctorDashboard';
import AppointmentList from './pages/AppointmentList';
import DoctorRoutes from './components/DoctorRoutes';
import './index.css'

function App() {
  return (
    <Router>
      <div className="app-container">
        <nav className="navbar">
          <div className="nav-container">
            <div className="logo">
              <span className="logo-icon">🏥</span>
              <span className="logo-text">HealHub</span>
            </div>
            <div className="nav-links">
              <Link to="/">Dashboard</Link>
              <Link to="/doctor/dashboard">Doctor Console</Link>
              <Link to="/doctor/appointments">Appointments</Link>
            </div>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={
              <>
                <header className="hero">
                  <div className="hero-content">
                    <h1>Modern Healthcare for a Better Life</h1>
                    <p>Seamlessly manage your health with HealHub's intuitive platform.</p>
                    <div className="hero-actions">
                      <button className="primary-btn" onClick={() => {
                        // For demo: set a fake token and go to doctor dash
                        localStorage.setItem('doctor_token', 'demo_token');
                        window.location.href = '/doctor/dashboard';
                      }}>Doctor Login (Demo)</button>
                    </div>
                  </div>
                </header>
                <section className="dashboard">
                  <div className="section-title">
                    <h2>Quick Access</h2>
                    <p>Everything you need in one place.</p>
                  </div>
                  <div className="stats-grid">
                    {['Find a Doctor', 'Active Appointments', 'Medical Records', 'Prescriptions'].map(card => (
                      <div key={card} className="stat-card">
                        <div className="card-icon">{card === 'Find a Doctor' ? '👨‍⚕️' : card === 'Active Appointments' ? '📅' : card === 'Medical Records' ? '📋' : '💊'}</div>
                        <div className="card-info">
                          <h3>{card}</h3>
                          <p>Manage your {card.toLowerCase()} effortlessly.</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </>
            } />

            {/* Doctor Protected Routes */}
            <Route path="/doctor" element={<DoctorRoutes />}>
              <Route path="dashboard" element={<DoctorDashboard />} />
              <Route path="appointments" element={<AppointmentList />} />
            </Route>

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>

        <Chatbot />
      </div>
    </Router>
  )
}

export default App
