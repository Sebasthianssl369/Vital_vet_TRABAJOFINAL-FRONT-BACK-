import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import MainLayout     from './layouts/MainLayout'
import ClienteLayout  from './layouts/ClienteLayout'
import Login          from './pages/Login'
import Dashboard      from './pages/Dashboard'
import Mascotas       from './pages/Mascotas'
import Clientes       from './pages/Clientes'
import Historial      from './pages/Historial'
import Citas          from './pages/Citas'
import Reportes       from './pages/Reportes'
import ClienteCitas     from './pages/cliente/ClienteCitas'
import ClienteHistorial from './pages/cliente/ClienteHistorial'

// Solo deja pasar si hay sesión activa
function ProtectedRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

// Solo para administrador
function AdminRoute({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.rol !== 'administrador') return <Navigate to="/cliente/citas" replace />
  return children
}

// Solo para cliente
function ClienteRoute({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.rol !== 'cliente') return <Navigate to="/dashboard" replace />
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* ── RUTAS ADMINISTRADOR ── */}
      <Route path="/" element={<AdminRoute><MainLayout /></AdminRoute>}>
        <Route index          element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="mascotas"  element={<Mascotas  />} />
        <Route path="clientes"  element={<Clientes  />} />
        <Route path="historial" element={<Historial />} />
        <Route path="citas"     element={<Citas     />} />
        <Route path="reportes"  element={<Reportes  />} />
      </Route>

      {/* ── RUTAS CLIENTE ── */}
      <Route path="/cliente" element={<ClienteRoute><ClienteLayout /></ClienteRoute>}>
        <Route index            element={<Navigate to="/cliente/citas" replace />} />
        <Route path="citas"     element={<ClienteCitas     />} />
        <Route path="historial" element={<ClienteHistorial />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
