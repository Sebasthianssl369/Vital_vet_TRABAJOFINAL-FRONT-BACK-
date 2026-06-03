import { useState } from 'react'
import { Plus, Search, X, QrCode, CheckCircle } from 'lucide-react'

const inicial = [
  { id:1, mascota:'Max',   especie:'Perro', cliente:'Carlos Pérez',  veterinario:'Dr. Silva',  fecha:'2026-05-05', hora:'09:00', tipo:'Vacunación',         estado:'pagado'    },
  { id:2, mascota:'Luna',  especie:'Gato',  cliente:'María Torres',  veterinario:'Dr. Román',  fecha:'2026-05-05', hora:'10:30', tipo:'Control/Revisión',   estado:'pendiente' },
  { id:3, mascota:'Rocky', especie:'Perro', cliente:'Jorge Silva',   veterinario:'Dr. Solis',  fecha:'2026-05-06', hora:'11:00', tipo:'Cirugía',             estado:'pendiente' },
  { id:4, mascota:'Mia',   especie:'Conejo',cliente:'Lucía Ramírez', veterinario:'Dr. Silva',  fecha:'2026-05-07', hora:'15:00', tipo:'Baño y grooming',     estado:'pendiente' },
]

const TIPOS = ['Vacunación','Esterilización','Cirugía','Baño y grooming','Consulta médica general','Control/Revisión']

const emptyForm = { mascota:'', especie:'Perro', cliente:'', veterinario:'', fecha:'', hora:'', tipo:'Vacunación' }

// QR decorativo fijo (patrón predefinido, no aleatorio)
const QR_PATTERN = [
  1,1,1,1,1,1,1,0,1,0,
  1,0,0,0,0,0,1,0,0,1,
  1,0,1,1,1,0,1,0,1,0,
  1,0,1,1,1,0,1,0,0,1,
  1,0,1,1,1,0,1,0,1,1,
  1,0,0,0,0,0,1,0,0,0,
  1,1,1,1,1,1,1,0,1,0,
  0,0,0,0,0,0,0,0,1,1,
  1,1,0,1,0,1,1,0,0,1,
  0,1,1,0,1,0,0,0,1,0,
]

export default function Citas() {
  const [citas, setCitas]               = useState(inicial)
  const [busqueda, setBusqueda]         = useState('')
  const [modalNueva, setModalNueva]     = useState(false)
  const [modalPago, setModalPago]       = useState(null)
  const [pagoConfirmado, setPagoConfirmado] = useState(false)
  const [form, setForm]                 = useState(emptyForm)

  const filtered = citas.filter(c =>
    c.mascota.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.cliente.toLowerCase().includes(busqueda.toLowerCase())
  )

  const handleGuardar = () => {
    if (!form.mascota || !form.fecha || !form.hora || !form.cliente) return
    const nueva = { ...form, id: Date.now(), estado: 'pendiente' }
    setCitas(prev => [...prev, nueva])
    setModalNueva(false)
    setForm(emptyForm)
    setModalPago(nueva)
    setPagoConfirmado(false)
  }

  const confirmarPago = () => {
    setPagoConfirmado(true)
    setTimeout(() => {
      setCitas(prev => prev.map(c => c.id === modalPago.id ? { ...c, estado: 'pagado' } : c))
      setModalPago(null)
      setPagoConfirmado(false)
    }, 1800)
  }

  const estadoStyle = {
    pagado:    { background:'#D1FAE5', color:'#065F46' },
    pendiente: { background:'#FEF3C7', color:'#92400E' },
  }

  return (
    <div>
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Citas</h1>
          <p style={s.sub}>{citas.length} citas registradas</p>
        </div>
        <button style={s.btnAdd} onClick={() => { setModalNueva(true); setForm(emptyForm) }}>
          <Plus size={16}/> Nueva cita
        </button>
      </div>

      <div style={{ position:'relative', maxWidth:360, marginBottom:18 }}>
        <Search size={14} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }}/>
        <input style={s.searchInput} placeholder="Buscar mascota o cliente..."
          value={busqueda} onChange={e => setBusqueda(e.target.value)}/>
      </div>

      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead>
            <tr>
              {['Mascota','Tipo de atención','Propietario','Veterinario','Fecha','Hora','Estado','Pago'].map(h => (
                <th key={h} style={s.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((c, i) => (
              <tr key={c.id} style={i % 2 === 0 ? s.trEven : {}}>
                <td style={s.td}>
                  <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                    <span>{c.especie==='Perro'?'🐶':c.especie==='Gato'?'🐱':c.especie==='Conejo'?'🐰':'🐾'}</span>
                    <b>{c.mascota}</b>
                  </div>
                </td>
                <td style={s.td}>{c.tipo}</td>
                <td style={s.td}>{c.cliente}</td>
                <td style={s.td}>{c.veterinario}</td>
                <td style={s.td}>{c.fecha}</td>
                <td style={s.td}>{c.hora}</td>
                <td style={s.td}>
                  <span style={{ ...s.badge, ...(estadoStyle[c.estado] || {}) }}>
                    {c.estado.charAt(0).toUpperCase() + c.estado.slice(1)}
                  </span>
                </td>
                <td style={s.td}>
                  {c.estado === 'pendiente' ? (
                    <button style={s.btnPagar} onClick={() => { setModalPago(c); setPagoConfirmado(false) }}>
                      <QrCode size={13}/> Pagar
                    </button>
                  ) : (
                    <span style={{ fontSize:12, color:'#065F46', fontWeight:600 }}>✅ Pagado</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── MODAL NUEVA CITA ── */}
      {modalNueva && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <div style={s.modalHeader}>
              <h3 style={s.modalTitle}>Reservar nueva cita</h3>
              <button style={s.closeBtn} onClick={() => setModalNueva(false)}><X size={18}/></button>
            </div>
            <div style={s.modalBody}>
              <div style={s.row2}>
                <div style={s.field}>
                  <label style={s.label}>Nombre de la mascota *</label>
                  <input style={s.input} placeholder="Ej: Max"
                    value={form.mascota} onChange={e => setForm({...form, mascota:e.target.value})}/>
                </div>
                <div style={s.field}>
                  <label style={s.label}>Especie</label>
                  <select style={s.input} value={form.especie} onChange={e => setForm({...form, especie:e.target.value})}>
                    <option>Perro</option><option>Gato</option><option>Conejo</option><option>Ave</option><option>Otro</option>
                  </select>
                </div>
              </div>
              <div style={s.field}>
                <label style={s.label}>Propietario *</label>
                <input style={s.input} placeholder="Nombre completo del dueño"
                  value={form.cliente} onChange={e => setForm({...form, cliente:e.target.value})}/>
              </div>
              <div style={s.field}>
                <label style={s.label}>Tipo de atención *</label>
                <select style={s.input} value={form.tipo} onChange={e => setForm({...form, tipo:e.target.value})}>
                  {TIPOS.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div style={s.field}>
                <label style={s.label}>Veterinario</label>
                <input style={s.input} placeholder="Ej: Dr. Silva"
                  value={form.veterinario} onChange={e => setForm({...form, veterinario:e.target.value})}/>
              </div>
              <div style={s.row2}>
                <div style={s.field}>
                  <label style={s.label}>Fecha *</label>
                  <input style={s.input} type="date" value={form.fecha} onChange={e => setForm({...form, fecha:e.target.value})}/>
                </div>
                <div style={s.field}>
                  <label style={s.label}>Hora *</label>
                  <input style={s.input} type="time" value={form.hora}  onChange={e => setForm({...form, hora:e.target.value})}/>
                </div>
              </div>
            </div>
            <div style={s.modalFooter}>
              <button style={s.btnCancel} onClick={() => setModalNueva(false)}>Cancelar</button>
              <button style={s.btnSave}   onClick={handleGuardar}>Reservar cita →</button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL PAGO QR ── */}
      {modalPago && (
        <div style={s.overlay}>
          <div style={{ ...s.modal, maxWidth:380 }}>
            <div style={s.modalHeader}>
              <h3 style={s.modalTitle}>💳 Pago de cita</h3>
              {!pagoConfirmado && (
                <button style={s.closeBtn} onClick={() => setModalPago(null)}><X size={18}/></button>
              )}
            </div>
            <div style={{ ...s.modalBody, alignItems:'center', textAlign:'center', gap:16 }}>
              {pagoConfirmado ? (
                <div style={{ padding:'24px 0', display:'flex', flexDirection:'column', alignItems:'center', gap:14 }}>
                  <CheckCircle size={56} color="#10B981"/>
                  <p style={{ fontSize:17, fontWeight:700, color:'#065F46' }}>¡Pago confirmado!</p>
                  <p style={{ fontSize:13, color:'var(--text-sub)' }}>
                    La cita de <b>{modalPago.mascota}</b> quedó registrada como <b>Pagada</b>.
                  </p>
                </div>
              ) : (
                <>
                  {/* Resumen de la cita */}
                  <div style={s.citaResumen}>
                    <div style={s.resumenRow}><span>🐾 Mascota:</span><b>{modalPago.mascota}</b></div>
                    <div style={s.resumenRow}><span>🩺 Tipo:</span><b>{modalPago.tipo}</b></div>
                    <div style={s.resumenRow}><span>📅 Fecha:</span><b>{modalPago.fecha} · {modalPago.hora}</b></div>
                  </div>

                  {/* QR simulado con patrón fijo */}
                  <div style={s.qrWrapper}>
                    <div style={s.qrGrid}>
                      {QR_PATTERN.map((cell, i) => (
                        <div key={i} style={{
                          width:14, height:14, borderRadius:2,
                          background: cell ? '#1A1A1A' : '#fff'
                        }}/>
                      ))}
                    </div>
                    <p style={{ fontSize:11, color:'var(--text-muted)', marginTop:8 }}>
                      Escanea el código QR para pagar
                    </p>
                  </div>

                  <p style={{ fontSize:12, color:'var(--text-sub)', lineHeight:1.5 }}>
                    Una vez realizado el pago externo, presiona el botón para confirmar y actualizar el estado de tu cita.
                  </p>

                  <button style={{ ...s.btnSave, width:'100%', padding:'13px', fontSize:14 }} onClick={confirmarPago}>
                    ✅ Confirmar pago
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const s = {
  header:     { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:22 },
  title:      { fontSize:22, fontWeight:700 },
  sub:        { fontSize:13, color:'var(--text-sub)', marginTop:3 },
  btnAdd:     { display:'flex', alignItems:'center', gap:7, background:'var(--primary)', color:'#fff', border:'none', borderRadius:9, padding:'10px 18px', fontWeight:600, fontSize:13, cursor:'pointer' },
  searchInput:{ width:'100%', padding:'9px 12px 9px 32px', border:'1px solid var(--border)', borderRadius:8, background:'#fff', fontSize:13 },
  tableWrap:  { background:'#fff', borderRadius:12, border:'1px solid var(--border)', overflow:'hidden', boxShadow:'var(--shadow)' },
  table:      { width:'100%', borderCollapse:'collapse' },
  th:         { textAlign:'left', padding:'11px 14px', fontSize:11, color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase', background:'#FAFAFA', borderBottom:'1px solid var(--border)' },
  td:         { padding:'11px 14px', fontSize:13, borderBottom:'1px solid #F5F0EB', color:'var(--text-main)' },
  trEven:     { background:'#FEFCFB' },
  badge:      { padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:600 },
  btnPagar:   { display:'flex', alignItems:'center', gap:5, background:'var(--primary-light)', border:'1px solid var(--primary)', color:'var(--primary)', borderRadius:7, padding:'5px 10px', fontSize:12, fontWeight:600, cursor:'pointer' },
  overlay:    { position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:999 },
  modal:      { background:'#fff', borderRadius:14, width:'100%', maxWidth:480, boxShadow:'0 20px 60px rgba(0,0,0,0.2)' },
  modalHeader:{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'18px 22px', borderBottom:'1px solid var(--border)' },
  modalTitle: { fontSize:16, fontWeight:700 },
  closeBtn:   { background:'transparent', border:'none', color:'var(--text-muted)', display:'flex', alignItems:'center', cursor:'pointer' },
  modalBody:  { padding:'22px', display:'flex', flexDirection:'column', gap:13 },
  modalFooter:{ padding:'14px 22px', borderTop:'1px solid var(--border)', display:'flex', justifyContent:'flex-end', gap:10 },
  row2:       { display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 },
  field:      { display:'flex', flexDirection:'column', gap:5 },
  label:      { fontSize:12, fontWeight:600, color:'var(--text-sub)' },
  input:      { padding:'9px 12px', border:'1px solid var(--border)', borderRadius:8, fontSize:13, background:'#FAFAFA' },
  btnCancel:  { padding:'9px 18px', border:'1px solid var(--border)', borderRadius:8, background:'transparent', color:'var(--text-sub)', fontSize:13, cursor:'pointer' },
  btnSave:    { padding:'9px 18px', background:'var(--primary)', color:'#fff', border:'none', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer' },
  citaResumen:{ background:'var(--bg)', borderRadius:10, padding:'14px 18px', width:'100%', textAlign:'left', display:'flex', flexDirection:'column', gap:6 },
  resumenRow: { display:'flex', justifyContent:'space-between', fontSize:13, color:'var(--text-sub)' },
  qrWrapper:  { display:'flex', flexDirection:'column', alignItems:'center' },
  qrGrid:     { display:'grid', gridTemplateColumns:'repeat(10, 14px)', gap:2, padding:14, background:'#fff', border:'2px solid #1A1A1A', borderRadius:10 },
}
