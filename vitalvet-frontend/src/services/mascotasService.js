// src/services/mascotasService.js

const API_URL = 'http://localhost:8080/api/mascotas'

const normalizarMascota = (m) => {
  return {
    ...m,

    // Compatibilidad con tu frontend actual
    id_mascota: m.idMascota ?? m.id_mascota,
    id_cliente: m.idCliente ?? m.id_cliente,

    // También dejamos camelCase para backend
    idMascota: m.idMascota ?? m.id_mascota,
    idCliente: m.idCliente ?? m.id_cliente
  }
}

const normalizarMascotas = (data) => {
  return Array.isArray(data) ? data.map(normalizarMascota) : []
}

const prepararMascotaParaBackend = (data) => {
  return {
    idCliente: Number(data.idCliente ?? data.id_cliente),
    nombre: data.nombre,
    especie: data.especie,
    raza: data.raza,
    edad: data.edad !== '' && data.edad !== undefined ? Number(data.edad) : 0,
    sexo: data.sexo,
    peso: data.peso !== '' && data.peso !== undefined && data.peso !== null
      ? Number(data.peso)
      : null,
    color: data.color,
    fechaNacimiento: data.fechaNacimiento ?? data.fecha_nacimiento ?? null,
    estado: data.estado || 'Activo',
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

export const getMascotas = async () => {
  const response = await fetch(API_URL)
  const data = await manejarError(response, 'No se pudieron cargar las mascotas.')
  return normalizarMascotas(data)
}

export const getMascotasPorCliente = async (id_cliente) => {
  const response = await fetch(`${API_URL}/cliente/${id_cliente}`)
  const data = await manejarError(response, 'No se pudieron cargar las mascotas del cliente.')
  return normalizarMascotas(data)
}

export const crearMascota = async (data) => {
  if (!data.nombre || !(data.id_cliente || data.idCliente)) {
    throw new Error('Nombre de mascota y propietario son obligatorios.')
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(prepararMascotaParaBackend(data))
  })

  const result = await manejarError(response, 'No se pudo registrar la mascota.')
  return normalizarMascota(result)
}

export const actualizarMascota = async (id_mascota, data) => {
  const response = await fetch(`${API_URL}/${id_mascota}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(prepararMascotaParaBackend(data))
  })

  const result = await manejarError(response, 'No se pudo actualizar la mascota.')
  return normalizarMascota(result)
}

export const eliminarMascota = async (id_mascota) => {
  const response = await fetch(`${API_URL}/${id_mascota}`, {
    method: 'DELETE'
  })

  const result = await manejarError(response, 'No se pudo eliminar la mascota.')

  return {
    id_mascota,
    idMascota: id_mascota,
    eliminado: true,
    message: result.message
  }
}
