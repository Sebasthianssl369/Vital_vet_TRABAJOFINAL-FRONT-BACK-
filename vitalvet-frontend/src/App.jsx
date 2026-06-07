import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import { AuthProvider, useAuth } from './context/AuthContext'

import MainLayout from './layouts/MainLayout'
import ClienteLayout from './layouts/ClienteLayout'

import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Mascotas from './pages/Mascotas'
import Clientes from './pages/Clientes'
import Historial from './pages/Historial'
import Citas from './pages/Citas'
import Reportes from './pages/Reportes'
import Veterinarios from './pages/Veterinarios'

import ClienteCitas from './pages/cliente/ClienteCitas'
import ClienteHistorial from './pages/cliente/ClienteHistorial'

// Ruta pública: si ya hay sesión, no vuelve al login
function PublicRoute({ children }) {
  const { user } = useAuth()

  if (!user) return children

  if (user.rol === 'administrador') {
    return <Navigate to="/dashboard" replace />
  }

  if (user.rol === 'cliente') {
    return <Navigate to="/cliente/citas" replace />
  }

  return <Navigate to="/login" replace />
}

// Solo administrador
function AdminRoute({ children }) {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (user.rol !== 'administrador') {
    return <Navigate to="/cliente/citas" replace />
  }

  return children
}

// Solo cliente
function ClienteRoute({ children }) {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (user.rol !== 'cliente') {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

// Redirección inicial según rol
function HomeRedirect() {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (user.rol === 'administrador') {
    return <Navigate to="/dashboard" replace />
  }

  if (user.rol === 'cliente') {
    return <Navigate to="/cliente/citas" replace />
  }

  return <Navigate to="/login" replace />
}

function AppRoutes() {
  return (
    <Routes>
      {/* LOGIN */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      {/* RAÍZ */}
      <Route path="/" element={<HomeRedirect />} />

      {/* RUTAS ADMINISTRADOR */}
      <Route
        element={
          <AdminRoute>
            <MainLayout />
          </AdminRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/mascotas" element={<Mascotas />} />
        <Route path="/clientes" element={<Clientes />} />
        <Route path="/historial" element={<Historial />} />
        <Route path="/citas" element={<Citas />} />
        <Route path="/veterinarios" element={<Veterinarios />} />
        <Route path="/reportes" element={<Reportes />} />
      </Route>

      {/* RUTAS CLIENTE */}
      <Route
        path="/cliente"
        element={
          <ClienteRoute>
            <ClienteLayout />
          </ClienteRoute>
        }
      >
        <Route index element={<Navigate to="/cliente/citas" replace />} />
        <Route path="citas" element={<ClienteCitas />} />
        <Route path="historial" element={<ClienteHistorial />} />
      </Route>

      {/* CUALQUIER RUTA INVÁLIDA */}
      <Route path="*" element={<HomeRedirect />} />
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
