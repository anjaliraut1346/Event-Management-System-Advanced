import { useState } from "react";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      alert(data.message);

      if (response.ok) {
        window.location.href = "/";
      }
    } catch (error) {
      alert("Unable to connect to server");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        {/* EventSphere Branding */}
        <div className="auth-brand">
          <div className="auth-brand-icon">🎓</div>

          <div className="auth-brand-text">
            <strong>EventSphere</strong>
            <span>College Event Management</span>
          </div>
        </div>

        <h1>Create Your Account ✨</h1>

        <p className="subtitle">
          Join your college's event community.
        </p>

        <div className="welcome">
          <h2>Welcome to EventSphere!</h2>
          <p>
            Create your account to discover, register and
            participate in college events.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <label>Full Name</label>

          <input
            type="text"
            name="name"
            placeholder="Enter your full name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <label>Email Address</label>

          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label>Password</label>

          <input
            type="password"
            name="password"
            placeholder="Create a password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <label>Register As</label>

          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
          >
            <option value="student">Student</option>
            <option value="admin">Admin</option>
          </select>

          <button type="submit" className="primary-btn">
            Create EventSphere Account →
          </button>
        </form>

        <p className="register-text">
          Already have an account?
          <a href="/"> Login</a>
        </p>
      </div>
    </div>
  );
}

export default Register;