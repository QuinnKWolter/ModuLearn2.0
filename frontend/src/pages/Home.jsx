import React from 'react';
import { Link } from 'react-router-dom';
import { FaLock, FaCubes, FaChartLine } from 'react-icons/fa';

function Home() {
  return (
    <div className="flex flex-col items-center justify-center bg-base-100 text-base-content py-10">
      <div className="text-center mb-10">
        <h1 className="text-5xl font-bold mb-4">Welcome to ModuLearn</h1>
        <p className="text-lg mb-8">
          A platform for secure, modular delivery of smart e-Learning content.
        </p>
        <div className="flex justify-center space-x-4">
          <Link to="/login" className="btn btn-primary btn-lg">
            <FaLock className="mr-2" /> Sign In
          </Link>
          <Link to="/signup" className="btn btn-outline btn-lg">
            <FaCubes className="mr-2" /> Sign Up
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4 md:px-0">
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body items-center text-center">
            <FaLock className="text-4xl text-primary mb-4" />
            <h2 className="card-title">Secure Integration</h2>
            <p>
              Seamlessly connects with your Learning Management System through LTI protocols.
            </p>
          </div>
        </div>
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body items-center text-center">
            <FaCubes className="text-4xl text-primary mb-4" />
            <h2 className="card-title">Modular Content</h2>
            <p>
              Flexible delivery of interactive learning modules, quizzes, and coding challenges.
            </p>
          </div>
        </div>
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body items-center text-center">
            <FaChartLine className="text-4xl text-primary mb-4" />
            <h2 className="card-title">Progress Tracking</h2>
            <p>
              Track progress, resume work, and automatically sync grades with your LMS.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home; 