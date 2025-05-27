import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function useModule(moduleId) {
  const { API } = useAuth();
  const [data, setData]     = useState(null);
  const [loading, setLoad]  = useState(true);
  const [error, setError]   = useState('');

  const refresh = useCallback(async () => {
    if (!moduleId) return;
    try {
      setLoad(true);
      const { data } = await API.get(`/modules/${moduleId}`);
      setData(data);
    } catch (e) {
      console.error(e);
      setError('Failed to load module.');
    } finally {
      setLoad(false);
    }
  }, [moduleId, API]);

  useEffect(() => { refresh(); }, [refresh]);
  console.log(data);

  return { data, loading, error, refresh };
}
