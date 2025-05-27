import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiExternalLink, FiUsers, FiCopy } from 'react-icons/fi';

import NewSessionModal      from './modals/NewSessionModal';
import ManageEnrollmentModal from './modals/ManageEnrollmentModal';

/**
 * CourseSessionList
 * -- lists every teaching session the instructor owns, lets them…
 *   • open the session dashboard
 *   • copy the LTI launch url
 *   • open the roster / enrol-management modal
 */
const CourseSessionList = ({ sessions = [] }) => {
  const navigate = useNavigate();

  const [showNewSession,      setShowNewSession]      = useState(false);
  const [showEnrollManager,   setShowEnrollManager]   = useState(false);
  const [currentSession,      setCurrentSession]      = useState(null);

  /** copy launch-URL to clipboard */
  const copyLaunchUrl = async (sessionId) => {
    const url = `${window.location.origin}/api/lti/launch/${sessionId}`;
    try {
      await navigator.clipboard.writeText(url);
      /* toast / notification hook could go here */
    } catch (_) { /* ignore – clipboard unsupported */ }
  };

  /* ─────────────────────────────  empty state  ───────────────────────────── */
  if (!sessions.length) {
    return (
      <div className="alert alert-info shadow">
        <FiUsers className="text-xl" />
        <span>No active course-sessions found.</span>
      </div>
    );
  }

  /* ────────────────────────────  list of sessions  ───────────────────────── */
  return (
    <div className="space-y-4">
      {sessions.map((s) => {
        /* api may return `course` or `Course`, `enrollments` or `Enrollments` */
        const course  = s.course       || s.Course       || {};
        const roster  = s.enrollments  || s.Enrollments  || [];
        const title   = course.title   || 'Untitled course';

        return (
          <div key={s.id} className="collapse collapse-arrow bg-base-200">
            <input type="checkbox" />
            <div className="collapse-title text-lg font-semibold flex items-center gap-2">
              <span>{title}</span>
              <span className="text-base-content/60">— {s.groupName}</span>
            </div>

            <div className="collapse-content space-y-4">
              {/* action buttons */}
              <div className="flex flex-wrap gap-2 justify-between">
                <div className="flex gap-2">
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() =>
                      navigate(`/courses/${course.id}/sessions/${s.id}`)
                    }
                  >
                    <FiExternalLink /> Details
                  </button>

                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => copyLaunchUrl(s.id)}
                  >
                    <FiCopy /> Copy LTI URL
                  </button>
                </div>

                <button
                  className="btn btn-accent btn-sm"
                  onClick={() => {
                    setCurrentSession(s);
                    setShowEnrollManager(true);
                  }}
                >
                  <FiUsers /> Manage enrolment
                </button>
              </div>

              {/* roster / progress table */}
              <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th className="w-56">Progress</th>
                      <th>Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roster.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="text-center">
                          No students enrolled yet.
                        </td>
                      </tr>
                    ) : (
                      roster.map((e) => {
                        const prog =
                          e.progress ||
                          e.Progresses?.[0] ||
                          e.Progress   ||
                          {};

                        const pct   = prog.percent ?? prog.completionPercentage ?? 0;
                        const score = prog.score   ?? prog.overallScore        ?? 0;

                        return (
                          <tr key={e.id}>
                            <td>{e.student?.email || e.User?.email}</td>
                            <td>
                              <progress
                                className="progress progress-primary w-full"
                                value={pct}
                                max={100}
                              />
                            </td>
                            <td>{Number(score).toFixed(1)}%</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })}

      {/* ───────────────  modals  ─────────────── */}
      <NewSessionModal
        isOpen={showNewSession}
        onClose={() => setShowNewSession(false)}
      />

      <ManageEnrollmentModal
        isOpen={showEnrollManager}
        onClose={() => setShowEnrollManager(false)}
        session={currentSession}
      />
    </div>
  );
};

export default CourseSessionList;