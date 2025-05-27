import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import API from '../config/axios';

const storage = {
  get access()  { return localStorage.getItem('accessToken'); },
  get refresh() { return localStorage.getItem('refreshToken'); },
  set(access, refresh) {
    localStorage.setItem('accessToken',  access);
    localStorage.setItem('refreshToken', refresh);
  },
  clear() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
};

/* ------------------------------------------------------------------ */
/*  Context setup                                                     */
/* ------------------------------------------------------------------ */

/**
 * @typedef {Object} AuthState
 * @property {boolean}  isAuthenticated
 * @property {Object?}  user
 * @property {string?}  accessToken
 * @property {string?}  refreshToken
 * @property {boolean}  isLoading
 * @property {string?}  error
 */

const AuthContext = createContext(/** @type {AuthState & {
  login: Function,
  logout: Function,
  setUser: Function
}} */ (null));

export const useAuth = () => useContext(AuthContext);

/* ------------------------------------------------------------------ */
/*  Provider                                                          */
/* ------------------------------------------------------------------ */
export function AuthProvider({ children }) {
  const [state, setState] = useState(/** @type {AuthState} */({
    isAuthenticated: false,
    user:            null,
    accessToken:     null,
    refreshToken:    null,
    isLoading:       true,
    error:           null
  }));

  /* ---------- helpers ---------- */
  const setUser = useCallback(
    updater =>
      setState(s => ({ ...s, user: typeof updater === 'function' ? updater(s.user) : updater })),
    []
  );

  const saveTokens = ({ accessToken, refreshToken }) => {
    storage.set(accessToken, refreshToken);
    API.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
  };

  const clearTokens = () => {
    storage.clear();
    delete API.defaults.headers.common.Authorization;
  };

  /* ---------------------------------------------------------------- */
  /*  1.  initial load                                                */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      const accessToken  = storage.access;
      const refreshToken = storage.refresh;

      if (!accessToken || !refreshToken) {
        return setState(s => ({ ...s, isLoading: false }));
      }

      API.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

      try {
        const { data: user } = await API.get('/auth/profile');
        if (cancelled) return;
        setState({
          isAuthenticated: true,
          user,
          accessToken,
          refreshToken,
          isLoading: false,
          error: null
        });
      } catch (err) {
        // silent refresh
        try {
          const { data } = await API.post('/auth/refresh-token', { refreshToken });
          saveTokens(data);
          const { data: user } = await API.get('/auth/profile');
          if (cancelled) return;
          setState({
            isAuthenticated: true,
            user,
            ...data,
            isLoading: false,
            error: null
          });
        } catch {
          clearTokens();
          if (!cancelled) setState(s => ({ ...s, isLoading: false }));
        }
      }
    };

    bootstrap();
    return () => { cancelled = true; };
  }, []);

  /* ---------------------------------------------------------------- */
  /*  2.  Axios response interceptor  (401 → refresh flow)            */
  /* ---------------------------------------------------------------- */
  const refreshingRef = useRef(/** @type {Promise<void>|null} */ (null));

  useEffect(() => {
    const id = API.interceptors.response.use(
      res => res,
      async error => {
        const original = error.config;

        if (error.response?.status !== 401 || original._retry || !state.refreshToken) {
          return Promise.reject(error);
        }

        // mark so we don't loop
        original._retry = true;

        // Deduplicate concurrent refreshes
        if (!refreshingRef.current) {
          refreshingRef.current = API
            .post('/auth/refresh-token', { refreshToken: state.refreshToken })
            .then(({ data }) => {
              saveTokens(data);
              setState(s => ({ ...s, ...data }));
            })
            .catch(err => {
              clearTokens();
              setState({
                isAuthenticated: false,
                user: null,
                accessToken: null,
                refreshToken: null,
                isLoading: false,
                error: 'Session expired'
              });
              throw err;
            })
            .finally(() => {
              refreshingRef.current = null;
            });
        }

        try {
          await refreshingRef.current;
          original.headers.Authorization = API.defaults.headers.common.Authorization;
          return API(original);
        } catch (refreshError) {
          return Promise.reject(refreshError);
        }
      }
    );
    return () => API.interceptors.response.eject(id);
  }, [state.refreshToken]);

  /* ---------------------------------------------------------------- */
  /*  3.  login / logout functions                                    */
  /* ---------------------------------------------------------------- */
  const login = useCallback(async (email, password) => {
    const { data } = await API.post('/auth/login', { email, password });
    saveTokens(data);
    setState({
      isAuthenticated: true,
      user: data.user,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      isLoading: false,
      error: null
    });
  }, []);

  const logout = useCallback(async () => {
    try {
      if (state.refreshToken) {
        await API.post('/auth/logout', { refreshToken: state.refreshToken });
      }
    } finally {
      clearTokens();
      setState({
        isAuthenticated: false,
        user: null,
        accessToken: null,
        refreshToken: null,
        isLoading: false,
        error: null
      });
    }
  }, [state.refreshToken]);

  /* ---------------------------------------------------------------- */
  /*  4.  memoised context value                                      */
  /* ---------------------------------------------------------------- */
  const ctxValue = useMemo(
    () => ({ ...state, login, logout, setUser, API }), // export API for convenience
    [state, login, logout, setUser]
  );

  return (
    <AuthContext.Provider value={ctxValue}>
      {state.isLoading ? null : children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
