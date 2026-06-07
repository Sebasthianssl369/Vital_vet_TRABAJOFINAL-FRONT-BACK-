// src/services/api.js

const API_URL = 'http://localhost:8080/api'

// Simulador de espera como si fuera una API real
export const delay = (ms = 300) =>
  new Promise(resolve => setTimeout(resolve, ms))

// Cliente base para cuando conectemos backend real
export const api = {
  async get(endpoint) {
    const res = await fetch(`${API_URL}${endpoint}`)

    if (!res.ok) {
      throw new Error('Error al obtener datos')
    }

    return res.json()
  },

  async post(endpoint, data) {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })

    if (!res.ok) {
      throw new Error('Error al registrar datos')
    }

    return res.json()
  },

  async put(endpoint, data) {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })

    if (!res.ok) {
      throw new Error('Error al actualizar datos')
    }

    return res.json()
  },

  async delete(endpoint) {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE'
    })

    if (!res.ok) {
      throw new Error('Error al eliminar datos')
    }

    return res.json()
  }
}
