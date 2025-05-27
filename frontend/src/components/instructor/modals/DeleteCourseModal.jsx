import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DeleteCourseModal = ({ isOpen, onClose, course }) => {
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && course) {
      fetchSessions();
    }
  }, [isOpen, course]);

  const fetchSessions = async () => {
    try {
      const response = await axios.get(`/api/courses/${course.id}/sessions`);
      setSessions(response.data);
    } catch (err) {
      setError('Failed to load course sessions');
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    setError('');

    try {
      await axios.delete(`/api/courses/${course.id}`);
      onClose();
      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete course');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !course) return null;

  return (
    <dialog open className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg">Confirm Course Deletion</h3>
        
        <div className="alert alert-warning mt-4">
          <span>You are about to delete:</span>
          <strong>{course.title}</strong>
        </div>

        {sessions.length > 0 && (
          <div className="mt-4">
            <p>This will also delete the following sessions:</p>
            <ul className="list-disc list-inside mt-2">
              {sessions.map(session => (
                <li key={session.id}>
                  {session.groupName} ({session.enrollmentCount} students)
                </li>
              ))}
            </ul>
          </div>
        )}

        {error && (
          <div className="alert alert-error mt-4">
            <span>{error}</span>
          </div>
        )}

        <div className="modal-action">
          <button 
            type="button" 
            className="btn" 
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            type="button" 
            className="btn btn-error"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="loading loading-spinner"></span>
            ) : (
              'Delete Course'
            )}
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
};

export default DeleteCourseModal; 