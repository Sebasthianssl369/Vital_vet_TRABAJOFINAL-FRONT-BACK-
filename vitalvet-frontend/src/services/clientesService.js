// src/services/clientesService.js

const API_URL = 'http://localhost:8080/api/clientes'

const normalizarCliente = (c) => {
  return {
    ...c,

    // Compatibilidad con tu frontend actual
    id_cliente: c.idCliente ?? c.id_cliente,
    id_usuario: c.idUsuario ?? c.id_usuario,

    // También dejamos camelCase para backend
    idCliente: c.idCliente ?? c.id_cliente,
    idUsuario: c.idUsuario ?? c.id_usuario
  }
}

const normalizarClientes = (data) => {
  return Array.isArray(data) ? data.map(normalizarCliente) : []
}

const prepararClienteParaBackend = (data) => {
  return {
    idUsuario: data.idUsuario ?? data.id_usuario ?? null,
    nombre: data.nombre,
    apellido: data.apellido,
    dni: data.dni,
    telefono: data.telefono || '',
    email: data.email || '',
    direccion: data.direccion || '',
    estado: data.estado || 'Activo'
  }
}

const manejarError = async (response, mensajeDefault) => {
  let data = null

  try {
    data = await response.json()
  } catch {
    data = null
  }

  if (!response.ok) {
    throw new Error(data?.message || mensajeDefault)
  }

  return data
}

export const getClientes = async () => {
  const response = await fetch(API_URL)
  const data = await manejarError(response, 'No se pudieron cargar los clientes.')
  return normalizarClientes(data)
}

export const getClienteByIdService = async (id_cliente) => {
  const response = await fetch(`${API_URL}/${id_cliente}`)
  const data = await manejarError(response, 'No se pudo cargar el cliente.')
  return normalizarCliente(data)
}

export const crearCliente = async (data) => {
  if (!data.nombre || !data.apellido || !data.dni) {
    throw new Error('Nombre, apellido y DNI son obligatorios.')
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(prepararClienteParaBackend(data))
  })

  const result = await manejarError(response, 'No se pudo registrar el cliente.')
  return normalizarCliente(result)
}

export const actualizarCliente = async (id_cliente, data) => {
  const response = await fetch(`${API_URL}/${id_cliente}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(prepararClienteParaBackend(data))
  })

  const result = await manejarError(response, 'No se pudo actualizar el cliente.')
  return normalizarCliente(result)
}

export const eliminarCliente = async (id_cliente) => {
  const response = await fetch(`${API_URL}/${id_cliente}`, {
    method: 'DELETE'
  })

  const result = await manejarError(response, 'No se pudo eliminar el cliente.')

  return {
    id_cliente,
    idCliente: id_cliente,
    eliminado: true,
    message: result.message
  }
}
