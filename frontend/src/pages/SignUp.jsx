import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

function SignUp() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    roles: {
      student: true,
      instructor: false,
      researcher: false
    }
  });
  const [isFormValid, setIsFormValid] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState([
    'at least 8 characters',
    'an uppercase letter',
    'a lowercase letter',
    'a number',
    'a special character',
  ]);
  const [passwordMatchError, setPasswordMatchError] = useState('Passwords do not match.');

  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    validatePassword();
    validatePasswordMatch();
    checkFormValidity();
  }, [formData]);

  const validatePassword = () => {
    const errors = [];
    const passwordRequirements = [
      { regex: /.{8,}/, message: 'at least 8 characters' },
      { regex: /[A-Z]/, message: 'an uppercase letter' },
      { regex: /[a-z]/, message: 'a lowercase letter' },
      { regex: /[0-9]/, message: 'a number' },
      { regex: /[^A-Za-z0-9]/, message: 'a special character' },
    ];

    passwordRequirements.forEach(requirement => {
      if (!requirement.regex.test(formData.password)) {
        errors.push(requirement.message);
      }
    });

    setPasswordErrors(errors);
    return errors.length === 0;
  };

  const validatePasswordMatch = () => {
    const match = formData.password === formData.confirmPassword;
    setPasswordMatchError(match ? '' : 'Passwords do not match.');
    return match;
  };

  const checkFormValidity = () => {
    const isEmailValid = formData.email.includes('@') && formData.email.includes('.');
    const isPasswordValid = validatePassword();
    const doPasswordsMatch = validatePasswordMatch();
    const isFullNameValid = formData.fullName.length > 0;
    const hasRole = Object.values(formData.roles).some(Boolean);

    setIsFormValid(
      isEmailValid && 
      isPasswordValid && 
      doPasswordsMatch && 
      isFullNameValid &&
      hasRole
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    const apiUrl = import.meta.env.VITE_API_URL;
    console.log(apiUrl);
    if (!apiUrl) {
      setError('API URL not configured. Please check environment variables.');
      return;
    }

    setError('');
    setIsLoading(true);
    
    try {
      const { confirmPassword, ...apiData } = formData;
      
      const response = await axios.post(
        `${apiUrl}/api/auth/signup`,
        apiData
      );
      
      const { user, accessToken, refreshToken } = response.data;
      
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      
      await login(formData.email, formData.password);
      
      navigate('/dashboard');
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.response?.data?.message || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 card bg-base-200 shadow-lg">
      <div className="card-body">
        <h2 className="card-title text-2xl font-bold">Sign Up</h2>
        
        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Full Name</span>
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
              className="input input-bordered w-full"
              required
            />
          </div>
          
          <div className="form-control">
            <label className="label">
              <span className="label-text">Email</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
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
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              className="input input-bordered w-full"
              required
            />
            <ul className="text-sm mt-1">
              {[
                'at least 8 characters',
                'an uppercase letter',
                'a lowercase letter',
                'a number',
                'a special character',
              ].map((requirement, index) => (
                <li
                  key={index}
                  className={
                    passwordErrors.includes(requirement)
                      ? 'text-red-500'
                      : 'text-green-500'
                  }
                >
                  Password must contain {requirement}.
                </li>
              ))}
            </ul>
          </div>
          
          <div className="form-control">
            <label className="label">
              <span className="label-text">Confirm Password</span>
            </label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              className="input input-bordered w-full"
              required
            />
            <p
              className={
                passwordMatchError
                  ? 'text-red-500 text-sm mt-1'
                  : 'text-green-500 text-sm mt-1'
              }
            >
              {passwordMatchError || 'Passwords match.'}
            </p>
          </div>
          
          <div className="form-control">
            <label className="label">
              <span className="label-text">Roles</span>
            </label>
            <div className="space-y-2">
              {Object.entries(formData.roles).map(([role, checked]) => (
                <label key={role} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      roles: {
                        ...prev.roles,
                        [role]: e.target.checked
                      }
                    }))}
                    className="checkbox"
                  />
                  <span className="capitalize">{role}</span>
                </label>
              ))}
            </div>
          </div>
          
          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={!isFormValid || isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
        
        <p className="mt-4 text-sm text-center">
          Already have an account? <Link to="/login" className="text-primary hover:text-primary-focus">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default SignUp; 