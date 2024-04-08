import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const auth = getAuth();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // User successfully logged in, redirect to HomePage...not implemented yet
      navigate('/homepage');
    } catch (error) {
      setError(error.message); 
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address to reset your password.');
      return;
    }
    const auth = getAuth();
    sendPasswordResetEmail(auth, email)
      .then(() => {
        alert('Password reset email sent! Please check your inbox.');
      })
      .catch((error) => {
        setError(error.message); // Display error message
      });
  };


  return (
    <div className="login-background">
    <div className="login-form">
       <h1>Login</h1>
      <p> Your next unforgettable experience few clicks away!
      </p>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button type="submit">Login</button>
      </form>
      <p>Forgot you password? We can fix that </p>

      <button onClick={handleForgotPassword} className="forgot-password">
          Reset Password
        </button>

      <p>Don’t have an account yet?  <Link to="/signup">SignUp</Link> and start sharing your travel stories with the world.</p>

     
        
    </div>
    </div>
  );
}

export default Login;
