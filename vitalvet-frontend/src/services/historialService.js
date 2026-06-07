// src/services/historialService.js

const API_URL = 'http://localhost:8080/api/historial'

const normalizarHistorial = (h) => {
  return {
    ...h,

    // Compatibilidad frontend
    id_historial: h.idHistorial ?? h.id_historial,
    id_mascota: h.idMascota ?? h.id_mascota,
    id_veterinario: h.idVeterinario ?? h.id_veterinario,
    id_cita: h.idCita ?? h.id_cita,

    // Compatibilidad backend
    idHistorial: h.idHistorial ?? h.id_historial,
    idMascota: h.idMascota ?? h.id_mascota,
    idVeterinario: h.idVeterinario ?? h.id_veterinario,
    idCita: h.idCita ?? h.id_cita,

    fecha: h.fecha,
    motivo: h.motivo || '',
    diagnostico: h.diagnostico || '',
    tratamiento: h.tratamiento || '',
    observaciones: h.observaciones || ''
  }
}

const normalizarHistoriales = (data) => {
  return Array.isArray(data) ? data.map(normalizarHistorial) : []
}

const prepararHistorialParaBackend = (data) => {
  return {
    idMascota: Number(data.idMascota ?? data.id_mascota),
    idVeterinario: Number(data.idVeterinario ?? data.id_veterinario),
    idCita: data.idCita ?? data.id_cita ? Number(data.idCita ?? data.id_cita) : null,
    fecha: data.fecha || null,
    motivo: data.motivo,
    diagnostico: data.diagnostico,
    tratamiento: data.tratamiento,
    observaciones: data.observaciones || ''
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

export const getHistorial = async () => {
  const response = await fetch(API_URL)
  const data = await manejarError(response, 'No se pudo cargar el historial clínico.')
  return normalizarHistoriales(data)
}

export const getHistorialById = async (id_historial) => {
  const response = await fetch(`${API_URL}/${id_historial}`)
  const data = await manejarError(response, 'No se pudo cargar el registro clínico.')
  return normalizarHistorial(data)
}

export const getHistorialPorMascota = async (id_mascota) => {
  const response = await fetch(`${API_URL}/mascota/${id_mascota}`)
  const data = await manejarError(response, 'No se pudo cargar el historial de la mascota.')
  return normalizarHistoriales(data)
}

export const getHistorialPorVeterinario = async (id_veterinario) => {
  const response = await fetch(`${API_URL}/veterinario/${id_veterinario}`)
  const data = await manejarError(response, 'No se pudo cargar el historial del veterinario.')
  return normalizarHistoriales(data)
}

export const getHistorialPorCita = async (id_cita) => {
  const response = await fetch(`${API_URL}/cita/${id_cita}`)
  const data = await manejarError(response, 'No se pudo cargar el historial de la cita.')
  return normalizarHistoriales(data)
}

export const crearHistorial = async (data) => {
  if (!data.id_mascota && !data.idMascota) {
    throw new Error('Selecciona una mascota.')
  }

  if (!data.id_veterinario && !data.idVeterinario) {
    throw new Error('Selecciona un veterinario.')
  }

  if (!data.motivo || !data.diagnostico || !data.tratamiento) {
    throw new Error('Motivo, diagnóstico y tratamiento son obligatorios.')
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(prepararHistorialParaBackend(data))
  })

  const result = await manejarError(response, 'No se pudo registrar el historial clínico.')
  return normalizarHistorial(result)
}

export const actualizarHistorial = async (id_historial, data) => {
  const response = await fetch(`${API_URL}/${id_historial}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(prepararHistorialParaBackend(data))
  })

  const result = await manejarError(response, 'No se pudo actualizar el historial clínico.')
  return normalizarHistorial(result)
}

export const eliminarHistorial = async (id_historial) => {
  const response = await fetch(`${API_URL}/${id_historial}`, {
    method: 'DELETE'
  })

  const result = await manejarError(response, 'No se pudo eliminar el historial clínico.')

  return {
    id_historial,
    idHistorial: id_historial,
    eliminado: true,
    message: result.message
  }
}
