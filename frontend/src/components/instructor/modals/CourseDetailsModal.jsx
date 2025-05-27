import React from 'react';

const CourseDetailsModal = ({ isOpen, onClose, course }) => {
  if (!isOpen || !course) return null;

  /* Units already include Modules thanks to backend include */
  const units = [...(course.Units || [])].sort((a, b) => a.order - b.order);

  return (
    <dialog open className="modal modal-open">
      <div className="modal-box max-w-3xl">
        <h3 className="font-bold text-xl mb-2">{course.title}</h3>
        <p className="text-sm mb-4">{course.description}</p>

        <div className="divider">Course Structure</div>

        <div className="overflow-y-auto max-h-96 space-y-4">
          {units.length === 0 && (
            <p className="text-center py-4 text-base-content/70">This course has no units yet.</p>
          )}

          {units.map((u, idx) => (
            <div key={u.id} className="collapse collapse-arrow bg-base-200">
              <input type="checkbox" defaultChecked />
              <div className="collapse-title font-medium">
                Unit {idx + 1}: {u.title}
              </div>
              <div className="collapse-content">
                {u.description && <p className="text-sm mb-2">{u.description}</p>}

                {u.Modules?.length ? (
                  <ul className="ml-5 list-disc space-y-1">
                    {u.Modules.map(m => (
                      <li key={m.id}>
                        <span className="font-semibold">{m.title}</span>{' '}
                        <span className="text-xs text-base-content/70">({m.providerId})</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-base-content/70">No modules in this unit</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="modal-action">
          <button className="btn" onClick={onClose}>Close</button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
};

export default CourseDetailsModal;
