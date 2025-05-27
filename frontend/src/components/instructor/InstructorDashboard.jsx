import { useEffect, useState } from 'react';
import { FiRefreshCw } from 'react-icons/fi';
import CourseList          from './CourseList';
import CourseSessionList   from './CourseSessionList';
import ImportCourseButton  from './ImportCourseButton';
import CreateCourseModal   from './modals/CreateCourseModal';
import { useAuth }         from '../../contexts/AuthContext';

const InstructorDashboard = ({ courses: preloadCourses = [], sessions: preloadSessions = [] }) => {
  const { API }            = useAuth();
  const [courses, setC]    = useState(preloadCourses);
  const [sessions, setS]   = useState(preloadSessions);
  const [open, setOpen]    = useState(false);
  const [busy , setBusy]   = useState(false);

  const refresh = async () => {
    try {
      setBusy(true);
      const [{ data: c }, { data: s }] = await Promise.all([
        API.get('/courses'),
        API.get('/enrollments/instructor')
      ]);
      setC(c); setS(s);
    } finally { setBusy(false); }
  };

  useEffect(() => { if (!preloadCourses.length) refresh(); }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Instructor Dashboard</h2>

        <div className="flex gap-2">
          <button className="btn btn-sm btn-ghost" onClick={refresh} disabled={busy}>
            {busy ? <span className="loading loading-spinner loading-xs" /> : <FiRefreshCw />}
          </button>
          <ImportCourseButton />
        </div>
      </div>

      {/* courses */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <div className="flex justify-between items-center">
            <h3 className="card-title">Your Courses</h3>
          </div>
          <CourseList courses={courses} />
        </div>
      </div>

      {/* sessions */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <h3 className="card-title">Active Sessions</h3>
          <CourseSessionList sessions={sessions} />
        </div>
      </div>

      <CreateCourseModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onCourseCreated={refresh}
      />
    </div>
  );
};

export default InstructorDashboard;