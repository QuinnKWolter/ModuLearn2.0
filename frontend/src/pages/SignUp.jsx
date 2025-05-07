import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [roles, setRoles] = useState({
    student: false,
    instructor: false,
    researcher: false,
  });
  const [passwordErrors, setPasswordErrors] = useState([
    'at least 8 characters',
    'an uppercase letter',
    'a lowercase letter',
    'a number',
    'a special character',
  ]);
  const [passwordMatchError, setPasswordMatchError] = useState('Passwords do not match.');
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    validatePassword();
    validatePasswordMatch();
    checkFormValidity();
  }, [password, confirmPassword, email, fullName, roles]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isFormValid) {
      // Handle sign up logic here
    }
  };

  const handleRoleChange = (role) => {
    setRoles((prevRoles) => ({
      ...prevRoles,
      [role]: !prevRoles[role],
    }));
  };

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
      if (!requirement.regex.test(password)) {
        errors.push(requirement.message);
      }
    });

    setPasswordErrors(errors);
    return errors.length === 0;
  };

  const validatePasswordMatch = () => {
    if (password !== confirmPassword) {
      setPasswordMatchError('Passwords do not match.');
      return false;
    }
    setPasswordMatchError('');
    return true;
  };

  const checkFormValidity = () => {
    const isRoleSelected = Object.values(roles).some(role => role);
    const isPasswordValid = validatePassword();
    const isPasswordMatchValid = validatePasswordMatch();
    const isEmailValid = email.includes('@') && email.includes('.');
    const isFullNameValid = fullName.trim().length > 0;

    setIsFormValid(isRoleSelected && isPasswordValid && isPasswordMatchValid && isEmailValid && isFullNameValid);
  };

  return (
    <div className="max-w-md mx-auto mt-10 card bg-base-200 shadow-lg">
      <div className="card-body">
        <h2 className="card-title text-2xl font-bold">Sign Up</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Full Name</span>
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
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
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={roles.student}
                  onChange={() => handleRoleChange('student')}
                  className="checkbox checkbox-primary"
                />
                <span className="ml-2">Student</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={roles.instructor}
                  onChange={() => handleRoleChange('instructor')}
                  className="checkbox checkbox-primary"
                />
                <span className="ml-2">Instructor</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={roles.researcher}
                  onChange={() => handleRoleChange('researcher')}
                  className="checkbox checkbox-primary"
                />
                <span className="ml-2">Researcher</span>
              </label>
            </div>
          </div>
          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={!isFormValid}
          >
            Sign Up
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