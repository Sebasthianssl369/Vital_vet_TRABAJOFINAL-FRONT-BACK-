import { useEffect, useState } from 'react'
import {
  Plus,
  X,
  QrCode,
  CheckCircle,
  Clock,
  ChevronRight,
  CalendarDays,
  PawPrint,
  CreditCard,
  FileText,
  Stethoscope,
  ReceiptText,
  UserCheck,
  ShieldCheck,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { QRCodeCanvas } from 'qrcode.react'
import { useAuth } from '../../context/AuthContext'

import {
  getCitasPorCliente,
  crearCita,
  marcarCitaPagada
} from '../../services/citasService'

import {
  getMascotasPorCliente,
  crearMascota
} from '../../services/mascotasService'

import {
  getVeterinariosActivos
} from '../../services/veterinariosService'

import {
  getServiciosActivos
} from '../../services/serviciosService'

const tipoEmoji = (t) => ({
  'Vacunación': '💉',
  'Consulta médica general': '🩺',
  'Control/Revisión': '📋',
  'Baño y grooming': '🛁',
  'Esterilización': '⚕️',
  'Cirugía': '🔬',
  'Desparasitación': '💊'
}[t] || '🐾')

const fechaTexto = (fecha) => {
  if (!fecha) return 'Sin fecha'
  const [year, month, day] = fecha.split('-')
  if (!year || !month || !day) return fecha
  return `${day}/${month}/${year}`
}

const fechaHoy = () => new Date().toISOString().split('T')[0]

const puedeAvanzar = (paso, form) => {
  if (paso === 1) return !!form.id_servicio
  if (paso === 2) return !!form.id_mascota
  if (paso === 3) return !!form.id_veterinario
  return false
}

const emptyForm = {
  id_mascota: '',
  id_veterinario: '',
  id_servicio: '',
  fecha: '',
  hora: ''
}

const emptyMascotaForm = {
  nombre: '',
  especie: 'Perro',
  raza: '',
  edad: '',
  sexo: 'Macho',
  peso: '',
  color: '',
  observaciones: ''
}

const emptyCardForm = {
  numero: '',
  nombre: '',
  venc: '',
  cvv: ''
}

const emptyTransferForm = {
  operacion: ''
}

const normalizarVet = (v) => ({
  ...v,
  id_veterinario: v.id_veterinario || v.idVeterinario,
  idVeterinario: v.idVeterinario || v.id_veterinario,
  foto: v.foto || '🩺',
  horarios: Array.isArray(v.horarios) && v.horarios.length > 0
    ? v.horarios
    : ['09:00', '10:30', '12:00', '15:00']
})

export default function ClienteCitas() {
  const { user } = useAuth()

  const idCliente = user?.id_cliente || user?.idCliente

  const [citas, setCitas] = useState([])
  const [misMascotas, setMisMascotas] = useState([])
  const [vetActivos, setVetActivos] = useState([])
  const [servicios, setServicios] = useState([])

  const [loading, setLoading] = useState(true)
  const [errorPage, setErrorPage] = useState('')

  const [modalNueva, setModalNueva] = useState(false)
  const [paso, setPaso] = useState(1)
  const [form, setForm] = useState(emptyForm)

  const [modalMascota, setModalMascota] = useState(false)
  const [mascotaForm, setMascotaForm] = useState(emptyMascotaForm)
  const [mascotaError, setMascotaError] = useState('')

  const [modalPago, setModalPago] = useState(null)
  const [modalDetalle, setModalDetalle] = useState(null)
  const [pagoConfirmado, setPagoConfirmado] = useState(false)
  const [metodoPago, setMetodoPago] = useState('yape')
  const [paymentError, setPaymentError] = useState('')
  const [cardForm, setCardForm] = useState(emptyCardForm)
  const [transferForm, setTransferForm] = useState(emptyTransferForm)

  useEffect(() => {
    const cargarDatosCliente = async () => {
      try {
        setLoading(true)
        setErrorPage('')

        if (!idCliente) {
          throw new Error('No se encontró el cliente asociado a la sesión.')
        }

        const [dataCitas, dataMascotas, dataVeterinarios, dataServicios] = await Promise.all([
          getCitasPorCliente(idCliente),
          getMascotasPorCliente(idCliente),
          getVeterinariosActivos(),
          getServiciosActivos()
        ])

        setCitas(dataCitas)
        setMisMascotas(dataMascotas)
        setVetActivos(dataVeterinarios.map(normalizarVet))
        setServicios(dataServicios)
      } catch (error) {
        setErrorPage(error.message || 'Error al cargar información del cliente.')
      } finally {
        setLoading(false)
      }
    }

    cargarDatosCliente()
  }, [idCliente])

  const mascotaById = (id) =>
    misMascotas.find(m => Number(m.id_mascota || m.idMascota) === Number(id))

  const veterinarioById = (id) =>
    vetActivos.find(v => Number(v.id_veterinario || v.idVeterinario) === Number(id))

  const servicioById = (id) =>
    servicios.find(sv => Number(sv.id_servicio || sv.idServicio) === Number(id))

  const vetSel = veterinarioById(form.id_veterinario)
  const servicioSel = servicioById(form.id_servicio)
  const precio = Number(servicioSel?.precio || 0)

  const citaVisual = (c) => {
    const idMascota = c.id_mascota || c.idMascota
    const idVeterinario = c.id_veterinario || c.idVeterinario
    const idServicio = c.id_servicio || c.idServicio

    const mascota = mascotaById(idMascota)
    const veterinario = veterinarioById(idVeterinario)
    const servicio = servicioById(idServicio)

    return {
      ...c,
      id_cita: c.id_cita || c.idCita,
      id_mascota: idMascota,
      id_veterinario: idVeterinario,
      id_servicio: idServicio,
      estado_pago: c.estado_pago || c.estadoPago || 'pendiente',
      estado: c.estado || 'Pendiente',
      tipo: servicio?.nombre || c.tipo || c.motivo || 'Servicio veterinario',
      monto: Number(c.monto || servicio?.precio || 0),
      mascotaNombre: mascota?.nombre || 'Mascota',
      especie: mascota?.especie || 'Otro',
      veterinarioNombre: veterinario
        ? `Dr(a). ${veterinario.nombre} ${veterinario.apellido}`
        : 'Por asignar'
    }
  }

  const citasVisuales = citas.map(citaVisual)

  const resetForm = () => {
    setPaso(1)
    setForm(emptyForm)
  }

  const resetPago = () => {
    setPagoConfirmado(false)
    setMetodoPago('yape')
    setPaymentError('')
    setCardForm(emptyCardForm)
    setTransferForm(emptyTransferForm)
  }

  const abrirReserva = () => {
    resetForm()
    setModalNueva(true)
  }

  const abrirReservaConVeterinario = (v) => {
    setPaso(1)
    setForm({
      id_mascota: '',
      id_veterinario: String(v.id_veterinario || v.idVeterinario),
      id_servicio: '',
      fecha: '',
      hora: ''
    })
    setModalNueva(true)
  }

  const abrirPago = (cita) => {
    setModalPago(citaVisual(cita))
    resetPago()
  }

  const cambiarMetodoPago = (metodo) => {
    setMetodoPago(metodo)
    setPaymentError('')
  }

  const citasOrdenadas = [...citasVisuales].sort((a, b) =>
    `${a.fecha} ${a.hora}`.localeCompare(`${b.fecha} ${b.hora}`)
  )

  const citasRecientes = [...citasVisuales].sort((a, b) =>
    `${b.fecha} ${b.hora}`.localeCompare(`${a.fecha} ${a.hora}`)
  )

  const proximaCita =
    citasOrdenadas.find(c => c.estado !== 'Cancelada' && c.estado_pago === 'pendiente') ||
    citasRecientes.find(c => c.estado !== 'Cancelada' && c.estado_pago === 'pagado') ||
    citasRecientes.find(c => c.estado !== 'Cancelada') ||
    null

  const totalCitas = citas.length
  const confirmadas = citasVisuales.filter(c => c.estado === 'Confirmada').length
  const pendientesPago = citasVisuales.filter(c =>
    c.estado_pago === 'pendiente' && c.estado !== 'Cancelada'
  ).length
  const mascotasRegistradas = misMascotas.length

  const abrirModalMascota = () => {
    setMascotaForm(emptyMascotaForm)
    setMascotaError('')
    setModalMascota(true)
  }

  const handleCrearMascotaCliente = async () => {
    setMascotaError('')

    if (!mascotaForm.nombre.trim()) {
      setMascotaError('Ingresa el nombre de tu mascota.')
      return
    }

    if (!idCliente) {
      setMascotaError('No se encontró el cliente asociado a la sesión.')
      return
    }

    if (mascotaForm.edad && Number(mascotaForm.edad) < 0) {
      setMascotaError('La edad no puede ser negativa.')
      return
    }

    if (mascotaForm.peso && Number(mascotaForm.peso) < 0) {
      setMascotaError('El peso no puede ser negativo.')
      return
    }

    try {
      const nuevaMascota = await crearMascota({
        id_cliente: Number(idCliente),
        nombre: mascotaForm.nombre.trim(),
        especie: mascotaForm.especie,
        raza: mascotaForm.raza.trim(),
        edad: mascotaForm.edad !== '' ? Number(mascotaForm.edad) : 0,
        sexo: mascotaForm.sexo,
        peso: mascotaForm.peso !== '' ? Number(mascotaForm.peso) : null,
        color: mascotaForm.color.trim(),
        observaciones: mascotaForm.observaciones.trim(),
        estado: 'Activo'
      })

      setMisMascotas(prev => [...prev, nuevaMascota])

      setForm(prev => ({
        ...prev,
        id_mascota: String(nuevaMascota.id_mascota || nuevaMascota.idMascota)
      }))

      setMascotaForm(emptyMascotaForm)
      setMascotaError('')
      setModalMascota(false)
    } catch (error) {
      setMascotaError(error.message || 'No se pudo registrar la mascota.')
    }
  }

  const handleReservar = async () => {
    if (!form.id_mascota || !form.id_servicio || !form.id_veterinario || !form.fecha || !form.hora) {
      alert('Completa todos los datos de la cita.')
      return
    }

    if (form.fecha < fechaHoy()) {
      alert('No puedes reservar una cita en una fecha anterior a hoy.')
      return
    }

    const servicio = servicioById(form.id_servicio)

    const nueva = {
      id_cliente: Number(idCliente),
      id_mascota: Number(form.id_mascota),
      id_veterinario: Number(form.id_veterinario),
      id_servicio: Number(form.id_servicio),
      fecha: form.fecha,
      hora: form.hora,
      estado: 'Pendiente',
      estado_pago: 'pendiente',
      monto: Number(servicio?.precio || 0),
      motivo: servicio?.nombre || 'Cita veterinaria'
    }

    try {
      const nuevaCita = await crearCita(nueva)
      const nuevaCitaVisual = citaVisual(nuevaCita)

      setCitas(prev => [...prev, nuevaCita])
      setModalNueva(false)
      resetForm()
      setModalPago(nuevaCitaVisual)
      resetPago()
    } catch (error) {
      alert(error.message || 'No se pudo reservar la cita.')
    }
  }

  const validarPago = () => {
    setPaymentError('')

    if (!modalPago) return false

    if (modalPago.estado === 'Cancelada') {
      setPaymentError('No puedes pagar una cita cancelada.')
      return false
    }

    if (modalPago.estado_pago === 'pagado') {
      setPaymentError('Esta cita ya figura como pagada.')
      return false
    }

    if (metodoPago === 'card') {
      const numeroLimpio = cardForm.numero.replace(/\s/g, '')

      if (numeroLimpio.length !== 16) {
        setPaymentError('Ingresa un número de tarjeta válido de 16 dígitos.')
        return false
      }

      if (!cardForm.nombre.trim()) {
        setPaymentError('Ingresa el nombre del titular de la tarjeta.')
        return false
      }

      if (!/^\d{2}\/\d{2}$/.test(cardForm.venc)) {
        setPaymentError('Ingresa un vencimiento válido en formato MM/AA.')
        return false
      }

      const [mes] = cardForm.venc.split('/')
      if (Number(mes) < 1 || Number(mes) > 12) {
        setPaymentError('El mes de vencimiento debe estar entre 01 y 12.')
        return false
      }

      if (cardForm.cvv.length !== 3) {
        setPaymentError('Ingresa un CVV válido de 3 dígitos.')
        return false
      }
    }

    if (metodoPago === 'trans') {
      if (!transferForm.operacion.trim()) {
        setPaymentError('Ingresa el número de operación de la transferencia.')
        return false
      }

      if (transferForm.operacion.trim().length < 5) {
        setPaymentError('El número de operación debe tener al menos 5 caracteres.')
        return false
      }
    }

    return true
  }

  const confirmarPago = async () => {
    if (!validarPago()) return

    setPagoConfirmado(true)

    try {
      const actualizada = await marcarCitaPagada(modalPago.id_cita)
      const actualizadaVisual = citaVisual(actualizada)

      setTimeout(() => {
        setCitas(prev =>
          prev.map(c =>
            Number(c.id_cita || c.idCita) === Number(modalPago.id_cita)
              ? actualizada
              : c
          )
        )

        setModalPago(null)
        setModalDetalle({
          ...actualizadaVisual,
          estado_pago: 'pagado',
          estado: 'Confirmada'
        })

        setPagoConfirmado(false)
        setPaymentError('')
        setCardForm(emptyCardForm)
        setTransferForm(emptyTransferForm)
      }, 1600)
    } catch (error) {
      setPagoConfirmado(false)
      setPaymentError(error.message || 'No se pudo confirmar el pago.')
    }
  }

  const estadoCitaStyle = {
    Confirmada: { bg: '#D1FAE5', txt: '#065F46' },
    Pendiente: { bg: '#FEF3C7', txt: '#92400E' },
    Cancelada: { bg: '#FEE2E2', txt: '#B91C1C' }
  }

  const estadoPagoStyle = {
    pagado: { bg: '#D1FAE5', txt: '#065F46' },
    pendiente: { bg: '#FEF3C7', txt: '#92400E' }
  }

  if (loading) {
    return (
      <div style={s.loadingBox}>
        <Loader2 size={34} color="var(--primary)" />
        <h3>Cargando tus citas...</h3>
        <p>Estamos preparando tu portal de reservas.</p>
      </div>
    )
  }

  if (errorPage) {
    return (
      <div style={s.errorBox}>
        <AlertCircle size={34} color="#DC2626" />
        <h3>Error al cargar tus citas</h3>
        <p>{errorPage}</p>
      </div>
    )
  }

  return (
    <div>
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Mis citas</h1>
          <p style={s.sub}>
            Bienvenido, {user?.username || 'Cliente'}. Aquí puedes reservar con el veterinario de tu preferencia.
          </p>
        </div>

        <button style={s.btnAdd} onClick={abrirReserva}>
          <Plus size={16} />
          Reservar cita
        </button>
      </div>

      {proximaCita && (
        <div style={s.nextCard}>
          <div style={s.nextLeft}>
            <div style={s.nextIcon}>
              <CalendarDays size={24} />
            </div>

            <div>
              <p style={s.nextLabel}>Próxima cita</p>

              <h2 style={s.nextTitle}>
                {proximaCita.mascotaNombre} · {proximaCita.tipo}
              </h2>

              <p style={s.nextText}>
                {fechaTexto(proximaCita.fecha)} · {proximaCita.hora} · {proximaCita.veterinarioNombre}
              </p>
            </div>
          </div>

          <div style={s.nextActions}>
            <span
              style={{
                ...s.badge,
                background: estadoPagoStyle[proximaCita.estado_pago]?.bg,
                color: estadoPagoStyle[proximaCita.estado_pago]?.txt
              }}
            >
              {proximaCita.estado_pago === 'pagado' ? '✅ Pagado' : '⏳ Pago pendiente'}
            </span>

            {proximaCita.estado_pago === 'pendiente' ? (
              <button style={s.btnPagarHero} onClick={() => abrirPago(proximaCita)}>
                <CreditCard size={15} />
                Pagar ahora
              </button>
            ) : (
              <button style={s.btnDetalle} onClick={() => setModalDetalle(proximaCita)}>
                <ReceiptText size={15} />
                Ver comprobante
              </button>
            )}
          </div>
        </div>
      )}

      <div style={s.statsRow}>
        {[
          {
            label: 'Total citas',
            val: totalCitas,
            color: 'var(--primary)',
            icon: <CalendarDays size={18} />
          },
          {
            label: 'Mascotas registradas',
            val: mascotasRegistradas,
            color: '#3B82F6',
            icon: <PawPrint size={18} />
          },
          {
            label: 'Confirmadas',
            val: confirmadas,
            color: '#10B981',
            icon: <CheckCircle size={18} />
          },
          {
            label: 'Pendiente de pago',
            val: pendientesPago,
            color: '#F59E0B',
            icon: <CreditCard size={18} />
          }
        ].map((x, i) => (
          <div key={i} style={s.statCard}>
            <div style={{ ...s.statIcon, background: `${x.color}18`, color: x.color }}>
              {x.icon}
            </div>

            <div>
              <div style={{ fontSize: 25, fontWeight: 800, color: x.color }}>
                {x.val}
              </div>

              <div style={{ fontSize: 12, color: 'var(--text-sub)' }}>
                {x.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={s.vetSection}>
        <div style={s.sectionHeader}>
          <div>
            <h3 style={s.sectionTitle}>Veterinarios disponibles</h3>
            <p style={s.sectionSub}>
              Elige el profesional y revisa sus horarios antes de reservar.
            </p>
          </div>

          <span style={s.availableBadge}>
            <UserCheck size={14} />
            {vetActivos.length} activos
          </span>
        </div>

        <div style={s.vetGrid}>
          {vetActivos.map(v => (
            <div key={v.id_veterinario} style={s.vetPublicCard}>
              <div style={s.vetPublicTop}>
                <div style={s.vetPhotoBig}>
                  {v.foto || '🩺'}
                </div>

                <div style={{ flex: 1 }}>
                  <h4 style={s.vetPublicName}>
                    Dr(a). {v.nombre} {v.apellido}
                  </h4>

                  <p style={s.vetPublicSpecialty}>
                    {v.especialidad}
                  </p>

                  <span style={s.vetStatus}>
                    <span style={s.dotGreen}></span>
                    Disponible
                  </span>
                </div>
              </div>

              <div style={s.vetHoursBox}>
                <p style={s.vetHoursTitle}>Horarios disponibles</p>

                <div style={s.vetHoursList}>
                  {v.horarios?.slice(0, 5).map(h => (
                    <span key={h} style={s.hourChip}>
                      {h}
                    </span>
                  ))}
                </div>
              </div>

              <button style={s.btnVetReserve} onClick={() => abrirReservaConVeterinario(v)}>
                <Stethoscope size={15} />
                Agendar con este veterinario
              </button>
            </div>
          ))}
        </div>
      </div>

      <div style={s.tableWrap}>
        <div style={s.tableHeader}>
          <div>
            <h3 style={s.tableTitle}>Historial de citas</h3>
            <p style={s.tableSub}>Consulta el estado de tus reservas, veterinario asignado y pagos.</p>
          </div>
        </div>

        <div style={s.tableScroll}>
          <table style={s.table}>
            <thead>
              <tr>
                {['Fecha', 'Hora', 'Mascota', 'Servicio', 'Veterinario', 'Estado', 'Pago', 'Acción'].map(h => (
                  <th key={h} style={s.th}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {citasOrdenadas.map((c, i) => (
                <tr key={c.id_cita} style={i % 2 === 0 ? { background: '#FAFAFA' } : {}}>
                  <td style={s.td}>
                    <b>{fechaTexto(c.fecha)}</b>
                  </td>

                  <td style={s.td}>{c.hora}</td>

                  <td style={s.td}>
                    <div style={s.petCell}>
                      <span style={{ fontSize: 18 }}>
                        {c.especie === 'Perro'
                          ? '🐶'
                          : c.especie === 'Gato'
                          ? '🐱'
                          : c.especie === 'Conejo'
                          ? '🐰'
                          : '🐾'}
                      </span>

                      <b>{c.mascotaNombre}</b>
                    </div>
                  </td>

                  <td style={s.td}>{c.tipo}</td>

                  <td style={s.td}>
                    <div style={s.vetTable}>
                      <Stethoscope size={14} />
                      {c.veterinarioNombre}
                    </div>
                  </td>

                  <td style={s.td}>
                    <span
                      style={{
                        ...s.badge,
                        background: estadoCitaStyle[c.estado]?.bg,
                        color: estadoCitaStyle[c.estado]?.txt
                      }}
                    >
                      {c.estado}
                    </span>
                  </td>

                  <td style={s.td}>
                    <span
                      style={{
                        ...s.badge,
                        background: estadoPagoStyle[c.estado_pago]?.bg,
                        color: estadoPagoStyle[c.estado_pago]?.txt
                      }}
                    >
                      {c.estado_pago === 'pagado' ? '✅ Pagado' : '⏳ Pendiente'}
                    </span>
                  </td>

                  <td style={s.td}>
                    {c.estado_pago === 'pendiente' && c.estado !== 'Cancelada' ? (
                      <button style={s.btnPagar} onClick={() => abrirPago(c)}>
                        <QrCode size={13} />
                        Pagar S/{Number(c.monto || 0).toFixed(2)}
                      </button>
                    ) : (
                      <button style={s.btnMiniDetalle} onClick={() => setModalDetalle(c)}>
                        Ver detalle
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {citas.length === 0 && (
          <div style={s.empty}>
            <CalendarDays size={38} color="var(--text-muted)" />
            <p>No tienes citas registradas.</p>
            <button style={s.btnAdd} onClick={abrirReserva}>
              <Plus size={15} />
              Reservar primera cita
            </button>
          </div>
        )}
      </div>

      {modalNueva && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <div style={s.mHead}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                {['Servicio', 'Mascota', 'Veterinario', 'Horario'].map((label, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={s.stepBox}>
                      <div
                        style={{
                          ...s.stepCircle,
                          ...(paso > i
                            ? s.stepDone
                            : paso === i + 1
                            ? s.stepCurrent
                            : s.stepPending)
                        }}
                      >
                        {paso > i ? '✓' : i + 1}
                      </div>

                      <span
                        style={{
                          fontSize: 10,
                          color: paso === i + 1 ? 'var(--primary)' : 'var(--text-muted)',
                          fontWeight: paso === i + 1 ? 700 : 500
                        }}
                      >
                        {label}
                      </span>
                    </div>

                    {i < 3 && (
                      <div
                        style={{
                          width: 35,
                          height: 2,
                          background: paso > i + 1 ? 'var(--primary)' : 'var(--border)',
                          margin: '0 7px',
                          marginBottom: 16
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>

              <button
                style={s.closeBtn}
                onClick={() => {
                  setModalNueva(false)
                  resetForm()
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={s.mBody}>
              {paso === 1 && (
                <div>
                  <h3 style={s.mTitle}>¿Qué tipo de atención necesitas?</h3>

                  <div style={s.serviceGrid}>
                    {servicios.map(servicio => (
                      <div
                        key={servicio.id_servicio}
                        style={{
                          ...s.servicioCard,
                          ...(Number(form.id_servicio) === Number(servicio.id_servicio) ? s.servicioActive : {})
                        }}
                        onClick={() => setForm({ ...form, id_servicio: String(servicio.id_servicio) })}
                      >
                        <div style={{ fontSize: 25 }}>{tipoEmoji(servicio.nombre)}</div>

                        <div style={{ fontSize: 13, fontWeight: 700 }}>
                          {servicio.nombre}
                        </div>

                        <div style={s.priceText}>
                          S/ {Number(servicio.precio || 0).toFixed(2)}
                        </div>

                        {Number(form.id_servicio) === Number(servicio.id_servicio) && (
                          <div style={s.checkFloating}>✓</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {paso === 2 && (
                <div>
                  <h3 style={s.mTitle}>¿Para qué mascota es la cita?</h3>

                  <div style={s.optionList}>
                    {misMascotas.map(m => (
                      <div
                        key={m.id_mascota || m.idMascota}
                        style={{
                          ...s.mascotaOpt,
                          ...(Number(form.id_mascota) === Number(m.id_mascota || m.idMascota)
                            ? s.mascotaOptActive
                            : {})
                        }}
                        onClick={() =>
                          setForm({ ...form, id_mascota: String(m.id_mascota || m.idMascota) })
                        }
                      >
                        <span style={{ fontSize: 28 }}>
                          {m.especie === 'Perro' ? '🐶' : m.especie === 'Gato' ? '🐱' : '🐾'}
                        </span>

                        <div>
                          <div style={s.petName}>{m.nombre}</div>
                          <div style={s.petInfo}>
                            {m.raza || 'Sin raza'} · {m.edad ?? 0} años · {m.sexo || 'No registrado'}
                          </div>
                        </div>

                        {Number(form.id_mascota) === Number(m.id_mascota || m.idMascota) && (
                          <span style={s.selectedMark}>✓</span>
                        )}
                      </div>
                    ))}

                    {misMascotas.length > 0 && (
                      <button
                        type="button"
                        style={s.btnRegisterPet}
                        onClick={abrirModalMascota}
                      >
                        + Registrar otra mascota
                      </button>
                    )}

                    {misMascotas.length === 0 && (
                      <div style={s.emptySmall}>
                        <p style={{ marginBottom: 10 }}>
                          No tienes mascotas registradas.
                        </p>

                        <button
                          type="button"
                          style={s.btnRegisterPet}
                          onClick={abrirModalMascota}
                        >
                          + Registrar mi mascota
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {paso === 3 && (
                <div>
                  <h3 style={s.mTitle}>Elige el veterinario de tu preferencia</h3>

                  <div style={s.vetList}>
                    {vetActivos.map(v => (
                      <div
                        key={v.id_veterinario}
                        style={{
                          ...s.vetCard,
                          ...(Number(form.id_veterinario) === Number(v.id_veterinario)
                            ? s.vetActive
                            : {})
                        }}
                        onClick={() =>
                          setForm({
                            ...form,
                            id_veterinario: String(v.id_veterinario),
                            hora: ''
                          })
                        }
                      >
                        <div style={s.vetPhoto}>
                          {v.foto || '🩺'}
                        </div>

                        <div style={{ flex: 1 }}>
                          <div style={s.vetName}>
                            Dr(a). {v.nombre} {v.apellido}
                          </div>

                          <div style={s.vetSpecialty}>
                            {v.especialidad}
                          </div>

                          <div style={s.vetScheduleText}>
                            Horarios: {v.horarios?.join(' · ') || 'Sin horarios registrados'}
                          </div>
                        </div>

                        {Number(form.id_veterinario) === Number(v.id_veterinario) && (
                          <span style={s.selectedMark}>✓</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {paso === 4 && (
                <div style={s.stepContent}>
                  <h3 style={s.mTitle}>Elige fecha y horario</h3>

                  <div style={s.selectedVetBox}>
                    <div style={s.vetPhoto}>
                      {vetSel?.foto || '🩺'}
                    </div>

                    <div>
                      <b>Dr(a). {vetSel?.nombre} {vetSel?.apellido}</b>
                      <p>{vetSel?.especialidad}</p>
                    </div>
                  </div>

                  <div style={s.field}>
                    <label style={s.label}>Fecha *</label>

                    <input
                      style={s.input}
                      type="date"
                      value={form.fecha}
                      min={fechaHoy()}
                      onChange={e =>
                        setForm({ ...form, fecha: e.target.value, hora: '' })
                      }
                    />
                  </div>

                  {vetSel && (
                    <div>
                      <label style={s.label}>
                        Horarios disponibles — Dr(a). {vetSel.nombre} {vetSel.apellido}
                      </label>

                      <div style={s.horariosWrap}>
                        {vetSel.horarios.map(h => (
                          <div
                            key={h}
                            style={{
                              ...s.horarioSlot,
                              ...(form.hora === h ? s.horarioActive : {})
                            }}
                            onClick={() => setForm({ ...form, hora: h })}
                          >
                            <Clock size={12} />
                            {h}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {form.id_servicio && form.id_mascota && form.id_veterinario && form.fecha && form.hora && (
                    <div style={s.resumenPreview}>
                      <p style={s.resumenTitle}>Resumen de tu cita</p>

                      {[
                        ['Servicio', servicioSel?.nombre],
                        ['Mascota', mascotaById(Number(form.id_mascota))?.nombre],
                        [
                          'Veterinario',
                          vetSel
                            ? `Dr(a). ${vetSel.nombre} ${vetSel.apellido}`
                            : 'Por asignar'
                        ],
                        ['Fecha y hora', `${fechaTexto(form.fecha)} · ${form.hora}`],
                        ['Total', `S/ ${precio.toFixed(2)}`]
                      ].map(([k, v]) => (
                        <div key={k} style={s.resumenRow}>
                          <span>{k}</span>

                          <b style={k === 'Total' ? s.totalText : {}}>
                            {v}
                          </b>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div style={s.mFoot}>
              {paso > 1 && (
                <button style={s.btnBack} onClick={() => setPaso(p => p - 1)}>
                  ← Atrás
                </button>
              )}

              <div style={{ flex: 1 }} />

              {paso < 4 ? (
                <button
                  style={{
                    ...s.btnNext,
                    ...(!puedeAvanzar(paso, form) ? { opacity: 0.5 } : {})
                  }}
                  disabled={!puedeAvanzar(paso, form)}
                  onClick={() => setPaso(p => p + 1)}
                >
                  Siguiente <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  style={{
                    ...s.btnNext,
                    ...(!form.fecha || !form.hora ? { opacity: 0.5 } : {})
                  }}
                  disabled={!form.fecha || !form.hora}
                  onClick={handleReservar}
                >
                  Reservar →
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {modalMascota && (
        <div style={s.overlay}>
          <div style={{ ...s.modal, maxWidth: 520 }}>
            <div style={s.mHead}>
              <div>
                <h3 style={s.mTitle}>Registrar mi mascota</h3>
                <p style={s.sub}>
                  Completa los datos principales para poder reservar una cita.
                </p>
              </div>

              <button
                style={s.closeBtn}
                onClick={() => {
                  setModalMascota(false)
                  setMascotaForm(emptyMascotaForm)
                  setMascotaError('')
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={s.mBody}>
              <div style={s.field}>
                <label style={s.label}>Nombre de la mascota *</label>
                <input
                  style={s.input}
                  placeholder="Ej: Max"
                  value={mascotaForm.nombre}
                  onChange={e => setMascotaForm({ ...mascotaForm, nombre: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={s.field}>
                  <label style={s.label}>Especie</label>
                  <select
                    style={s.input}
                    value={mascotaForm.especie}
                    onChange={e => setMascotaForm({ ...mascotaForm, especie: e.target.value })}
                  >
                    <option>Perro</option>
                    <option>Gato</option>
                    <option>Conejo</option>
                    <option>Ave</option>
                    <option>Otro</option>
                  </select>
                </div>

                <div style={s.field}>
                  <label style={s.label}>Sexo</label>
                  <select
                    style={s.input}
                    value={mascotaForm.sexo}
                    onChange={e => setMascotaForm({ ...mascotaForm, sexo: e.target.value })}
                  >
                    <option>Macho</option>
                    <option>Hembra</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={s.field}>
                  <label style={s.label}>Raza</label>
                  <input
                    style={s.input}
                    placeholder="Ej: Labrador"
                    value={mascotaForm.raza}
                    onChange={e => setMascotaForm({ ...mascotaForm, raza: e.target.value })}
                  />
                </div>

                <div style={s.field}>
                  <label style={s.label}>Color</label>
                  <input
                    style={s.input}
                    placeholder="Ej: Dorado"
                    value={mascotaForm.color}
                    onChange={e => setMascotaForm({ ...mascotaForm, color: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={s.field}>
                  <label style={s.label}>Edad</label>
                  <input
                    style={s.input}
                    type="number"
                    min="0"
                    placeholder="Ej: 3"
                    value={mascotaForm.edad}
                    onChange={e => setMascotaForm({ ...mascotaForm, edad: e.target.value })}
                  />
                </div>

                <div style={s.field}>
                  <label style={s.label}>Peso</label>
                  <input
                    style={s.input}
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Ej: 24.5"
                    value={mascotaForm.peso}
                    onChange={e => setMascotaForm({ ...mascotaForm, peso: e.target.value })}
                  />
                </div>
              </div>

              <div style={s.field}>
                <label style={s.label}>Observaciones</label>
                <textarea
                  style={{
                    ...s.input,
                    minHeight: 80,
                    resize: 'vertical'
                  }}
                  placeholder="Ej: Es tranquilo, tiene alergias, etc."
                  value={mascotaForm.observaciones}
                  onChange={e => setMascotaForm({ ...mascotaForm, observaciones: e.target.value })}
                />
              </div>

              {mascotaError && (
                <div style={s.paymentError}>
                  <AlertCircle size={15} />
                  {mascotaError}
                </div>
              )}
            </div>

            <div style={s.mFoot}>
              <button
                style={s.btnBack}
                onClick={() => {
                  setModalMascota(false)
                  setMascotaForm(emptyMascotaForm)
                  setMascotaError('')
                }}
              >
                Cancelar
              </button>

              <div style={{ flex: 1 }} />

              <button style={s.btnNext} onClick={handleCrearMascotaCliente}>
                Guardar mascota
              </button>
            </div>
          </div>
        </div>
      )}

      {modalPago && (
        <div style={s.overlay}>
          <div style={{ ...s.modal, maxWidth: 470 }}>
            <div style={s.paymentHead}>
              <div style={s.paymentHeadLeft}>
                <div style={s.lockIcon}>
                  <ShieldCheck size={18} />
                </div>

                <div>
                  <div style={s.paymentTitle}>Pago seguro</div>
                  <div style={s.paymentSub}>Transacción cifrada SSL</div>
                </div>
              </div>

              {!pagoConfirmado && (
                <button
                  style={{ ...s.closeBtn, color: '#fff' }}
                  onClick={() => setModalPago(null)}
                >
                  <X size={18} />
                </button>
              )}
            </div>

            {pagoConfirmado ? (
              <div style={s.successPayment}>
                <div style={s.successIcon}>
                  <CheckCircle size={50} color="#10B981" />
                </div>

                <h2 style={s.successTitle}>¡Pago exitoso!</h2>

                <p style={s.successText}>
                  Tu cita de <b>{modalPago.tipo}</b> quedó confirmada y registrada como pagada.
                </p>

                <div style={s.transactionBox}>
                  <div style={s.transactionLabel}>N° de transacción</div>
                  <div style={s.transactionCode}>
                    VV-{Date.now().toString().slice(-8)}
                  </div>
                </div>

                <p style={s.transactionHint}>
                  Recibirás un correo de confirmación en breve.
                </p>
              </div>
            ) : (
              <div style={s.paymentBody}>
                <div style={s.resumenBox}>
                  {[
                    ['🐾 Mascota', modalPago.mascotaNombre],
                    ['🩺 Servicio', modalPago.tipo],
                    ['👨‍⚕️ Veterinario', modalPago.veterinarioNombre],
                    ['📅 Fecha', `${fechaTexto(modalPago.fecha)} · ${modalPago.hora}`]
                  ].map(([k, v]) => (
                    <div key={k} style={s.paymentRow}>
                      <span>{k}</span>
                      <b>{v}</b>
                    </div>
                  ))}

                  <div style={s.paymentTotal}>
                    <span>Total</span>
                    <span>S/ {Number(modalPago.monto || 0).toFixed(2)}</span>
                  </div>
                </div>

                <div style={s.methodGrid}>
                  {[
                    { id: 'yape', icon: '📱', label: 'Yape / Plin' },
                    { id: 'card', icon: '💳', label: 'Tarjeta' },
                    { id: 'trans', icon: '🏦', label: 'Transferencia' }
                  ].map(m => (
                    <div
                      key={m.id}
                      style={{
                        ...s.tabMetodo,
                        ...(metodoPago === m.id ? s.tabMetodoActive : {})
                      }}
                      onClick={() => cambiarMetodoPago(m.id)}
                    >
                      <div style={{ fontSize: 20 }}>{m.icon}</div>
                      <div style={s.methodLabel}>{m.label}</div>
                    </div>
                  ))}
                </div>

                {metodoPago === 'yape' && (
                  <div style={s.yapeBox}>
                    <div style={s.qrBox}>
                      <QRCodeCanvas
                        value={`vitalvet://pago?id=${modalPago.id_cita}&monto=${modalPago.monto}&servicio=${modalPago.tipo}`}
                        size={200}
                        level="H"
                        includeMargin={false}
                      />
                    </div>

                    <div style={s.payTags}>
                      <span style={s.yapeTag}>🟣 Yape</span>
                      <span style={s.plinTag}>🔵 Plin</span>
                    </div>

                    <p style={s.qrText}>
                      Escanea el QR con tu app. Número: <b>912 345 678</b>
                    </p>
                  </div>
                )}

                {metodoPago === 'card' && (
                  <div style={s.cardPay}>
                    <div style={s.creditCard}>
                      <div style={{ fontSize: 18 }}>▬▬</div>

                      <div style={s.cardNumber}>
                        {cardForm.numero || '•••• •••• •••• ••••'}
                      </div>

                      <div style={s.cardBottom}>
                        <span>{cardForm.nombre || 'NOMBRE APELLIDO'}</span>
                        <span>{cardForm.venc || 'MM/AA'}</span>
                      </div>
                    </div>

                    <div style={s.field}>
                      <label style={s.label}>Número de tarjeta</label>
                      <input
                        style={s.input}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        value={cardForm.numero}
                        onChange={e =>
                          setCardForm(p => ({
                            ...p,
                            numero: e.target.value
                              .replace(/\D/g, '')
                              .slice(0, 16)
                              .replace(/(.{4})/g, '$1 ')
                              .trim()
                          }))
                        }
                      />
                    </div>

                    <div style={s.field}>
                      <label style={s.label}>Nombre en tarjeta</label>
                      <input
                        style={s.input}
                        placeholder="CARLOS RAMIREZ"
                        value={cardForm.nombre}
                        onChange={e =>
                          setCardForm(p => ({ ...p, nombre: e.target.value.toUpperCase() }))
                        }
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div style={s.field}>
                        <label style={s.label}>Vencimiento</label>
                        <input
                          style={s.input}
                          placeholder="MM/AA"
                          maxLength={5}
                          value={cardForm.venc}
                          onChange={e => {
                            let v = e.target.value.replace(/\D/g, '')
                            if (v.length >= 2) v = v.slice(0, 2) + '/' + v.slice(2, 4)
                            setCardForm(p => ({ ...p, venc: v }))
                          }}
                        />
                      </div>

                      <div style={s.field}>
                        <label style={s.label}>CVV</label>
                        <input
                          style={s.input}
                          placeholder="•••"
                          maxLength={3}
                          type="password"
                          value={cardForm.cvv}
                          onChange={e =>
                            setCardForm(p => ({
                              ...p,
                              cvv: e.target.value.replace(/\D/g, '').slice(0, 3)
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>
                )}

                {metodoPago === 'trans' && (
                  <div style={s.transBox}>
                    <p style={s.transTitle}>Realiza la transferencia a:</p>

                    {[
                      ['Banco', 'BCP'],
                      ['Tipo de cuenta', 'Corriente'],
                      ['N° de cuenta', '191-12345678-0-54'],
                      ['CCI', '00219100123456780054'],
                      ['Titular', 'VitalVet Clínica Veterinaria'],
                      ['Monto exacto', `S/ ${Number(modalPago.monto || 0).toFixed(2)}`]
                    ].map(([k, v]) => (
                      <div key={k} style={s.transRow}>
                        <span>{k}</span>
                        <b style={k === 'Monto exacto' ? { color: 'var(--primary)' } : {}}>
                          {v}
                        </b>
                      </div>
                    ))}

                    <div style={s.warningBox}>
                      ⚠️ Guarda el número de operación y adjúntalo al confirmar.
                    </div>

                    <div style={s.field}>
                      <label style={s.label}>N° de operación</label>
                      <input
                        style={s.input}
                        placeholder="Ej: 1234567"
                        value={transferForm.operacion}
                        onChange={e =>
                          setTransferForm({
                            ...transferForm,
                            operacion: e.target.value.replace(/\s/g, '')
                          })
                        }
                      />
                    </div>
                  </div>
                )}

                {paymentError && (
                  <div style={s.paymentError}>
                    <AlertCircle size={15} />
                    {paymentError}
                  </div>
                )}

                <button style={s.btnPrimary} onClick={confirmarPago}>
                  ✅ Confirmar pago — S/ {Number(modalPago.monto || 0).toFixed(2)}
                </button>

                <p style={s.paymentFooter}>
                  🔒 Pago 100% seguro · Cifrado SSL · No almacenamos datos de tarjeta
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {modalDetalle && (
        <div style={s.overlay}>
          <div style={{ ...s.modal, maxWidth: 430 }}>
            <div style={s.mHead}>
              <div>
                <h3 style={s.mTitle}>Detalle de cita</h3>
                <p style={s.sub}>Información completa de tu atención.</p>
              </div>

              <button style={s.closeBtn} onClick={() => setModalDetalle(null)}>
                <X size={18} />
              </button>
            </div>

            <div style={s.detailBody}>
              {[
                ['Mascota', modalDetalle.mascotaNombre],
                ['Servicio', modalDetalle.tipo],
                ['Veterinario', modalDetalle.veterinarioNombre],
                ['Fecha', fechaTexto(modalDetalle.fecha)],
                ['Hora', modalDetalle.hora],
                ['Estado', modalDetalle.estado],
                ['Pago', modalDetalle.estado_pago === 'pagado' ? 'Pagado' : 'Pendiente'],
                ['Monto', `S/ ${Number(modalDetalle.monto || 0).toFixed(2)}`]
              ].map(([k, v]) => (
                <div key={k} style={s.detailRow}>
                  <span>{k}</span>
                  <b>{v}</b>
                </div>
              ))}

              {modalDetalle.estado_pago === 'pagado' && (
                <div style={s.comprobanteBox}>
                  <FileText size={20} />
                  <div>
                    <b>Comprobante generado</b>
                    <p>Esta cita ya fue pagada y confirmada.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const s = {
  loadingBox: {
    background: '#fff',
    border: '1px solid var(--border)',
    borderRadius: 16,
    padding: 40,
    boxShadow: 'var(--shadow)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 10,
    color: 'var(--text-sub)'
  },
  errorBox: {
    background: '#fff',
    border: '1px solid #FECACA',
    borderRadius: 16,
    padding: 40,
    boxShadow: 'var(--shadow)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 10,
    color: '#991B1B'
  },

  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 },
  title: { fontSize: 24, fontWeight: 800, color: 'var(--text-main)' },
  sub: { fontSize: 13, color: 'var(--text-sub)', marginTop: 4 },

  btnAdd: {
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    background: 'linear-gradient(135deg,var(--primary),var(--accent))',
    color: '#fff',
    border: 'none',
    borderRadius: 12,
    padding: '12px 20px',
    fontWeight: 800,
    fontSize: 13,
    cursor: 'pointer',
    boxShadow: '0 10px 22px rgba(232,97,44,.22)'
  },

  nextCard: {
    background: 'linear-gradient(135deg,#FFFFFF,#FFF8EE)',
    border: '1px solid var(--border)',
    borderRadius: 18,
    padding: 22,
    boxShadow: 'var(--shadow)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 18,
    marginBottom: 18
  },
  nextLeft: { display: 'flex', alignItems: 'center', gap: 16 },
  nextIcon: {
    width: 54,
    height: 54,
    borderRadius: 16,
    background: 'var(--primary-light)',
    color: 'var(--primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  nextLabel: { fontSize: 12, color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase', marginBottom: 3 },
  nextTitle: { fontSize: 19, fontWeight: 800, color: 'var(--text-main)' },
  nextText: { fontSize: 13, color: 'var(--text-sub)', marginTop: 3 },
  nextActions: { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end' },

  btnPagarHero: {
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    background: 'var(--primary)',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    padding: '10px 15px',
    fontWeight: 800,
    fontSize: 13,
    cursor: 'pointer'
  },
  btnDetalle: {
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    background: '#EFF6FF',
    color: '#2563EB',
    border: '1px solid #BFDBFE',
    borderRadius: 10,
    padding: '10px 15px',
    fontWeight: 800,
    fontSize: 13,
    cursor: 'pointer'
  },

  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 20 },
  statCard: {
    background: '#fff',
    borderRadius: 14,
    border: '1px solid var(--border)',
    padding: '18px 20px',
    boxShadow: 'var(--shadow)',
    display: 'flex',
    alignItems: 'center',
    gap: 14
  },
  statIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },

  vetSection: {
    background: '#fff',
    border: '1px solid var(--border)',
    borderRadius: 16,
    padding: 20,
    boxShadow: 'var(--shadow)',
    marginBottom: 20
  },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  sectionTitle: { fontSize: 17, fontWeight: 900, color: 'var(--text-main)' },
  sectionSub: { fontSize: 12, color: 'var(--text-sub)', marginTop: 3 },
  availableBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    background: '#D1FAE5',
    color: '#065F46',
    borderRadius: 999,
    padding: '6px 12px',
    fontSize: 12,
    fontWeight: 800
  },
  vetGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 },
  vetPublicCard: {
    border: '1px solid var(--border)',
    borderRadius: 14,
    padding: 15,
    background: '#FAFAFA',
    display: 'flex',
    flexDirection: 'column',
    gap: 12
  },
  vetPublicTop: { display: 'flex', gap: 12, alignItems: 'center' },
  vetPhotoBig: {
    width: 52,
    height: 52,
    borderRadius: 14,
    background: 'var(--primary-light)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 28,
    flexShrink: 0
  },
  vetPublicName: { fontSize: 14, fontWeight: 900, color: 'var(--text-main)' },
  vetPublicSpecialty: { fontSize: 12, color: 'var(--text-sub)', marginTop: 2 },
  vetStatus: { display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#059669', fontWeight: 800, marginTop: 5 },
  dotGreen: { width: 8, height: 8, borderRadius: '50%', background: '#22C55E' },
  vetHoursBox: { background: '#fff', border: '1px solid var(--border)', borderRadius: 11, padding: 10 },
  vetHoursTitle: { fontSize: 11, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 },
  vetHoursList: { display: 'flex', gap: 6, flexWrap: 'wrap' },
  hourChip: {
    background: 'var(--primary-light)',
    color: 'var(--primary)',
    borderRadius: 999,
    padding: '4px 9px',
    fontSize: 11,
    fontWeight: 800
  },
  btnVetReserve: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 7,
    background: 'var(--primary)',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    padding: '10px',
    fontWeight: 800,
    fontSize: 12,
    cursor: 'pointer'
  },

  tableWrap: {
    background: '#fff',
    borderRadius: 14,
    border: '1px solid var(--border)',
    overflow: 'hidden',
    boxShadow: 'var(--shadow)'
  },
  tableHeader: { padding: '18px 20px', borderBottom: '1px solid var(--border)' },
  tableTitle: { fontSize: 16, fontWeight: 800, color: 'var(--text-main)' },
  tableSub: { fontSize: 12, color: 'var(--text-sub)', marginTop: 3 },
  tableScroll: { width: '100%', overflowX: 'auto' },
  table: { width: '100%', minWidth: 850, borderCollapse: 'collapse' },
  th: {
    textAlign: 'left',
    padding: '12px 14px',
    fontSize: 11,
    color: 'var(--text-muted)',
    fontWeight: 800,
    textTransform: 'uppercase',
    background: '#F8FAFC',
    borderBottom: '1px solid var(--border)'
  },
  td: { padding: '13px 14px', fontSize: 13, borderBottom: '1px solid #F5F5F5', color: 'var(--text-main)' },
  petCell: { display: 'flex', alignItems: 'center', gap: 7 },
  vetTable: { display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-sub)', fontWeight: 700 },

  badge: { padding: '4px 11px', borderRadius: 20, fontSize: 11, fontWeight: 800, whiteSpace: 'nowrap' },
  btnPagar: {
    background: 'var(--primary-light)',
    border: '1px solid var(--primary)',
    color: 'var(--primary)',
    borderRadius: 9,
    padding: '6px 12px',
    fontSize: 12,
    fontWeight: 800,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 5
  },
  btnMiniDetalle: {
    background: '#F8FAFC',
    border: '1px solid var(--border)',
    color: 'var(--text-sub)',
    borderRadius: 8,
    padding: '6px 12px',
    fontSize: 12,
    fontWeight: 700,
    cursor: 'pointer'
  },
  empty: { padding: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, color: 'var(--text-muted)' },

  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
    padding: 16
  },
  modal: {
    background: '#fff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 590,
    boxShadow: '0 25px 60px rgba(0,0,0,0.22)',
    maxHeight: '92vh',
    overflowY: 'auto'
  },
  mHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '18px 22px', borderBottom: '1px solid var(--border)' },
  closeBtn: { background: 'transparent', border: 'none', color: 'var(--text-sub)', cursor: 'pointer', display: 'flex', alignItems: 'center' },
  stepBox: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 },
  stepCircle: { width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800 },
  stepDone: { background: 'var(--primary)', color: '#fff' },
  stepCurrent: { background: 'var(--primary-light)', color: 'var(--primary)', border: '2px solid var(--primary)' },
  stepPending: { background: 'var(--bg)', color: 'var(--text-muted)', border: '2px solid var(--border)' },
  mBody: { padding: 22 },
  mTitle: { fontSize: 17, fontWeight: 800, color: 'var(--text-main)', marginBottom: 14 },
  serviceGrid: { display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 },
  servicioCard: {
    border: '2px solid var(--border)',
    borderRadius: 12,
    padding: 15,
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    gap: 5,
    position: 'relative',
    transition: 'all 0.15s',
    background: '#fff'
  },
  servicioActive: { border: '2px solid var(--primary)', background: 'var(--primary-light)' },
  priceText: { fontSize: 12, color: 'var(--primary)', fontWeight: 800 },
  checkFloating: { position: 'absolute', top: 8, right: 10, color: 'var(--primary)', fontWeight: 900 },
  optionList: { display: 'flex', flexDirection: 'column', gap: 10 },
  mascotaOpt: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    border: '2px solid var(--border)',
    borderRadius: 12,
    cursor: 'pointer',
    transition: 'all 0.15s',
    background: '#fff'
  },
  mascotaOptActive: { border: '2px solid var(--primary)', background: 'var(--primary-light)' },
  petName: { fontWeight: 800, fontSize: 14 },
  petInfo: { fontSize: 12, color: 'var(--text-sub)', marginTop: 2 },
  selectedMark: { marginLeft: 'auto', color: 'var(--primary)', fontWeight: 900 },
  emptySmall: { color: 'var(--text-sub)', fontSize: 13, background: 'var(--bg)', padding: 14, borderRadius: 10 },
  btnRegisterPet: {
    background: 'var(--primary)',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    padding: '10px 14px',
    fontWeight: 800,
    cursor: 'pointer',
    width: '100%'
  },
  vetList: { display: 'flex', flexDirection: 'column', gap: 8, marginTop: 7 },
  vetCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 14px',
    border: '2px solid var(--border)',
    borderRadius: 12,
    cursor: 'pointer',
    transition: 'all 0.15s',
    background: '#fff'
  },
  vetActive: { border: '2px solid var(--primary)', background: 'var(--primary-light)' },
  vetPhoto: {
    fontSize: 24,
    width: 44,
    height: 44,
    background: 'var(--bg)',
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  vetName: { fontWeight: 800, fontSize: 13 },
  vetSpecialty: { fontSize: 11, color: 'var(--text-sub)' },
  vetScheduleText: { fontSize: 10, color: 'var(--primary)', fontWeight: 700, marginTop: 2 },
  stepContent: { display: 'flex', flexDirection: 'column', gap: 16 },
  selectedVetBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    background: 'var(--primary-light)',
    border: '1px solid #FFD6C7',
    borderRadius: 12,
    padding: 12,
    color: 'var(--text-main)'
  },
  field: { display: 'flex', flexDirection: 'column', gap: 5 },
  label: { fontSize: 12, fontWeight: 800, color: 'var(--text-sub)' },
  input: {
    padding: '10px 12px',
    border: '1px solid var(--border)',
    borderRadius: 9,
    fontSize: 13,
    background: '#FAFAFA',
    outline: 'none',
    width: '100%'
  },
  horariosWrap: { display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 7 },
  horarioSlot: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    padding: '8px 14px',
    border: '2px solid var(--border)',
    borderRadius: 9,
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600,
    background: '#fff',
    transition: 'all 0.15s'
  },
  horarioActive: { border: '2px solid var(--primary)', background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 800 },
  resumenPreview: {
    background: 'var(--bg)',
    borderRadius: 12,
    padding: '14px 16px',
    border: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    gap: 4
  },
  resumenTitle: { fontSize: 13, fontWeight: 800, color: 'var(--primary)', marginBottom: 6 },
  resumenRow: { display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '5px 0', color: 'var(--text-sub)' },
  totalText: { color: 'var(--primary)', fontSize: 15 },
  mFoot: { padding: '16px 22px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 },
  btnBack: {
    background: 'transparent',
    border: '1px solid var(--border)',
    borderRadius: 10,
    padding: '10px 18px',
    fontSize: 13,
    color: 'var(--text-sub)',
    cursor: 'pointer',
    fontWeight: 700
  },
  btnNext: {
    background: 'var(--primary)',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    padding: '11px 22px',
    fontSize: 13,
    fontWeight: 800,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    cursor: 'pointer'
  },

  paymentHead: { background: '#0F2027', borderRadius: '16px 16px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 22px' },
  paymentHeadLeft: { display: 'flex', alignItems: 'center', gap: 10 },
  lockIcon: { width: 34, height: 34, borderRadius: 9, background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  paymentTitle: { fontSize: 14, fontWeight: 800, color: '#fff' },
  paymentSub: { fontSize: 11, color: 'rgba(255,255,255,0.55)' },
  paymentBody: { padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 14 },
  resumenBox: { background: 'var(--bg)', borderRadius: 12, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8, border: '1px solid var(--border)' },
  paymentRow: { display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-sub)' },
  paymentTotal: { borderTop: '1px solid var(--border)', paddingTop: 10, display: 'flex', justifyContent: 'space-between', fontSize: 17, fontWeight: 900, color: 'var(--primary)' },
  methodGrid: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 },
  tabMetodo: { border: '2px solid var(--border)', borderRadius: 12, padding: '10px 6px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer', transition: 'all 0.15s' },
  tabMetodoActive: { border: '2px solid var(--primary)', background: 'var(--primary-light)' },
  methodLabel: { fontSize: 11, fontWeight: 800 },
  yapeBox: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 },
  qrBox: { background: '#fff', padding: 16, borderRadius: 16, border: '2px solid #E5E7EB', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', display: 'flex', justifyContent: 'center' },
  payTags: { display: 'flex', gap: 8 },
  yapeTag: { background: '#6D28D9', color: '#fff', padding: '5px 16px', borderRadius: 99, fontSize: 12, fontWeight: 800 },
  plinTag: { background: '#06B6D4', color: '#fff', padding: '5px 16px', borderRadius: 99, fontSize: 12, fontWeight: 800 },
  qrText: { fontSize: 12, color: 'var(--text-sub)', textAlign: 'center' },
  cardPay: { display: 'flex', flexDirection: 'column', gap: 12 },
  creditCard: { background: 'linear-gradient(135deg,#00695C,#00897B)', borderRadius: 14, padding: '18px 20px', color: '#fff', display: 'flex', flexDirection: 'column', gap: 10 },
  cardNumber: { fontSize: 15, letterSpacing: 3, fontFamily: 'monospace', fontWeight: 800 },
  cardBottom: { display: 'flex', justifyContent: 'space-between', fontSize: 12, opacity: 0.85 },
  transBox: { display: 'flex', flexDirection: 'column', gap: 10 },
  transTitle: { fontSize: 13, fontWeight: 800 },
  transRow: { display: 'flex', justifyContent: 'space-between', padding: '7px 0', fontSize: 13, color: 'var(--text-sub)' },
  warningBox: { background: '#FFFBEA', border: '1px solid #FDE68A', borderRadius: 10, padding: '10px 12px', fontSize: 12, color: '#92400E' },

  paymentError: {
    background: '#FEE2E2',
    color: '#991B1B',
    border: '1px solid #FECACA',
    borderRadius: 10,
    padding: '10px 12px',
    fontSize: 12,
    fontWeight: 800,
    display: 'flex',
    alignItems: 'center',
    gap: 7
  },

  btnPrimary: { background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 12, padding: 14, fontWeight: 900, fontSize: 14, width: '100%', cursor: 'pointer' },
  paymentFooter: { fontSize: 11, color: 'var(--text-muted)', textAlign: 'center' },
  successPayment: { padding: '36px 28px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, textAlign: 'center' },
  successIcon: { width: 82, height: 82, borderRadius: '50%', background: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  successTitle: { fontSize: 21, fontWeight: 900, color: 'var(--text-main)' },
  successText: { fontSize: 13, color: 'var(--text-sub)', maxWidth: 290, lineHeight: 1.6 },
  transactionBox: { background: 'var(--bg)', borderRadius: 12, padding: '12px 24px', border: '2px dashed var(--border)', textAlign: 'center' },
  transactionLabel: { fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 },
  transactionCode: { fontWeight: 900, fontSize: 15, color: 'var(--primary)', letterSpacing: 2 },
  transactionHint: { fontSize: 11, color: 'var(--text-muted)' },

  detailBody: { padding: 22, display: 'flex', flexDirection: 'column', gap: 10 },
  detailRow: { display: 'flex', justifyContent: 'space-between', padding: '9px 0', fontSize: 13, color: 'var(--text-sub)' },
  comprobanteBox: { marginTop: 10, background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#065F46', borderRadius: 12, padding: 14, display: 'flex', gap: 12, alignItems: 'center' }
}
