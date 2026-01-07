import Chatbot from './Chatbot'
import './index.css'

function App() {
  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="nav-container">
          <div className="logo">
            <span className="logo-icon">🏥</span>
            <span className="logo-text">HealHub</span>
          </div>
          <div className="nav-links">
            <a href="#dashboard" className="active">Dashboard</a>
            <a href="#doctors">Find Doctors</a>
            <a href="#appointments">Appointments</a>
            <button className="login-btn">Sign In</button>
          </div>
        </div>
      </nav>

      <header className="hero">
        <div className="hero-content">
          <h1>Modern Healthcare for a Better Life</h1>
          <p>Seamlessly manage your health with HealHub's intuitive platform.</p>
          <div className="hero-actions">
            <button className="primary-btn">Get Started</button>
            <button className="secondary-btn">Learn More</button>
          </div>
        </div>
      </header>

      <main className="dashboard">
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
      </main>

      <Chatbot />
    </div>
  )
}

export default App
