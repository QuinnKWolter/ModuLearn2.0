import axios from 'axios';

/**
 * One single axios instance that the whole front-end shares.
 * AuthContext will import *this* and attach the Authorization
 * header later when the user logs in.
 */
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL + '/api',
  withCredentials: false        // JWT in header
});

export default API;