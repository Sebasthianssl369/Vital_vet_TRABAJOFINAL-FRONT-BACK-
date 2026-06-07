import { useEffect, useState } from 'react'
import {
  BarChart2,
  Download,
  TrendingUp,
  Dog,
  ClipboardList,
  CreditCard,
  CalendarDays,
  AlertCircle,
  FileText,
  Wallet,
  Stethoscope,
  Activity
} from 'lucide-react'

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

import { getCitas } from '../services/citasService'
import { getClientes } from '../services/clientesService'
import { getMascotas } from '../services/mascotasService'
import { getVeterinarios } from '../services/veterinariosService'
import { getServicios } from '../services/serviciosService'

const formatMoney = (n) => `S/ ${Number(n || 0).toLocaleString('es-PE', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
})}`

const mesesCortos = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

const normalizarId = (obj, camel, snake) => obj?.[snake] || obj?.[camel]

const formatFecha = (fecha) => {
  if (!fecha) return 'Sin fecha'

  const [year, month, day] = String(fecha).split('-')
  if (!year || !month || !day) return fecha

  return `${day}/${month}/${year}`
}

export default function Reportes() {
  const [mesSeleccionado, setMesSeleccionado] = useState('')

  const [citas, setCitas] = useState([])
  const [clientes, setClientes] = useState([])
  const [mascotas, setMascotas] = useState([])
  const [veterinarios, setVeterinarios] = useState([])
  const [serviciosBase, setServiciosBase] = useState([])

  const [loading, setLoading] = useState(true)
  const [errorPage, setErrorPage] = useState('')

  useEffect(() => {
    const cargarReportes = async () => {
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
          getVeterinarios(),
          getServicios()
        ])

        setCitas(dataCitas)
        setClientes(dataClientes)
        setMascotas(dataMascotas)
        setVeterinarios(dataVeterinarios)
        setServiciosBase(dataServicios)
      } catch (error) {
        setErrorPage(error.message || 'Error al cargar reportes.')
      } finally {
        setLoading(false)
      }
    }

    cargarReportes()
  }, [])

  const clienteById = (id) =>
    clientes.find(c => Number(normalizarId(c, 'idCliente', 'id_cliente')) === Number(id))

  const mascotaById = (id) =>
    mascotas.find(m => Number(normalizarId(m, 'idMascota', 'id_mascota')) === Number(id))

  const veterinarioById = (id) =>
    veterinarios.find(v => Number(normalizarId(v, 'idVeterinario', 'id_veterinario')) === Number(id))

  const servicioById = (id) =>
    serviciosBase.find(s => Number(normalizarId(s, 'idServicio', 'id_servicio')) === Number(id))

  const getNombreCliente = (id) => {
    const cliente = clienteById(id)
    return cliente ? `${cliente.nombre} ${cliente.apellido}` : 'Sin cliente'
  }

  const getNombreMascota = (id) => {
    const mascota = mascotaById(id)
    return mascota?.nombre || 'Sin mascota'
  }

  const getNombreVeterinario = (id) => {
    const vet = veterinarioById(id)
    return vet ? `Dr(a). ${vet.nombre} ${vet.apellido}` : 'Sin veterinario'
  }

  const getNombreServicio = (cita) => {
    const servicio = servicioById(cita.id_servicio || cita.idServicio)
    return servicio?.nombre || cita.motivo || cita.tipo || 'Servicio veterinario'
  }

  const citasNormalizadas = citas.map(c => ({
    ...c,
    id_cita: c.id_cita || c.idCita,
    id_cliente: c.id_cliente || c.idCliente,
    id_mascota: c.id_mascota || c.idMascota,
    id_veterinario: c.id_veterinario || c.idVeterinario,
    id_servicio: c.id_servicio || c.idServicio,
    estado_pago: c.estado_pago || c.estadoPago || 'pendiente',
    estado: c.estado || 'Pendiente',
    monto: Number(c.monto || 0)
  }))

  const citasPagadas = citasNormalizadas.filter(c => c.estado_pago === 'pagado')
  const citasPendientesPago = citasNormalizadas.filter(c =>
    c.estado_pago === 'pendiente' && c.estado !== 'Cancelada'
  )

  const mesActualIndex = new Date().getMonth()
  const anioActual = new Date().getFullYear()

  const meses = Array.from({ length: 6 }).map((_, index) => {
    const fechaBase = new Date(anioActual, mesActualIndex - 5 + index, 1)
    const mes = fechaBase.getMonth()
    const anio = fechaBase.getFullYear()

    const citasDelMes = citasPagadas.filter(c => {
      if (!c.fecha) return false

      const fechaCita = new Date(`${c.fecha}T00:00:00`)
      return fechaCita.getMonth() === mes && fechaCita.getFullYear() === anio
    })

    const ingresos = citasDelMes.reduce((acc, c) => acc + Number(c.monto || 0), 0)

    return {
      mes: mesesCortos[mes],
      anio,
      atenciones: citasDelMes.length,
      ingresos,
      gastos: Math.round(ingresos * 0.35)
    }
  })

  useEffect(() => {
    if (!mesSeleccionado && meses.length > 0) {
      const ultimoMes = meses[meses.length - 1]
      setMesSeleccionado(`${ultimoMes.mes} ${ultimoMes.anio}`)
    }
  }, [mesSeleccionado, meses])

  const mesActual =
    meses.find(m => `${m.mes} ${m.anio}` === mesSeleccionado) ||
    meses[meses.length - 1] ||
    { mes: 'Sin datos', anio: anioActual, atenciones: 0, ingresos: 0, gastos: 0 }

  const totalIngresos = meses.reduce((acc, m) => acc + Number(m.ingresos || 0), 0)
  const totalGastos = meses.reduce((acc, m) => acc + Number(m.gastos || 0), 0)
  const ganancia = totalIngresos - totalGastos

  const maxIngreso = Math.max(...meses.map(m => Number(m.ingresos || 0)), 1)
  const maxAtenciones = Math.max(...meses.map(m => Number(m.atenciones || 0)), 1)

  const totalPendiente = citasPendientesPago.reduce((acc, c) => acc + Number(c.monto || 0), 0)

  const pagosPendientes = citasPendientesPago.map(cita => ({
    id: cita.id_cita,
    cliente: getNombreCliente(cita.id_cliente),
    mascota: getNombreMascota(cita.id_mascota),
    servicio: getNombreServicio(cita),
    fecha: cita.fecha || 'Sin fecha',
    monto: cita.monto
  }))

  const serviciosCount = citasNormalizadas.reduce((acc, cita) => {
    const servicio = getNombreServicio(cita)
    acc[servicio] = (acc[servicio] || 0) + 1
    return acc
  }, {})

  const coloresServicios = ['var(--primary)', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444']

  const servicios = Object.entries(serviciosCount)
    .map(([label, cantidad], index) => ({
      label,
      cantidad,
      color: coloresServicios[index % coloresServicios.length]
    }))
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 6)

  const maxServicio = Math.max(...servicios.map(s => s.cantidad), 1)

  const serviciosConPorcentaje = servicios.map(s => ({
    ...s,
    pct: Math.round((s.cantidad / maxServicio) * 100)
  }))

  const ultimasAtenciones = [...citasNormalizadas]
    .sort((a, b) => `${b.fecha} ${b.hora}`.localeCompare(`${a.fecha} ${a.hora}`))
    .slice(0, 5)
    .map(cita => ({
      mascota: getNombreMascota(cita.id_mascota),
      cliente: getNombreCliente(cita.id_cliente),
      servicio: getNombreServicio(cita),
      veterinario: getNombreVeterinario(cita.id_veterinario),
      monto: cita.monto,
      pago: cita.estado_pago === 'pagado' ? 'Pagado' : 'Pendiente'
    }))

  const crecimientoMensual = (() => {
    const actual = meses[meses.length - 1]?.ingresos || 0
    const anterior = meses[meses.length - 2]?.ingresos || 0

    if (anterior === 0 && actual > 0) return 100
    if (anterior === 0 && actual === 0) return 0

    return Math.round(((actual - anterior) / anterior) * 100)
  })()

  const exportarPDF = () => {
    const doc = new jsPDF()
    const fechaActual = new Date().toLocaleDateString('es-PE')

    doc.setFontSize(18)
    doc.text('Reporte Administrativo - VitalVet', 14, 18)

    doc.setFontSize(11)
    doc.setTextColor(100)
    doc.text(`Periodo: ${mesSeleccionado}`, 14, 26)
    doc.text(`Generado el: ${fechaActual}`, 14, 33)

    doc.setTextColor(0)
    doc.setFontSize(14)
    doc.text('Resumen general', 14, 45)

    autoTable(doc, {
      startY: 50,
      head: [['Indicador', 'Valor']],
      body: [
        ['Atenciones del mes', mesActual.atenciones],
        ['Ingresos del mes', formatMoney(mesActual.ingresos)],
        ['Pagos pendientes', formatMoney(totalPendiente)],
        ['Crecimiento mensual', `${crecimientoMensual >= 0 ? '+' : ''}${crecimientoMensual}%`],
        ['Ingresos semestrales', formatMoney(totalIngresos)],
        ['Gastos semestrales', formatMoney(totalGastos)],
        ['Ganancia estimada', formatMoney(ganancia)],
        ['Total citas registradas', citasNormalizadas.length],
        ['Citas confirmadas', citasNormalizadas.filter(c => c.estado === 'Confirmada').length]
      ],
      headStyles: {
        fillColor: [232, 97, 44],
        textColor: 255
      },
      styles: {
        fontSize: 10,
        cellPadding: 4
      }
    })

    doc.setFontSize(14)
    doc.text('Ingresos mensuales', 14, doc.lastAutoTable.finalY + 12)

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 17,
      head: [['Mes', 'Atenciones', 'Ingresos', 'Gastos', 'Ganancia']],
      body: meses.map(m => [
        `${m.mes} ${m.anio}`,
        m.atenciones,
        formatMoney(m.ingresos),
        formatMoney(m.gastos),
        formatMoney(m.ingresos - m.gastos)
      ]),
      headStyles: {
        fillColor: [232, 97, 44],
        textColor: 255
      },
      styles: {
        fontSize: 9,
        cellPadding: 3
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      }
    })

    doc.setFontSize(14)
    doc.text('Servicios más solicitados', 14, doc.lastAutoTable.finalY + 12)

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 17,
      head: [['Servicio', 'Cantidad', 'Porcentaje']],
      body: serviciosConPorcentaje.map(s => [
        s.label,
        s.cantidad,
        `${s.pct}%`
      ]),
      headStyles: {
        fillColor: [232, 97, 44],
        textColor: 255
      },
      styles: {
        fontSize: 9,
        cellPadding: 3
      }
    })

    doc.setFontSize(14)
    doc.text('Pagos pendientes', 14, doc.lastAutoTable.finalY + 12)

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 17,
      head: [['Cliente', 'Mascota', 'Servicio', 'Fecha', 'Monto']],
      body: pagosPendientes.length
        ? pagosPendientes.map(p => [
            p.cliente,
            p.mascota,
            p.servicio,
            formatFecha(p.fecha),
            formatMoney(p.monto)
          ])
        : [['Sin pendientes', '-', '-', '-', formatMoney(0)]],
      headStyles: {
        fillColor: [232, 97, 44],
        textColor: 255
      },
      styles: {
        fontSize: 9,
        cellPadding: 3
      }
    })

    doc.setFontSize(14)
    doc.text('Últimas atenciones', 14, doc.lastAutoTable.finalY + 12)

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 17,
      head: [['Mascota', 'Cliente', 'Servicio', 'Veterinario', 'Monto', 'Pago']],
      body: ultimasAtenciones.map(a => [
        a.mascota,
        a.cliente,
        a.servicio,
        a.veterinario,
        formatMoney(a.monto),
        a.pago
      ]),
      headStyles: {
        fillColor: [232, 97, 44],
        textColor: 255
      },
      styles: {
        fontSize: 9,
        cellPadding: 3
      }
    })

    doc.save(`Reporte_VitalVet_${Date.now()}.pdf`)
  }

  if (loading) {
    return (
      <div style={styles.loadingBox}>
        <BarChart2 size={34} color="var(--primary)" />
        <h3>Cargando reportes...</h3>
        <p>Estamos preparando las estadísticas del sistema.</p>
      </div>
    )
  }

  if (errorPage) {
    return (
      <div style={styles.errorBox}>
        <AlertCircle size={34} color="#DC2626" />
        <h3>Error al cargar reportes</h3>
        <p>{errorPage}</p>
      </div>
    )
  }

  return (
    <div>
      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Reportes</h1>
          <p style={styles.sub}>
            Estadísticas administrativas, ingresos, servicios y pagos pendientes.
          </p>
        </div>

        <div style={styles.headerActions}>
          <select
            style={styles.select}
            value={mesSeleccionado}
            onChange={e => setMesSeleccionado(e.target.value)}
          >
            {meses.map(m => (
              <option key={`${m.mes}-${m.anio}`}>
                {m.mes} {m.anio}
              </option>
            ))}
          </select>

          <button style={styles.btnExport} onClick={exportarPDF}>
            <Download size={15} />
            Exportar PDF
          </button>
        </div>
      </div>

      {/* KPIS */}
      <div style={styles.kpiGrid}>
        <div style={styles.kpiCard}>
          <div style={{ ...styles.kpiIcon, background: 'var(--primary-light)', color: 'var(--primary)' }}>
            <ClipboardList size={20} />
          </div>

          <div>
            <div style={styles.kpiVal}>{mesActual.atenciones}</div>
            <div style={styles.kpiLabel}>Atenciones del mes</div>
          </div>
        </div>

        <div style={styles.kpiCard}>
          <div style={{ ...styles.kpiIcon, background: '#D1FAE5', color: '#059669' }}>
            <Wallet size={20} />
          </div>

          <div>
            <div style={styles.kpiVal}>{formatMoney(mesActual.ingresos)}</div>
            <div style={styles.kpiLabel}>Ingresos del mes</div>
          </div>
        </div>

        <div style={styles.kpiCard}>
          <div style={{ ...styles.kpiIcon, background: '#FEF3C7', color: '#D97706' }}>
            <CreditCard size={20} />
          </div>

          <div>
            <div style={styles.kpiVal}>{formatMoney(totalPendiente)}</div>
            <div style={styles.kpiLabel}>Pagos pendientes</div>
          </div>
        </div>

        <div style={styles.kpiCard}>
          <div style={{ ...styles.kpiIcon, background: '#DBEAFE', color: '#2563EB' }}>
            <TrendingUp size={20} />
          </div>

          <div>
            <div style={styles.kpiVal}>
              {crecimientoMensual >= 0 ? '+' : ''}
              {crecimientoMensual}%
            </div>
            <div style={styles.kpiLabel}>Crecimiento mensual</div>
          </div>
        </div>
      </div>

      {/* RESUMEN PARA SUSTENTACIÓN */}
      <div style={styles.sustCard}>
        <div style={styles.sustIcon}>
          <FileText size={22} />
        </div>

        <div>
          <h3 style={styles.sustTitle}>Resumen para sustentación</h3>
          <p style={styles.sustText}>
            Este módulo permite visualizar indicadores clave de la clínica veterinaria:
            atenciones realizadas, ingresos mensuales, servicios más solicitados,
            pagos pendientes y rentabilidad general. Actualmente consume datos reales
            desde MySQL mediante el backend Spring Boot.
          </p>
        </div>
      </div>

      {/* GRÁFICOS PRINCIPALES */}
      <div style={styles.row2}>
        {/* INGRESOS POR MES */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h3 style={styles.cardTitle}>
                <BarChart2 size={16} />
                Ingresos por mes
              </h3>

              <p style={styles.cardSub}>
                Comparativo semestral de ingresos generados.
              </p>
            </div>

            <span style={styles.cardBadge}>
              Total {formatMoney(totalIngresos)}
            </span>
          </div>

          <div style={styles.chartArea}>
            {meses.map(m => (
              <div key={`${m.mes}-${m.anio}`} style={styles.barCol}>
                <span style={styles.barValue}>
                  {formatMoney(m.ingresos)}
                </span>

                <div style={styles.barBg}>
                  <div
                    style={{
                      ...styles.barFill,
                      height: `${(Number(m.ingresos || 0) / maxIngreso) * 100}%`
                    }}
                  />
                </div>

                <span style={styles.barLabel}>{m.mes}</span>
              </div>
            ))}
          </div>
        </div>

        {/* TOP SERVICIOS */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h3 style={styles.cardTitle}>
                <Stethoscope size={16} />
                Top servicios
              </h3>

              <p style={styles.cardSub}>
                Servicios más solicitados durante el periodo.
              </p>
            </div>
          </div>

          <div style={styles.serviceList}>
            {serviciosConPorcentaje.length > 0 ? (
              serviciosConPorcentaje.map((t, i) => (
                <div key={t.label} style={styles.serviceItem}>
                  <div style={styles.serviceTop}>
                    <div style={styles.serviceName}>
                      <span style={styles.rank}>{i + 1}</span>
                      {t.label}
                    </div>

                    <strong style={{ color: t.color }}>
                      {t.cantidad}
                    </strong>
                  </div>

                  <div style={styles.progBg}>
                    <div
                      style={{
                        ...styles.progFill,
                        width: `${t.pct}%`,
                        background: t.color
                      }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div style={styles.emptyMini}>
                No hay servicios registrados en citas todavía.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SEGUNDO BLOQUE */}
      <div style={styles.row3}>
        {/* ATENCIONES */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h3 style={styles.cardTitle}>
                <Activity size={16} />
                Atenciones semestrales
              </h3>

              <p style={styles.cardSub}>
                Evolución mensual de citas pagadas.
              </p>
            </div>
          </div>

          <div style={styles.lineFake}>
            {meses.map(m => (
              <div key={`${m.mes}-${m.anio}`} style={styles.attCol}>
                <div style={styles.attNumber}>{m.atenciones}</div>

                <div style={styles.attBg}>
                  <div
                    style={{
                      ...styles.attFill,
                      height: `${(Number(m.atenciones || 0) / maxAtenciones) * 100}%`
                    }}
                  />
                </div>

                <div style={styles.attMonth}>{m.mes}</div>
              </div>
            ))}
          </div>
        </div>

        {/* RESUMEN FINANCIERO */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h3 style={styles.cardTitle}>
                <Wallet size={16} />
                Resumen financiero
              </h3>

              <p style={styles.cardSub}>
                Ingresos, gastos y ganancia estimada.
              </p>
            </div>
          </div>

          <div style={styles.finGrid}>
            <div style={styles.finBox}>
              <span>Ingresos</span>
              <strong>{formatMoney(totalIngresos)}</strong>
            </div>

            <div style={styles.finBox}>
              <span>Gastos</span>
              <strong>{formatMoney(totalGastos)}</strong>
            </div>

            <div style={{ ...styles.finBox, background: '#ECFDF5', borderColor: '#A7F3D0' }}>
              <span>Ganancia</span>
              <strong style={{ color: '#059669' }}>
                {formatMoney(ganancia)}
              </strong>
            </div>
          </div>
        </div>

        {/* PAGOS PENDIENTES */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h3 style={styles.cardTitle}>
                <AlertCircle size={16} />
                Pagos pendientes
              </h3>

              <p style={styles.cardSub}>
                Citas que aún no registran pago.
              </p>
            </div>

            <span style={styles.pendingBadge}>
              {pagosPendientes.length}
            </span>
          </div>

          <div style={styles.pendingList}>
            {pagosPendientes.length > 0 ? (
              pagosPendientes.map(p => (
                <div key={p.id} style={styles.pendingItem}>
                  <div>
                    <strong>{p.mascota}</strong>
                    <p>{p.cliente}</p>
                    <small>{p.servicio} · {formatFecha(p.fecha)}</small>
                  </div>

                  <b>{formatMoney(p.monto)}</b>
                </div>
              ))
            ) : (
              <div style={styles.emptyMini}>
                No hay pagos pendientes.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* TABLA INGRESOS */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div>
            <h3 style={styles.cardTitle}>
              <CalendarDays size={16} />
              Tabla de ingresos mensuales
            </h3>

            <p style={styles.cardSub}>
              Detalle financiero mensual con utilidad estimada.
            </p>
          </div>
        </div>

        <div style={styles.tableScroll}>
          <table style={styles.table}>
            <thead>
              <tr>
                {['Mes', 'Atenciones', 'Ingresos', 'Gastos', 'Ganancia'].map(h => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>

            <tbody>
              {meses.map((m, i) => (
                <tr key={`${m.mes}-${m.anio}`} style={i % 2 === 0 ? styles.trEven : {}}>
                  <td style={styles.td}>
                    <b>{m.mes} {m.anio}</b>
                  </td>

                  <td style={styles.td}>{m.atenciones}</td>
                  <td style={styles.td}>{formatMoney(m.ingresos)}</td>
                  <td style={styles.td}>{formatMoney(m.gastos)}</td>

                  <td style={styles.td}>
                    <span style={styles.profitText}>
                      {formatMoney(m.ingresos - m.gastos)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ÚLTIMAS ATENCIONES */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div>
            <h3 style={styles.cardTitle}>
              <Dog size={16} />
              Últimas atenciones con ingresos
            </h3>

            <p style={styles.cardSub}>
              Servicios recientes y estado de pago.
            </p>
          </div>
        </div>

        <div style={styles.tableScroll}>
          <table style={styles.table}>
            <thead>
              <tr>
                {['Mascota', 'Cliente', 'Servicio', 'Veterinario', 'Monto', 'Pago'].map(h => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>

            <tbody>
              {ultimasAtenciones.map((a, i) => (
                <tr key={i} style={i % 2 === 0 ? styles.trEven : {}}>
                  <td style={styles.td}>
                    <b>{a.mascota}</b>
                  </td>

                  <td style={styles.td}>{a.cliente}</td>
                  <td style={styles.td}>{a.servicio}</td>
                  <td style={styles.td}>{a.veterinario}</td>
                  <td style={styles.td}>{formatMoney(a.monto)}</td>

                  <td style={styles.td}>
                    <span style={a.pago === 'Pagado' ? styles.badgeOk : styles.badgePend}>
                      {a.pago === 'Pagado' ? '✅ Pagado' : '⏳ Pendiente'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {ultimasAtenciones.length === 0 && (
          <div style={styles.emptyMini}>
            No hay atenciones registradas todavía.
          </div>
        )}
      </div>

      {/* NOTA */}
      <div style={styles.nota}>
        <b>Nota:</b> Este reporte consume datos reales desde MySQL por medio del backend Spring Boot.
        Las barras y tablas son componentes visuales propios del frontend.
        El botón <b> Exportar PDF</b> genera un archivo real usando <code> jsPDF</code> y <code> jspdf-autotable</code>.
      </div>
    </div>
  )
}

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24
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
    gap: 10,
    alignItems: 'center'
  },

  select: {
    padding: '10px 14px',
    border: '1px solid var(--border)',
    borderRadius: 10,
    fontSize: 13,
    background: '#fff',
    color: 'var(--text-main)'
  },

  btnExport: {
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    background: 'linear-gradient(135deg,var(--primary),var(--accent))',
    border: 'none',
    color: '#fff',
    borderRadius: 10,
    padding: '11px 17px',
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

  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4,1fr)',
    gap: 14,
    marginBottom: 20
  },

  kpiCard: {
    background: '#fff',
    borderRadius: 14,
    border: '1px solid var(--border)',
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

  kpiVal: {
    fontSize: 24,
    fontWeight: 900,
    color: 'var(--text-main)'
  },

  kpiLabel: {
    fontSize: 12,
    color: 'var(--text-sub)',
    marginTop: 2
  },

  sustCard: {
    background: 'linear-gradient(135deg,#FFFFFF,#FFF8EE)',
    border: '1px solid var(--border)',
    borderRadius: 16,
    padding: 18,
    boxShadow: 'var(--shadow)',
    display: 'flex',
    gap: 14,
    marginBottom: 20
  },

  sustIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    background: 'var(--primary-light)',
    color: 'var(--primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },

  sustTitle: {
    fontSize: 16,
    fontWeight: 900,
    color: 'var(--text-main)',
    marginBottom: 4
  },

  sustText: {
    fontSize: 13,
    color: 'var(--text-sub)',
    lineHeight: 1.6
  },

  row2: {
    display: 'grid',
    gridTemplateColumns: '3fr 2fr',
    gap: 16,
    marginBottom: 16
  },

  row3: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 1fr 1.2fr',
    gap: 16,
    marginBottom: 16
  },

  card: {
    background: '#fff',
    borderRadius: 14,
    border: '1px solid var(--border)',
    padding: 20,
    boxShadow: 'var(--shadow)',
    marginBottom: 16
  },

  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16
  },

  cardTitle: {
    fontSize: 15,
    fontWeight: 900,
    color: 'var(--text-main)',
    display: 'flex',
    alignItems: 'center',
    gap: 7
  },

  cardSub: {
    fontSize: 12,
    color: 'var(--text-sub)',
    marginTop: 3
  },

  cardBadge: {
    background: 'var(--primary-light)',
    color: 'var(--primary)',
    borderRadius: 999,
    padding: '6px 11px',
    fontSize: 11,
    fontWeight: 800
  },

  chartArea: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: 10,
    height: 210,
    paddingTop: 10
  },

  barCol: {
    flex: 1,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 5
  },

  barValue: {
    fontSize: 10,
    color: 'var(--text-sub)',
    height: 14
  },

  barBg: {
    width: '100%',
    flex: 1,
    display: 'flex',
    alignItems: 'flex-end',
    background: 'var(--bg)',
    borderRadius: '8px 8px 0 0',
    overflow: 'hidden'
  },

  barFill: {
    width: '100%',
    background: 'linear-gradient(180deg,var(--primary),var(--accent))',
    borderRadius: '8px 8px 0 0',
    transition: 'height .3s ease'
  },

  barLabel: {
    fontSize: 11,
    color: 'var(--text-muted)',
    fontWeight: 800
  },

  serviceList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 15
  },

  serviceItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6
  },

  serviceTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: 13
  },

  serviceName: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    color: 'var(--text-sub)',
    fontWeight: 700
  },

  rank: {
    width: 22,
    height: 22,
    borderRadius: '50%',
    background: 'var(--primary-light)',
    color: 'var(--primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 11,
    fontWeight: 900
  },

  progBg: {
    background: 'var(--bg)',
    borderRadius: 999,
    height: 10,
    overflow: 'hidden'
  },

  progFill: {
    height: '100%',
    borderRadius: 999
  },

  lineFake: {
    height: 185,
    display: 'flex',
    alignItems: 'flex-end',
    gap: 10
  },

  attCol: {
    flex: 1,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 5
  },

  attNumber: {
    fontSize: 11,
    color: 'var(--text-sub)',
    fontWeight: 800
  },

  attBg: {
    flex: 1,
    width: '100%',
    background: '#F8FAFC',
    borderRadius: 999,
    display: 'flex',
    alignItems: 'flex-end',
    overflow: 'hidden'
  },

  attFill: {
    width: '100%',
    background: '#3B82F6',
    borderRadius: 999
  },

  attMonth: {
    fontSize: 11,
    color: 'var(--text-muted)',
    fontWeight: 700
  },

  finGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10
  },

  finBox: {
    border: '1px solid var(--border)',
    background: 'var(--bg)',
    borderRadius: 12,
    padding: 14,
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 13,
    color: 'var(--text-sub)'
  },

  pendingBadge: {
    background: '#FEE2E2',
    color: '#991B1B',
    width: 28,
    height: 28,
    borderRadius: '50%',
    fontSize: 12,
    fontWeight: 900,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },

  pendingList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10
  },

  pendingItem: {
    background: '#FFF7ED',
    border: '1px solid #FED7AA',
    borderRadius: 12,
    padding: 12,
    display: 'flex',
    justifyContent: 'space-between',
    gap: 10,
    fontSize: 13
  },

  emptyMini: {
    background: '#F8FAFC',
    border: '1px dashed var(--border)',
    borderRadius: 12,
    padding: 14,
    fontSize: 12,
    color: 'var(--text-sub)',
    textAlign: 'center'
  },

  tableScroll: {
    width: '100%',
    overflowX: 'auto'
  },

  table: {
    width: '100%',
    minWidth: 760,
    borderCollapse: 'collapse'
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

  profitText: {
    color: '#059669',
    fontWeight: 900
  },

  badgeOk: {
    background: '#D1FAE5',
    color: '#065F46',
    padding: '5px 11px',
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 800
  },

  badgePend: {
    background: '#FEF3C7',
    color: '#92400E',
    padding: '5px 11px',
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 800
  },

  nota: {
    background: '#FFFBEA',
    border: '1px solid #FDE68A',
    borderRadius: 12,
    padding: '13px 16px',
    fontSize: 12,
    color: '#92400E',
    lineHeight: 1.6
  }
}
