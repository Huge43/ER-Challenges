import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
})

export const getDashboard = () => api.get('/dashboard')
export const getMembers = () => api.get('/members')
export const addRun = (data) => api.post('/runs', data)

export default api