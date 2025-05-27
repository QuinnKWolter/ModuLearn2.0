import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import InstructorDashboard from '../components/instructor/InstructorDashboard';
import StudentDashboard    from '../components/student/StudentDashboard';
import ResearcherDashboard from '../components/researcher/ResearcherDashboard';

const Dashboard = () => {
  const { user, API } = useAuth();
  const [data, setData]   = useState({ courses: [], sessions: [], enrollments: null });
  const [loading, setLoad]= useState(true);
  const [err, setErr]     = useState('');

  useEffect(() => {
    (async () => {
      try {
        setLoad(true);

        /* common – enrollments for every user */
        const { data: enr } = await API.get('/enrollments');

        /* instructor extras */
        let courses = [], sessions = [];
        if (user.roles.instructor) {
          ({ data: courses }  = await API.get('/courses'));
          ({ data: sessions } = await API.get('/enrollments/instructor'));
        }

        setData({ courses, sessions, enrollments: enr });
      } catch (e) {
        console.error(e);
        setErr('Failed to load dashboard');
      } finally { setLoad(false); }
    })();
  }, [user.roles, API]);

  if (loading) return <Loader />;

  if (err) return <Banner text={err} />;

  /* route to role-specific dashboards */
  if (user.roles.instructor) {
    return <InstructorDashboard courses={data.courses} sessions={data.sessions} />;
  }
  if (user.roles.student) {
    return <StudentDashboard enrollments={data.enrollments.asStudent} />;
  }
  if (user.roles.researcher) {
    return <ResearcherDashboard />;
  }

  /* fallback */
  return <Banner text="No dashboard available for your role." />;
};

const Loader = () => (
  <div className="min-h-screen flex justify-center items-center">
    <span className="loading loading-spinner loading-lg" />
  </div>
);
const Banner = ({ text }) => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="alert alert-error max-w-md">{text}</div>
  </div>
);

export default Dashboard;
