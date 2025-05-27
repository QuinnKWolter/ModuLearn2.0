import { useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';

const ModuleFrame = ({ moduleId, providerUrl, savedState }) => {
  const { API } = useAuth();
  const iframeRef = useRef(null);

  useEffect(() => {
    console.log('[ModuleFrame] Initialized with savedState:', savedState);
    
    const handleMessage = async (event) => {
      const allowed = [
        'http://pawscomp2.sis.pitt.edu',
        'http://127.0.0.1:8000',
        'https://codecheck.io',
        'https://codecheck.me'
      ];
      console.log('[ModuleFrame] Received message from:', event.origin);
      if (!allowed.includes(event.origin)) {
        console.log(event)
        console.log('[ModuleFrame] Ignored message from unauthorized origin');
        return;
      }

      const { subject, message_id, score, state } = event.data;
      console.log('[ModuleFrame] Received message:', { subject, message_id, score, state });
  
      /* ----------------------------------------------------------------
         1) CodeCheck asks for stored state
      ---------------------------------------------------------------- */
      if (subject === 'SPLICE.getState') {
        console.log('[ModuleFrame] → CodeCheck asked for state', savedState);
        iframeRef.current?.contentWindow?.postMessage(
          {
            subject: 'SPLICE.getState.response',
            message_id,
            state: savedState || null
          },
          event.origin
        );
        return;
      }
  
      /* ----------------------------------------------------------------
         2) CodeCheck reports progress + new state
      ---------------------------------------------------------------- */
      if (subject === 'SPLICE.reportScoreAndState') {
        try {
          const rawScore  = Number(score) || 0;      // 0-1
          const pct       = rawScore * 100;
  
          console.log('[ModuleFrame] ← progress', { rawScore, pct, state });
  
          const response = await API.post(`/modules/${moduleId}/progress`, {
            data: [{
              activityId: moduleId,
              completion: rawScore === 1,
              score     : pct,          // 0-100 for backend
              success   : rawScore >= 0.7,
              progress  : pct,
              response  : state
            }]
          });
          console.log(response);
  
          console.log('[ModuleFrame] → progress stored OK');
        } catch (err) {
          console.error('[ModuleFrame] progress store FAILED', err);
        }
      }
    };
  
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [API, moduleId, savedState]);

  return (
    <iframe
      ref={iframeRef}
      src={providerUrl}
      title="Learning content"
      className="w-full"
      style={{ minHeight: 800, background: '#fff' }}
      allowFullScreen
    />
  );
};

export default ModuleFrame;