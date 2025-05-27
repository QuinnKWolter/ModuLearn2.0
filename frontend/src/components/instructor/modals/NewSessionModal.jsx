import React, { useState } from 'react';
import axios from 'axios';

const NewSessionModal = ({ isOpen, onClose, courseId }) => {
  const [groupName, setGroupName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isNameValid, setIsNameValid] = useState(false);

  const validateGroupName = async (name) => {
    if (!name.trim()) {
      setIsNameValid(false);
      return;
    }

    setIsValidating(true);
    try {
      const response = await axios.get(`/api/courses/${courseId}/check-group-name`, {
        params: { groupName: name }
      });
      setIsNameValid(response.data.available);
    } catch (err) {
      console.error('Validation error:', err);
      setIsNameValid(true); // Allow submission if check fails
    } finally {
      setIsValidating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await axios.post(`/api/courses/${courseId}/sessions`, {
        groupName: groupName.trim()
      });

      if (response.data.success) {
        onClose();
        window.location.reload();
      } else {
        throw new Error(response.data.error);
      }
    } catch (err) {
      setError(err.message || 'Failed to create session');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <dialog open className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg">Create New Course Session</h3>
        
        {error && (
          <div className="alert alert-error mt-4">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Session Name</span>
            </label>
            <input 
              type="text"
              className={`input input-bordered ${
                isValidating ? 'input-disabled' :
                isNameValid ? 'input-success' :
                groupName ? 'input-error' : ''
              }`}
              value={groupName}
              onChange={(e) => {
                setGroupName(e.target.value);
                validateGroupName(e.target.value);
              }}
              placeholder="e.g., Fall 2024, Section A"
              required
            />
            <label className="label">
              <span className="label-text-alt">
                A unique identifier for this course session
              </span>
            </label>
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
              disabled={isLoading || isValidating || !isNameValid}
            >
              {isLoading ? (
                <span className="loading loading-spinner"></span>
              ) : (
                'Create Session'
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

export default NewSessionModal; 