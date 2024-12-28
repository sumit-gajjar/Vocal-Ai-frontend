import axios from 'axios';
import React, { useState } from 'react';
import { ThreeDots } from 'react-loader-spinner';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import config from '../config';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const loginUrl = `${config.baseUrl}/login`;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      console.log('current environment: ', config);
      const response = await axios.post(loginUrl, { email, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user_id', response.data.user_id);
      localStorage.setItem('name', response.data.name);
      navigate('/');
    } catch (error) {
      console.error('Login failed', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content">
      <div className="split-left animated fadeInLeft">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="email"
              placeholder=" "
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <label>Email</label>
            <i className="fas fa-envelope icon"></i>
          </div>
          <div className="input-group">
            <input
              type="password"
              placeholder=" "
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <label>Password</label>
            <i className="fas fa-lock icon"></i>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (
              <div className="loader-container">
                <ThreeDots height="10" width="50" color="#ffffff" />
              </div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
        <div className="auth-footer">
          <p>Don't have an account? <a href="/signup">Sign up here</a></p>
        </div>
      </div>
      <div className="split-right animated fadeInRight">
        {/* Right side image */}
      </div>
    </div>
  );
}

export default Login;
