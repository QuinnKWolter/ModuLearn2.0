import React from 'react';
import { useNavigate, Link } from 'react-router-dom';

const CourseCard = ({ course, onDelete }) => {
  const navigate = useNavigate();
  const activeSessions = course.Sessions ? 
    course.Sessions.filter(session => session.isActive).length : 0;

  return (
    <div className="card bg-base-200 shadow-lg hover:shadow-xl transition-shadow">
      <div className="card-body">
        <h3 className="card-title text-lg">{course.title}</h3>
        <p className="text-base-content/70">{course.description}</p>
        
        <div className="mt-2 flex flex-wrap gap-2">
          <span className="badge badge-outline">
            {activeSessions} active session{activeSessions !== 1 ? 's' : ''}
          </span>
          <span className="badge badge-outline">
            Created: {new Date(course.createdAt).toLocaleDateString()}
          </span>
        </div>
        
        <div className="card-actions justify-end mt-4">
          <button 
            className="btn btn-error btn-sm"
            onClick={() => onDelete(course)}
          >
            Delete
          </button>
          <Link 
            to={`/courses/${course.id}/manage`}
            className="btn btn-primary btn-sm"
          >
            Manage
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CourseCard; 