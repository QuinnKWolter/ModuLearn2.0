import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CourseCard from './CourseCard';
import CreateCourseModal from './modals/CreateCourseModal';
import DeleteCourseModal from './modals/DeleteCourseModal';
import ErrorMessage from '../ErrorMessage';
import { useAuth } from '../../contexts/AuthContext';

const CourseList = ({ initialCourses = [] }) => {
  const [courses, setCourses] = useState(initialCourses);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const { accessToken } = useAuth();

  useEffect(() => {
    if (accessToken) {
      fetchCourses();
    }
  }, [accessToken]);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/courses`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      setCourses(response.data);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('Failed to load courses. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCourseCreated = () => {
    fetchCourses();
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (courses.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-base-content/70">You haven't created any courses yet.</p>
        <button 
          className="btn btn-primary mt-4"
          onClick={() => setCreateModalOpen(true)}
        >
          Create Your First Course
        </button>
        <CreateCourseModal 
          isOpen={isCreateModalOpen} 
          onClose={() => setCreateModalOpen(false)}
          onCourseCreated={handleCourseCreated}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          className="btn btn-primary"
          onClick={() => setCreateModalOpen(true)}
        >
          Create New Course
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map(course => (
          <CourseCard 
            key={course.id}
            course={course}
            onDelete={() => {
              setSelectedCourse(course);
              setDeleteModalOpen(true);
            }}
          />
        ))}
      </div>
      
      <DeleteCourseModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        course={selectedCourse}
        onDeleteComplete={fetchCourses}
      />
      
      <CreateCourseModal 
        isOpen={isCreateModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCourseCreated={handleCourseCreated}
      />
    </div>
  );
};

export default CourseList; 