import React, { useState } from 'react';
import axios from '../../config/axios';  // Import configured axios instance

const ImportCourseButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleImport = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Retrieve the auth token from localStorage
      const token = localStorage.getItem('accessToken');
      console.log('Using auth token:', token ? 'yes' : 'no');
      console.log('Token retrieved from localStorage:', token);

      if (!token) {
        throw new Error('No authentication token found. Please log in.');
      }

      // Get token from backend
      const tokenResponse = await axios.post('/api/authoring/course-authoring-token', null, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (tokenResponse.data.error) {
        throw new Error(tokenResponse.data.error);
      }
      
      const tokenFromBackend = tokenResponse.data.token;
      console.log('Token received, attempting to authenticate...');
      
      // Use the proxy to authenticate with the course authoring tool
      const loginResponse = await axios.post('/api/proxy/course-authoring-login', { token: tokenFromBackend }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Login response:', loginResponse);
      
      if (loginResponse.data.error) {
        throw new Error(loginResponse.data.error);
      }
      
      // Redirect to course authoring tool
      console.log('Authentication successful, redirecting...');
      window.location.href = "https://proxy.personalized-learning.org/next.course-authoring/#/modulearn";
    } catch (error) {
      console.error('Import error:', error);
      setError(error.message || 'Failed to connect to course authoring tool');
      // You could add a toast notification here
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button 
        className="btn btn-primary"
        onClick={handleImport}
        disabled={isLoading}
      >
        {isLoading ? (
          <span className="loading loading-spinner"></span>
        ) : (
          'Import From Course Authoring Tool'
        )}
      </button>
      
      {error && (
        <div className="alert alert-error mt-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default ImportCourseButton; 