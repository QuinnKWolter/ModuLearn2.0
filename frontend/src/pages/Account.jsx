import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ErrorMessage from '../components/ErrorMessage';

const Account = () => {
  const { user, setUser, isLoading, API } = useAuth();   // 👈 get pre-configured Axios
  const [roles, setRoles]               = useState({});
  const [enrollments, setEnrollments]   = useState(null);
  const [error, setError]               = useState('');
  const [success, setSuccess]           = useState('');

  /* -------------------------------------------------------------- */
  /* initialise roles when user arrives                              */
  /* -------------------------------------------------------------- */
  useEffect(() => { if (user?.roles) setRoles(user.roles); }, [user]);

  /* -------------------------------------------------------------- */
  /* fetch enrolments once                                          */
  /* -------------------------------------------------------------- */
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const { data } = await API.get('/enrollments');
        setEnrollments(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load enrollment data.');
      }
    })();
  }, [user, API]);

  /* -------------------------------------------------------------- */
  /* role checkbox logic                                            */
  /* -------------------------------------------------------------- */
  const handleRoleChange = role => {
    const next = { ...roles, [role]: !roles[role] };
    if (Object.values(next).some(Boolean)) setRoles(next);
    else setError('At least one role must remain selected.');
  };

  /* -------------------------------------------------------------- */
  /* save roles                                                     */
  /* -------------------------------------------------------------- */
  const handleSave = async () => {
    try {
      const { data } = await API.put('/users/roles', { roles });
      setUser(u => ({ ...u, roles: data.roles }));
      setSuccess('Roles updated.');
      setError('');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to update roles.');
    }
  };

  /* -------------------------------------------------------------- */
  /*  UI                                                            */
  /* -------------------------------------------------------------- */
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (!user) return <p className="text-center mt-6">Please log in.</p>;

  return (
    <div className="max-w-2xl mx-auto mt-10 card bg-base-200 shadow-lg">
      <div className="card-body">
        <h2 className="card-title text-3xl font-bold text-center">Account</h2>

        {/* basic info */}
        <InfoRow label="Name"  value={user.fullName} />
        <InfoRow label="Email" value={user.email} />
        <InfoRow label="Last login" value={user.lastLogin
          ? new Date(user.lastLogin).toLocaleString()
          : 'N/A'} />

        {/* roles */}
        <div className="mt-6">
          <span className="font-semibold">Roles</span>
          <div className="ml-4 space-y-2">
            {Object.keys(roles).map(r => {
              const disabled =
                !!enrollments?.[`as${r[0].toUpperCase()}${r.slice(1)}`]?.length;
              return (
                <label key={r} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={roles[r]}
                    onChange={() => handleRoleChange(r)}
                    disabled={disabled}
                    className="checkbox checkbox-primary"
                  />
                  <span className="capitalize">{r}</span>
                  {disabled && <span className="text-xs">(active)</span>}
                </label>
              );
            })}
          </div>
        </div>

        <ErrorMessage message={error} />
        {success && (
          <div className="alert alert-success mt-4">{success}</div>
        )}

        <button className="btn btn-primary mt-6" onClick={handleSave}>
          Save Changes
        </button>
      </div>
    </div>
  );
};

const InfoRow = ({ label, value }) => (
  <div className="flex justify-between">
    <span className="font-semibold">{label}:</span>
    <span>{value}</span>
  </div>
);

export default Account;