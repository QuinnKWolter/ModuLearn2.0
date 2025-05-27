import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import ErrorMessage from '../ErrorMessage';

const StudentPerformanceSection = ({ sessionId }) => {
  const { API }       = useAuth();
  const [rows, setRows]   = useState([]);
  const [loading, setLoad]= useState(true);
  const [error, setErr]   = useState('');

  useEffect(() => {
    (async () => {
      try {
        setLoad(true);
        const { data } = await API.get(`/sessions/${sessionId}/performance`);
        setRows(data);
      } catch (e) {
        console.error(e);
        setErr('Failed to load student performance.');
      } finally {
        setLoad(false);
      }
    })();
  }, [sessionId, API]);

  if (loading) return <CenterSpinner />;
  if (error)   return <ErrorMessage message={error} />;
  if (rows.length === 0)
    return <p className="text-center py-4 text-base-content/70">No student enrollments yet.</p>;

  return (
    <div className="overflow-x-auto">
      <table className="table w-full">
        <thead>
          <tr>
            <th>Student</th><th>Email</th><th>Progress</th><th>Score</th><th>Last Activity</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id}>
              <td>{r.student.fullName}</td>
              <td>{r.student.email}</td>
              <td><ProgressBar percent={r.progress?.percent ?? 0} /></td>
              <td>{r.progress?.score != null ? `${r.progress.score}%` : '—'}</td>
              <td>{r.lastActivity ? new Date(r.lastActivity).toLocaleDateString() : 'Never'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const ProgressBar = ({ percent }) => (
  <div className="flex items-center gap-2">
    <progress className="progress progress-primary w-full" value={percent} max="100" />
    <span className="text-xs">{Math.round(percent)}%</span>
  </div>
);

const CenterSpinner = () => (
  <div className="flex justify-center py-4">
    <span className="loading loading-spinner" />
  </div>
);

export default StudentPerformanceSection;