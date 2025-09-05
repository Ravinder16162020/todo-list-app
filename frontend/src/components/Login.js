import React, { useState } from 'react';
import { auth } from '../firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from "firebase/auth";

function Login() {
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleAuthAction = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isLoginView) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-container">
      <h2>{isLoginView ? 'Login' : 'Sign Up'}</h2>
      <form onSubmit={handleAuthAction}>
        <input 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          placeholder="Email Address" 
          required 
        />
        <input 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          placeholder="Password" 
          required 
        />
        <button type="submit">{isLoginView ? 'Login' : 'Sign Up'}</button>
      </form>
      {error && <p className="error">{error}</p>}
      <button onClick={() => setIsLoginView(!isLoginView)} className="toggle-btn">
        {isLoginView ? 'Need an account? Sign Up' : 'Have an account? Login'}
      </button>
    </div>
  );
}

export default Login;