import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import ErrorMessage from '../components/ErrorMessage';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isFormValid, setIsFormValid] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    checkFormValidity();
  }, [email, password]);

  const checkFormValidity = () => {
    const isEmailValid = email.includes('@') && email.includes('.');
    const isPasswordValid = password.length > 0;
    setIsFormValid(isEmailValid && isPasswordValid);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    setError('');
    setIsLoading(true);
    
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Failed to login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 card bg-base-200 shadow-lg">
      <div className="card-body">
        <h2 className="card-title text-2xl font-bold">Login</h2>
        
        <ErrorMessage message={error} />
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Email</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input input-bordered w-full"
              required
            />
          </div>
          
          <div className="form-control">
            <label className="label">
              <span className="label-text">Password</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input input-bordered w-full"
              required
            />
          </div>
          
          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={!isFormValid || isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <p className="mt-4 text-sm text-center">
          Don't have an account? <Link to="/signup" className="text-primary hover:text-primary-focus">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}

export default Login; 