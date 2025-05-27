import { useEffect, useState, Fragment } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiChevronDown } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';

const StudentSessionPage = () => {
  const { sessionId }   = useParams();
  const [data, setData] = useState(null);
  const [err,  setErr]  = useState('');
  const [loading, setLoading] = useState(true);
  const { API } = useAuth();

  /* ─────────────────────────────────────────── DATA LOAD */
  useEffect(() => {
    (async () => {
      try {
        setLoading(true); setErr('');
        const { data: sessionData } = await API.get(`/sessions/${sessionId}`);
        setData(sessionData);
      } catch (e) {
        console.error(e);
        setErr(e.response?.data?.error || 'Unable to load session');
      } finally { setLoading(false); }
    })();
  }, [sessionId, API]);

  /* ─────────────────────────────────────────── UI STATES */
  if (loading) return <PageLoader />;
  if (err)     return <ErrorBanner err={err} />;
  if (!data)   return null;

  const { Course: course, groupName } = data;

  /* ─────────────────────────────────────────── RENDER */
  return (
    <div className="container mx-auto px-4 py-8 lg:py-12 space-y-10 animate-fade-in">
      {/* ── HEADER */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <Link to="/dashboard" className="btn btn-circle btn-lg btn-ghost shrink-0 shadow md:hover:-translate-x-1 transition">
          <FiArrowLeft size={20} />
        </Link>

        <div className="space-y-1">
          <h1 className="text-3xl lg:text-4xl font-extrabold leading-tight tracking-tight">
            {course.title}
            <br></br>
            <span className="ml-3 badge badge-outline badge-lg align-top float-right">{groupName}</span>
          </h1>
          {course.description && (
            <p className="max-w-3xl text-base-content/70">{course.description}</p>
          )}
        </div>
      </header>

      {/* ── UNITS */}
      <section className="flex flex-col gap-6">
        {course.Units.sort((a, b) => a.order - b.order).map(unit => (
          <UnitCard key={unit.id} unit={unit} />
        ))}
      </section>
    </div>
  );
};

/* ─────────────────────────────────────────── COMPONENTS */

const UnitCard = ({ unit, isFirstUnit }) => {
  // Check if unit has any progress
  const hasProgress = unit.Modules.some(mod => {
    const percent = isNaN(parseFloat(mod.percent)) ? 0 : parseFloat(mod.percent);
    return percent > 0;
  });

  // Check if unit is complete
  const isComplete = unit.Modules.every(mod => {
    const percent = isNaN(parseFloat(mod.percent)) ? 0 : parseFloat(mod.percent);
    return percent === 100;
  });

  // Determine if unit should be expanded
  const shouldExpand = isFirstUnit || hasProgress || isComplete;

  return (
    <details
      className="collapse collapse-arrow bg-base-200/60 backdrop-blur shadow-md rounded-box transition-all duration-300"
      open={shouldExpand}
    >
      <summary className="collapse-title flex items-center gap-2 text-xl font-semibold">
        {unit.title}
        {unit.unitType !== 'content' && (
          <span className="badge badge-accent badge-sm uppercase">{unit.unitType}</span>
        )}
      </summary>

      <div className="collapse-content space-y-4">
        {unit.description && (
          <p className="text-base-content/70">{unit.description}</p>
        )}

        {/* MODULE LIST */}
        <ul className="flex flex-col divide-y divide-base-300">
          {unit.Modules
            .sort((a, b) => a.order - b.order)
            .map(mod => (
              <Fragment key={mod.id}>
                <ModuleRow mod={mod} />
              </Fragment>
            ))}
        </ul>
      </div>
    </details>
  );
};

const ModuleRow = ({ mod }) => {
  /* percent / score parsing */
  const percent = isNaN(parseFloat(mod.percent)) ? 0 : parseFloat(mod.percent);
  const score   = mod.score ?? null;

  /* progress bar colour ramp */
  const progressClass =
    percent >= 67
      ? 'progress-success'
      : percent >= 34
      ? 'progress-warning'
      : 'progress-error';

  return (
    <li className="flex items-center justify-between py-3 gap-4 hover:bg-base-100/40 transition-colors group">
      {/* clickable title */}
      <Link
        to={`/modules/${mod.id}`}
        className="flex-1 font-medium hover:underline decoration-dotted underline-offset-4"
      >
        {mod.title || `Untitled module (${mod.providerId ?? 'link'})`}
      </Link>

      {/* progress bar */}
      <div className="flex items-center gap-3 shrink-0 w-[200px]">
        <progress
          className={`progress ${progressClass} w-32 sm:w-40 lg:w-48`}
          value={percent}
          max="100"
        />
        <span className="text-xs opacity-70 w-12 text-right">{Math.round(percent)}%</span>
      </div>

      {/* score */}
      {/* <span className="text-sm opacity-70 shrink-0 w-14 text-right">({score ?? 0} pts)</span> */}
    </li>
  );
};

const PageLoader = () => (
  <div className="min-h-screen flex justify-center items-center">
    <span className="loading loading-spinner loading-lg text-primary" />
  </div>
);

const ErrorBanner = ({ err }) => (
  <div className="min-h-screen flex flex-col items-center justify-center gap-6">
    <div className="alert alert-error shadow-lg max-w-md">{err}</div>
    <Link to="/" className="btn btn-primary">
      <FiArrowLeft className="mr-1" /> Dashboard
    </Link>
  </div>
);

/* ─────────────────────────────────────────── ANIMATION UTIL
   Add once to your global CSS (tailwind.css) or in src/index.css:

   @keyframes fade-in {
     from { opacity: 0; transform: translateY(12px); }
     to   { opacity: 1; transform: translateY(0); }
   }
   .animate-fade-in {
     animation: fade-in 0.5s ease-out both;
   }
*/

export default StudentSessionPage;
