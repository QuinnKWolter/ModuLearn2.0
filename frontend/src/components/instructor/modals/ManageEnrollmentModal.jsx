import { useState, useEffect, useCallback } from 'react';
import { FiPlus, FiTrash2, FiX } from 'react-icons/fi';
import { useAuth } from '../../../contexts/AuthContext';

/**
 * Shows / edits the roster for one session.
 * → Works even if a “skeleton” user record was invited (no fullName, no password yet).
 */
const ManageEnrollmentModal = ({ isOpen, onClose, session }) => {
  const { API } = useAuth();

  const [roster, setRoster]   = useState([]);      // [{ id, student:{…} }]
  const [emails, setEmails]   = useState('');      // textarea contents
  const [loading, setLoad]    = useState(false);
  const [err, setErr]         = useState('');

  /* ------------------------------------------------------------------ */
  /*  Helpers                                                            */
  /* ------------------------------------------------------------------ */
  const rosterUrl  = session ? `/sessions/${session.id}/enrollments` : '';
  const enrollUrl  = session ? `/sessions/${session.id}/enroll`      : '';

  /** GET roster → setRoster */
  const loadRoster = useCallback(async () => {
    if (!session) return;
    try {
      setLoad(true); setErr('');
      const { data } = await API.get(rosterUrl);
      setRoster(data);
    } catch (e) {
      console.error(e);
      setErr('Unable to load roster');
    } finally { setLoad(false); }
  }, [API, rosterUrl, session]);

  /** POST bulk invite/enroll */
  const bulkEnroll = async () => {
    const list = emails.split(/[,\s]+/).filter(Boolean);
    if (!list.length) return;

    try {
      setLoad(true); setErr('');
      await API.post(enrollUrl, { emails: list });
      setEmails('');
      await loadRoster();
    } catch (e) {
      console.error(e);
      setErr('Enrollment failed');
    } finally { setLoad(false); }
  };

  /** DELETE single enrollment */
  const removeStudent = async (enrollmentId) => {
    if (!confirm('Remove this student?')) return;
    try {
      await API.delete(`/enrollments/${enrollmentId}`);
      setRoster(r => r.filter(s => s.id !== enrollmentId));
    } catch (e) {
      console.error(e);
      setErr('Could not remove student');
    }
  };

  /* ------------------------------------------------------------------ */
  /*  Load roster every time the modal opens                             */
  /* ------------------------------------------------------------------ */
  useEffect(() => { if (isOpen && session) loadRoster(); }, [isOpen, session, loadRoster]);

  if (!isOpen || !session) return null;

  return (
    <dialog open className="modal modal-open">
      <div className="modal-box w-full max-w-3xl">
        <h3 className="font-bold text-xl flex items-center gap-2">
          Manage Enrollment
          <span className="badge badge-outline badge-sm">{session.groupName}</span>
        </h3>

        {/* error banner */}
        {err && <div className="alert alert-error my-3">{err}</div>}

        {/* add students */}
        <div className="my-4 flex items-center gap-2">
          <input
            type="text"
            className="input input-bordered flex-1"
            placeholder="email1@example.com, email2@example.com …"
            value={emails}
            onChange={e => setEmails(e.target.value)}
            disabled={loading}
          />
          <button
            className="btn btn-primary btn-square"
            onClick={bulkEnroll}
            disabled={loading}
            title="Add / invite"
          >
            {loading ? <span className="loading loading-spinner" /> : <FiPlus />}
          </button>
        </div>

        <div className="divider" />

        {/* roster list */}
        {loading ? (
          <div className="flex justify-center py-8">
            <span className="loading loading-spinner loading-lg" />
          </div>
        ) : roster.length ? (
          <ul className="menu w-full">
            {roster.map(({ id, student }) => {
              /* ─────────────── display-name fallbacks ─────────────── */
              const displayName =
                  student?.fullName?.trim()                              // “Jane Doe”
               ||  (student?.email ? student.email.split('@')[0] : '')   // “janedoe”
               ||  'Invited user';                                       // last-ditch

              return (
                <li key={id} className="flex justify-between items-center">
                  <span>
                    <b>{displayName}</b>
                    {student?.email && (
                      <>
                        <br />
                        <small className="text-base-content/70">
                          {student.email}
                        </small>
                      </>
                    )}
                  </span>

                  <button
                    className="btn btn-ghost btn-sm text-error"
                    onClick={() => removeStudent(id)}
                    title="Remove"
                  >
                    <FiTrash2 />
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-center italic py-6">No students enrolled yet.</p>
        )}

        <div className="modal-action">
          <button className="btn" onClick={onClose}>
            <FiX className="mr-1" /> Close
          </button>
        </div>
      </div>

      {/* click outside to close */}
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
};

export default ManageEnrollmentModal;