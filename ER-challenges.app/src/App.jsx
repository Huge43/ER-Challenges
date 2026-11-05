import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppShell from './components/AppShell'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Register from './pages/Register'
import Classement from './pages/Classement'
import Progression from './pages/Progression'
import SoumettreRun from './pages/SoumettreRun'
import Membres from './pages/Membres'
import Challenges from './pages/Challenges'
import Profil from './pages/Profil'
import Landing from './pages/Landing'
import ResetPassword from './pages/ResetPassword'
import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reinitialiser/:token" element={<ResetPassword />} />
        <Route path="/*" element={
          <ProtectedRoute>
            <AppShell>
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/classement" element={<Classement />} />
                <Route path="/challenges" element={<Challenges />} />
                <Route path="/progression" element={<Progression />} />
                <Route path="/soumettre" element={<SoumettreRun />} />
                <Route path="/membres" element={<Membres />} />
                <Route path="/profil" element={<Profil />} />
                <Route path="/profil/:id" element={<Profil />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </AppShell>
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}