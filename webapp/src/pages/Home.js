import { useNavigate } from "react-router-dom";
import "./Home.css";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero">
        <h1>Customer International Payments Portal</h1>
        <p>
          Send money globally with confidence. Fast, secure, and transparent
          international transfers at your fingertips.
        </p>
        <div className="cta-buttons">
          <button className="btn-primary" onClick={() => navigate("/register")}>
            Get Started
          </button>
          <button className="btn-secondary" onClick={() => navigate("/login")}>
            Sign In
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="feature-card">
          <div className="feature-icon">🔒</div>
          <h3>Bank-Grade Security</h3>
          <p>
            Your transactions are protected with advanced encryption and
            multi-layer security protocols.
          </p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">⚡</div>
          <h3>Fast Transfers</h3>
          <p>
            Send money internationally in minutes, not days. Real-time tracking
            for all transactions.
          </p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">👥</div>
          <h3>24/7 Support</h3>
          <p>
            Our dedicated team is here to help you anytime, anywhere with your
            payment needs.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats">
        <h2>Trusted by Thousands</h2>
        <p className="stats-subtitle">
          Join our growing community of satisfied customers
        </p>
        <div className="stats-grid">
          <div className="stat-item">
            <h4>50K+</h4>
            <p>Active Users</p>
          </div>
          <div className="stat-item">
            <h4>150+</h4>
            <p>Countries</p>
          </div>
          <div className="stat-item">
            <h4>R2B+</h4>
            <p>Transferred</p>
          </div>
          <div className="stat-item">
            <h4>99.9%</h4>
            <p>Uptime</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
