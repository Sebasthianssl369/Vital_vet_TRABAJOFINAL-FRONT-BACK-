// src/services/authService.js

const API_URL = 'http://localhost:8080/api/auth'

const normalizarUsuario = (data) => {
  return {
    id_usuario: data.idUsuario,
    id_cliente: data.idCliente,
    idUsuario: data.idUsuario,
    idCliente: data.idCliente,
    username: data.username,
    nombre: data.nombre,
    apellido: data.apellido,
    email: data.email,
    rol: data.rol,
    token: data.token
  }
}

export const loginUsuario = async ({ username, password, rol }) => {
  if (!username || !password || !rol) {
    throw new Error('Usuario, contraseña y rol son obligatorios.')
  }

  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username,
      password,
      rol
    })
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'No se pudo iniciar sesión.')
  }

  const usuario = normalizarUsuario(data)

  localStorage.setItem('vitalvet_user', JSON.stringify(usuario))
  localStorage.setItem('vitalvet_token', usuario.token)

  return usuario
}

export const registrarCliente = async (data) => {
  if (
    !data.nombre ||
    !data.apellido ||
    !data.dni ||
    !data.email ||
    !data.username ||
    !data.password
  ) {
    throw new Error('Completa todos los campos obligatorios.')
  }

  const response = await fetch(`${API_URL}/registro`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      nombre: data.nombre,
      apellido: data.apellido,
      dni: data.dni,
      telefono: data.telefono,
      email: data.email,
      username: data.username,
      password: data.password
    })
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.message || 'No se pudo registrar el cliente.')
  }

  return normalizarUsuario(result)
}

export const logoutUsuario = async () => {
  localStorage.removeItem('vitalvet_user')
  localStorage.removeItem('vitalvet_token')
  return true
}

export const getUsuarioActual = () => {
  const data = localStorage.getItem('vitalvet_user')

  if (!data) return null

  try {
    return JSON.parse(data)
  } catch {
    localStorage.removeItem('vitalvet_user')
    localStorage.removeItem('vitalvet_token')
    return null
  }
}
