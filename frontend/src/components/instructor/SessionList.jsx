import { useState } from 'react';
import StudentPerformanceSection from './StudentPerformanceSection';

const SessionList = ({ sessions, course, onOpenDetails, onCopyLtiUrl, onManageEnrollment }) => {
  const [openInfo, setOpenInfo]       = useState({});
  const [openPerf, setOpenPerf]       = useState({});

  const toggle = (setFn, id) => setFn(p => ({ ...p, [id]: !p[id] }));

  return (
    <div className="space-y-4">
      {sessions.map(s => (
        <div key={s.id} className="card bg-base-100 shadow-xl">
          <header
            className="card-title p-4 cursor-pointer flex justify-between items-center"
            onClick={() => toggle(setOpenInfo, s.id)}
          >
            <span>{`${course.title} – ${s.groupName}`}</span>
            <span className="text-sm text-base-content/70">
              {s.Enrollments?.length ?? s.enrollmentCount ?? 0} students
            </span>
            <button
              className="btn btn-sm btn-circle"
              onClick={e => {
                e.stopPropagation();
                toggle(setOpenInfo, s.id);
              }}
            >
              {openInfo[s.id] ? '−' : '+'}
            </button>
          </header>

          {openInfo[s.id] && (
            <div className="card-body">
              <div className="flex flex-wrap gap-2">
                <Btn label="Course Details" onClick={onOpenDetails} />
                <Btn label="Copy LTI URL"  onClick={() => onCopyLtiUrl(s.id)} />
                <Btn label="Manage Enrollment" onClick={() => onManageEnrollment(s)} />
                <Btn
                  label={`Student Performance ${openPerf[s.id] ? '▲' : '▼'}`}
                  onClick={e => { e.stopPropagation(); toggle(setOpenPerf, s.id); }}
                />
              </div>

              {openPerf[s.id] && <StudentPerformanceSection sessionId={s.id} />}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const Btn = ({ label, onClick }) => (
  <button className="btn btn-sm btn-outline" onClick={onClick}>
    {label}
  </button>
);

export default SessionList;