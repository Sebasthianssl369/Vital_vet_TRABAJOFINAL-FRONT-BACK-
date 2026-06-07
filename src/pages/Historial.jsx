import { useEffect, useState } from 'react'
import {
  Search,
  ClipboardList,
  CalendarDays,
  UserRound,
  Stethoscope,
  Dog,
  FileText,
  CheckCircle,
  AlertCircle,
  Eye,
  X,
  Loader2
} from 'lucide-react'

import {
  getHistorial
} from '../services/historialService'

import {
  getMascotas
} from '../services/mascotasService'

import {
  getClientes
} from '../services/clientesService'

import {
  getVeterinarios
} from '../services/veterinariosService'

const iconoEspecie = (especie) => {
  if (especie === 'Perro') return '🐶'
  if (especie === 'Gato') return '🐱'
  if (especie === 'Conejo') return '🐰'
  if (especie === 'Ave') return '🐦'
  return '🐾'
}

const formatFecha = (fecha) => {
  if (!fecha) return 'Sin fecha'

  const fechaNormalizada = String(fecha).replace('T', ' ')
  const [date, timeCompleto] = fechaNormalizada.split(' ')

  if (!date) return fecha

  const [year, month, day] = date.split('-')

  if (!year || !month || !day) return fecha

  const time = timeCompleto ? timeCompleto.slice(0, 5) : ''

  return `${day}/${month}/${year}${time ? ` · ${time}` : ''}`
}

export default function Historial() {
  const [historial, setHistorial] = useState([])
  const [mascotas, setMascotas] = useState([])
  const [clientes, setClientes] = useState([])
  const [veterinarios, setVeterinarios] = useState([])

  const [loading, setLoading] = useState(true)
  const [errorPage, setErrorPage] = useState('')

  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('Todos')
  const [detalle, setDetalle] = useState(null)

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true)
        setErrorPage('')

        const [
          dataHistorial,
          dataMascotas,
          dataClientes,
          dataVeterinarios
        ] = await Promise.all([
          getHistorial(),
          getMascotas(),
          getClientes(),
          getVeterinarios()
        ])

        setHistorial(dataHistorial)
        setMascotas(dataMascotas)
        setClientes(dataClientes)
        setVeterinarios(dataVeterinarios)
      } catch (error) {
        setErrorPage(error.message || 'Error al cargar el historial clínico.')
      } finally {
        setLoading(false)
      }
    }

    cargarDatos()
  }, [])

  const mascotaById = (id) =>
    mascotas.find(m => Number(m.id_mascota || m.idMascota) === Number(id))

  const clienteById = (id) =>
    clientes.find(c => Number(c.id_cliente || c.idCliente) === Number(id))

  const veterinarioById = (id) =>
    veterinarios.find(v => Number(v.id_veterinario || v.idVeterinario) === Number(id))

  const normalizarHistorial = (h) => {
    const idMascota = h.id_mascota || h.idMascota
    const idVeterinario = h.id_veterinario || h.idVeterinario

    const mascota = mascotaById(idMascota)
    const cliente = clienteById(mascota?.id_cliente || mascota?.idCliente)
    const veterinario = veterinarioById(idVeterinario)

    return {
      ...h,
      id_historial: h.id_historial || h.idHistorial,
      id_mascota: idMascota,
      id_veterinario: idVeterinario,
      id_cita: h.id_cita || h.idCita,

      // El backend actual no tiene campo estado en historial_clinico.
      // Lo usamos como estado visual.
      estado: h.estado || 'Completada',

      mascotaNombre: mascota?.nombre || 'Sin mascota',
      especie: mascota?.especie || 'Otro',
      raza: mascota?.raza || 'Sin raza',
      edad: mascota?.edad ?? '-',
      clienteNombre: cliente ? `${cliente.nombre} ${cliente.apellido}` : 'Sin cliente',
      veterinarioNombre: veterinario
        ? `Dr(a). ${veterinario.nombre} ${veterinario.apellido}`
        : 'Sin veterinario',
      especialidad: veterinario?.especialidad || 'Sin especialidad',
      motivo: h.motivo || 'Sin motivo',
      diagnostico: h.diagnostico || 'Sin diagnóstico',
      tratamiento: h.tratamiento || 'Sin tratamiento',
      observaciones: h.observaciones || ''
    }
  }

  const historialNormalizado = historial.map(normalizarHistorial)

  const filtered = historialNormalizado.filter(item => {
    const texto = `
      ${item.clienteNombre}
      ${item.mascotaNombre}
      ${item.especie}
      ${item.motivo}
      ${item.diagnostico}
      ${item.tratamiento}
      ${item.veterinarioNombre}
    `.toLowerCase()

    const matchBusqueda = texto.includes(busqueda.toLowerCase())
    const matchEstado = filtroEstado === 'Todos' || item.estado === filtroEstado

    return matchBusqueda && matchEstado
  })

  const totalHistoriales = historialNormalizado.length
  const completadas = historialNormalizado.filter(h => h.estado === 'Completada').length
  const pendientes = historialNormalizado.filter(h => h.estado === 'Pendiente').length
  const mascotasAtendidas = new Set(historialNormalizado.map(h => h.id_mascota)).size

  const estadoStyle = {
    Completada: {
      background: '#D1FAE5',
      color: '#065F46'
    },
    Pendiente: {
      background: '#FEF3C7',
      color: '#92400E'
    },
    Cancelada: {
      background: '#FEE2E2',
      color: '#991B1B'
    }
  }

  if (loading) {
    return (
      <div style={styles.card}>
        <div style={styles.empty}>
          <Loader2 size={38} color="var(--primary)" />
          <p>Cargando historial clínico...</p>
        </div>
      </div>
    )
  }

  if (errorPage) {
    return (
      <div style={styles.card}>
        <div style={styles.empty}>
          <AlertCircle size={38} color="#DC2626" />
          <p>{errorPage}</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Historial clínico global</h1>
          <p style={styles.subtitle}>
            Registro general de atenciones médicas realizadas a las mascotas.
          </p>
        </div>
      </div>

      {/* KPIS */}
      <div style={styles.kpiGrid}>
        <div style={styles.kpiCard}>
          <div style={{ ...styles.kpiIcon, background: 'var(--primary-light)', color: 'var(--primary)' }}>
            <ClipboardList size={20} />
          </div>

          <div>
            <div style={styles.kpiValue}>{totalHistoriales}</div>
            <div style={styles.kpiLabel}>Atenciones registradas</div>
          </div>
        </div>

        <div style={styles.kpiCard}>
          <div style={{ ...styles.kpiIcon, background: '#D1FAE5', color: '#059669' }}>
            <CheckCircle size={20} />
          </div>

          <div>
            <div style={styles.kpiValue}>{completadas}</div>
            <div style={styles.kpiLabel}>Completadas</div>
          </div>
        </div>

        <div style={styles.kpiCard}>
          <div style={{ ...styles.kpiIcon, background: '#FEF3C7', color: '#D97706' }}>
            <AlertCircle size={20} />
          </div>

          <div>
            <div style={styles.kpiValue}>{pendientes}</div>
            <div style={styles.kpiLabel}>Pendientes</div>
          </div>
        </div>

        <div style={styles.kpiCard}>
          <div style={{ ...styles.kpiIcon, background: '#DBEAFE', color: '#2563EB' }}>
            <Dog size={20} />
          </div>

          <div>
            <div style={styles.kpiValue}>{mascotasAtendidas}</div>
            <div style={styles.kpiLabel}>Mascotas atendidas</div>
          </div>
        </div>
      </div>

      {/* FILTROS */}
      <div style={styles.toolbar}>
        <div style={styles.searchWrap}>
          <Search size={15} style={styles.searchIcon} />

          <input
            style={styles.searchInput}
            placeholder="Buscar por cliente, mascota, veterinario, motivo o diagnóstico..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
        </div>

        <select
          style={styles.select}
          value={filtroEstado}
          onChange={e => setFiltroEstado(e.target.value)}
        >
          <option>Todos</option>
          <option>Completada</option>
          <option>Pendiente</option>
          <option>Cancelada</option>
        </select>
      </div>

      {/* TABLA */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div>
            <h3 style={styles.cardTitle}>Atenciones clínicas</h3>
            <p style={styles.cardSub}>
              {filtered.length} resultado(s) encontrados
            </p>
          </div>
        </div>

        <div style={styles.tableScroll}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Fecha</th>
                <th style={styles.th}>Cliente</th>
                <th style={styles.th}>Mascota</th>
                <th style={styles.th}>Motivo</th>
                <th style={styles.th}>Veterinario</th>
                <th style={styles.th}>Estado</th>
                <th style={styles.th}>Acción</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((item, i) => (
                <tr key={item.id_historial} style={i % 2 === 0 ? styles.trEven : {}}>
                  <td style={styles.td}>
                    <div style={styles.iconText}>
                      <CalendarDays size={14} />
                      <b>{formatFecha(item.fecha)}</b>
                    </div>
                  </td>

                  <td style={styles.td}>
                    <div style={styles.iconText}>
                      <UserRound size={14} />
                      {item.clienteNombre}
                    </div>
                  </td>

                  <td style={styles.td}>
                    <div style={styles.petCell}>
                      <span style={styles.petIcon}>
                        {iconoEspecie(item.especie)}
                      </span>

                      <div>
                        <b>{item.mascotaNombre}</b>
                        <p style={styles.petSub}>
                          {item.raza} · {item.edad} años
                        </p>
                      </div>
                    </div>
                  </td>

                  <td style={styles.td}>
                    <b>{item.motivo}</b>
                  </td>

                  <td style={styles.td}>
                    <div style={styles.iconText}>
                      <Stethoscope size={14} />
                      {item.veterinarioNombre}
                    </div>
                  </td>

                  <td style={styles.td}>
                    <span style={{ ...styles.badge, ...(estadoStyle[item.estado] || {}) }}>
                      {item.estado}
                    </span>
                  </td>

                  <td style={styles.td}>
                    <button style={styles.btnView} onClick={() => setDetalle(item)}>
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
          <div style={styles.empty}>
            <FileText size={40} color="var(--text-muted)" />
            <p>No hay registros en el historial.</p>
          </div>
        )}
      </div>

      {/* MODAL DETALLE */}
      {detalle && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <div>
                <h3 style={styles.modalTitle}>Detalle de atención</h3>
                <p style={styles.modalSub}>
                  Información clínica registrada para la mascota.
                </p>
              </div>

              <button style={styles.closeBtn} onClick={() => setDetalle(null)}>
                <X size={18} />
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.detailHero}>
                <div style={styles.detailIcon}>
                  {iconoEspecie(detalle.especie)}
                </div>

                <div>
                  <h2 style={styles.detailTitle}>{detalle.mascotaNombre}</h2>
                  <p style={styles.detailSub}>
                    {detalle.raza} · {detalle.edad} años · {detalle.especie}
                  </p>

                  <span style={{ ...styles.badge, ...(estadoStyle[detalle.estado] || {}) }}>
                    {detalle.estado}
                  </span>
                </div>
              </div>

              <div style={styles.detailGrid}>
                <div style={styles.detailBox}>
                  <UserRound size={17} color="var(--primary)" />
                  <span>Cliente</span>
                  <b>{detalle.clienteNombre}</b>
                </div>

                <div style={styles.detailBox}>
                  <Stethoscope size={17} color="var(--primary)" />
                  <span>Veterinario</span>
                  <b>{detalle.veterinarioNombre}</b>
                </div>

                <div style={styles.detailBox}>
                  <CalendarDays size={17} color="var(--primary)" />
                  <span>Fecha</span>
                  <b>{formatFecha(detalle.fecha)}</b>
                </div>
              </div>

              <div style={styles.clinicalBox}>
                <h4>Motivo de consulta</h4>
                <p>{detalle.motivo}</p>
              </div>

              <div style={styles.clinicalBox}>
                <h4>Diagnóstico</h4>
                <p>{detalle.diagnostico}</p>
              </div>

              <div style={styles.clinicalBox}>
                <h4>Tratamiento</h4>
                <p>{detalle.tratamiento}</p>
              </div>

              {detalle.observaciones && (
                <div style={styles.clinicalBox}>
                  <h4>Observaciones</h4>
                  <p>{detalle.observaciones}</p>
                </div>
              )}

              <div style={styles.noteBox}>
                <b>Nota administrativa:</b>
                <p>
                  Esta vista permite al administrador consultar el historial clínico global
                  registrado en la base de datos MySQL.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
const styles = {
  header: {
    marginBottom: 22
  },

  title: {
    fontSize: 24,
    fontWeight: 800,
    color: 'var(--text-main)'
  },

  subtitle: {
    color: 'var(--text-sub)',
    fontSize: 13,
    marginTop: 4
  },

  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4,1fr)',
    gap: 14,
    marginBottom: 20
  },

  kpiCard: {
    background: '#fff',
    border: '1px solid var(--border)',
    borderRadius: 14,
    padding: 18,
    boxShadow: 'var(--shadow)',
    display: 'flex',
    alignItems: 'center',
    gap: 13
  },

  kpiIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },

  kpiValue: {
    fontSize: 25,
    fontWeight: 900,
    color: 'var(--text-main)'
  },

  kpiLabel: {
    fontSize: 12,
    color: 'var(--text-sub)',
    marginTop: 2
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

  select: {
    padding: '11px 14px',
    border: '1px solid var(--border)',
    borderRadius: 11,
    background: '#FAFAFA',
    fontSize: 13,
    color: 'var(--text-main)',
    minWidth: 150
  },

  card: {
    background: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
    border: '1px solid var(--border)',
    boxShadow: 'var(--shadow)'
  },

  cardHeader: {
    padding: '18px 20px',
    borderBottom: '1px solid var(--border)'
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: 900,
    color: 'var(--text-main)'
  },

  cardSub: {
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
    minWidth: 960,
    borderCollapse: 'collapse'
  },

  th: {
    padding: '13px 14px',
    textAlign: 'left',
    background: '#F9FAFB',
    borderBottom: '1px solid var(--border)',
    fontSize: 11,
    fontWeight: 900,
    color: 'var(--text-muted)',
    textTransform: 'uppercase'
  },

  td: {
    padding: '14px',
    borderBottom: '1px solid #F3F4F6',
    fontSize: 13,
    color: 'var(--text-main)'
  },

  trEven: {
    background: '#FEFCFB'
  },

  iconText: {
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    color: 'var(--text-sub)',
    fontWeight: 700
  },

  petCell: {
    display: 'flex',
    alignItems: 'center',
    gap: 9
  },

  petIcon: {
    fontSize: 21
  },

  petSub: {
    fontSize: 11,
    color: 'var(--text-muted)',
    marginTop: 2
  },

  badge: {
    padding: '5px 11px',
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 800,
    whiteSpace: 'nowrap'
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
    maxWidth: 640,
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
    padding: 22,
    display: 'flex',
    flexDirection: 'column',
    gap: 14
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
    gridTemplateColumns: 'repeat(3,1fr)',
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

  clinicalBox: {
    background: '#FAFAFA',
    border: '1px solid var(--border)',
    borderRadius: 13,
    padding: 14
  },

  noteBox: {
    background: '#FFFBEA',
    border: '1px solid #FDE68A',
    color: '#92400E',
    borderRadius: 12,
    padding: '12px 14px',
    fontSize: 12,
    lineHeight: 1.6
  }
}