import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Dog,
  Users,
  ClipboardList,
  Calendar,
  TrendingUp,
  Activity,
  CreditCard,
  Clock,
  Bell,
  PawPrint,
  CheckCircle,
  AlertCircle,
  X,
  Server,
  Database,
  Wifi,
  FileText,
  Eye,
  BarChart3,
  Loader2
} from 'lucide-react'

import { useAuth } from '../context/AuthContext'

import { getClientes } from '../services/clientesService'
import { getMascotas } from '../services/mascotasService'
import { getCitas } from '../services/citasService'
import { getHistorial } from '../services/historialService'
import { getVeterinarios } from '../services/veterinariosService'
import { getServicios } from '../services/serviciosService'

const formatMoney = (n) => `S/ ${Number(n || 0).toLocaleString('es-PE', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
})}`

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

  return `${day}/${month}/${year}${time ? ` · ${time}` : ''}`
}

const normalizarId = (obj, camel, snake) => obj?.[snake] || obj?.[camel]

const mesesCortos = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [modalAlertas, setModalAlertas] = useState(false)
  const [modalSistema, setModalSistema] = useState(false)

  const [clientes, setClientes] = useState([])
  const [mascotas, setMascotas] = useState([])
  const [citas, setCitas] = useState([])
  const [historiales, setHistoriales] = useState([])
  const [veterinarios, setVeterinarios] = useState([])
  const [servicios, setServicios] = useState([])

  const [loading, setLoading] = useState(true)
  const [errorPage, setErrorPage] = useState('')

  useEffect(() => {
    const cargarDashboard = async () => {
      try {
        setLoading(true)
        setErrorPage('')

        const [
          dataClientes,
          dataMascotas,
          dataCitas,
          dataHistorial,
          dataVeterinarios,
          dataServicios
        ] = await Promise.all([
          getClientes(),
          getMascotas(),
          getCitas(),
          getHistorial(),
          getVeterinarios(),
          getServicios()
        ])

        setClientes(dataClientes)
        setMascotas(dataMascotas)
        setCitas(dataCitas)
        setHistoriales(dataHistorial)
        setVeterinarios(dataVeterinarios)
        setServicios(dataServicios)
      } catch (error) {
        setErrorPage(error.message || 'Error al cargar dashboard.')
      } finally {
        setLoading(false)
      }
    }

    cargarDashboard()
  }, [])

  const fechaActual = new Date().toLocaleDateString('es-PE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  const clienteById = (id) =>
    clientes.find(c => Number(normalizarId(c, 'idCliente', 'id_cliente')) === Number(id))

  const mascotaById = (id) =>
    mascotas.find(m => Number(normalizarId(m, 'idMascota', 'id_mascota')) === Number(id))

  const veterinarioById = (id) =>
    veterinarios.find(v => Number(normalizarId(v, 'idVeterinario', 'id_veterinario')) === Number(id))

  const servicioById = (id) =>
    servicios.find(s => Number(normalizarId(s, 'idServicio', 'id_servicio')) === Number(id))

  const totalMascotas = mascotas.length

  const clientesActivos = clientes.filter(c =>
    (c.estado || 'Activo') === 'Activo'
  ).length

  const citasActivas = citas.filter(c => c.estado !== 'Cancelada')
  const pagosPendientes = citas.filter(c =>
    (c.estado_pago || c.estadoPago || 'pendiente') === 'pendiente' && c.estado !== 'Cancelada'
  ).length

  const citasPendientes = citas.filter(c => c.estado === 'Pendiente').length
  const atencionesMes = historiales.length

  const citasPagadas = citas.filter(c =>
    (c.estado_pago || c.estadoPago) === 'pagado'
  )

  const ingresosTotales = citasPagadas.reduce((acc, c) => acc + Number(c.monto || 0), 0)

  const mesActualIndex = new Date().getMonth()
  const anioActual = new Date().getFullYear()

  const ingresosMesActual = citasPagadas
    .filter(c => {
      if (!c.fecha) return false
      const fecha = new Date(`${c.fecha}T00:00:00`)
      return fecha.getMonth() === mesActualIndex && fecha.getFullYear() === anioActual
    })
    .reduce((acc, c) => acc + Number(c.monto || 0), 0)

  const reportesMensuales = Array.from({ length: 6 }).map((_, index) => {
    const fechaBase = new Date(anioActual, mesActualIndex - 5 + index, 1)
    const mes = fechaBase.getMonth()
    const anio = fechaBase.getFullYear()

    const citasDelMes = citasPagadas.filter(c => {
      if (!c.fecha) return false
      const fechaCita = new Date(`${c.fecha}T00:00:00`)
      return fechaCita.getMonth() === mes && fechaCita.getFullYear() === anio
    })

    return {
      mes: mesesCortos[mes],
      ingresos: citasDelMes.reduce((acc, c) => acc + Number(c.monto || 0), 0),
      atenciones: citasDelMes.length
    }
  })

  const mesActual = reportesMensuales[reportesMensuales.length - 1] || {
    ingresos: ingresosMesActual,
    atenciones: 0
  }

  const ingresosMes = reportesMensuales.map(r => ({
    mes: r.mes,
    monto: Number(r.ingresos || 0)
  }))

  const maxIngreso = Math.max(...ingresosMes.map(i => i.monto), 1)

  const especiesCount = mascotas.reduce((acc, m) => {
    const especie = m.especie || 'Otro'
    acc[especie] = (acc[especie] || 0) + 1
    return acc
  }, {})

  const especiesBars = [
    {
      label: 'Perros',
      especie: 'Perro',
      cantidad: especiesCount.Perro || 0,
      color: 'var(--primary)'
    },
    {
      label: 'Gatos',
      especie: 'Gato',
      cantidad: especiesCount.Gato || 0,
      color: '#8B5CF6'
    },
    {
      label: 'Conejos',
      especie: 'Conejo',
      cantidad: especiesCount.Conejo || 0,
      color: '#F59E0B'
    },
    {
      label: 'Otros',
      especie: 'Otros',
      cantidad: mascotas.filter(m => !['Perro', 'Gato', 'Conejo'].includes(m.especie)).length,
      color: '#94A3B8'
    }
  ].map(e => ({
    ...e,
    pct: totalMascotas ? Math.round((e.cantidad / totalMascotas) * 100) : 0
  }))

  const perrosPct = especiesBars.find(e => e.especie === 'Perro')?.pct || 0

  const ultimasAtenciones = [...historiales]
    .sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)))
    .slice(0, 4)
    .map(h => {
      const idMascota = h.id_mascota || h.idMascota
      const idVeterinario = h.id_veterinario || h.idVeterinario

      const mascota = mascotaById(idMascota)
      const cliente = clienteById(mascota?.id_cliente || mascota?.idCliente)
      const vet = veterinarioById(idVeterinario)

      return {
        mascota: mascota?.nombre || 'Sin mascota',
        especie: mascota?.raza || mascota?.especie || 'Sin especie',
        especieReal: mascota?.especie || 'Otro',
        veterinario: vet ? `Dr(a). ${vet.apellido}` : 'Sin veterinario',
        estado: 'Atendido',
        fecha: formatFecha(h.fecha),
        hora: String(h.fecha || '').includes('T')
          ? String(h.fecha).split('T')[1]?.slice(0, 5)
          : '--:--',
        cliente: cliente ? `${cliente.nombre} ${cliente.apellido}` : 'Sin cliente'
      }
    })

  const proximasCitas = [...citasActivas]
    .sort((a, b) => `${a.fecha} ${a.hora}`.localeCompare(`${b.fecha} ${b.hora}`))
    .slice(0, 3)
    .map(c => {
      const idMascota = c.id_mascota || c.idMascota
      const idCliente = c.id_cliente || c.idCliente
      const idServicio = c.id_servicio || c.idServicio

      const mascota = mascotaById(idMascota)
      const cliente = clienteById(idCliente)
      const servicio = servicioById(idServicio)

      return {
        hora: c.hora,
        mascota: mascota?.nombre || 'Sin mascota',
        cliente: cliente ? `${cliente.nombre} ${cliente.apellido}` : 'Sin cliente',
        tipo: servicio?.nombre || c.motivo || c.tipo || 'Servicio veterinario',
        estado: c.estado || 'Pendiente'
      }
    })

  const crecimientoMensual = (() => {
    const actual = ingresosMes[ingresosMes.length - 1]?.monto || 0
    const anterior = ingresosMes[ingresosMes.length - 2]?.monto || 0

    if (anterior === 0 && actual > 0) return 100
    if (anterior === 0 && actual === 0) return 0

    return Math.round(((actual - anterior) / anterior) * 100)
  })()

  const satisfaccionVisual = citas.length > 0
    ? Math.max(70, Math.round((citas.filter(c => c.estado === 'Confirmada').length / citas.length) * 100))
    : 0

  const kpis = [
    {
      icon: <Dog size={22} />,
      number: totalMascotas,
      label: 'Mascotas registradas',
      color: 'var(--primary)',
      ruta: '/mascotas'
    },
    {
      icon: <Users size={22} />,
      number: clientesActivos,
      label: 'Clientes activos',
      color: '#10B981',
      ruta: '/clientes'
    },
    {
      icon: <ClipboardList size={22} />,
      number: atencionesMes,
      label: 'Atenciones registradas',
      color: '#F59E0B',
      ruta: '/historial'
    },
    {
      icon: <Calendar size={22} />,
      number: citasActivas.length,
      label: 'Citas registradas',
      color: '#8B5CF6',
      ruta: '/citas'
    }
  ]

  const alertas = [
    {
      titulo: 'Pagos pendientes',
      texto: `Hay ${pagosPendientes} cita(s) con pago pendiente.`,
      icon: <CreditCard size={18} />,
      color: '#F59E0B',
      ruta: '/citas',
      boton: 'Ver citas'
    },
    {
      titulo: 'Citas por confirmar',
      texto: `Existen ${citasPendientes} cita(s) pendientes de confirmación.`,
      icon: <Calendar size={18} />,
      color: '#8B5CF6',
      ruta: '/citas',
      boton: 'Ver agenda'
    },
    {
      titulo: 'Historiales clínicos',
      texto: `Hay ${historiales.length} registros clínicos disponibles.`,
      icon: <ClipboardList size={18} />,
      color: '#3B82F6',
      ruta: '/historial',
      boton: 'Ver historial'
    }
  ]

  const actividades = [
    {
      icon: <PawPrint size={15} />,
      titulo: 'Mascotas registradas',
      texto: `${mascotas.length} mascotas en el sistema.`,
      tiempo: 'Actualizado',
      color: 'var(--primary)',
      ruta: '/mascotas'
    },
    {
      icon: <CreditCard size={15} />,
      titulo: 'Pagos pendientes',
      texto: `${pagosPendientes} pago(s) por revisar.`,
      tiempo: 'Hoy',
      color: '#10B981',
      ruta: '/citas'
    },
    {
      icon: <ClipboardList size={15} />,
      titulo: 'Historial clínico',
      texto: `${historiales.length} atención(es) registradas.`,
      tiempo: 'Reciente',
      color: '#3B82F6',
      ruta: '/historial'
    },
    {
      icon: <Calendar size={15} />,
      titulo: 'Citas activas',
      texto: `${citasActivas.length} cita(s) activas.`,
      tiempo: 'Hoy',
      color: '#F59E0B',
      ruta: '/citas'
    }
  ]

  if (loading) {
    return (
      <div style={styles.loadingBox}>
        <Loader2 size={34} color="var(--primary)" />
        <h3>Cargando dashboard...</h3>
        <p>Estamos preparando el panel administrativo.</p>
      </div>
    )
  }

  if (errorPage) {
    return (
      <div style={styles.errorBox}>
        <AlertCircle size={34} color="#DC2626" />
        <h3>Error al cargar dashboard</h3>
        <p>{errorPage}</p>
      </div>
    )
  }

  return (
    <div>
      {/* HERO */}
      <div style={styles.hero}>
        <div style={styles.heroLeft}>
          <button style={styles.heroBadge} onClick={() => setModalSistema(true)}>
            <Activity size={15} />
            Panel administrativo
          </button>

          <h1 style={styles.heroTitle}>
            Bienvenido, {user?.username || 'Administrador'}
          </h1>

          <p style={styles.heroSub}>
            Gestiona citas, clientes, mascotas, pagos e historial clínico desde un solo lugar.
          </p>

          <div style={styles.heroActions}>
            <button style={styles.heroMini} onClick={() => setModalSistema(true)}>
              <CheckCircle size={16} />
              Sistema activo
            </button>

            <button style={styles.heroMini} onClick={() => setModalAlertas(true)}>
              <Bell size={16} />
              {alertas.length} alertas nuevas
            </button>
          </div>
        </div>

        <div style={styles.heroRight}>
          <button style={styles.heroDate} onClick={() => navigate('/citas')}>
            <span>📅</span>
            {fechaActual}
          </button>

          <button style={styles.heroIncome} onClick={() => navigate('/reportes')}>
            <span style={styles.heroIncomeLabel}>Ingresos del mes</span>
            <strong>{formatMoney(mesActual.ingresos || ingresosMesActual)}</strong>
            <small>
              {crecimientoMensual >= 0 ? '+' : ''}
              {crecimientoMensual}% vs mes anterior
            </small>
          </button>
        </div>
      </div>

      {/* KPIS */}
      <div style={styles.statsGrid}>
        {kpis.map((k, i) => (
          <button key={i} style={styles.kpiCard} onClick={() => navigate(k.ruta)}>
            <div style={{ ...styles.kpiIcon, background: `${k.color}18`, color: k.color }}>
              {k.icon}
            </div>

            <div>
              <div style={styles.kpiNumber}>{k.number}</div>
              <div style={styles.kpiLabel}>{k.label}</div>
            </div>
          </button>
        ))}
      </div>

      {/* RESUMEN */}
      <div style={styles.quickGrid}>
        <button style={styles.quickCard} onClick={() => navigate('/reportes')}>
          <div style={{ ...styles.quickIcon, background: '#D1FAE5', color: '#059669' }}>
            <TrendingUp size={22} />
          </div>

          <div>
            <h3 style={styles.quickNumber}>
              {crecimientoMensual >= 0 ? '+' : ''}
              {crecimientoMensual}%
            </h3>
            <span style={styles.quickText}>Crecimiento mensual</span>
          </div>
        </button>

        <button style={styles.quickCard} onClick={() => navigate('/clientes')}>
          <div style={{ ...styles.quickIcon, background: '#DBEAFE', color: '#2563EB' }}>
            <Activity size={22} />
          </div>

          <div>
            <h3 style={styles.quickNumber}>{satisfaccionVisual}%</h3>
            <span style={styles.quickText}>Citas confirmadas</span>
          </div>
        </button>

        <button style={styles.quickCard} onClick={() => navigate('/citas')}>
          <div style={{ ...styles.quickIcon, background: '#FEF3C7', color: '#D97706' }}>
            <AlertCircle size={22} />
          </div>

          <div>
            <h3 style={styles.quickNumber}>{pagosPendientes}</h3>
            <span style={styles.quickText}>Pagos pendientes</span>
          </div>
        </button>
      </div>

      {/* BLOQUE CENTRAL */}
      <div style={styles.mainGrid}>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h3 style={styles.cardTitle}>Últimas atenciones</h3>
              <p style={styles.cardSub}>Registro reciente de consultas y servicios.</p>
            </div>

            <button style={styles.cardBadgeBtn} onClick={() => navigate('/historial')}>
              Ver historial
            </button>
          </div>

          <div style={styles.tableScroll}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Mascota</th>
                  <th style={styles.th}>Cliente</th>
                  <th style={styles.th}>Veterinario</th>
                  <th style={styles.th}>Fecha</th>
                  <th style={styles.th}>Estado</th>
                  <th style={styles.th}>Acción</th>
                </tr>
              </thead>

              <tbody>
                {ultimasAtenciones.map((a, i) => (
                  <tr key={i} style={i % 2 === 0 ? styles.trEven : {}}>
                    <td style={styles.td}>
                      <div style={styles.petCell}>
                        <div style={styles.petAvatar}>
                          {iconoMascota(a.especieReal)}
                        </div>

                        <div>
                          <strong>{a.mascota}</strong>
                          <div style={styles.petSub}>{a.especie}</div>
                        </div>
                      </div>
                    </td>

                    <td style={styles.td}>{a.cliente}</td>
                    <td style={styles.td}>{a.veterinario}</td>

                    <td style={styles.td}>
                      <div>{a.fecha}</div>
                      <small style={styles.muted}>{a.hora}</small>
                    </td>

                    <td style={styles.td}>
                      <span style={styles.badgeOk}>{a.estado}</span>
                    </td>

                    <td style={styles.td}>
                      <button style={styles.btnTable} onClick={() => navigate('/historial')}>
                        <Eye size={13} />
                        Ver historial
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {ultimasAtenciones.length === 0 && (
            <div style={{ padding: 22, color: 'var(--text-muted)', fontSize: 13 }}>
              No hay atenciones clínicas registradas todavía.
            </div>
          )}
        </div>

        {/* DISTRIBUCIÓN */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h3 style={styles.cardTitle}>Distribución por especie</h3>
              <p style={styles.cardSub}>Porcentaje de mascotas registradas.</p>
            </div>
          </div>

          <button
            style={{
              ...styles.chartCircle,
              background: `conic-gradient(var(--primary) 0% ${perrosPct}%, #E5E7EB ${perrosPct}% 100%)`
            }}
            onClick={() => navigate('/mascotas')}
          >
            <div>
              <strong>{perrosPct}%</strong>
              <span>Perros</span>
            </div>
          </button>

          {especiesBars.map(e => (
            <button key={e.label} style={styles.barBlock} onClick={() => navigate('/mascotas')}>
              <div style={styles.barHeader}>
                <span>{e.label}</span>
                <strong style={{ color: e.color }}>{e.pct}%</strong>
              </div>

              <div style={styles.barBg}>
                <div
                  style={{
                    ...styles.barFill,
                    width: `${e.pct}%`,
                    background: e.color
                  }}
                />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* BLOQUE INFERIOR */}
      <div style={styles.bottomGrid}>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h3 style={styles.cardTitle}>Próximas citas</h3>
              <p style={styles.cardSub}>Agenda pendiente del día.</p>
            </div>

            <button style={styles.smallAction} onClick={() => navigate('/citas')}>
              Ver agenda
            </button>
          </div>

          <div style={styles.appointmentList}>
            {proximasCitas.map((c, i) => (
              <button key={i} style={styles.appointmentItem} onClick={() => navigate('/citas')}>
                <div style={styles.timeBox}>
                  <Clock size={14} />
                  {c.hora}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={styles.appointmentTitle}>
                    {c.mascota} · {c.tipo}
                  </div>

                  <div style={styles.appointmentSub}>
                    {c.cliente}
                  </div>
                </div>

                <span style={c.estado === 'Confirmada' ? styles.badgeOk : styles.badgePend}>
                  {c.estado}
                </span>
              </button>
            ))}

            {proximasCitas.length === 0 && (
              <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                No hay citas activas registradas.
              </div>
            )}
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h3 style={styles.cardTitle}>Ingresos semestrales</h3>
              <p style={styles.cardSub}>Resumen visual de ingresos.</p>
            </div>

            <button style={styles.smallAction} onClick={() => navigate('/reportes')}>
              Reportes
            </button>
          </div>

          <button style={styles.incomeChart} onClick={() => navigate('/reportes')}>
            {ingresosMes.map(i => (
              <div key={i.mes} style={styles.incomeCol}>
                <span style={styles.incomeValue}>{formatMoney(i.monto)}</span>

                <div style={styles.incomeBarBg}>
                  <div
                    style={{
                      ...styles.incomeBar,
                      height: `${(i.monto / maxIngreso) * 100}%`
                    }}
                  />
                </div>

                <span style={styles.incomeMonth}>{i.mes}</span>
              </div>
            ))}
          </button>
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h3 style={styles.cardTitle}>Actividad reciente</h3>
              <p style={styles.cardSub}>Últimos movimientos del sistema.</p>
            </div>
          </div>

          <div style={styles.activityList}>
            {actividades.map((a, i) => (
              <button key={i} style={styles.activityItem} onClick={() => navigate(a.ruta)}>
                <div style={{ ...styles.activityIcon, background: `${a.color}18`, color: a.color }}>
                  {a.icon}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={styles.activityTitle}>{a.titulo}</div>
                  <div style={styles.activityText}>{a.texto}</div>
                </div>

                <span style={styles.activityTime}>{a.tiempo}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL ALERTAS */}
      {modalAlertas && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <div>
                <h3 style={styles.modalTitle}>Alertas del sistema</h3>
                <p style={styles.modalSub}>Acciones importantes detectadas hoy.</p>
              </div>

              <button style={styles.closeBtn} onClick={() => setModalAlertas(false)}>
                <X size={18} />
              </button>
            </div>

            <div style={styles.modalBody}>
              {alertas.map((a, i) => (
                <div key={i} style={styles.alertItem}>
                  <div style={{ ...styles.alertIcon, background: `${a.color}18`, color: a.color }}>
                    {a.icon}
                  </div>

                  <div style={{ flex: 1 }}>
                    <h4 style={styles.alertTitle}>{a.titulo}</h4>
                    <p style={styles.alertText}>{a.texto}</p>
                  </div>

                  <button
                    style={styles.alertBtn}
                    onClick={() => {
                      setModalAlertas(false)
                      navigate(a.ruta)
                    }}
                  >
                    {a.boton}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL SISTEMA */}
      {modalSistema && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <div>
                <h3 style={styles.modalTitle}>Estado del sistema</h3>
                <p style={styles.modalSub}>Resumen técnico del entorno actual.</p>
              </div>

              <button style={styles.closeBtn} onClick={() => setModalSistema(false)}>
                <X size={18} />
              </button>
            </div>

            <div style={styles.modalBody}>
              {[
                {
                  icon: <Wifi size={18} />,
                  titulo: 'Frontend',
                  texto: 'Disponible en entorno local',
                  estado: 'Activo'
                },
                {
                  icon: <Server size={18} />,
                  titulo: 'Backend',
                  texto: 'Spring Boot conectado al sistema',
                  estado: 'Activo'
                },
                {
                  icon: <Database size={18} />,
                  titulo: 'Base de datos',
                  texto: 'MySQL en XAMPP conectado correctamente',
                  estado: 'MySQL'
                },
                {
                  icon: <FileText size={18} />,
                  titulo: 'Módulos',
                  texto: `${clientes.length} clientes, ${mascotas.length} mascotas, ${citas.length} citas, ${historiales.length} historiales`,
                  estado: 'Real'
                }
              ].map((sist, i) => (
                <div key={i} style={styles.systemItem}>
                  <div style={styles.systemIcon}>{sist.icon}</div>

                  <div style={{ flex: 1 }}>
                    <h4 style={styles.alertTitle}>{sist.titulo}</h4>
                    <p style={styles.alertText}>{sist.texto}</p>
                  </div>

                  <span style={styles.systemBadge}>{sist.estado}</span>
                </div>
              ))}
            </div>

            <div style={styles.modalFooter}>
              <button
                style={styles.btnPrimary}
                onClick={() => {
                  setModalSistema(false)
                  navigate('/reportes')
                }}
              >
                <BarChart3 size={15} />
                Ver reportes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
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

  hero: {
    background: 'linear-gradient(135deg, rgba(232,97,44,.96), rgba(245,160,74,.92))',
    boxShadow: '0 18px 45px rgba(232,97,44,.22)',
    borderRadius: 24,
    padding: 30,
    color: '#fff',
    marginBottom: 24,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    gap: 24,
    position: 'relative',
    overflow: 'hidden'
  },

  heroLeft: {
    maxWidth: 620
  },

  heroBadge: {
    width: 'fit-content',
    background: 'rgba(255,255,255,.18)',
    border: '1px solid rgba(255,255,255,.25)',
    color: '#fff',
    borderRadius: 999,
    padding: '7px 12px',
    fontSize: 12,
    fontWeight: 800,
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    marginBottom: 16
  },

  heroTitle: {
    margin: 0,
    fontSize: 32,
    fontWeight: 900,
    letterSpacing: '-0.04em'
  },

  heroSub: {
    marginTop: 9,
    opacity: .95,
    fontSize: 15,
    lineHeight: 1.6
  },

  heroActions: {
    display: 'flex',
    gap: 10,
    marginTop: 18,
    flexWrap: 'wrap'
  },

  heroMini: {
    background: 'rgba(255,255,255,.16)',
    border: '1px solid rgba(255,255,255,.22)',
    color: '#fff',
    borderRadius: 12,
    padding: '9px 12px',
    fontSize: 12,
    fontWeight: 800,
    display: 'flex',
    alignItems: 'center',
    gap: 7
  },

  heroRight: {
    minWidth: 230,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    justifyContent: 'space-between'
  },

  heroDate: {
    background: 'rgba(255,255,255,.15)',
    color: '#fff',
    border: 'none',
    padding: '12px 16px',
    borderRadius: 14,
    textTransform: 'capitalize',
    fontSize: 12,
    fontWeight: 800,
    display: 'flex',
    alignItems: 'center',
    gap: 7
  },

  heroIncome: {
    background: 'rgba(255,255,255,.18)',
    border: '1px solid rgba(255,255,255,.24)',
    color: '#fff',
    borderRadius: 16,
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    textAlign: 'left'
  },

  heroIncomeLabel: {
    fontSize: 11,
    opacity: .85,
    fontWeight: 700
  },

  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4,1fr)',
    gap: 16,
    marginBottom: 22
  },

  kpiCard: {
    background: '#fff',
    border: '1px solid var(--border)',
    borderRadius: 16,
    padding: 18,
    boxShadow: 'var(--shadow)',
    display: 'flex',
    alignItems: 'center',
    gap: 13,
    textAlign: 'left'
  },

  kpiIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },

  kpiNumber: {
    fontSize: 25,
    fontWeight: 900,
    color: 'var(--text-main)'
  },

  kpiLabel: {
    fontSize: 12,
    color: 'var(--text-sub)',
    marginTop: 2
  },

  quickGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3,1fr)',
    gap: 16,
    marginBottom: 22
  },

  quickCard: {
    background: '#fff',
    borderRadius: 16,
    padding: 18,
    display: 'flex',
    alignItems: 'center',
    gap: 13,
    border: '1px solid var(--border)',
    boxShadow: 'var(--shadow)',
    textAlign: 'left'
  },

  quickIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },

  quickNumber: {
    margin: 0,
    fontSize: 22,
    fontWeight: 900,
    color: 'var(--text-main)'
  },

  quickText: {
    fontSize: 13,
    color: 'var(--text-sub)'
  },

  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '3fr 1.4fr',
    gap: 18,
    marginBottom: 18
  },

  bottomGrid: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 1fr 1.2fr',
    gap: 18
  },

  card: {
    border: '1px solid var(--border)',
    background: '#fff',
    borderRadius: 18,
    padding: 22,
    boxShadow: 'var(--shadow)'
  },

  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 18
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

  cardBadgeBtn: {
    background: 'var(--primary-light)',
    color: 'var(--primary)',
    border: 'none',
    padding: '5px 10px',
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 800
  },

  smallAction: {
    background: 'var(--primary-light)',
    color: 'var(--primary)',
    border: '1px solid #FFD6C7',
    padding: '7px 11px',
    borderRadius: 9,
    fontSize: 11,
    fontWeight: 800
  },

  tableScroll: {
    width: '100%',
    overflowX: 'auto'
  },

  table: {
    width: '100%',
    minWidth: 720,
    borderCollapse: 'collapse'
  },

  th: {
    textAlign: 'left',
    padding: '12px',
    fontSize: 11,
    color: 'var(--text-muted)',
    fontWeight: 900,
    textTransform: 'uppercase',
    borderBottom: '1px solid var(--border)',
    background: '#F8FAFC'
  },

  td: {
    padding: '13px 12px',
    borderBottom: '1px solid #F1F5F9',
    fontSize: 13,
    color: 'var(--text-main)'
  },

  trEven: {
    background: '#FEFCFB'
  },

  petCell: {
    display: 'flex',
    alignItems: 'center',
    gap: 10
  },

  petAvatar: {
    width: 38,
    height: 38,
    borderRadius: 12,
    background: 'var(--bg)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 18
  },

  petSub: {
    fontSize: 11,
    color: 'var(--text-muted)',
    marginTop: 2
  },

  muted: {
    color: 'var(--text-muted)',
    fontSize: 11
  },

  badgeOk: {
    background: '#DCFCE7',
    color: '#166534',
    padding: '5px 12px',
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 800,
    whiteSpace: 'nowrap'
  },

  badgePend: {
    background: '#FEF3C7',
    color: '#92400E',
    padding: '5px 12px',
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 800,
    whiteSpace: 'nowrap'
  },

  btnTable: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    background: '#EFF6FF',
    border: '1px solid #BFDBFE',
    color: '#2563EB',
    borderRadius: 8,
    padding: '7px 10px',
    fontSize: 12,
    fontWeight: 800
  },

  chartCircle: {
    width: 154,
    height: 154,
    borderRadius: '50%',
    margin: '4px auto 26px',
    boxShadow: '0 8px 25px rgba(232,97,44,.16)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    color: 'var(--text-main)',
    border: 'none'
  },

  barBlock: {
    marginBottom: 14,
    width: '100%',
    background: 'transparent',
    border: 'none',
    padding: 0,
    textAlign: 'left'
  },

  barHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: 6,
    fontSize: 13,
    color: 'var(--text-sub)'
  },

  barBg: {
    height: 10,
    borderRadius: 20,
    background: '#E5E7EB',
    overflow: 'hidden'
  },

  barFill: {
    height: '100%',
    borderRadius: 20
  },

  appointmentList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12
  },

  appointmentItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    background: '#FAFAFA',
    border: '1px solid var(--border)',
    borderRadius: 13,
    padding: 12,
    width: '100%',
    textAlign: 'left'
  },

  timeBox: {
    width: 72,
    background: 'var(--primary-light)',
    color: 'var(--primary)',
    borderRadius: 11,
    padding: '8px 10px',
    fontSize: 12,
    fontWeight: 900,
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    justifyContent: 'center'
  },

  appointmentTitle: {
    fontSize: 13,
    fontWeight: 900,
    color: 'var(--text-main)'
  },

  appointmentSub: {
    fontSize: 12,
    color: 'var(--text-sub)',
    marginTop: 2
  },

  incomeChart: {
    height: 180,
    display: 'flex',
    alignItems: 'flex-end',
    gap: 10,
    width: '100%',
    background: 'transparent',
    border: 'none'
  },

  incomeCol: {
    flex: 1,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 5
  },

  incomeValue: {
    fontSize: 10,
    color: 'var(--text-sub)',
    height: 14
  },

  incomeBarBg: {
    flex: 1,
    width: '100%',
    background: 'var(--bg)',
    borderRadius: '8px 8px 0 0',
    display: 'flex',
    alignItems: 'flex-end',
    overflow: 'hidden'
  },

  incomeBar: {
    width: '100%',
    background: 'linear-gradient(180deg,var(--primary),var(--accent))',
    borderRadius: '8px 8px 0 0'
  },

  incomeMonth: {
    fontSize: 11,
    color: 'var(--text-muted)',
    fontWeight: 700
  },

  activityList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 13
  },

  activityItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 11,
    border: 'none',
    borderBottom: '1px solid #F1F5F9',
    background: 'transparent',
    padding: '0 0 12px',
    width: '100%',
    textAlign: 'left'
  },

  activityIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },

  activityTitle: {
    fontSize: 13,
    fontWeight: 900,
    color: 'var(--text-main)'
  },

  activityText: {
    fontSize: 12,
    color: 'var(--text-sub)',
    marginTop: 2
  },

  activityTime: {
    fontSize: 10,
    color: 'var(--text-muted)',
    whiteSpace: 'nowrap'
  },

  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,.45)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
    padding: 16
  },

  modal: {
    width: '100%',
    maxWidth: 560,
    background: '#fff',
    borderRadius: 16,
    boxShadow: '0 25px 60px rgba(0,0,0,.22)',
    overflow: 'hidden'
  },

  modalHeader: {
    padding: '18px 22px',
    borderBottom: '1px solid var(--border)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },

  modalTitle: {
    fontSize: 18,
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
    display: 'flex'
  },

  modalBody: {
    padding: 22,
    display: 'flex',
    flexDirection: 'column',
    gap: 12
  },

  alertItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: 13,
    padding: 14
  },

  alertIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },

  alertTitle: {
    fontSize: 14,
    fontWeight: 900,
    color: 'var(--text-main)'
  },

  alertText: {
    fontSize: 12,
    color: 'var(--text-sub)',
    marginTop: 3
  },

  alertBtn: {
    background: 'var(--primary)',
    color: '#fff',
    border: 'none',
    borderRadius: 9,
    padding: '8px 12px',
    fontSize: 12,
    fontWeight: 800
  },

  systemItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: 13,
    padding: 14
  },

  systemIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    background: 'var(--primary-light)',
    color: 'var(--primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },

  systemBadge: {
    background: '#D1FAE5',
    color: '#065F46',
    borderRadius: 999,
    padding: '5px 10px',
    fontSize: 11,
    fontWeight: 800
  },

  modalFooter: {
    padding: '14px 22px',
    borderTop: '1px solid var(--border)',
    display: 'flex',
    justifyContent: 'flex-end'
  },

  btnPrimary: {
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    background: 'var(--primary)',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    padding: '10px 16px',
    fontSize: 13,
    fontWeight: 800
  }
}
