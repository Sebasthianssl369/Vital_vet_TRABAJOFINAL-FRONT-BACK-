// src/services/serviciosService.js

const API_URL = 'http://localhost:8080/api/servicios'

const normalizarServicio = (s) => {
  return {
    ...s,

    // Compatibilidad frontend
    id_servicio: s.idServicio ?? s.id_servicio,
    duracion_minutos: s.duracionMinutos ?? s.duracion_minutos,

    // Compatibilidad backend
    idServicio: s.idServicio ?? s.id_servicio,
    duracionMinutos: s.duracionMinutos ?? s.duracion_minutos,

    precio: Number(s.precio || 0),
    estado: s.estado || 'Activo'
  }
}

const normalizarServicios = (data) => {
  return Array.isArray(data) ? data.map(normalizarServicio) : []
}

const prepararServicioParaBackend = (data) => {
  return {
    nombre: data.nombre,
    descripcion: data.descripcion || '',
    precio: Number(data.precio || 0),
    duracionMinutos: Number(data.duracionMinutos ?? data.duracion_minutos ?? 30),
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

export const getServicios = async () => {
  const response = await fetch(API_URL)
  const data = await manejarError(response, 'No se pudieron cargar los servicios.')
  return normalizarServicios(data)
}

export const getServiciosActivos = async () => {
  const response = await fetch(`${API_URL}/activos`)
  const data = await manejarError(response, 'No se pudieron cargar los servicios activos.')
  return normalizarServicios(data)
}

export const getServicioById = async (id_servicio) => {
  const response = await fetch(`${API_URL}/${id_servicio}`)
  const data = await manejarError(response, 'No se pudo cargar el servicio.')
  return normalizarServicio(data)
}

export const crearServicio = async (data) => {
  if (!data.nombre || data.precio === undefined || data.precio === null) {
    throw new Error('Nombre y precio son obligatorios.')
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(prepararServicioParaBackend(data))
  })

  const result = await manejarError(response, 'No se pudo registrar el servicio.')
  return normalizarServicio(result)
}

export const actualizarServicio = async (id_servicio, data) => {
  const response = await fetch(`${API_URL}/${id_servicio}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(prepararServicioParaBackend(data))
  })

  const result = await manejarError(response, 'No se pudo actualizar el servicio.')
  return normalizarServicio(result)
}

export const eliminarServicio = async (id_servicio) => {
  const response = await fetch(`${API_URL}/${id_servicio}`, {
    method: 'DELETE'
  })

  const result = await manejarError(response, 'No se pudo eliminar el servicio.')

  return {
    id_servicio,
    idServicio: id_servicio,
    eliminado: true,
    message: result.message
  }
}