import { BarChart2, Download, TrendingUp, Users, Dog, ClipboardList } from 'lucide-react'

const meses = ['Ene','Feb','Mar','Abr','May','Jun']
const valores = [28, 32, 41, 37, 0, 0]
const maxVal = Math.max(...valores.filter(v=>v>0))

const tratamientos = [
  { label:'Vacunación',    pct:65, color:'var(--primary)' },
  { label:'Consulta gral',pct:48, color:'var(--accent)'  },
  { label:'Desparasitac.',pct:30, color:'#F5C87A'         },
  { label:'Cirugía',       pct:12, color:'#C0C0C0'        },
]

export default function Reportes() {
  return (
    <div>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Reportes</h1>
          <p style={styles.sub}>Estadísticas del sistema — Abril 2026</p>
        </div>
        <div style={{display:'flex',gap:10,alignItems:'center'}}>
          <select style={styles.select}>
            <option>Abril 2026</option>
            <option>Marzo 2026</option>
            <option>Febrero 2026</option>
          </select>
          <button style={styles.btnExport}><Download size={14}/> Exportar PDF</button>
        </div>
      </div>

      {/* KPIs */}
      <div style={styles.kpiGrid}>
        {[
          { icon:<ClipboardList size={20}/>, val:37,       label:'Atenciones del mes', color:'var(--primary)' },
          { icon:<Dog size={20}/>,           val:14,       label:'Nuevas mascotas',    color:'#10B981'        },
          { icon:<Users size={20}/>,         val:8,        label:'Nuevos clientes',    color:'#3B82F6'        },
          { icon:<TrendingUp size={20}/>,    val:'S/ 4,820',label:'Ingresos estimados',color:'var(--accent)'  },
        ].map((k,i) => (
          <div key={i} style={styles.kpiCard}>
            <div style={{...styles.kpiIcon, background:k.color+'18', color:k.color}}>{k.icon}</div>
            <div style={styles.kpiVal}>{k.val}</div>
            <div style={styles.kpiLabel}>{k.label}</div>
          </div>
        ))}
      </div>

      <div style={styles.row2}>
        {/* Gráfico de barras */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}><BarChart2 size={16}/> Atenciones por mes (2026)</h3>
          <div style={styles.chartArea}>
            {meses.map((m, i) => (
              <div key={m} style={styles.barCol}>
                <span style={styles.barNum}>{valores[i] || ''}</span>
                <div style={styles.barBg}>
                  <div style={{
                    ...styles.barFill,
                    height: valores[i] ? `${(valores[i]/maxVal)*100}%` : '4px',
                    background: i===3 ? 'var(--accent)' : valores[i] ? 'var(--primary)' : '#E0E0E0',
                    opacity: valores[i] ? 1 : 0.4,
                  }}/>
                </div>
                <span style={{ ...styles.barLabel, color: i===3 ? 'var(--primary)' : 'var(--text-muted)', fontWeight: i===3 ? 700 : 400 }}>{m}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top tratamientos */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Top tratamientos del mes</h3>
          <div style={{display:'flex',flexDirection:'column',gap:16,marginTop:8}}>
            {tratamientos.map(t => (
              <div key={t.label}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>
                  <span style={{fontSize:13,color:'var(--text-sub)'}}>{t.label}</span>
                  <span style={{fontSize:12,fontWeight:700,color:t.color}}>{t.pct}%</span>
                </div>
                <div style={styles.progBg}>
                  <div style={{...styles.progFill, width:`${t.pct}%`, background:t.color}}/>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Nota */}
      <div style={styles.nota}>
        <b>Nota:</b> Los datos mostrados son estadísticos del mes actual. Para exportar el reporte completo en PDF, conecta el módulo de reportes con el backend (endpoint <code>/api/reportes/generar</code>).
      </div>
    </div>
  )
}

const styles = {
  header:   {display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:24},
  title:    {fontSize:22,fontWeight:700},
  sub:      {fontSize:13,color:'var(--text-sub)',marginTop:3},
  select:   {padding:'8px 12px',border:'1px solid var(--border)',borderRadius:8,fontSize:13,background:'#fff',color:'var(--text-main)'},
  btnExport:{display:'flex',alignItems:'center',gap:7,background:'transparent',border:'1px solid var(--primary)',color:'var(--primary)',borderRadius:9,padding:'9px 16px',fontWeight:600,fontSize:13},
  kpiGrid:  {display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginBottom:22},
  kpiCard:  {background:'#fff',borderRadius:12,border:'1px solid var(--border)',padding:'18px 16px',boxShadow:'var(--shadow)',display:'flex',flexDirection:'column',gap:6},
  kpiIcon:  {width:38,height:38,borderRadius:9,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:2},
  kpiVal:   {fontSize:24,fontWeight:700,color:'var(--text-main)'},
  kpiLabel: {fontSize:12,color:'var(--text-sub)'},
  row2:     {display:'grid',gridTemplateColumns:'3fr 2fr',gap:16,marginBottom:16},
  card:     {background:'#fff',borderRadius:12,border:'1px solid var(--border)',padding:'20px',boxShadow:'var(--shadow)'},
  cardTitle:{fontSize:15,fontWeight:600,marginBottom:16,color:'var(--text-main)',display:'flex',alignItems:'center',gap:7},
  chartArea:{display:'flex',alignItems:'flex-end',gap:10,height:160,paddingTop:8},
  barCol:   {flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:4},
  barNum:   {fontSize:10,color:'var(--text-sub)',height:14},
  barBg:    {width:'100%',flex:1,display:'flex',alignItems:'flex-end',background:'var(--bg)',borderRadius:'4px 4px 0 0',overflow:'hidden'},
  barFill:  {width:'100%',borderRadius:'4px 4px 0 0',transition:'height 0.4s'},
  barLabel: {fontSize:11,color:'var(--text-muted)'},
  progBg:   {background:'var(--bg)',borderRadius:6,height:10,overflow:'hidden'},
  progFill: {height:'100%',borderRadius:6},
  nota:     {background:'#FFFBEA',border:'1px solid #FDE68A',borderRadius:10,padding:'12px 16px',fontSize:12,color:'#92400E'},
}
