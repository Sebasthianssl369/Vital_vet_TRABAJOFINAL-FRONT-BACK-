import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import {
  Search,
  Download,
  FileText,
  CalendarDays,
  Stethoscope,
  Activity,
  HeartPulse,
  PawPrint,
  AlertCircle,
  Loader2
} from 'lucide-react'

import {
  getMascotasPorCliente
} from '../../services/mascotasService'

import {
  getHistorialPorMascota
} from '../../services/historialService'

import {
  getVeterinarios
} from '../../services/veterinariosService'

const iconoMascota = (especie) => {
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

  return `${day}/${month}/${year}${time ? ` ${time}` : ''}`
}

export default function ClienteHistorial() {
  const { user } = useAuth()

  const idCliente = user?.id_cliente || user?.idCliente

  const [mascotasCliente, setMascotasCliente] = useState([])
  const [seleccionada, setSeleccionada] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const [loading, setLoading] = useState(true)
  const [errorPage, setErrorPage] = useState('')

  useEffect(() => {
    const cargarHistorial = async () => {
      try {
        setLoading(true)
        setErrorPage('')

        if (!idCliente) {
          throw new Error('No se encontró el cliente asociado a la sesión.')
        }

        const [mascotas, veterinarios] = await Promise.all([
          getMascotasPorCliente(idCliente),
          getVeterinarios()
        ])

        const veterinarioById = (id) =>
          veterinarios.find(v => Number(v.id_veterinario || v.idVeterinario) === Number(id))

        const mascotasConHistorial = await Promise.all(
          mascotas.map(async (mascota) => {
            const idMascota = mascota.id_mascota || mascota.idMascota
            const consultasData = await getHistorialPorMascota(idMascota)

            const consultas = consultasData
              .map(consulta => {
                const vet = veterinarioById(consulta.id_veterinario || consulta.idVeterinario)

                return {
                  ...consulta,
                  id_historial: consulta.id_historial || consulta.idHistorial,
                  id_mascota: consulta.id_mascota || consulta.idMascota,
                  id_veterinario: consulta.id_veterinario || consulta.idVeterinario,
                  veterinario: vet
                    ? `Dr(a). ${vet.nombre} ${vet.apellido}`
                    : 'Sin veterinario',
                  motivo: consulta.motivo || 'Sin motivo',
                  diagnostico: consulta.diagnostico || 'Sin diagnóstico',
                  tratamiento: consulta.tratamiento || 'Sin tratamiento',
                  observaciones: consulta.observaciones || ''
                }
              })
              .sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)))

            return {
              ...mascota,
              id_mascota: mascota.id_mascota || mascota.idMascota,
              mascota: mascota.nombre,
              peso: mascota.peso || 'No registrado',
              estado: mascota.estado || 'Activo',
              consultas
            }
          })
        )

        setMascotasCliente(mascotasConHistorial)
        setSeleccionada(mascotasConHistorial[0] || null)
      } catch (error) {
        setErrorPage(error.message || 'Error al cargar historial clínico.')
      } finally {
        setLoading(false)
      }
    }

    cargarHistorial()
  }, [idCliente])

  const mascotaSeleccionadaActualizada = useMemo(() => {
    if (!seleccionada) return mascotasCliente[0] || null

    return (
      mascotasCliente.find(m =>
        Number(m.id_mascota || m.idMascota) === Number(seleccionada.id_mascota || seleccionada.idMascota)
      ) ||
      mascotasCliente[0] ||
      null
    )
  }, [mascotasCliente, seleccionada])

  const consultasFiltradas = useMemo(() => {
    if (!mascotaSeleccionadaActualizada) return []

    const q = busqueda.toLowerCase().trim()

    if (!q) return mascotaSeleccionadaActualizada.consultas

    return mascotaSeleccionadaActualizada.consultas.filter(c =>
      `${c.fecha} ${c.veterinario} ${c.motivo} ${c.diagnostico} ${c.tratamiento} ${c.observaciones}`
        .toLowerCase()
        .includes(q)
    )
  }, [busqueda, mascotaSeleccionadaActualizada])

  const totalConsultas = mascotaSeleccionadaActualizada?.consultas.length || 0
  const ultimaConsulta = mascotaSeleccionadaActualizada?.consultas[0]
  const veterinarioFrecuente = mascotaSeleccionadaActualizada?.consultas[0]?.veterinario || 'Sin registro'

  const handleDescargar = () => {
    window.print()
  }

  if (loading) {
    return (
      <div style={s.loadingBox}>
        <Loader2 size={34} color="var(--primary)" />
        <h3>Cargando historial clínico...</h3>
        <p>Estamos preparando el expediente médico de tus mascotas.</p>
      </div>
    )
  }

  if (errorPage) {
    return (
      <div style={s.errorBox}>
        <AlertCircle size={34} color="#DC2626" />
        <h3>Error al cargar historial</h3>
        <p>{errorPage}</p>
      </div>
    )
  }

  return (
    <div>
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Mi historial clínico</h1>
          <p style={s.sub}>
            Bienvenido, {user?.username || 'cliente'}. Consulta el expediente médico de tus mascotas.
          </p>
        </div>

        <button style={s.btnDownload} onClick={handleDescargar}>
          <Download size={15} />
          Descargar historial
        </button>
      </div>

      <div style={s.statsRow}>
        <div style={s.statCard}>
          <div style={{ ...s.statIcon, background: 'var(--primary-light)', color: 'var(--primary)' }}>
            <PawPrint size={19} />
          </div>

          <div>
            <div style={s.statValue}>{mascotasCliente.length}</div>
            <div style={s.statLabel}>Mascotas registradas</div>
          </div>
        </div>

        <div style={s.statCard}>
          <div style={{ ...s.statIcon, background: '#DBEAFE', color: '#2563EB' }}>
            <FileText size={19} />
          </div>

          <div>
            <div style={s.statValue}>{totalConsultas}</div>
            <div style={s.statLabel}>
              Consultas de {mascotaSeleccionadaActualizada?.mascota || 'mascota'}
            </div>
          </div>
        </div>

        <div style={s.statCard}>
          <div style={{ ...s.statIcon, background: '#D1FAE5', color: '#059669' }}>
            <CalendarDays size={19} />
          </div>

          <div>
            <div style={s.statValueSmall}>
              {ultimaConsulta?.fecha ? formatFecha(ultimaConsulta.fecha) : 'Sin registro'}
            </div>
            <div style={s.statLabel}>Última atención</div>
          </div>
        </div>

        <div style={s.statCard}>
          <div style={{ ...s.statIcon, background: '#FEF3C7', color: '#D97706' }}>
            <Stethoscope size={19} />
          </div>

          <div>
            <div style={s.statValueSmall}>{veterinarioFrecuente}</div>
            <div style={s.statLabel}>Veterinario asignado</div>
          </div>
        </div>
      </div>

      <div style={s.layout}>
        <aside style={s.panelLeft}>
          <div style={s.panelHead}>
            <p style={s.panelLabel}>Mis mascotas</p>
            <span style={s.totalBadge}>{mascotasCliente.length}</span>
          </div>

          {mascotasCliente.map(m => (
            <button
              type="button"
              key={m.id_mascota}
              style={{
                ...s.mascotaItem,
                ...(Number(mascotaSeleccionadaActualizada?.id_mascota) === Number(m.id_mascota) ? s.mascotaActive : {})
              }}
              onClick={() => {
                setSeleccionada(m)
                setBusqueda('')
              }}
            >
              <span style={s.petEmoji}>{iconoMascota(m.especie)}</span>

              <div style={{ flex: 1 }}>
                <div style={s.mascotaNombre}>{m.mascota}</div>
                <div style={s.mascotaSub}>{m.raza} · {m.edad} años</div>
              </div>

              <span style={s.countBadge}>{m.consultas.length}</span>
            </button>
          ))}

          {mascotasCliente.length === 0 && (
            <div style={s.emptyMini}>
              No tienes mascotas registradas.
            </div>
          )}
        </aside>

        <main style={s.panelRight}>
          {mascotaSeleccionadaActualizada ? (
            <>
              <div style={s.petHero}>
                <div style={s.petHeroLeft}>
                  <div style={s.bigPetIcon}>
                    {iconoMascota(mascotaSeleccionadaActualizada.especie)}
                  </div>

                  <div>
                    <div style={s.petTitleRow}>
                      <h2 style={s.petTitle}>{mascotaSeleccionadaActualizada.mascota}</h2>
                      <span style={s.statusBadge}>
                        {mascotaSeleccionadaActualizada.estado || 'Activo'}
                      </span>
                    </div>

                    <p style={s.petInfo}>
                      {mascotaSeleccionadaActualizada.raza} · {mascotaSeleccionadaActualizada.especie} · {mascotaSeleccionadaActualizada.edad} años
                    </p>
                  </div>
                </div>

                <div style={s.petMiniStats}>
                  <div style={s.petMiniItem}>
                    <span>Peso</span>
                    <b>{mascotaSeleccionadaActualizada.peso}</b>
                  </div>

                  <div style={s.petMiniItem}>
                    <span>Sexo</span>
                    <b>{mascotaSeleccionadaActualizada.sexo}</b>
                  </div>

                  <div style={s.petMiniItem}>
                    <span>Consultas</span>
                    <b>{mascotaSeleccionadaActualizada.consultas.length}</b>
                  </div>
                </div>
              </div>

              <div style={s.toolsRow}>
                <div style={s.searchWrap}>
                  <Search size={15} style={s.searchIcon} />

                  <input
                    style={s.searchInput}
                    placeholder="Buscar por motivo, diagnóstico, tratamiento o fecha..."
                    value={busqueda}
                    onChange={e => setBusqueda(e.target.value)}
                  />
                </div>
              </div>

              <div style={s.sectionHeader}>
                <div>
                  <p style={s.panelLabel}>Expediente médico</p>
                  <h3 style={s.sectionTitle}>
                    {consultasFiltradas.length} consultas encontradas
                  </h3>
                </div>
              </div>

              {consultasFiltradas.length > 0 ? (
                <div style={s.timeline}>
                  {consultasFiltradas.map((c, i) => (
                    <div key={c.id_historial} style={s.tItem}>
                      <div
                        style={{
                          ...s.dot,
                          background: i === 0 ? 'var(--primary)' : 'var(--accent)'
                        }}
                      />

                      <article style={s.tCard}>
                        <div style={s.tTop}>
                          <div>
                            <span style={s.tFecha}>{formatFecha(c.fecha)}</span>
                            <h4 style={s.tMotivo}>{c.motivo}</h4>
                          </div>

                          <span style={s.vetTag}>
                            <Stethoscope size={12} />
                            {c.veterinario}
                          </span>
                        </div>

                        <div style={s.medicalGrid}>
                          <div style={s.medicalBox}>
                            <div style={s.medicalTitle}>
                              <HeartPulse size={14} />
                              Diagnóstico
                            </div>
                            <p style={s.medicalText}>{c.diagnostico}</p>
                          </div>

                          <div style={s.medicalBox}>
                            <div style={s.medicalTitle}>
                              <Activity size={14} />
                              Tratamiento
                            </div>
                            <p style={s.medicalText}>{c.tratamiento}</p>
                          </div>
                        </div>

                        {c.observaciones && (
                          <div style={s.medicalBox}>
                            <div style={s.medicalTitle}>
                              <FileText size={14} />
                              Observaciones
                            </div>
                            <p style={s.medicalText}>{c.observaciones}</p>
                          </div>
                        )}
                      </article>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={s.empty}>
                  <FileText size={42} color="var(--text-muted)" />
                  <p>No se encontraron consultas con ese criterio.</p>
                </div>
              )}
            </>
          ) : (
            <div style={s.empty}>
              <PawPrint size={42} color="var(--text-muted)" />
              <p>No tienes mascotas con historial clínico registrado.</p>
            </div>
          )}
        </main>
      </div>
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

  header: {
    marginBottom: 22,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16
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

  btnDownload: {
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    background: 'var(--primary)',
    color: '#fff',
    border: 'none',
    borderRadius: 11,
    padding: '11px 18px',
    fontSize: 13,
    fontWeight: 800,
    boxShadow: '0 10px 22px rgba(232,97,44,.22)',
    cursor: 'pointer'
  },

  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 14,
    marginBottom: 20
  },

  statCard: {
    background: '#fff',
    borderRadius: 14,
    border: '1px solid var(--border)',
    padding: '16px',
    boxShadow: 'var(--shadow)',
    display: 'flex',
    alignItems: 'center',
    gap: 12
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

  statValue: {
    fontSize: 23,
    fontWeight: 900,
    color: 'var(--text-main)'
  },

  statValueSmall: {
    fontSize: 13,
    fontWeight: 900,
    color: 'var(--text-main)'
  },

  statLabel: {
    fontSize: 12,
    color: 'var(--text-sub)',
    marginTop: 2
  },

  layout: {
    display: 'grid',
    gridTemplateColumns: '260px 1fr',
    gap: 18
  },

  panelLeft: {
    background: '#fff',
    borderRadius: 14,
    border: '1px solid var(--border)',
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 9,
    alignSelf: 'start',
    boxShadow: 'var(--shadow)'
  },

  panelHead: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4
  },

  panelLabel: {
    fontSize: 11,
    fontWeight: 800,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '.06em'
  },

  totalBadge: {
    background: 'var(--primary-light)',
    color: 'var(--primary)',
    borderRadius: 999,
    padding: '3px 9px',
    fontSize: 11,
    fontWeight: 800
  },

  mascotaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 11,
    padding: 12,
    borderRadius: 12,
    cursor: 'pointer',
    border: '1px solid transparent',
    background: 'transparent',
    textAlign: 'left',
    transition: 'all .18s ease'
  },

  mascotaActive: {
    background: 'var(--primary-light)',
    border: '1px solid var(--primary)',
    boxShadow: '0 8px 18px rgba(232,97,44,.12)'
  },

  petEmoji: {
    fontSize: 24,
    flexShrink: 0
  },

  mascotaNombre: {
    fontWeight: 800,
    fontSize: 13,
    color: 'var(--text-main)'
  },

  mascotaSub: {
    fontSize: 11,
    color: 'var(--text-muted)',
    marginTop: 2
  },

  countBadge: {
    marginLeft: 'auto',
    background: 'var(--primary)',
    color: '#fff',
    borderRadius: 20,
    fontSize: 10,
    fontWeight: 800,
    padding: '3px 8px'
  },

  emptyMini: {
    background: 'var(--bg)',
    border: '1px dashed var(--border)',
    borderRadius: 12,
    padding: 14,
    fontSize: 12,
    color: 'var(--text-sub)',
    textAlign: 'center'
  },

  panelRight: {
    background: '#fff',
    borderRadius: 14,
    border: '1px solid var(--border)',
    padding: '22px 24px',
    boxShadow: 'var(--shadow)',
    minHeight: 460
  },

  petHero: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 18,
    alignItems: 'center',
    paddingBottom: 18,
    borderBottom: '1px solid var(--border)',
    marginBottom: 18
  },

  petHeroLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 14
  },

  bigPetIcon: {
    width: 58,
    height: 58,
    borderRadius: 16,
    background: 'var(--primary-light)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 31
  },

  petTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10
  },

  petTitle: {
    fontSize: 22,
    fontWeight: 900,
    color: 'var(--text-main)'
  },

  statusBadge: {
    background: '#D1FAE5',
    color: '#065F46',
    borderRadius: 999,
    padding: '4px 10px',
    fontSize: 11,
    fontWeight: 800
  },

  petInfo: {
    fontSize: 13,
    color: 'var(--text-sub)',
    marginTop: 3
  },

  petMiniStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 10,
    minWidth: 260
  },

  petMiniItem: {
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: 12,
    padding: '10px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
    textAlign: 'center',
    fontSize: 12,
    color: 'var(--text-sub)'
  },

  toolsRow: {
    marginBottom: 18
  },

  searchWrap: {
    position: 'relative',
    maxWidth: 520
  },

  searchIcon: {
    position: 'absolute',
    left: 11,
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--text-muted)'
  },

  searchInput: {
    width: '100%',
    padding: '11px 12px 11px 36px',
    border: '1px solid var(--border)',
    borderRadius: 11,
    background: '#FAFAFA',
    fontSize: 13,
    color: 'var(--text-main)'
  },

  sectionHeader: {
    marginBottom: 12
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: 800,
    color: 'var(--text-main)',
    marginTop: 4
  },

  timeline: {
    paddingLeft: 18,
    borderLeft: '2px solid var(--border)',
    marginTop: 12,
    display: 'flex',
    flexDirection: 'column'
  },

  tItem: {
    position: 'relative',
    paddingLeft: 22,
    paddingBottom: 20
  },

  dot: {
    position: 'absolute',
    left: -10,
    top: 18,
    width: 18,
    height: 18,
    borderRadius: '50%',
    border: '3px solid #fff',
    outline: '2px solid var(--primary)'
  },

  tCard: {
    background: '#FAFAFA',
    borderRadius: 14,
    border: '1px solid var(--border)',
    padding: '16px 18px',
    display: 'flex',
    flexDirection: 'column',
    gap: 13
  },

  tTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12
  },

  tFecha: {
    fontSize: 12,
    color: 'var(--text-muted)',
    fontWeight: 700
  },

  vetTag: {
    fontSize: 11,
    color: 'var(--text-sub)',
    background: '#F1F5F9',
    padding: '5px 10px',
    borderRadius: 999,
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    fontWeight: 700,
    whiteSpace: 'nowrap'
  },

  tMotivo: {
    fontSize: 16,
    fontWeight: 900,
    color: 'var(--text-main)',
    marginTop: 4
  },

  medicalGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 12
  },

  medicalBox: {
    background: '#fff',
    border: '1px solid var(--border)',
    borderRadius: 12,
    padding: '12px 14px'
  },

  medicalTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 12,
    fontWeight: 900,
    color: 'var(--primary)',
    marginBottom: 7
  },

  medicalText: {
    fontSize: 13,
    color: 'var(--text-sub)',
    lineHeight: 1.6
  },

  empty: {
    padding: 38,
    borderRadius: 14,
    border: '1px dashed var(--border)',
    background: 'var(--bg)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 10,
    color: 'var(--text-sub)',
    fontSize: 13
  }
}
