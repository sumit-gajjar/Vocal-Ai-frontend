import axios from 'axios';
import React, { useState } from 'react';
import { ThreeDots } from 'react-loader-spinner';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import config from '../config';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const signupURL = `${config.baseUrl}/register`

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(signupURL/*'http://localhost:5000/register'*/, { username, email, password });
      navigate('/login');
    } catch (error) {
      console.error('Signup failed', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content">
      <div className="split-left animated fadeInLeft">
        <h2>Create your account</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="text"
              placeholder=" "
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <label>Name</label>
            <i className="fas fa-user icon"></i>
          </div>
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
              'Sign Up'
            )}
          </button>
        </form>
        <div className="auth-footer">
          <p>Already have an account? <a href="/login">Log in</a></p>
        </div>
      </div>
      <div className="split-right animated fadeInRight">
        {/* Right side image */}
      </div>
    </div>
  );
};

export default Signup;
