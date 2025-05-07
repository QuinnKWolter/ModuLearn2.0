import React from 'react';
import { Helmet } from 'react-helmet-async';
import { FaWrench, FaReact, FaNodeJs, FaDatabase, FaChalkboardTeacher, FaPuzzlePiece, FaChartLine, FaUserGraduate } from 'react-icons/fa';

function About() {
  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <Helmet>
        <title>ModuLearn - About</title>
      </Helmet>
      <h1 className="text-4xl font-bold mb-4">About ModuLearn</h1>
      <div className="alert alert-warning mb-6 flex items-center">
        <FaWrench className="text-xl mr-2" />
        <span>Prototype Status: This application is currently in prototype phase. Please report any bugs or provide feedback to <a href="mailto:QuinnKWolter@pitt.edu" className="text-primary">QuinnKWolter@pitt.edu</a>.</span>
      </div>
      <div className="bg-base-200 p-6 rounded-lg mb-6">
        <h2 className="text-2xl font-bold mb-2">What is ModuLearn?</h2>
        <p>
          ModuLearn is a lightweight, flexible platform designed to revolutionize how educational content is delivered and managed. Whether integrated with your Learning Management System (LMS) or used standalone, ModuLearn makes smart eLearning content delivery seamless and efficient.
        </p>
      </div>
      <h2 className="text-2xl font-bold mb-4">Key Features</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-base-200 p-4 rounded-lg flex items-center">
          <FaChalkboardTeacher className="text-4xl text-primary mr-4" />
          <div>
            <h3 className="font-bold">LMS Integration</h3>
            <p>Currently supports Canvas LMS via LTI 1.1, with planned expansion to LTI 1.3 for institutional Canvas accounts, Moodle, and TopHat.</p>
          </div>
        </div>
        <div className="bg-base-200 p-4 rounded-lg flex items-center">
          <FaPuzzlePiece className="text-4xl text-primary mr-4" />
          <div>
            <h3 className="font-bold">Module Support</h3>
            <p>Full support for eLearning modules, with upcoming compatibility for various protocols.</p>
          </div>
        </div>
        <div className="bg-base-200 p-4 rounded-lg flex items-center">
          <FaChartLine className="text-4xl text-primary mr-4" />
          <div>
            <h3 className="font-bold">Progress Tracking</h3>
            <p>Comprehensive progress tracking with automatic grade submission to your LMS and the ability to resume incomplete work.</p>
          </div>
        </div>
        <div className="bg-base-200 p-4 rounded-lg flex items-center">
          <FaUserGraduate className="text-4xl text-primary mr-4" />
          <div>
            <h3 className="font-bold">Standalone Capability</h3>
            <p>Use ModuLearn independently of any LMS, perfect for individual courses or specialized training programs.</p>
          </div>
        </div>
      </div>
      <h2 className="text-2xl font-bold mt-8 mb-4">Technology Stack</h2>
      <div className="flex justify-around items-center bg-base-200 p-4 rounded-lg">
        <div className="text-center">
          <FaReact className="text-4xl text-blue-500 mb-2" />
          <p>React</p>
        </div>
        <div className="text-center">
          <FaNodeJs className="text-4xl text-green-500 mb-2" />
          <p>Express</p>
        </div>
        <div className="text-center">
          <FaDatabase className="text-4xl text-yellow-500 mb-2" />
          <p>Postgres</p>
        </div>
      </div>
    </div>
  );
}

export default About; 