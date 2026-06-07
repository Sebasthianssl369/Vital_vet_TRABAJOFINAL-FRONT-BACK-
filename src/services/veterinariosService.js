// src/services/veterinariosService.js

const API_URL = 'http://localhost:8080/api/veterinarios'

const normalizarVeterinario = (v) => {
  return {
    ...v,

    // Compatibilidad con tu frontend actual
    id_veterinario: v.idVeterinario ?? v.id_veterinario,

    // También dejamos camelCase para backend
    idVeterinario: v.idVeterinario ?? v.id_veterinario,

    // Campos visuales usados en tu front
    foto: v.foto || '🩺',
    horarios: v.horarios || [],
    citasAsignadas: v.citasAsignadas ?? 0,
    estado: v.estado || 'Activo'
  }
}

const normalizarVeterinarios = (data) => {
  return Array.isArray(data) ? data.map(normalizarVeterinario) : []
}

const prepararVeterinarioParaBackend = (data) => {
  return {
    nombre: data.nombre,
    apellido: data.apellido,
    especialidad: data.especialidad,
    telefono: data.telefono || '',
    email: data.email || '',
    cmp: data.cmp || '',
    foto: data.foto || '🩺',
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

export const getVeterinarios = async () => {
  const response = await fetch(API_URL)
  const data = await manejarError(response, 'No se pudieron cargar los veterinarios.')
  return normalizarVeterinarios(data)
}

export const getVeterinariosActivos = async () => {
  const response = await fetch(`${API_URL}/activos`)
  const data = await manejarError(response, 'No se pudieron cargar los veterinarios activos.')
  return normalizarVeterinarios(data)
}

export const crearVeterinario = async (data) => {
  if (!data.nombre || !data.apellido || !data.especialidad) {
    throw new Error('Nombre, apellido y especialidad son obligatorios.')
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(prepararVeterinarioParaBackend(data))
  })

  const result = await manejarError(response, 'No se pudo registrar el veterinario.')
  return normalizarVeterinario(result)
}

export const actualizarVeterinario = async (id_veterinario, data) => {
  const response = await fetch(`${API_URL}/${id_veterinario}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(prepararVeterinarioParaBackend(data))
  })

  const result = await manejarError(response, 'No se pudo actualizar el veterinario.')
  return normalizarVeterinario(result)
}

export const cambiarEstadoVeterinario = async (id_veterinario, estado) => {
  const veterinarioActual = {
    ...(await getVeterinarioById(id_veterinario)),
    estado
  }

  const actualizado = await actualizarVeterinario(id_veterinario, veterinarioActual)

  return {
    ...actualizado,
    id_veterinario,
    idVeterinario: id_veterinario,
    estado
  }
}

export const eliminarVeterinario = async (id_veterinario) => {
  const response = await fetch(`${API_URL}/${id_veterinario}`, {
    method: 'DELETE'
  })

  const result = await manejarError(response, 'No se pudo eliminar el veterinario.')

  return {
    id_veterinario,
    idVeterinario: id_veterinario,
    eliminado: true,
    message: result.message
  }
}

export const getVeterinarioById = async (id_veterinario) => {
  const response = await fetch(`${API_URL}/${id_veterinario}`)
  const data = await manejarError(response, 'No se pudo cargar el veterinario.')
  return normalizarVeterinario(data)
}
