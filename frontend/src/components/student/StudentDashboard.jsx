import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';

const StudentDashboard = ({ enrollments = [] }) => {
  return (
    <div className="p-6 space-y-8">
      <h2 className="text-xl font-bold">My Course Sessions</h2>

      {enrollments.length === 0 && (
        <p className="italic">You aren’t enrolled in any sessions yet.</p>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {enrollments.map(({ id, session, course, progress }) => (
          <div key={id} className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h3 className="card-title">{course.title}</h3>
              <p className="text-sm opacity-70">{session.groupName}</p>

              <progress
                className="progress progress-primary w-full mt-4"
                value={progress?.percent || 0}
                max="100"
              />
              <p className="text-right text-xs mt-1">
                {Math.round(progress?.percent || 0)} % complete
              </p>

              <div className="card-actions justify-end">
                <Link to={`/sessions/${session.id}`} className="btn btn-primary btn-sm">
                  Open <FiArrowRight />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentDashboard;