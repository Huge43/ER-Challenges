import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Register from './pages/Register'
import Classement from './pages/Classement'
import Progression from './pages/Progression'
import SoumettreRun from './pages/SoumettreRun'
import Membres from './pages/Membres'
import ProtectedRoute from './components/ProtectedRoute'

function Layout({ children }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, background: '#f8f9fb', padding: '2rem', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/*" element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/classement" element={<Classement />} />
                <Route path="/progression" element={<Progression />} />
                <Route path="/soumettre" element={<SoumettreRun />} />
                <Route path="/membres" element={<Membres />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}