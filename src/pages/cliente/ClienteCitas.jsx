import { useState } from 'react'
import { Plus, X, QrCode, CheckCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const TIPOS = ['Vacunación','Esterilización','Cirugía','Baño y grooming','Consulta médica general','Control/Revisión']

const emptyForm = { mascota:'', especie:'Perro', tipo:'Vacunación', fecha:'', hora:'' }

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

export default function ClienteCitas() {
  const { user } = useAuth()
  const [citas, setCitas] = useState([
    { id:1, mascota:'Max',  especie:'Perro', tipo:'Vacunación',   fecha:'2026-05-05', hora:'09:00', estado:'pagado'    },
    { id:2, mascota:'Luna', especie:'Gato',  tipo:'Control/Revisión', fecha:'2026-05-12', hora:'10:30', estado:'pendiente' },
  ])
  const [modalNueva, setModalNueva]       = useState(false)
  const [modalPago, setModalPago]         = useState(null)
  const [pagoConfirmado, setPagoConfirmado] = useState(false)
  const [form, setForm] = useState(emptyForm)

  const handleReservar = () => {
    if (!form.mascota || !form.fecha || !form.hora) return
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
      setCitas(prev => prev.map(c => c.id === modalPago.id ? { ...c, estado:'pagado' } : c))
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
          <h1 style={s.title}>Mis citas 📅</h1>
          <p style={s.sub}>Bienvenido, {user?.username}. Aquí puedes ver y reservar tus citas.</p>
        </div>
        <button style={s.btnAdd} onClick={() => { setModalNueva(true); setForm(emptyForm) }}>
          <Plus size={15}/> Reservar cita
        </button>
      </div>

      {/* Cards de citas */}
      <div style={s.grid}>
        {citas.map(c => (
          <div key={c.id} style={s.card}>
            <div style={s.cardTop}>
              <span style={s.petIcon}>{c.especie==='Perro'?'🐶':c.especie==='Gato'?'🐱':'🐾'}</span>
              <div>
                <div style={s.petName}>{c.mascota}</div>
                <div style={s.petSub}>{c.tipo}</div>
              </div>
              <span style={{ ...s.badge, ...(estadoStyle[c.estado] || {}), marginLeft:'auto' }}>
                {c.estado.charAt(0).toUpperCase() + c.estado.slice(1)}
              </span>
            </div>
            <div style={s.cardInfo}>
              <span>📅 {c.fecha}</span>
              <span>🕐 {c.hora}</span>
            </div>
            {c.estado === 'pendiente' && (
              <button style={s.btnPagar} onClick={() => { setModalPago(c); setPagoConfirmado(false) }}>
                <QrCode size={14}/> Pagar cita
              </button>
            )}
          </div>
        ))}
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
                <label style={s.label}>Tipo de atención *</label>
                <select style={s.input} value={form.tipo} onChange={e => setForm({...form, tipo:e.target.value})}>
                  {TIPOS.map(t => <option key={t}>{t}</option>)}
                </select>
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
              <button style={s.btnSave}   onClick={handleReservar}>Reservar →</button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL PAGO QR ── */}
      {modalPago && (
        <div style={s.overlay}>
          <div style={{ ...s.modal, maxWidth:370 }}>
            <div style={s.modalHeader}>
              <h3 style={s.modalTitle}>💳 Pago de cita</h3>
              {!pagoConfirmado && <button style={s.closeBtn} onClick={() => setModalPago(null)}><X size={18}/></button>}
            </div>
            <div style={{ ...s.modalBody, alignItems:'center', textAlign:'center', gap:16 }}>
              {pagoConfirmado ? (
                <div style={{ padding:'20px 0', display:'flex', flexDirection:'column', alignItems:'center', gap:12 }}>
                  <CheckCircle size={54} color="#10B981"/>
                  <p style={{ fontSize:16, fontWeight:700, color:'#065F46' }}>¡Pago confirmado!</p>
                  <p style={{ fontSize:13, color:'var(--text-sub)' }}>Tu cita quedó registrada como <b>Pagada</b>.</p>
                </div>
              ) : (
                <>
                  <div style={s.citaResumen}>
                    <div style={s.resumenRow}><span>🐾</span><b>{modalPago.mascota}</b></div>
                    <div style={s.resumenRow}><span>🩺</span><b>{modalPago.tipo}</b></div>
                    <div style={s.resumenRow}><span>📅</span><b>{modalPago.fecha} · {modalPago.hora}</b></div>
                  </div>
                  <div style={s.qrWrapper}>
                    <div style={s.qrGrid}>
                      {QR_PATTERN.map((cell, i) => (
                        <div key={i} style={{ width:14, height:14, borderRadius:2, background: cell ? '#1A1A1A' : '#fff' }}/>
                      ))}
                    </div>
                    <p style={{ fontSize:11, color:'var(--text-muted)', marginTop:8 }}>Escanea para pagar</p>
                  </div>
                  <p style={{ fontSize:12, color:'var(--text-sub)', lineHeight:1.5 }}>
                    Una vez realizado el pago, presiona confirmar para actualizar tu cita.
                  </p>
                  <button style={{ ...s.btnSave, width:'100%', padding:'12px' }} onClick={confirmarPago}>
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
  header:     { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 },
  title:      { fontSize:22, fontWeight:700 },
  sub:        { fontSize:13, color:'var(--text-sub)', marginTop:3 },
  btnAdd:     { display:'flex', alignItems:'center', gap:7, background:'var(--primary)', color:'#fff', border:'none', borderRadius:9, padding:'10px 18px', fontWeight:600, fontSize:13, cursor:'pointer' },
  grid:       { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px,1fr))', gap:14 },
  card:       { background:'#fff', borderRadius:12, border:'1px solid var(--border)', padding:'18px', boxShadow:'var(--shadow)', display:'flex', flexDirection:'column', gap:12 },
  cardTop:    { display:'flex', alignItems:'center', gap:10 },
  petIcon:    { fontSize:26, flexShrink:0 },
  petName:    { fontWeight:700, fontSize:14 },
  petSub:     { fontSize:12, color:'var(--text-muted)' },
  badge:      { padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:600, whiteSpace:'nowrap' },
  cardInfo:   { display:'flex', gap:14, fontSize:13, color:'var(--text-sub)' },
  btnPagar:   { display:'flex', alignItems:'center', justifyContent:'center', gap:6, background:'var(--primary-light)', border:'1px solid var(--primary)', color:'var(--primary)', borderRadius:8, padding:'9px', fontSize:13, fontWeight:600, cursor:'pointer' },
  overlay:    { position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:999 },
  modal:      { background:'#fff', borderRadius:14, width:'100%', maxWidth:460, boxShadow:'0 20px 60px rgba(0,0,0,0.2)' },
  modalHeader:{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'18px 22px', borderBottom:'1px solid var(--border)' },
  modalTitle: { fontSize:16, fontWeight:700 },
  closeBtn:   { background:'transparent', border:'none', color:'var(--text-muted)', cursor:'pointer', display:'flex', alignItems:'center' },
  modalBody:  { padding:'22px', display:'flex', flexDirection:'column', gap:13 },
  modalFooter:{ padding:'14px 22px', borderTop:'1px solid var(--border)', display:'flex', justifyContent:'flex-end', gap:10 },
  row2:       { display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 },
  field:      { display:'flex', flexDirection:'column', gap:5 },
  label:      { fontSize:12, fontWeight:600, color:'var(--text-sub)' },
  input:      { padding:'9px 12px', border:'1px solid var(--border)', borderRadius:8, fontSize:13, background:'#FAFAFA' },
  btnCancel:  { padding:'9px 18px', border:'1px solid var(--border)', borderRadius:8, background:'transparent', color:'var(--text-sub)', fontSize:13, cursor:'pointer' },
  btnSave:    { padding:'9px 18px', background:'var(--primary)', color:'#fff', border:'none', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer' },
  citaResumen:{ background:'var(--bg)', borderRadius:10, padding:'12px 16px', width:'100%', textAlign:'left', display:'flex', flexDirection:'column', gap:6 },
  resumenRow: { display:'flex', gap:8, fontSize:13, color:'var(--text-sub)', alignItems:'center' },
  qrWrapper:  { display:'flex', flexDirection:'column', alignItems:'center' },
  qrGrid:     { display:'grid', gridTemplateColumns:'repeat(10, 14px)', gap:2, padding:14, background:'#fff', border:'2px solid #1A1A1A', borderRadius:10 },
}
