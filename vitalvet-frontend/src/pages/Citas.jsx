import { useEffect, useState } from 'react'
import {
  Plus,
  Search,
  X,
  FileText,
  Eye,
  CalendarDays,
  Clock,
  Stethoscope,
  UserRound,
  CreditCard,
  CheckCircle,
  AlertCircle,
  UserCheck,
  Filter
} from 'lucide-react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

import {
  getCitas,
  crearCita,
  cambiarEstadoCita as cambiarEstadoCitaService
} from '../services/citasService'

import {
  getClientes
} from '../services/clientesService'

import {
  getMascotas
} from '../services/mascotasService'

import {
  getVeterinariosActivos
} from '../services/veterinariosService'

import {
  getServiciosActivos
} from '../services/serviciosService'

const emptyForm = {
  id_cliente: '',
  id_mascota: '',
  id_veterinario: '',
  id_servicio: '',
  fecha: '',
  hora: '',
  estado: 'Pendiente',
  estado_pago: 'pendiente',
  monto: 0
}

const fechaHoy = () => new Date().toISOString().split('T')[0]

const iconoEspecie = (especie) => {
  if (especie === 'Perro') return '🐶'
  if (especie === 'Gato') return '🐱'
  if (especie === 'Conejo') return '🐰'
  if (especie === 'Ave') return '🐦'
  return '🐾'
}

const formatFecha = (fecha) => {
  if (!fecha) return 'Sin fecha'
  const [year, month, day] = fecha.split('-')
  if (!year || !month || !day) return fecha
  return `${day}/${month}/${year}`
}

const nombreVet = (v) => `Dr(a). ${v?.nombre || ''} ${v?.apellido || ''}`.trim()

const normalizarVet = (v) => ({
  ...v,
  id_veterinario: v.id_veterinario || v.idVeterinario,
  idVeterinario: v.idVeterinario || v.id_veterinario,
  foto: v.foto || '🩺',
  horarios: Array.isArray(v.horarios) && v.horarios.length > 0
    ? v.horarios
    : ['09:00', '10:30', '12:00', '15:00']
})

export default function Citas() {
  const [citas, setCitas] = useState([])
  const [clientes, setClientes] = useState([])
  const [mascotas, setMascotas] = useState([])
  const [veterinarios, setVeterinarios] = useState([])
  const [servicios, setServicios] = useState([])

  const [loading, setLoading] = useState(true)
  const [errorPage, setErrorPage] = useState('')

  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('Todos')
  const [filtroPago, setFiltroPago] = useState('Todos')
  const [filtroVeterinario, setFiltroVeterinario] = useState('Todos')
  const [modalNueva, setModalNueva] = useState(false)
  const [modalDetalle, setModalDetalle] = useState(null)
  const [form, setForm] = useState(emptyForm)

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true)
        setErrorPage('')

        const [
          dataCitas,
          dataClientes,
          dataMascotas,
          dataVeterinarios,
          dataServicios
        ] = await Promise.all([
          getCitas(),
          getClientes(),
          getMascotas(),
          getVeterinariosActivos(),
          getServiciosActivos()
        ])

        setCitas(dataCitas)
        setClientes(dataClientes)
        setMascotas(dataMascotas)
        setVeterinarios(dataVeterinarios.map(normalizarVet))
        setServicios(dataServicios)
      } catch (error) {
        setErrorPage(error.message || 'Error al cargar citas.')
      } finally {
        setLoading(false)
      }
    }

    cargarDatos()
  }, [])

  const clienteById = (id) =>
    clientes.find(c => Number(c.id_cliente || c.idCliente) === Number(id))

  const mascotaById = (id) =>
    mascotas.find(m => Number(m.id_mascota || m.idMascota) === Number(id))

  const veterinarioById = (id) =>
    veterinarios.find(v => Number(v.id_veterinario || v.idVeterinario) === Number(id))

  const servicioById = (id) =>
    servicios.find(sv => Number(sv.id_servicio || sv.idServicio) === Number(id))

  const mascotasDelCliente = mascotas.filter(m =>
    Number(m.id_cliente || m.idCliente) === Number(form.id_cliente)
  )

  const servicioSeleccionado = servicioById(form.id_servicio)

  const normalizarCita = (cita) => {
    const idCliente = cita.id_cliente || cita.idCliente
    const idMascota = cita.id_mascota || cita.idMascota
    const idVeterinario = cita.id_veterinario || cita.idVeterinario
    const idServicio = cita.id_servicio || cita.idServicio

    const cliente = clienteById(idCliente)
    const mascota = mascotaById(idMascota)
    const veterinario = veterinarioById(idVeterinario)
    const servicio = servicioById(idServicio)

    return {
      ...cita,
      id_cita: cita.id_cita || cita.idCita,
      id_cliente: idCliente,
      id_mascota: idMascota,
      id_veterinario: idVeterinario,
      id_servicio: idServicio,
      estado_pago: cita.estado_pago || cita.estadoPago || 'pendiente',
      mascotaNombre: mascota?.nombre || 'Sin mascota',
      especie: mascota?.especie || 'Otro',
      clienteNombre: cliente ? `${cliente.nombre} ${cliente.apellido}` : 'Sin cliente',
      veterinarioNombre: veterinario ? nombreVet(veterinario) : 'Sin veterinario',
      tipo: servicio?.nombre || cita.motivo || 'Servicio veterinario',
      monto: Number(cita.monto || servicio?.precio || 0)
    }
  }

  const citasNormalizadas = citas.map(normalizarCita)

  const filtered = citasNormalizadas.filter(c => {
    const texto = `${c.mascotaNombre} ${c.clienteNombre} ${c.veterinarioNombre} ${c.tipo}`.toLowerCase()

    const matchBusqueda = texto.includes(busqueda.toLowerCase())
    const matchEstado = filtroEstado === 'Todos' || c.estado === filtroEstado
    const matchPago = filtroPago === 'Todos' || c.estado_pago === filtroPago
    const matchVet = filtroVeterinario === 'Todos' || c.veterinarioNombre.includes(filtroVeterinario)

    return matchBusqueda && matchEstado && matchPago && matchVet
  })

  const totalCitas = citas.length
  const confirmadas = citasNormalizadas.filter(c => c.estado === 'Confirmada').length
  const pendientes = citasNormalizadas.filter(c => c.estado === 'Pendiente').length
  const pagosPendientes = citasNormalizadas.filter(c => c.estado_pago === 'pendiente').length

  const abrirModalNueva = () => {
    setForm({
      ...emptyForm,
      id_cliente: clientes[0]?.id_cliente || '',
      id_veterinario: veterinarios[0]?.id_veterinario || '',
      id_servicio: servicios[0]?.id_servicio || '',
      monto: Number(servicios[0]?.precio || 0)
    })
    setModalNueva(true)
  }

  const handleGuardar = async () => {
    if (
      !form.id_cliente ||
      !form.id_mascota ||
      !form.id_veterinario ||
      !form.id_servicio ||
      !form.fecha ||
      !form.hora
    ) {
      alert('Completa cliente, mascota, veterinario, servicio, fecha y hora.')
      return
    }

    if (form.fecha < fechaHoy()) {
      alert('No puedes registrar una cita en una fecha anterior a hoy.')
      return
    }

    if (!form.estado) {
      alert('Selecciona el estado de la cita.')
      return
    }

    if (!form.estado_pago) {
      alert('Selecciona el estado de pago.')
      return
    }

    if (Number(form.monto) < 0) {
      alert('El monto no puede ser negativo.')
      return
    }

    const servicio = servicioById(form.id_servicio)

    const nueva = {
      id_cliente: Number(form.id_cliente),
      id_mascota: Number(form.id_mascota),
      id_veterinario: Number(form.id_veterinario),
      id_servicio: Number(form.id_servicio),
      fecha: form.fecha,
      hora: form.hora,
      estado: form.estado,
      estado_pago: form.estado_pago,
      monto: Number(form.monto) || Number(servicio?.precio || 0),
      motivo: servicio?.nombre || 'Cita veterinaria'
    }

    try {
      const nuevaCita = await crearCita(nueva)

      setCitas(prev => [...prev, nuevaCita])
      setModalNueva(false)
      setForm(emptyForm)
    } catch (error) {
      alert(error.message || 'No se pudo registrar la cita.')
    }
  }

  const cambiarEstadoCitaLocal = async (id, nuevoEstado) => {
    try {
      const actualizada = await cambiarEstadoCitaService(id, nuevoEstado)

      setCitas(prev =>
        prev.map(c =>
          Number(c.id_cita || c.idCita) === Number(id)
            ? actualizada
            : c
        )
      )

      if (Number(modalDetalle?.id_cita) === Number(id)) {
        setModalDetalle(prev => ({ ...prev, estado: nuevoEstado }))
      }
    } catch (error) {
      alert(error.message || 'No se pudo cambiar el estado de la cita.')
    }
  }

  const exportarPDF = () => {
    const doc = new jsPDF()

    doc.setFontSize(18)
    doc.text('Reporte de Citas - VitalVet', 14, 20)

    doc.setFontSize(11)
    doc.setTextColor(100)

    const fechaActual = new Date().toLocaleDateString('es-PE')
    doc.text(`Generado el: ${fechaActual}`, 14, 28)

    const tableColumn = [
      'Mascota',
      'Servicio',
      'Cliente',
      'Veterinario',
      'Fecha',
      'Hora',
      'Estado',
      'Pago',
      'Monto'
    ]

    const tableRows = filtered.map(c => [
      c.mascotaNombre,
      c.tipo,
      c.clienteNombre,
      c.veterinarioNombre,
      formatFecha(c.fecha),
      c.hora,
      c.estado,
      c.estado_pago === 'pagado' ? 'Pagado' : 'Pendiente',
      `S/ ${Number(c.monto || 0).toFixed(2)}`
    ])

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 35,
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [232, 97, 44] },
      alternateRowStyles: { fillColor: [248, 250, 252] }
    })

    doc.save(`Citas_VitalVet_${Date.now()}.pdf`)
  }

  const estadoCitaStyle = {
    Confirmada: { background: '#D1FAE5', color: '#065F46' },
    Pendiente: { background: '#FEF3C7', color: '#92400E' },
    Cancelada: { background: '#FEE2E2', color: '#991B1B' }
  }

  const estadoPagoStyle = {
    pagado: { background: '#D1FAE5', color: '#065F46' },
    pendiente: { background: '#FEE2E2', color: '#991B1B' }
  }

  if (loading) {
    return (
      <div style={s.loadingBox}>
        <CalendarDays size={34} color="var(--primary)" />
        <h3>Cargando citas...</h3>
        <p>Estamos preparando la información del sistema.</p>
      </div>
    )
  }

  if (errorPage) {
    return (
      <div style={s.errorBox}>
        <AlertCircle size={34} color="#DC2626" />
        <h3>Error al cargar citas</h3>
        <p>{errorPage}</p>
      </div>
    )
  }

  return (
    <div>
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Citas</h1>
          <p style={s.sub}>
            Administra las citas, veterinarios asignados, horarios y estado de pagos.
          </p>
        </div>

        <div style={s.headerActions}>
          <button style={s.btnExportar} onClick={exportarPDF}>
            <FileText size={15} />
            Exportar reporte
          </button>

          <button style={s.btnAdd} onClick={abrirModalNueva}>
            <Plus size={15} />
            Registrar cita
          </button>
        </div>
      </div>

      <div style={s.statsGrid}>
        <div style={s.statCard}>
          <div style={{ ...s.statIcon, background: 'var(--primary-light)', color: 'var(--primary)' }}>
            <CalendarDays size={20} />
          </div>

          <div>
            <div style={s.statNumber}>{totalCitas}</div>
            <div style={s.statLabel}>Total citas</div>
          </div>
        </div>

        <div style={s.statCard}>
          <div style={{ ...s.statIcon, background: '#D1FAE5', color: '#059669' }}>
            <CheckCircle size={20} />
          </div>

          <div>
            <div style={s.statNumber}>{confirmadas}</div>
            <div style={s.statLabel}>Confirmadas</div>
          </div>
        </div>

        <div style={s.statCard}>
          <div style={{ ...s.statIcon, background: '#FEF3C7', color: '#D97706' }}>
            <AlertCircle size={20} />
          </div>

          <div>
            <div style={s.statNumber}>{pendientes}</div>
            <div style={s.statLabel}>Pendientes</div>
          </div>
        </div>

        <div style={s.statCard}>
          <div style={{ ...s.statIcon, background: '#FEE2E2', color: '#DC2626' }}>
            <CreditCard size={20} />
          </div>

          <div>
            <div style={s.statNumber}>{pagosPendientes}</div>
            <div style={s.statLabel}>Pagos pendientes</div>
          </div>
        </div>
      </div>

      <div style={s.vetSection}>
        <div style={s.sectionHeader}>
          <div>
            <h3 style={s.sectionTitle}>Veterinarios disponibles hoy</h3>
            <p style={s.sectionSub}>
              Revisa los profesionales activos y sus horarios asignados.
            </p>
          </div>

          <span style={s.availableBadge}>
            <UserCheck size={14} />
            {veterinarios.length} activos
          </span>
        </div>

        <div style={s.vetGrid}>
          {veterinarios.map(v => (
            <div key={v.id_veterinario} style={s.vetCard}>
              <div style={s.vetTop}>
                <div style={s.vetAvatar}>{v.foto || '🩺'}</div>

                <div>
                  <h4 style={s.vetName}>
                    {nombreVet(v)}
                  </h4>

                  <p style={s.vetSpec}>{v.especialidad}</p>

                  <span style={s.vetStatus}>
                    <span style={s.dotGreen}></span>
                    Disponible
                  </span>
                </div>
              </div>

              <div style={s.hoursBox}>
                <p style={s.hoursTitle}>Horarios</p>

                <div style={s.hoursList}>
                  {v.horarios.map(h => (
                    <span key={h} style={s.hourChip}>
                      {h}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={s.toolbar}>
        <div style={s.searchWrap}>
          <Search size={15} style={s.searchIcon} />

          <input
            style={s.searchInput}
            placeholder="Buscar por mascota, cliente, veterinario o servicio..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
        </div>

        <div style={s.filterBox}>
          <Filter size={14} color="var(--text-muted)" />

          <select
            style={s.select}
            value={filtroEstado}
            onChange={e => setFiltroEstado(e.target.value)}
          >
            <option>Todos</option>
            <option>Confirmada</option>
            <option>Pendiente</option>
            <option>Cancelada</option>
          </select>

          <select
            style={s.select}
            value={filtroPago}
            onChange={e => setFiltroPago(e.target.value)}
          >
            <option>Todos</option>
            <option value="pagado">Pagado</option>
            <option value="pendiente">Pendiente</option>
          </select>

          <select
            style={s.select}
            value={filtroVeterinario}
            onChange={e => setFiltroVeterinario(e.target.value)}
          >
            <option>Todos</option>

            {veterinarios.map(v => (
              <option key={v.id_veterinario} value={nombreVet(v)}>
                {nombreVet(v)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={s.tableWrap}>
        <div style={s.tableHeader}>
          <div>
            <h3 style={s.tableTitle}>Listado de citas</h3>
            <p style={s.tableSub}>{filtered.length} resultado(s) encontrados</p>
          </div>
        </div>

        <div style={s.tableScroll}>
          <table style={s.table}>
            <thead>
              <tr>
                {[
                  'Mascota',
                  'Servicio',
                  'Propietario',
                  'Veterinario',
                  'Fecha',
                  'Hora',
                  'Estado cita',
                  'Pago',
                  'Acciones'
                ].map(h => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filtered.map((c, i) => (
                <tr key={c.id_cita} style={i % 2 === 0 ? s.trEven : {}}>
                  <td style={s.td}>
                    <div style={s.petCell}>
                      <span style={s.petEmoji}>{iconoEspecie(c.especie)}</span>

                      <div>
                        <b>{c.mascotaNombre}</b>
                        <div style={s.petSub}>{c.especie}</div>
                      </div>
                    </div>
                  </td>

                  <td style={s.td}>{c.tipo}</td>

                  <td style={s.td}>
                    <div style={s.iconText}>
                      <UserRound size={14} />
                      {c.clienteNombre}
                    </div>
                  </td>

                  <td style={s.td}>
                    <div style={s.iconText}>
                      <Stethoscope size={14} />
                      {c.veterinarioNombre}
                    </div>
                  </td>

                  <td style={s.td}>
                    <b>{formatFecha(c.fecha)}</b>
                  </td>

                  <td style={s.td}>{c.hora}</td>

                  <td style={s.td}>
                    <select
                      style={{
                        ...s.estadoSelect,
                        ...(estadoCitaStyle[c.estado] || {})
                      }}
                      value={c.estado}
                      onChange={e => cambiarEstadoCitaLocal(c.id_cita, e.target.value)}
                    >
                      <option>Confirmada</option>
                      <option>Pendiente</option>
                      <option>Cancelada</option>
                    </select>
                  </td>

                  <td style={s.td}>
                    <span style={{ ...s.badge, ...(estadoPagoStyle[c.estado_pago] || {}) }}>
                      {c.estado_pago === 'pagado' ? '✅ Pagado' : '⏳ Pendiente'}
                    </span>
                  </td>

                  <td style={s.td}>
                    <button style={s.btnView} onClick={() => setModalDetalle(c)}>
                      <Eye size={13} />
                      Ver
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div style={s.empty}>
            <CalendarDays size={38} color="var(--text-muted)" />
            <p>No se encontraron citas.</p>
          </div>
        )}
      </div>

      {modalNueva && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <div style={s.modalHeader}>
              <div>
                <h3 style={s.modalTitle}>Registrar nueva cita</h3>
                <p style={s.modalSub}>
                  Agenda una cita manual desde administración.
                </p>
              </div>

              <button style={s.closeBtn} onClick={() => setModalNueva(false)}>
                <X size={18} />
              </button>
            </div>

            <div style={s.modalBody}>
              <div style={s.field}>
                <label style={s.label}>Cliente *</label>
                <select
                  style={s.input}
                  value={form.id_cliente}
                  onChange={e =>
                    setForm({
                      ...form,
                      id_cliente: e.target.value,
                      id_mascota: ''
                    })
                  }
                >
                  <option value="">Selecciona cliente</option>
                  {clientes.map(c => (
                    <option key={c.id_cliente} value={c.id_cliente}>
                      {c.nombre} {c.apellido} — DNI {c.dni}
                    </option>
                  ))}
                </select>
              </div>

              <div style={s.row2}>
                <div style={s.field}>
                  <label style={s.label}>Mascota *</label>
                  <select
                    style={s.input}
                    value={form.id_mascota}
                    onChange={e => setForm({ ...form, id_mascota: e.target.value })}
                  >
                    <option value="">Selecciona mascota</option>
                    {mascotasDelCliente.map(m => (
                      <option key={m.id_mascota} value={m.id_mascota}>
                        {m.nombre} — {m.especie}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={s.field}>
                  <label style={s.label}>Servicio *</label>
                  <select
                    style={s.input}
                    value={form.id_servicio}
                    onChange={e => {
                      const servicio = servicioById(e.target.value)

                      setForm({
                        ...form,
                        id_servicio: e.target.value,
                        monto: Number(servicio?.precio || 0)
                      })
                    }}
                  >
                    <option value="">Selecciona servicio</option>
                    {servicios.map(servicio => (
                      <option key={servicio.id_servicio} value={servicio.id_servicio}>
                        {servicio.nombre} — S/ {Number(servicio.precio || 0).toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={s.field}>
                <label style={s.label}>Veterinario asignado *</label>
                <select
                  style={s.input}
                  value={form.id_veterinario}
                  onChange={e => setForm({ ...form, id_veterinario: e.target.value })}
                >
                  <option value="">Selecciona veterinario</option>
                  {veterinarios.map(v => (
                    <option key={v.id_veterinario} value={v.id_veterinario}>
                      {nombreVet(v)} — {v.especialidad}
                    </option>
                  ))}
                </select>
              </div>

              <div style={s.row2}>
                <div style={s.field}>
                  <label style={s.label}>Fecha *</label>
                  <input
                    style={s.input}
                    type="date"
                    min={fechaHoy()}
                    value={form.fecha}
                    onChange={e => setForm({ ...form, fecha: e.target.value })}
                  />
                </div>

                <div style={s.field}>
                  <label style={s.label}>Hora *</label>
                  <input
                    style={s.input}
                    type="time"
                    value={form.hora}
                    onChange={e => setForm({ ...form, hora: e.target.value })}
                  />
                </div>
              </div>

              <div style={s.row2}>
                <div style={s.field}>
                  <label style={s.label}>Estado de cita</label>
                  <select
                    style={s.input}
                    value={form.estado}
                    onChange={e => setForm({ ...form, estado: e.target.value })}
                  >
                    <option>Pendiente</option>
                    <option>Confirmada</option>
                    <option>Cancelada</option>
                  </select>
                </div>

                <div style={s.field}>
                  <label style={s.label}>Estado de pago</label>
                  <select
                    style={s.input}
                    value={form.estado_pago}
                    onChange={e => setForm({ ...form, estado_pago: e.target.value })}
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="pagado">Pagado</option>
                  </select>
                </div>
              </div>

              <div style={s.field}>
                <label style={s.label}>Monto</label>
                <input
                  style={s.input}
                  type="number"
                  min="0"
                  placeholder="Ej: 50"
                  value={form.monto}
                  onChange={e => setForm({ ...form, monto: e.target.value })}
                />
              </div>
            </div>

            <div style={s.modalFooter}>
              <button style={s.btnCancel} onClick={() => setModalNueva(false)}>
                Cancelar
              </button>

              <button style={s.btnSave} onClick={handleGuardar}>
                Agendar cita
              </button>
            </div>
          </div>
        </div>
      )}

      {modalDetalle && (
        <div style={s.overlay}>
          <div style={{ ...s.modal, maxWidth: 540 }}>
            <div style={s.modalHeader}>
              <div>
                <h3 style={s.modalTitle}>Detalle de cita</h3>
                <p style={s.modalSub}>
                  Información completa de la cita seleccionada.
                </p>
              </div>

              <button style={s.closeBtn} onClick={() => setModalDetalle(null)}>
                <X size={18} />
              </button>
            </div>

            <div style={s.detailBody}>
              <div style={s.detailHero}>
                <div style={s.detailIcon}>
                  {iconoEspecie(modalDetalle.especie)}
                </div>

                <div>
                  <h2 style={s.detailTitle}>{modalDetalle.mascotaNombre}</h2>
                  <p style={s.detailSub}>{modalDetalle.tipo}</p>

                  <span style={{ ...s.badge, ...(estadoCitaStyle[modalDetalle.estado] || {}) }}>
                    {modalDetalle.estado}
                  </span>
                </div>
              </div>

              <div style={s.detailGrid}>
                <div style={s.detailBox}>
                  <UserRound size={17} color="var(--primary)" />
                  <span>Propietario</span>
                  <b>{modalDetalle.clienteNombre}</b>
                </div>

                <div style={s.detailBox}>
                  <Stethoscope size={17} color="var(--primary)" />
                  <span>Veterinario</span>
                  <b>{modalDetalle.veterinarioNombre}</b>
                </div>

                <div style={s.detailBox}>
                  <CalendarDays size={17} color="var(--primary)" />
                  <span>Fecha</span>
                  <b>{formatFecha(modalDetalle.fecha)}</b>
                </div>

                <div style={s.detailBox}>
                  <Clock size={17} color="var(--primary)" />
                  <span>Hora</span>
                  <b>{modalDetalle.hora}</b>
                </div>
              </div>

              <div style={s.paymentBox}>
                <div>
                  <span style={s.paymentLabel}>Estado de pago</span>

                  <div style={{ marginTop: 6 }}>
                    <span style={{ ...s.badge, ...(estadoPagoStyle[modalDetalle.estado_pago] || {}) }}>
                      {modalDetalle.estado_pago === 'pagado' ? '✅ Pagado' : '⏳ Pendiente'}
                    </span>
                  </div>
                </div>

                <div style={s.amountBox}>
                  <span>Monto</span>
                  <b>S/ {Number(modalDetalle.monto || 0).toFixed(2)}</b>
                </div>
              </div>

              <div style={s.adminBox}>
                <b>Acción administrativa:</b>
                <p>
                  Desde esta vista el administrador supervisa la cita y puede cambiar su estado.
                  El pago lo realiza el cliente desde su portal.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
const s = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 22
  },

  title: {
    fontSize: 24,
    fontWeight: 800,
    color: 'var(--text-main)'
  },

  sub: {
    fontSize: 13,
    color: 'var(--text-sub)',
    marginTop: 4
  },

  headerActions: {
    display: 'flex',
    gap: 10
  },

  btnExportar: {
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    background: '#fff',
    color: 'var(--text-main)',
    border: '1px solid var(--border)',
    borderRadius: 11,
    padding: '11px 18px',
    fontWeight: 800,
    fontSize: 13,
    cursor: 'pointer',
    boxShadow: 'var(--shadow)'
  },

  btnAdd: {
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    background: 'linear-gradient(135deg,var(--primary),var(--accent))',
    color: '#fff',
    border: 'none',
    borderRadius: 11,
    padding: '11px 18px',
    fontWeight: 800,
    fontSize: 13,
    cursor: 'pointer',
    boxShadow: '0 10px 22px rgba(232,97,44,.22)'
  },

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

  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 14,
    marginBottom: 20
  },

  statCard: {
    background: '#fff',
    border: '1px solid var(--border)',
    borderRadius: 14,
    padding: 18,
    boxShadow: 'var(--shadow)',
    display: 'flex',
    alignItems: 'center',
    gap: 13
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

  statNumber: {
    fontSize: 25,
    fontWeight: 900,
    color: 'var(--text-main)'
  },

  statLabel: {
    fontSize: 12,
    color: 'var(--text-sub)',
    marginTop: 2
  },

  vetSection: {
    background: '#fff',
    border: '1px solid var(--border)',
    borderRadius: 16,
    padding: 20,
    boxShadow: 'var(--shadow)',
    marginBottom: 20
  },

  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: 900,
    color: 'var(--text-main)'
  },

  sectionSub: {
    fontSize: 12,
    color: 'var(--text-sub)',
    marginTop: 3
  },

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

  vetGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: 14
  },

  vetCard: {
    border: '1px solid var(--border)',
    borderRadius: 14,
    padding: 15,
    background: '#FAFAFA',
    display: 'flex',
    flexDirection: 'column',
    gap: 12
  },

  vetTop: {
    display: 'flex',
    alignItems: 'center',
    gap: 12
  },

  vetAvatar: {
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

  vetName: {
    fontSize: 14,
    fontWeight: 900,
    color: 'var(--text-main)'
  },

  vetSpec: {
    fontSize: 12,
    color: 'var(--text-sub)',
    marginTop: 2
  },

  vetStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    fontSize: 11,
    color: '#059669',
    fontWeight: 800,
    marginTop: 5
  },

  vetStatusOff: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    fontSize: 11,
    color: '#DC2626',
    fontWeight: 800,
    marginTop: 5
  },

  dotGreen: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: '#22C55E'
  },

  dotRed: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: '#DC2626'
  },

  hoursBox: {
    background: '#fff',
    border: '1px solid var(--border)',
    borderRadius: 11,
    padding: 10
  },

  hoursTitle: {
    fontSize: 11,
    fontWeight: 900,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    marginBottom: 8
  },

  hoursList: {
    display: 'flex',
    gap: 6,
    flexWrap: 'wrap'
  },

  hourChip: {
    background: 'var(--primary-light)',
    color: 'var(--primary)',
    borderRadius: 999,
    padding: '4px 9px',
    fontSize: 11,
    fontWeight: 800
  },

  toolbar: {
    background: '#fff',
    border: '1px solid var(--border)',
    borderRadius: 14,
    padding: 14,
    boxShadow: 'var(--shadow)',
    display: 'flex',
    gap: 12,
    marginBottom: 18
  },

  searchWrap: {
    position: 'relative',
    flex: 1
  },

  searchIcon: {
    position: 'absolute',
    left: 12,
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--text-muted)'
  },

  searchInput: {
    width: '100%',
    padding: '11px 12px 11px 38px',
    border: '1px solid var(--border)',
    borderRadius: 11,
    background: '#FAFAFA',
    fontSize: 13,
    color: 'var(--text-main)'
  },

  filterBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 8
  },

  select: {
    padding: '10px 12px',
    border: '1px solid var(--border)',
    borderRadius: 10,
    background: '#FAFAFA',
    fontSize: 13,
    color: 'var(--text-main)'
  },

  tableWrap: {
    background: '#fff',
    borderRadius: 14,
    border: '1px solid var(--border)',
    overflow: 'hidden',
    boxShadow: 'var(--shadow)'
  },

  tableHeader: {
    padding: '18px 20px',
    borderBottom: '1px solid var(--border)'
  },

  tableTitle: {
    fontSize: 16,
    fontWeight: 900,
    color: 'var(--text-main)'
  },

  tableSub: {
    fontSize: 12,
    color: 'var(--text-sub)',
    marginTop: 3
  },

  tableScroll: {
    width: '100%',
    overflowX: 'auto'
  },

  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: 980
  },

  th: {
    textAlign: 'left',
    padding: '12px 14px',
    fontSize: 11,
    color: 'var(--text-muted)',
    fontWeight: 900,
    textTransform: 'uppercase',
    background: '#F8FAFC',
    borderBottom: '1px solid var(--border)'
  },

  td: {
    padding: '13px 14px',
    fontSize: 13,
    borderBottom: '1px solid #F5F5F5',
    color: 'var(--text-main)'
  },

  trEven: {
    background: '#FEFCFB'
  },

  petCell: {
    display: 'flex',
    alignItems: 'center',
    gap: 9
  },

  petEmoji: {
    fontSize: 20
  },

  petSub: {
    fontSize: 11,
    color: 'var(--text-muted)',
    marginTop: 2
  },

  iconText: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    color: 'var(--text-sub)',
    fontWeight: 700
  },

  badge: {
    padding: '5px 11px',
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 800,
    whiteSpace: 'nowrap'
  },

  estadoSelect: {
    border: 'none',
    borderRadius: 20,
    padding: '6px 10px',
    fontSize: 11,
    fontWeight: 800,
    outline: 'none'
  },

  btnView: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    background: '#EFF6FF',
    border: '1px solid #BFDBFE',
    color: '#2563EB',
    borderRadius: 9,
    padding: '7px 10px',
    fontSize: 12,
    fontWeight: 800,
    cursor: 'pointer'
  },

  empty: {
    padding: 38,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 10,
    color: 'var(--text-muted)',
    fontSize: 13
  },

  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.45)',
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
    maxWidth: 560,
    boxShadow: '0 25px 60px rgba(0,0,0,0.22)',
    maxHeight: '92vh',
    overflowY: 'auto'
  },

  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '18px 22px',
    borderBottom: '1px solid var(--border)'
  },

  modalTitle: {
    fontSize: 17,
    fontWeight: 900,
    color: 'var(--text-main)'
  },

  modalSub: {
    fontSize: 12,
    color: 'var(--text-sub)',
    marginTop: 3
  },

  closeBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-muted)',
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer'
  },

  modalBody: {
    padding: '20px 22px',
    display: 'flex',
    flexDirection: 'column',
    gap: 14
  },

  row2: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 12
  },

  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: 5
  },

  label: {
    fontSize: 12,
    fontWeight: 800,
    color: 'var(--text-sub)'
  },

  input: {
    padding: '10px 12px',
    border: '1px solid var(--border)',
    borderRadius: 9,
    fontSize: 13,
    background: '#FAFAFA',
    color: 'var(--text-main)',
    outline: 'none'
  },

  modalFooter: {
    padding: '14px 22px',
    borderTop: '1px solid var(--border)',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 10
  },

  btnCancel: {
    padding: '10px 18px',
    border: '1px solid var(--border)',
    borderRadius: 10,
    background: 'transparent',
    color: 'var(--text-sub)',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer'
  },

  btnSave: {
    padding: '10px 18px',
    background: 'var(--primary)',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 800,
    cursor: 'pointer'
  },

  detailBody: {
    padding: 22,
    display: 'flex',
    flexDirection: 'column',
    gap: 16
  },

  detailHero: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    paddingBottom: 16,
    borderBottom: '1px solid var(--border)'
  },

  detailIcon: {
    width: 72,
    height: 72,
    borderRadius: 22,
    background: 'var(--primary-light)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 38
  },

  detailTitle: {
    fontSize: 24,
    fontWeight: 900,
    color: 'var(--text-main)'
  },

  detailSub: {
    fontSize: 13,
    color: 'var(--text-sub)',
    margin: '2px 0 8px'
  },

  detailGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4,1fr)',
    gap: 10
  },

  detailBox: {
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: 13,
    padding: 12,
    display: 'flex',
    flexDirection: 'column',
    gap: 5,
    fontSize: 12,
    color: 'var(--text-sub)'
  },

  paymentBox: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 14,
    background: '#F8FAFC',
    border: '1px solid var(--border)',
    borderRadius: 13,
    padding: 14
  },

  paymentLabel: {
    fontSize: 12,
    color: 'var(--text-sub)',
    fontWeight: 800
  },

  amountBox: {
    textAlign: 'right',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    color: 'var(--text-sub)'
  },

  adminBox: {
    background: '#FFFBEA',
    border: '1px solid #FDE68A',
    color: '#92400E',
    borderRadius: 12,
    padding: '12px 14px',
    fontSize: 12,
    lineHeight: 1.6
  }
}
