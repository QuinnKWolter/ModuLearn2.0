import React from 'react';
import { Helmet } from 'react-helmet-async';

function License() {
  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <Helmet>
        <title>ModuLearn - License</title>
      </Helmet>
      <h1 className="text-3xl font-bold">License</h1>
      <p className="mt-4">
        This application is licensed under the GNU General Public License v3.0. You are free to use, modify, and distribute this software under the terms of this license.
      </p>
      <p className="mt-4">
        For more details, see the <a href="https://www.gnu.org/licenses/gpl-3.0.html" className="text-primary">GNU General Public License</a>.
      </p>
    </div>
  );
}

export default License; 