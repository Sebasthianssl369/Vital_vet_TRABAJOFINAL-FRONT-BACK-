import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'

const misMascotas = [
  {
    mascota:'Max', especie:'Perro', raza:'Labrador', edad:3,
    consultas:[
      { id:1, fecha:'02/05/2026 10:30', veterinario:'Dr. Silva',  motivo:'Control rutinario',   diagnostico:'Leve infección ocular.',      tratamiento:'Colirio antibiótico 2x/día por 7 días.' },
      { id:2, fecha:'15/03/2026 09:00', veterinario:'Dr. Román',  motivo:'Vacunación anual',    diagnostico:'Paciente sano.',               tratamiento:'Vacuna polivalente + antiparasitario.'   },
    ]
  },
  {
    mascota:'Luna', especie:'Gato', raza:'Siamés', edad:5,
    consultas:[
      { id:3, fecha:'01/05/2026 11:00', veterinario:'Dr. Román',  motivo:'Dermatología',        diagnostico:'Dermatitis alérgica leve.',    tratamiento:'Antihistamínico oral 1x/día por 10 días.' },
    ]
  },
]

export default function ClienteHistorial() {
  const { user } = useAuth()
  const [seleccionada, setSeleccionada] = useState(misMascotas[0])

  return (
    <div>
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Mi historial clínico 📋</h1>
          <p style={s.sub}>Consulta el historial de salud de tus mascotas.</p>
        </div>
      </div>

      <div style={s.layout}>
        {/* Panel izquierdo - mis mascotas */}
        <div style={s.panelLeft}>
          <p style={s.panelLabel}>Mis mascotas</p>
          {misMascotas.map(m => (
            <div
              key={m.mascota}
              style={{ ...s.mascotaItem, ...(seleccionada?.mascota === m.mascota ? s.mascotaActive : {}) }}
              onClick={() => setSeleccionada(m)}
            >
              <span style={{ fontSize:22 }}>{m.especie==='Perro'?'🐶':m.especie==='Gato'?'🐱':'🐾'}</span>
              <div>
                <div style={s.mascotaNombre}>{m.mascota}</div>
                <div style={s.mascotaSub}>{m.raza} · {m.edad} años</div>
              </div>
              <span style={s.countBadge}>{m.consultas.length}</span>
            </div>
          ))}
        </div>

        {/* Panel derecho - consultas */}
        <div style={s.panelRight}>
          {seleccionada && (
            <>
              <div style={s.petHeader}>
                <span style={{ fontSize:34 }}>{seleccionada.especie==='Perro'?'🐶':seleccionada.especie==='Gato'?'🐱':'🐾'}</span>
                <div>
                  <h2 style={s.petTitle}>{seleccionada.mascota}</h2>
                  <p style={s.petInfo}>{seleccionada.raza} · {seleccionada.edad} años</p>
                </div>
              </div>

              <p style={s.panelLabel}>{seleccionada.consultas.length} consultas registradas</p>

              <div style={s.timeline}>
                {seleccionada.consultas.map((c, i) => (
                  <div key={c.id} style={s.tItem}>
                    <div style={{ ...s.dot, background: i===0 ? 'var(--primary)' : 'var(--accent)' }}/>
                    <div style={s.tCard}>
                      <div style={s.tTop}>
                        <span style={s.tFecha}>{c.fecha}</span>
                        <span style={s.vetTag}>🩺 {c.veterinario}</span>
                      </div>
                      <h4 style={s.tMotivo}>{c.motivo}</h4>
                      <p style={s.tRow}><b>Diagnóstico:</b> {c.diagnostico}</p>
                      <p style={s.tRow}><b>Tratamiento:</b> {c.tratamiento}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

const s = {
  header:       { marginBottom:24 },
  title:        { fontSize:22, fontWeight:700 },
  sub:          { fontSize:13, color:'var(--text-sub)', marginTop:3 },
  layout:       { display:'flex', gap:18 },
  panelLeft:    { width:220, background:'#fff', borderRadius:12, border:'1px solid var(--border)', padding:16, display:'flex', flexDirection:'column', gap:8, flexShrink:0, boxShadow:'var(--shadow)' },
  panelLabel:   { fontSize:11, fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.04em', marginBottom:4 },
  mascotaItem:  { display:'flex', alignItems:'center', gap:10, padding:'10px', borderRadius:9, cursor:'pointer', border:'1px solid transparent' },
  mascotaActive:{ background:'var(--primary-light)', border:'1px solid var(--primary)' },
  mascotaNombre:{ fontWeight:600, fontSize:13 },
  mascotaSub:   { fontSize:11, color:'var(--text-muted)' },
  countBadge:   { marginLeft:'auto', background:'var(--primary)', color:'#fff', borderRadius:20, fontSize:10, fontWeight:700, padding:'2px 7px' },
  panelRight:   { flex:1, background:'#fff', borderRadius:12, border:'1px solid var(--border)', padding:'20px 24px', boxShadow:'var(--shadow)' },
  petHeader:    { display:'flex', alignItems:'center', gap:12, marginBottom:18, paddingBottom:16, borderBottom:'1px solid var(--border)' },
  petTitle:     { fontSize:18, fontWeight:700 },
  petInfo:      { fontSize:13, color:'var(--text-sub)', marginTop:2 },
  timeline:     { paddingLeft:18, borderLeft:'2px solid var(--border)', marginTop:12, display:'flex', flexDirection:'column', gap:0 },
  tItem:        { position:'relative', paddingLeft:20, paddingBottom:18 },
  dot:          { position:'absolute', left:-9, top:14, width:16, height:16, borderRadius:'50%', border:'2px solid #fff', outline:'2px solid var(--primary)' },
  tCard:        { background:'#FAFAFA', borderRadius:10, border:'1px solid var(--border)', padding:'14px 16px', display:'flex', flexDirection:'column', gap:6 },
  tTop:         { display:'flex', justifyContent:'space-between', alignItems:'center' },
  tFecha:       { fontSize:11, color:'var(--text-muted)' },
  vetTag:       { fontSize:11, color:'var(--text-muted)', background:'#F0F0F0', padding:'2px 9px', borderRadius:20 },
  tMotivo:      { fontSize:14, fontWeight:600, color:'var(--text-main)' },
  tRow:         { fontSize:13, color:'var(--text-sub)', lineHeight:1.5 },
}
