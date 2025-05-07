import React from 'react';
import { Helmet } from 'react-helmet-async';
import { FaEnvelope, FaWrench } from 'react-icons/fa';

function Contact() {
  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <Helmet>
        <title>ModuLearn - Contact</title>
      </Helmet>
      <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
      <div className="alert alert-warning mb-6 flex items-center">
        <FaWrench className="text-xl mr-2" />
        <span>Prototype Status: This application is currently in prototype phase. Please report any bugs or provide feedback to <a href="mailto:QuinnKWolter@pitt.edu" className="text-primary">QuinnKWolter@pitt.edu</a>.</span>
      </div>
      <div className="bg-base-200 p-6 rounded-lg text-center">
        <FaEnvelope className="text-6xl text-primary mb-4 mx-auto" />
        <h2 className="text-2xl font-bold mb-2">Get In Touch</h2>
        <p className="mb-4">Have questions, feedback, or encountered a bug? We'd love to hear from you!</p>
        <a href="mailto:QuinnKWolter@pitt.edu" className="btn btn-primary">Contact the Developer</a>
        <p className="mt-4">Email: QuinnKWolter@pitt.edu</p>
      </div>
    </div>
  );
}

export default Contact; 