// src/services/citasService.js

const API_URL = 'http://localhost:8080/api/citas'

const normalizarCita = (c) => {
  return {
    ...c,

    id_cita: c.idCita ?? c.id_cita,
    id_cliente: c.idCliente ?? c.id_cliente,
    id_mascota: c.idMascota ?? c.id_mascota,
    id_veterinario: c.idVeterinario ?? c.id_veterinario,
    id_servicio: c.idServicio ?? c.id_servicio,

    idCita: c.idCita ?? c.id_cita,
    idCliente: c.idCliente ?? c.id_cliente,
    idMascota: c.idMascota ?? c.id_mascota,
    idVeterinario: c.idVeterinario ?? c.id_veterinario,
    idServicio: c.idServicio ?? c.id_servicio,

    estado_pago: c.estadoPago ?? c.estado_pago ?? 'pendiente',
    estadoPago: c.estadoPago ?? c.estado_pago ?? 'pendiente',

    monto: Number(c.monto || 0),
    estado: c.estado || 'Pendiente',
    motivo: c.motivo || ''
  }
}

const normalizarCitas = (data) => {
  return Array.isArray(data) ? data.map(normalizarCita) : []
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

const prepararCitaParaBackend = (data) => {
  return {
    idCliente: Number(data.idCliente ?? data.id_cliente),
    idMascota: Number(data.idMascota ?? data.id_mascota),
    idVeterinario: Number(data.idVeterinario ?? data.id_veterinario),
    idServicio: Number(data.idServicio ?? data.id_servicio),
    fecha: data.fecha,
    hora: data.hora,
    estado: data.estado || 'Pendiente',
    estadoPago: data.estadoPago ?? data.estado_pago ?? 'pendiente',
    monto: Number(data.monto || 0),
    motivo: data.motivo || '',
    observaciones: data.observaciones || ''
  }
}

export const getCitas = async () => {
  const response = await fetch(API_URL)
  const data = await manejarError(response, 'No se pudieron cargar las citas.')
  return normalizarCitas(data)
}

export const getCitasPorCliente = async (id_cliente) => {
  const response = await fetch(`${API_URL}/cliente/${id_cliente}`)
  const data = await manejarError(response, 'No se pudieron cargar tus citas.')
  return normalizarCitas(data)
}

export const crearCita = async (data) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(prepararCitaParaBackend(data))
  })

  const result = await manejarError(response, 'No se pudo registrar la cita.')
  return normalizarCita(result)
}

export const cambiarEstadoCita = async (id_cita, estado) => {
  const response = await fetch(`${API_URL}/${id_cita}/estado`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ estado })
  })

  const result = await manejarError(response, 'No se pudo actualizar el estado.')
  return normalizarCita(result)
}

export const marcarCitaPagada = async (id_cita) => {
  const response = await fetch(`${API_URL}/${id_cita}/pago`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ estadoPago: 'pagado' })
  })

  const result = await manejarError(response, 'No se pudo registrar el pago.')
  return normalizarCita(result)
}

export const eliminarCita = async (id_cita) => {
  const response = await fetch(`${API_URL}/${id_cita}`, {
    method: 'DELETE'
  })

  const result = await manejarError(response, 'No se pudo cancelar la cita.')

  return {
    id_cita,
    idCita: id_cita,
    eliminado: true,
    message: result.message
  }
}
