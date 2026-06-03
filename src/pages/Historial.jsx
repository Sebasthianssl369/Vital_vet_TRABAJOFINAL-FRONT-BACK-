import { useState } from 'react'
import { Search, Plus, X } from 'lucide-react'

const historiales = [
  {
    mascota: 'Max', especie:'Perro', raza:'Labrador', edad:3, cliente:'Carlos Pérez',
    consultas:[
      { id:1, fecha:'02/05/2026 10:30', veterinario:'Dr. Silva',  motivo:'Control rutinario',  diagnostico:'Leve infección ocular.', tratamiento:'Colirio antibiótico 2x/día por 7 días.', estado:'Completada' },
      { id:2, fecha:'15/03/2026 09:00', veterinario:'Dr. Román',  motivo:'Vacunación anual',   diagnostico:'Paciente sano, apto para vacunación.', tratamiento:'Vacuna polivalente + antiparasitario.', estado:'Completada' },
      { id:3, fecha:'08/01/2026 11:00', veterinario:'Dr. Silva',  motivo:'Vómitos frecuentes', diagnostico:'Gastritis leve.', tratamiento:'Dieta blanda 3 días + protector gástrico.', estado:'Completada' },
    ]
  },
  {
    mascota:'Luna', especie:'Gato', raza:'Siamés', edad:5, cliente:'María Torres',
    consultas:[
      { id:4, fecha:'01/05/2026 11:00', veterinario:'Dr. Román', motivo:'Revisión dermatológica', diagnostico:'Dermatitis alérgica leve.', tratamiento:'Antihistamínico oral 1x/día por 10 días.', estado:'Completada' },
    ]
  },
]

const emptyConsulta = { motivo:'', diagnostico:'', tratamiento:'', veterinario:'', estado:'Pendiente' }

export default function Historial() {
  const [busqueda, setBusqueda] = useState('')
  const [seleccionada, setSeleccionada] = useState(historiales[0])
  const [modal, setModal] = useState(false)
  const [form, setForm]   = useState(emptyConsulta)
  const [lista, setLista] = useState(historiales)

  const filteredMascotas = lista.filter(h =>
    h.mascota.toLowerCase().includes(busqueda.toLowerCase()) ||
    h.cliente.toLowerCase().includes(busqueda.toLowerCase())
  )

  const handleNuevaConsulta = () => {
    if (!form.motivo || !form.veterinario) return
    const nueva = { ...form, id: Date.now(), fecha: new Date().toLocaleString('es-PE') }
    const updated = lista.map(h =>
      h.mascota === seleccionada.mascota
        ? { ...h, consultas: [nueva, ...h.consultas] }
        : h
    )
    setLista(updated)
    setSeleccionada(updated.find(h => h.mascota === seleccionada.mascota))
    setModal(false)
    setForm(emptyConsulta)
  }

  return (
    <div style={{ display:'flex', gap:18, height:'calc(100vh - 60px)' }}>
      {/* Panel izquierdo - lista mascotas */}
      <div style={styles.panelLeft}>
        <h2 style={styles.panelTitle}>Historial Clínico</h2>
        <div style={styles.searchWrap}>
          <Search size={14} style={styles.searchIcon}/>
          <input style={styles.searchInput} placeholder="Buscar mascota..." value={busqueda} onChange={e => setBusqueda(e.target.value)}/>
        </div>
        <div style={styles.mascotaList}>
          {filteredMascotas.map(h => (
            <div
              key={h.mascota}
              style={{ ...styles.mascotaItem, ...(seleccionada?.mascota === h.mascota ? styles.mascotaActive : {}) }}
              onClick={() => setSeleccionada(h)}
            >
              <div style={styles.mascotaIcon}>{h.especie==='Perro'?'🐶':h.especie==='Gato'?'🐱':'🐾'}</div>
              <div>
                <div style={styles.mascotaNombre}>{h.mascota}</div>
                <div style={styles.mascotaSub}>{h.raza} · {h.cliente}</div>
              </div>
              <span style={styles.consultaCount}>{h.consultas.length}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Panel derecho - consultas */}
      <div style={styles.panelRight}>
        {seleccionada ? (
          <>
            <div style={styles.rightHeader}>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={styles.bigIcon}>{seleccionada.especie==='Perro'?'🐶':seleccionada.especie==='Gato'?'🐱':'🐾'}</div>
                <div>
                  <h2 style={styles.mascotaTitle}>{seleccionada.mascota}</h2>
                  <p style={styles.mascotaInfo}>{seleccionada.raza} · {seleccionada.edad} años · 👤 {seleccionada.cliente}</p>
                </div>
              </div>
              <button style={styles.btnAdd} onClick={() => setModal(true)}><Plus size={15}/> Nueva consulta</button>
            </div>

            <div style={styles.timeline}>
              {seleccionada.consultas.map((c, i) => (
                <div key={c.id} style={styles.timelineItem}>
                  <div style={{ ...styles.dot, background: i===0 ? 'var(--primary)' : 'var(--accent)' }}/>
                  <div style={styles.consultaCard}>
                    <div style={styles.consultaTop}>
                      <span style={styles.consultaFecha}>{c.fecha}</span>
                      <span style={styles.badgeOk}>{c.estado}</span>
                    </div>
                    <h4 style={styles.consultaMotivo}>{c.motivo}</h4>
                    <div style={styles.consultaGrid}>
                      <div><span style={styles.fieldLabel}>Diagnóstico:</span> {c.diagnostico}</div>
                      <div><span style={styles.fieldLabel}>Tratamiento:</span> {c.tratamiento}</div>
                    </div>
                    <div style={styles.vetTag}>🩺 {c.veterinario}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p style={{ color:'var(--text-muted)', fontSize:14 }}>Selecciona una mascota para ver su historial.</p>
        )}
      </div>

      {/* Modal nueva consulta */}
      {modal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Nueva consulta — {seleccionada?.mascota}</h3>
              <button style={styles.closeBtn} onClick={() => setModal(false)}><X size={18}/></button>
            </div>
            <div style={styles.modalBody}>
              {[
                { label:'Motivo de consulta', key:'motivo',      placeholder:'Ej: Control rutinario' },
                { label:'Veterinario',         key:'veterinario', placeholder:'Ej: Dr. Silva' },
                { label:'Diagnóstico',         key:'diagnostico', placeholder:'Descripción del diagnóstico...' },
                { label:'Tratamiento',         key:'tratamiento', placeholder:'Medicamentos y dosis...' },
              ].map(f => (
                <div key={f.key} style={styles.field}>
                  <label style={styles.label}>{f.label}</label>
                  <input style={styles.input} placeholder={f.placeholder} value={form[f.key]} onChange={e => setForm({...form,[f.key]:e.target.value})}/>
                </div>
              ))}
              <div style={styles.field}>
                <label style={styles.label}>Estado</label>
                <select style={styles.input} value={form.estado} onChange={e => setForm({...form,estado:e.target.value})}>
                  <option>Pendiente</option><option>Completada</option>
                </select>
              </div>
            </div>
            <div style={styles.modalFooter}>
              <button style={styles.btnCancel} onClick={() => setModal(false)}>Cancelar</button>
              <button style={styles.btnSave}   onClick={handleNuevaConsulta}>Registrar consulta</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  panelLeft:     { width:270, background:'#fff', borderRadius:12, border:'1px solid var(--border)', padding:18, display:'flex', flexDirection:'column', gap:12, flexShrink:0, boxShadow:'var(--shadow)', overflowY:'auto' },
  panelTitle:    { fontSize:17, fontWeight:700 },
  searchWrap:    { position:'relative' },
  searchIcon:    { position:'absolute', left:9, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' },
  searchInput:   { width:'100%', padding:'8px 10px 8px 28px', border:'1px solid var(--border)', borderRadius:8, fontSize:13 },
  mascotaList:   { display:'flex', flexDirection:'column', gap:6 },
  mascotaItem:   { display:'flex', alignItems:'center', gap:10, padding:'10px 10px', borderRadius:9, cursor:'pointer', border:'1px solid transparent', transition:'all 0.15s' },
  mascotaActive: { background:'var(--primary-light)', border:'1px solid var(--primary)', },
  mascotaIcon:   { fontSize:22, flexShrink:0 },
  mascotaNombre: { fontWeight:600, fontSize:13 },
  mascotaSub:    { fontSize:11, color:'var(--text-muted)' },
  consultaCount: { marginLeft:'auto', background:'var(--primary)', color:'#fff', borderRadius:20, fontSize:10, fontWeight:700, padding:'2px 7px' },
  panelRight:    { flex:1, background:'#fff', borderRadius:12, border:'1px solid var(--border)', padding:'20px 24px', boxShadow:'var(--shadow)', overflowY:'auto' },
  rightHeader:   { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:22, paddingBottom:18, borderBottom:'1px solid var(--border)' },
  bigIcon:       { fontSize:36 },
  mascotaTitle:  { fontSize:18, fontWeight:700 },
  mascotaInfo:   { fontSize:13, color:'var(--text-sub)', marginTop:3 },
  btnAdd:        { display:'flex', alignItems:'center', gap:7, background:'var(--primary)', color:'#fff', border:'none', borderRadius:9, padding:'9px 16px', fontWeight:600, fontSize:13 },
  timeline:      { display:'flex', flexDirection:'column', gap:0, paddingLeft:18, borderLeft:'2px solid var(--border)' },
  timelineItem:  { position:'relative', paddingLeft:20, paddingBottom:20 },
  dot:           { position:'absolute', left:-9, top:14, width:16, height:16, borderRadius:'50%', border:'2px solid #fff', outline:'2px solid var(--primary)' },
  consultaCard:  { background:'#FAFAFA', borderRadius:10, border:'1px solid var(--border)', padding:'14px 16px', display:'flex', flexDirection:'column', gap:8 },
  consultaTop:   { display:'flex', justifyContent:'space-between', alignItems:'center' },
  consultaFecha: { fontSize:11, color:'var(--text-muted)' },
  badgeOk:       { background:'#D1FAE5', color:'#065F46', padding:'2px 9px', borderRadius:20, fontSize:10, fontWeight:600 },
  consultaMotivo:{ fontSize:14, fontWeight:600, color:'var(--text-main)' },
  consultaGrid:  { display:'flex', flexDirection:'column', gap:4, fontSize:13, color:'var(--text-sub)' },
  fieldLabel:    { fontWeight:600, color:'var(--text-main)' },
  vetTag:        { fontSize:11, color:'var(--text-muted)', background:'#F0F0F0', display:'inline-block', padding:'3px 10px', borderRadius:20, width:'fit-content' },
  overlay:       { position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:999 },
  modal:         { background:'#fff', borderRadius:14, width:'100%', maxWidth:460, boxShadow:'0 20px 60px rgba(0,0,0,0.2)' },
  modalHeader:   { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'18px 22px', borderBottom:'1px solid var(--border)' },
  modalTitle:    { fontSize:15, fontWeight:700 },
  closeBtn:      { background:'transparent', border:'none', color:'var(--text-muted)', display:'flex', alignItems:'center' },
  modalBody:     { padding:'20px 22px', display:'flex', flexDirection:'column', gap:13 },
  modalFooter:   { padding:'14px 22px', borderTop:'1px solid var(--border)', display:'flex', justifyContent:'flex-end', gap:10 },
  field:         { display:'flex', flexDirection:'column', gap:5 },
  label:         { fontSize:12, fontWeight:600, color:'var(--text-sub)' },
  input:         { padding:'9px 12px', border:'1px solid var(--border)', borderRadius:8, fontSize:13, background:'#FAFAFA' },
  btnCancel:     { padding:'9px 18px', border:'1px solid var(--border)', borderRadius:8, background:'transparent', color:'var(--text-sub)', fontSize:13 },
  btnSave:       { padding:'9px 18px', background:'var(--primary)', color:'#fff', border:'none', borderRadius:8, fontSize:13, fontWeight:600 },
}
