// src/services/reportesService.js

import { delay } from './api'
import {
  REPORTES_MENSUALES,
  SERVICIOS_TOP,
  PAGOS,
  CITAS
} from '../data/db'

export const getReportesMensuales = async () => {
  await delay()
  return REPORTES_MENSUALES
}

export const getTopServicios = async () => {
  await delay()
  return SERVICIOS_TOP
}

export const getPagos = async () => {
  await delay()
  return PAGOS
}

export const getPagosPendientes = async () => {
  await delay()
  return PAGOS.filter(p => p.estado === 'pendiente')
}

export const getResumenDashboard = async () => {
  await delay()

  return {
    totalCitas: CITAS.length,
    citasConfirmadas: CITAS.filter(c => c.estado === 'Confirmada').length,
    pagosPendientes: CITAS.filter(c => c.estado_pago === 'pendiente').length,
    ingresosEstimados: CITAS.reduce((acc, c) => acc + Number(c.monto || 0), 0)
  }
}