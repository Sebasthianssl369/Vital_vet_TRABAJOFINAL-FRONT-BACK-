import {
  Dog,
  Users,
  ClipboardList,
  Calendar,
  TrendingUp,
  Activity
} from 'lucide-react'

import StatCard from '../components/StatCard'
import { useAuth } from '../context/AuthContext'

const ultimasAtenciones = [
  { mascota:'Max', especie:'Labrador', veterinario:'Dr. Silva', estado:'Atendido', fecha:'02/05/2026' },
  { mascota:'Luna', especie:'Siamés', veterinario:'Dr. Román', estado:'Atendido', fecha:'02/05/2026' },
  { mascota:'Rocky', especie:'Bulldog', veterinario:'Dr. Silva', estado:'Pendiente', fecha:'03/05/2026' },
  { mascota:'Mia', especie:'Conejo', veterinario:'Dr. Solis', estado:'Pendiente', fecha:'03/05/2026' },
]

const especiesBars = [
  { label:'Perros', pct:72, color:'#2563EB' },
  { label:'Gatos', pct:18, color:'#8B5CF6' },
  { label:'Conejos', pct:6, color:'#F59E0B' },
  { label:'Otros', pct:4, color:'#94A3B8' },
]

export default function Dashboard() {
  const { user } = useAuth()

  return (
    <div>

      {/* HERO */}
      <div style={styles.hero}>
        <div>
          <h1 style={styles.heroTitle}>
            Bienvenido, {user?.username} 👋
          </h1>

          <p style={styles.heroSub}>
            Gestiona la clínica veterinaria desde un solo lugar.
          </p>
        </div>

        <div style={styles.heroDate}>
          {new Date().toLocaleDateString('es-PE', {
            weekday:'long',
            day:'numeric',
            month:'long',
            year:'numeric'
          })}
        </div>
      </div>

      {/* KPIS */}
      <div style={styles.statsGrid}>
        <StatCard
          icon={<Dog size={22}/>}
          number={124}
          label="Mascotas registradas"
          color="#2563EB"
        />

        <StatCard
          icon={<Users size={22}/>}
          number={98}
          label="Clientes activos"
          color="#10B981"
        />

        <StatCard
          icon={<ClipboardList size={22}/>}
          number={37}
          label="Atenciones del mes"
          color="#F59E0B"
        />

        <StatCard
          icon={<Calendar size={22}/>}
          number={8}
          label="Citas de hoy"
          color="#8B5CF6"
        />
      </div>

      {/* RESUMEN */}
      <div style={styles.quickGrid}>
        <div style={styles.quickCard}>
          <TrendingUp size={22}/>
          <div>
            <h3 style={styles.quickNumber}>+15%</h3>
            <span style={styles.quickText}>
              Crecimiento mensual
            </span>
          </div>
        </div>

        <div style={styles.quickCard}>
          <Activity size={22}/>
          <div>
            <h3 style={styles.quickNumber}>94%</h3>
            <span style={styles.quickText}>
              Satisfacción clientes
            </span>
          </div>
        </div>
      </div>

      {/* CONTENIDO */}
      <div style={styles.row2}>

        {/* TABLA */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>
            Últimas atenciones
          </h3>

          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Mascota</th>
                <th style={styles.th}>Especie</th>
                <th style={styles.th}>Veterinario</th>
                <th style={styles.th}>Fecha</th>
                <th style={styles.th}>Estado</th>
              </tr>
            </thead>

            <tbody>
              {ultimasAtenciones.map((a,i)=>(
                <tr key={i}>
                  <td style={styles.td}>
                    <strong>{a.mascota}</strong>
                  </td>

                  <td style={styles.td}>{a.especie}</td>
                  <td style={styles.td}>{a.veterinario}</td>
                  <td style={styles.td}>{a.fecha}</td>

                  <td style={styles.td}>
                    <span
                      style={
                        a.estado === 'Atendido'
                        ? styles.badgeOk
                        : styles.badgePend
                      }
                    >
                      {a.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* GRAFICO */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>
            Distribución por especie
          </h3>

          <div style={styles.chartCircle}>
            72%
          </div>

          {especiesBars.map(e => (
            <div key={e.label} style={{ marginBottom:14 }}>
              <div style={styles.barHeader}>
                <span>{e.label}</span>
                <span>{e.pct}%</span>
              </div>

              <div style={styles.barBg}>
                <div
                  style={{
                    ...styles.barFill,
                    width:`${e.pct}%`,
                    background:e.color
                  }}
                />
              </div>
            </div>
          ))}
        </div>

      </div>

    </div>
  )
}

const styles = {

  hero:{
    background:'linear-gradient(135deg,#2563EB,#3B82F6)',
    borderRadius:20,
    padding:'28px',
    color:'#fff',
    marginBottom:24,
    display:'flex',
    justifyContent:'space-between',
    alignItems:'center'
  },

  heroTitle:{
    margin:0,
    fontSize:28,
    fontWeight:700
  },

  heroSub:{
    marginTop:8,
    opacity:.9
  },

  heroDate:{
    background:'rgba(255,255,255,.15)',
    padding:'12px 18px',
    borderRadius:12,
    textTransform:'capitalize'
  },

  statsGrid:{
    display:'grid',
    gridTemplateColumns:'repeat(4,1fr)',
    gap:16,
    marginBottom:24
  },

  quickGrid:{
    display:'grid',
    gridTemplateColumns:'1fr 1fr',
    gap:16,
    marginBottom:24
  },

  quickCard:{
    background:'#fff',
    borderRadius:16,
    padding:'18px',
    display:'flex',
    alignItems:'center',
    gap:12,
    boxShadow:'0 4px 18px rgba(0,0,0,.05)'
  },

  quickNumber:{
    margin:0,
    fontSize:20
  },

  quickText:{
    fontSize:13,
    color:'#64748B'
  },

  row2:{
    display:'grid',
    gridTemplateColumns:'3fr 1.5fr',
    gap:18
  },

  card:{
    background:'#fff',
    borderRadius:18,
    padding:'22px',
    boxShadow:'0 4px 20px rgba(0,0,0,.05)'
  },

  cardTitle:{
    marginBottom:18,
    fontSize:16,
    fontWeight:700
  },

  table:{
    width:'100%',
    borderCollapse:'collapse'
  },

  th:{
    textAlign:'left',
    padding:'12px',
    fontSize:12,
    color:'#64748B',
    borderBottom:'1px solid #E2E8F0'
  },

  td:{
    padding:'14px 12px',
    borderBottom:'1px solid #F1F5F9'
  },

  badgeOk:{
    background:'#DCFCE7',
    color:'#166534',
    padding:'5px 12px',
    borderRadius:999
  },

  badgePend:{
    background:'#FEF3C7',
    color:'#92400E',
    padding:'5px 12px',
    borderRadius:999
  },

  chartCircle:{
    width:150,
    height:150,
    borderRadius:'50%',
    margin:'0 auto 25px',
    background:'conic-gradient(#2563EB 0% 72%, #E5E7EB 72% 100%)',
    display:'flex',
    alignItems:'center',
    justifyContent:'center',
    fontWeight:700,
    fontSize:28
  },

  barHeader:{
    display:'flex',
    justifyContent:'space-between',
    marginBottom:5,
    fontSize:13
  },

  barBg:{
    height:10,
    borderRadius:20,
    background:'#E5E7EB',
    overflow:'hidden'
  },

  barFill:{
    height:'100%',
    borderRadius:20
  }
}
