import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    checkFormValidity();
  }, [email, password]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isFormValid) {
      // Handle login logic here
    }
  };

  const checkFormValidity = () => {
    const isEmailValid = email.includes('@') && email.includes('.');
    const isPasswordValid = password.length > 0;
    setIsFormValid(isEmailValid && isPasswordValid);
  };

  return (
    <div className="max-w-md mx-auto mt-10 card bg-base-200 shadow-lg">
      <div className="card-body">
        <h2 className="card-title text-2xl font-bold">Login</h2>
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
            disabled={!isFormValid}
          >
            Login
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