import { Dog, Users, ClipboardList, Calendar } from 'lucide-react'
import StatCard from '../components/StatCard'
import { useAuth } from '../context/AuthContext'

const ultimasAtenciones = [
  { mascota: 'Max',   especie: 'Labrador',  veterinario: 'Dr. Silva',  estado: 'Atendido',  fecha: '02/05/2026' },
  { mascota: 'Luna',  especie: 'Siamés',    veterinario: 'Dr. Román',  estado: 'Atendido',  fecha: '02/05/2026' },
  { mascota: 'Rocky', especie: 'Bulldog',   veterinario: 'Dr. Silva',  estado: 'Pendiente', fecha: '03/05/2026' },
  { mascota: 'Mia',   especie: 'Conejo',    veterinario: 'Dr. Solis',  estado: 'Pendiente', fecha: '03/05/2026' },
]

const especiesBars = [
  { label: 'Perros',  pct: 72, color: 'var(--primary)' },
  { label: 'Gatos',   pct: 18, color: 'var(--accent)'  },
  { label: 'Conejos', pct:  6, color: '#F5C87A'         },
  { label: 'Otros',   pct:  4, color: '#C8C8C8'         },
]

export default function Dashboard() {
  const { user } = useAuth()

  return (
    <div>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Bienvenido, {user?.username} 👋</h1>
          <p style={styles.sub}>Resumen general del sistema VitalVet</p>
        </div>
        <div style={styles.dateBadge}>{new Date().toLocaleDateString('es-PE', { weekday:'long', day:'numeric', month:'long' })}</div>
      </div>

      {/* Stats */}
      <div style={styles.statsGrid}>
        <StatCard icon={<Dog size={20}/>}           number={124} label="Mascotas registradas"  color="var(--primary)" />
        <StatCard icon={<Users size={20}/>}          number={98}  label="Clientes / Propietarios" color="#3B82F6" />
        <StatCard icon={<ClipboardList size={20}/>}  number={37}  label="Atenciones este mes"  color="#10B981" />
        <StatCard icon={<Calendar size={20}/>}       number={8}   label="Citas programadas hoy" color="var(--accent)" />
      </div>

      {/* Tablas y gráfico */}
      <div style={styles.row2}>
        {/* Últimas atenciones */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Últimas atenciones</h3>
          <table style={styles.table}>
            <thead>
              <tr>
                {['Mascota','Especie','Veterinario','Fecha','Estado'].map(h => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ultimasAtenciones.map((a, i) => (
                <tr key={i} style={i % 2 === 0 ? styles.trEven : {}}>
                  <td style={styles.td}><b>{a.mascota}</b></td>
                  <td style={styles.td}>{a.especie}</td>
                  <td style={styles.td}>{a.veterinario}</td>
                  <td style={styles.td}>{a.fecha}</td>
                  <td style={styles.td}>
                    <span style={a.estado === 'Atendido' ? styles.badgeOk : styles.badgePend}>
                      {a.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Gráfico especies */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Atenciones por especie</h3>
          <div style={{ display:'flex', flexDirection:'column', gap:14, marginTop:8 }}>
            {especiesBars.map(e => (
              <div key={e.label}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                  <span style={{ fontSize:13, color:'var(--text-sub)' }}>{e.label}</span>
                  <span style={{ fontSize:12, fontWeight:600, color:e.color }}>{e.pct}%</span>
                </div>
                <div style={styles.barBg}>
                  <div style={{ ...styles.barFill, width:`${e.pct}%`, background:e.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  header: { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 },
  title:  { fontSize:22, fontWeight:700, color:'var(--text-main)' },
  sub:    { fontSize:13, color:'var(--text-sub)', marginTop:3 },
  dateBadge: { background:'#fff', border:'1px solid var(--border)', borderRadius:8, padding:'7px 14px', fontSize:13, color:'var(--text-sub)', textTransform:'capitalize' },
  statsGrid: { display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:16, marginBottom:24 },
  row2:   { display:'grid', gridTemplateColumns:'3fr 2fr', gap:16 },
  card:   { background:'#fff', borderRadius:12, border:'1px solid var(--border)', padding:'20px', boxShadow:'var(--shadow)' },
  cardTitle: { fontSize:15, fontWeight:600, marginBottom:14, color:'var(--text-main)' },
  table:  { width:'100%', borderCollapse:'collapse' },
  th:     { textAlign:'left', padding:'8px 10px', fontSize:11, color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase', borderBottom:'1px solid var(--border)' },
  td:     { padding:'10px 10px', fontSize:13, color:'var(--text-main)', borderBottom:'1px solid #F5F0EB' },
  trEven: { background:'#FAFAFA' },
  badgeOk:   { background:'#D1FAE5', color:'#065F46', padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:600 },
  badgePend: { background:'#FEF3C7', color:'#92400E', padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:600 },
  barBg:  { background:'var(--bg)', borderRadius:6, height:10, overflow:'hidden' },
  barFill:{ height:'100%', borderRadius:6, transition:'width 0.3s' },
}
