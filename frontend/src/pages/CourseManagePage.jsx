import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ErrorMessage from '../components/ErrorMessage';
import CreateSessionModal from '../components/instructor/modals/CreateSessionModal';
import CourseDetailsModal from '../components/instructor/modals/CourseDetailsModal';
import ManageEnrollmentModal from '../components/instructor/modals/ManageEnrollmentModal';
import SessionList from '../components/instructor/SessionList';

const CourseManagePage = () => {
  const { courseId }        = useParams();
  const navigate            = useNavigate();
  const { API }             = useAuth();

  const [course, setCourse] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  const [showCreate, setShowCreate]       = useState(false);
  const [showDetails, setShowDetails]     = useState(false);
  const [showEnroll, setShowEnroll]       = useState(false);
  const [selectedSession, setSelected]    = useState(null);

  /* ---------------------------------- fetch ---------------------------------- */
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { data: c } = await API.get(`/courses/${courseId}`);
        setCourse(c);

        const { data: s } = await API.get(`/courses/${courseId}/sessions`);
        setSessions(s);
      } catch (e) {
        console.error(e);
        setError('Failed to load course info.');
      } finally {
        setLoading(false);
      }
    })();
  }, [courseId, API]);

  /* -------------------------------- handlers --------------------------------- */
  const addSession = s => setSessions(prev => [...prev, s]);
  const copyLti    = id =>
    navigator.clipboard
      .writeText(`https://proxy.personalized-learning.org/modulearn/lti/launch/?course_id=${id}`)
      .then(() => console.log('LTI copied'));

  /* ---------------------------------- render --------------------------------- */
  if (loading) return <Spinner />;
  if (error)   return <Error message={error} onBack={() => navigate('/dashboard')} />;

  return (
    <div className="p-6">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{course.title}</h1>
          <p className="text-base-content/70">{course.description}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          Create New Session
        </button>
      </header>

      {sessions.length === 0 ? (
        <EmptyState onCreate={() => setShowCreate(true)} />
      ) : (
        <SessionList
          sessions={sessions}
          course={course}
          onOpenDetails={() => setShowDetails(true)}
          onCopyLtiUrl={copyLti}
          onManageEnrollment={s => {
            setSelected(s);
            setShowEnroll(true);
          }}
        />
      )}

      {/* Modals */}
      <CreateSessionModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        courseId={courseId}
        onSessionCreated={addSession}
        existingSessions={sessions}
      />

      <CourseDetailsModal
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        course={course}
      />

      <ManageEnrollmentModal
        isOpen={showEnroll}
        onClose={() => setShowEnroll(false)}
        session={selectedSession}
      />
    </div>
  );
};

/* ----- tiny helpers ----- */
const Spinner = () => (
  <div className="p-8 flex justify-center">
    <span className="loading loading-spinner loading-lg" />
  </div>
);

const Error = ({ message, onBack }) => (
  <div className="p-8">
    <ErrorMessage message={message} />
    <button className="btn btn-primary mt-4" onClick={onBack}>
      Return to Dashboard
    </button>
  </div>
);

const EmptyState = ({ onCreate }) => (
  <div className="text-center py-12 bg-base-200 rounded-box">
    <h3 className="text-lg font-semibold">No Sessions Yet</h3>
    <p className="mt-2 text-base-content/70">Create your first session to start enrolling students.</p>
    <button className="btn btn-primary mt-4" onClick={onCreate}>
      Create Session
    </button>
  </div>
);

export default CourseManagePage;
