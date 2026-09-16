import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_URL,
})

export const getDashboard = () => api.get('/dashboard')
export const getMembers = () => api.get('/members')
export const addRun = (data) => api.post('/runs', data)

export default api