import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../contexts/AuthContext';
import ErrorMessage from '../../ErrorMessage';

const CreateSessionModal = ({ isOpen, onClose, courseId, onSessionCreated, existingSessions = [] }) => {
  const [sessionName, setSessionName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [nameExists, setNameExists] = useState(false);
  const { accessToken } = useAuth();

  // Reset form on open
  useEffect(() => {
    if (isOpen) {
      setSessionName('');
      setError('');
    }
  }, [isOpen]);

  // Check for duplicate session names
  useEffect(() => {
    const nameAlreadyExists = existingSessions.some(
      session => session.groupName.toLowerCase() === sessionName.toLowerCase()
    );
    setNameExists(nameAlreadyExists);
  }, [sessionName, existingSessions]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (nameExists) {
      setError('A session with this name already exists for this course.');
      return;
    }
    
    if (!sessionName.trim()) {
      setError('Session name is required.');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/courses/${courseId}/sessions`,
        { groupName: sessionName },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      
      if (response.data.success) {
        if (onSessionCreated) {
          onSessionCreated(response.data.session);
        }
        onClose();
      } else {
        throw new Error(response.data.error || 'Failed to create session');
      }
    } catch (err) {
      console.error('Error creating session:', err);
      setError(err.response?.data?.error || err.message || 'An error occurred while creating the session');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <dialog open className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg">Create New Course Session</h3>
        
        <ErrorMessage message={error} />

        <form onSubmit={handleSubmit} className="mt-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Session Name</span>
            </label>
            <input 
              type="text"
              className={`input input-bordered ${nameExists ? 'input-error' : ''}`}
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              placeholder="Enter a unique session name"
            />
            {nameExists && (
              <label className="label">
                <span className="label-text-alt text-error">
                  This session name already exists
                </span>
              </label>
            )}
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
              disabled={isLoading || nameExists || !sessionName.trim()}
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

export default CreateSessionModal; 