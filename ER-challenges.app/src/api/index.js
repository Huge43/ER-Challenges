import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_URL,
})

// Joint le token à chaque requête
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Token expiré ou invalide : retour à la connexion
api.interceptors.response.use(res => res, err => {
  if (err.response?.status === 401 && localStorage.getItem('token')) {
    localStorage.removeItem('token')
    localStorage.removeItem('member')
    window.location.href = '/login'
  }
  return Promise.reject(err)
})

export const getDashboard = () => api.get('/dashboard')
export const getMembers = () => api.get('/members')
export const addRun = (data) => api.post('/runs', data)

export default api
