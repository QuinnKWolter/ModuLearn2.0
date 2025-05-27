import React, { useState } from 'react';
import ErrorMessage from '../../ErrorMessage';
import { useAuth } from '../../../contexts/AuthContext';

const CreateCourseModal = ({ isOpen, onClose, onCourseCreated }) => {
  const [courseId, setCourseId] = useState('');
  const [rawJson, setRawJson] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { API } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!courseId && !rawJson) {
        throw new Error('Please provide either a Course ID or Raw JSON');
      }

      let courseData = null;
      if (rawJson) {
        try {
          courseData = JSON.parse(rawJson);
        } catch (e) {
          throw new Error('Invalid JSON format: ' + e.message);
        }
      }

      // Create request object
      const requestData = {};
      if (courseId) {
        requestData.courseId = courseId;
      }
      if (courseData) {
        requestData.courseData = courseData;
      }

      console.log('Sending request with:', requestData);
      
      // Add the authorization header
      const { data: response } = await API.post('/courses', requestData);

      if (response.data.success) {
        if (onCourseCreated) {
          onCourseCreated(response.data.course);
        }
        onClose();
      } else {
        throw new Error(response.data.error || 'Failed to create course');
      }
    } catch (err) {
      console.error('Error creating course:', err);
      setError(err.response?.data?.error || err.message || 'An error occurred while creating the course');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <dialog open className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg">Create New Course</h3>
        
        <ErrorMessage message={error} />

        <form onSubmit={handleSubmit} className="mt-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Course ID</span>
            </label>
            <input 
              type="text"
              className="input input-bordered"
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              placeholder="Enter existing course ID"
            />
          </div>

          <div className="divider">OR</div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Raw JSON</span>
            </label>
            <textarea 
              className="textarea textarea-bordered h-24"
              value={rawJson}
              onChange={(e) => setRawJson(e.target.value)}
              placeholder="Paste course JSON structure"
            />
          </div>

          <div className="modal-action">
            <button 
              type="button" 
              className="btn" 
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="loading loading-spinner"></span>
              ) : (
                'Create Course'
              )}
            </button>
          </div>
        </form>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
};

export default CreateCourseModal; 