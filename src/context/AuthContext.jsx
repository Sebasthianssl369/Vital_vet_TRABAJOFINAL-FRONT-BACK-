import { createContext, useContext, useState } from 'react'
import { getUsuarioActual, logoutUsuario } from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getUsuarioActual())

  const login = (userData) => {
    const usuarioAdaptado = {
      ...userData,

      // Compatibilidad para tus páginas actuales
      id_usuario: userData.id_usuario ?? userData.idUsuario ?? userData.id ?? null,
      id_cliente: userData.id_cliente ?? userData.idCliente ?? null,

      // También dejamos camelCase por si luego lo usamos
      idUsuario: userData.idUsuario ?? userData.id_usuario ?? userData.id ?? null,
      idCliente: userData.idCliente ?? userData.id_cliente ?? null
    }

    setUser(usuarioAdaptado)

    localStorage.setItem('vitalvet_user', JSON.stringify(usuarioAdaptado))

    if (usuarioAdaptado.token) {
      localStorage.setItem('vitalvet_token', usuarioAdaptado.token)
    }
  }

  const logout = async () => {
    await logoutUsuario()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
