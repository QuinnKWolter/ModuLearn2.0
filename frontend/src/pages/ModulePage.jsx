import { useParams, Link } from 'react-router-dom';
import useModule from '../hooks/useModule';
import ModuleFrame from '../components/ModuleFrame';
import ErrorMessage from '../components/ErrorMessage';

const ModulePage = () => {
  const { moduleId } = useParams();
  const { data, loading, error } = useModule(moduleId);

  if (loading) return <CenterSpinner />;
  if (error)   return <ErrorMessage message={error} />;

  const { module, progress, session } = data;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <Link to={`/sessions/${session.id}`} className="btn btn-sm mb-4">← Back to Course</Link>

      <h1 className="text-2xl font-bold mb-2">{module.title}</h1>
      <p className="mb-6">{module.description}</p>

      <ModuleFrame
        moduleId={module.id}
        providerUrl={module.resolvedUrl}
        savedState={progress?.state}
      />
    </div>
  );
};

const CenterSpinner = () => (
  <div className="flex justify-center py-20">
    <span className="loading loading-spinner loading-lg" />
  </div>
);

export default ModulePage;
