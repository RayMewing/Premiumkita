
'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Icon } from '@/components/Icons'

const MENU = [
  { key:'overview',  label:'Overview',    icon:'bar-chart' },
  { key:'banners',   label:'Banners',     icon:'image'     },
  { key:'users',     label:'Users',       icon:'users'     },
  { key:'transaksi', label:'Transaksi',   icon:'history'   },
  { key:'settings',  label:'Pengaturan',  icon:'settings'  },
]

export default function AdminPage() {
  const router = useRouter()
  const [tab, setTab] = useState('overview')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/user/me').then(r => r.json()).then(d => {
      if (!d.success || d.user?.role !== 'admin') { router.push('/dashboard'); return }
      setUser(d.user); setLoading(false)
    })
  }, [])

  if (loading) return <div style={{ minHeight:'100dvh',background:'#0f172a',display:'flex',alignItems:'center',justifyContent:'center' }}><Spinner /></div>

  return (
    <div style={{ minHeight:'100dvh',background:'#0f172a',display:'flex',flexDirection:'column' }}>
      {/* Top bar */}
      <div style={{ background:'#1e293b',borderBottom:'1px solid #334155',padding:'16px 20px',display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:50 }}>
        <div style={{ display:'flex',alignItems:'center',gap:10 }}>
          <button onClick={() => router.push('/dashboard')} style={{ width:34,height:34,borderRadius:10,background:'#334155',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}>
            <Icon name="arrow-left" size={16} color="#94a3b8"/>
          </button>
          <div style={{ display:'flex',alignItems:'center',gap:8 }}>
            <div style={{ width:32,height:32,borderRadius:10,background:'linear-gradient(135deg,#2563eb,#0ea5e9)',display:'flex',alignItems:'center',justifyContent:'center' }}>
              <Icon name="shield" size={16} color="white"/>
            </div>
            <div>
              <p style={{ margin:0,fontSize:14,fontWeight:700,color:'white' }}>Admin Panel</p>
              <p style={{ margin:0,fontSize:11,color:'#64748b' }}>PremiumKita</p>
            </div>
          </div>
        </div>
        <div style={{ display:'flex',alignItems:'center',gap:8 }}>
          <div style={{ width:8,height:8,borderRadius:'50%',background:'#10b981' }}/>
          <span style={{ fontSize:12,color:'#94a3b8' }}>{user?.nama}</span>
        </div>
      </div>

      {/* Side nav + content */}
      <div style={{ display:'flex',flex:1 }}>
        {/* Side nav */}
        <div style={{ width:64,background:'#1e293b',borderRight:'1px solid #334155',display:'flex',flexDirection:'column',alignItems:'center',paddingTop:12,gap:4,position:'sticky',top:53,height:'calc(100dvh - 53px)',overflowY:'auto' }}>
          {MENU.map(m => (
            <button key={m.key} onClick={() => setTab(m.key)} title={m.label}
              style={{ width:48,height:48,borderRadius:14,background:tab===m.key?'#2563eb':'transparent',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',transition:'all 0.15s' }}>
              <Icon name={m.icon} size={20} color={tab===m.key?'white':'#64748b'} strokeWidth={tab===m.key?2:1.8}/>
            </button>
          ))}
        </div>

        {/* Main content */}
        <div style={{ flex:1,overflow:'hidden' }}>
          {tab === 'overview'  && <AdminOverview />}
          {tab === 'banners'   && <AdminBanners />}
          {tab === 'users'     && <AdminUsers />}
          {tab === 'transaksi' && <AdminTransaksi />}
          {tab === 'settings'  && <AdminSettings />}
        </div>
      </div>
    </div>
  )
}

/* ─────────────── OVERVIEW ─────────────── */
function AdminOverview() {
  const [stats, setStats] = useState(null)
  useEffect(() => {
    Promise.all([
      fetch('/api/user/me').then(r=>r.json()),
    ]).then(async () => {
      const [users, trx] = await Promise.all([
        fetch('/api/admin/users').then(r=>r.json()),
        fetch('/api/riwayat?tab=all&page=1').then(r=>r.json()),
      ])
      setStats({ totalUsers: users.users?.length || 0, totalTrx: trx.data?.length || 0 })
    })
  }, [])

  return (
    <div style={{ padding:20 }}>
      <h2 style={{ margin:'0 0 20px',color:'white',fontSize:18,fontWeight:700 }}>Overview</h2>
      <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:20 }}>
        {[
          { label:'Total User',  val: stats?.totalUsers ?? '...', icon:'users',    color:'#2563eb' },
          { label:'Transaksi',   val: stats?.totalTrx ?? '...',  icon:'history',  color:'#059669' },
        ].map(s => (
          <div key={s.label} style={{ background:'#1e293b',borderRadius:16,padding:18,border:'1px solid #334155' }}>
            <div style={{ width:36,height:36,borderRadius:10,background:s.color+'22',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:12 }}>
              <Icon name={s.icon} size={18} color={s.color}/>
            </div>
            <p style={{ margin:0,fontSize:26,fontWeight:800,color:'white' }}>{s.val}</p>
            <p style={{ margin:'4px 0 0',fontSize:12,color:'#64748b' }}>{s.label}</p>
          </div>
        ))}
      </div>
      <div style={{ background:'#1e293b',borderRadius:16,padding:18,border:'1px solid #334155' }}>
        <p style={{ margin:'0 0 12px',fontSize:13,fontWeight:700,color:'#94a3b8',textTransform:'uppercase',letterSpacing:1 }}>Akses Cepat</p>
        {[
          { label:'Kelola Banner',     sub:'Tambah/edit banner halaman utama',  tab:'banners' },
          { label:'Kelola User',       sub:'Lihat & atur akun pengguna',        tab:'users'   },
          { label:'Pengaturan Umum',   sub:'Logo, nama app, warna email',       tab:'settings'},
        ].map(i => (
          <div key={i.tab} style={{ padding:'12px 0',borderBottom:'1px solid #334155',cursor:'pointer' }} onClick={() => {}}>
            <p style={{ margin:0,fontSize:13,fontWeight:600,color:'white' }}>{i.label}</p>
            <p style={{ margin:'2px 0 0',fontSize:11,color:'#64748b' }}>{i.sub}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─────────────── BANNERS ─────────────── */
function AdminBanners() {
  const [banners, setBanners] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ title:'', subtitle:'', imageUrl:'', linkUrl:'', gradient:'linear-gradient(135deg,#1e40af,#2563eb)', isActive:true, order:0 })
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => { loadBanners() }, [])

  const loadBanners = async () => {
    setLoading(true)
    const r = await fetch('/api/admin/banners').then(res => res.json())
    setBanners(r.banners || [])
    setLoading(false)
  }

  const save = async () => {
    setSaving(true)
    const method = editing ? 'PUT' : 'POST'
    const body = editing ? { id: editing._id, ...form } : form
    await fetch('/api/admin/banners', { method, headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) })
    setMsg(editing ? 'Banner diperbarui' : 'Banner ditambahkan')
    setEditing(null)
    setForm({ title:'', subtitle:'', imageUrl:'', linkUrl:'', gradient:'linear-gradient(135deg,#1e40af,#2563eb)', isActive:true, order:0 })
    await loadBanners()
    setSaving(false)
    setTimeout(() => setMsg(''), 2500)
  }

  const del = async (id) => {
    if (!confirm('Hapus banner ini?')) return
    await fetch('/api/admin/banners', { method:'DELETE', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ id }) })
    await loadBanners()
  }

  const startEdit = (b) => {
    setEditing(b)
    setForm({ title:b.title, subtitle:b.subtitle||'', imageUrl:b.imageUrl||'', linkUrl:b.linkUrl||'', gradient:b.gradient||'', isActive:b.isActive, order:b.order||0 })
  }

  const GRADIENTS = [
    { label:'Biru', val:'linear-gradient(135deg,#1e40af,#2563eb)' },
    { label:'Ungu', val:'linear-gradient(135deg,#4c1d95,#7c3aed)' },
    { label:'Hijau', val:'linear-gradient(135deg,#064e3b,#059669)' },
    { label:'Merah', val:'linear-gradient(135deg,#991b1b,#dc2626)' },
    { label:'Emas', val:'linear-gradient(135deg,#78350f,#d97706)' },
    { label:'Cyan', val:'linear-gradient(135deg,#0c4a6e,#0891b2)' },
  ]

  return (
    <div style={{ padding:20,overflowY:'auto',maxHeight:'calc(100dvh - 53px)' }}>
      <h2 style={{ margin:'0 0 16px',color:'white',fontSize:18,fontWeight:700 }}>Kelola Banner</h2>
      {msg && <div style={{ background:'#d1fae5',borderRadius:10,padding:'10px 14px',color:'#065f46',fontSize:13,marginBottom:14 }}>✓ {msg}</div>}

      {/* Form */}
      <div style={{ background:'#1e293b',borderRadius:18,padding:18,marginBottom:20,border:'1px solid #334155' }}>
        <p style={{ margin:'0 0 14px',fontSize:13,fontWeight:700,color:'#94a3b8',textTransform:'uppercase',letterSpacing:0.8 }}>
          {editing ? 'Edit Banner' : 'Tambah Banner Baru'}
        </p>
        <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
          <AdminInput label="Judul" val={form.title} onChange={v => setForm(f=>({...f,title:v}))} placeholder="Contoh: Top Up Game Murah"/>
          <AdminInput label="Subjudul" val={form.subtitle} onChange={v => setForm(f=>({...f,subtitle:v}))} placeholder="Harga mulai Rp 1.000 aja!"/>
          <AdminInput label="URL Gambar (opsional)" val={form.imageUrl} onChange={v => setForm(f=>({...f,imageUrl:v}))} placeholder="https://..."/>
          <AdminInput label="URL Tujuan saat Diklik" val={form.linkUrl} onChange={v => setForm(f=>({...f,linkUrl:v}))} placeholder="/layanan/games atau https://..."/>
          <AdminInput label="Urutan" val={String(form.order)} onChange={v => setForm(f=>({...f,order:parseInt(v)||0}))} placeholder="0" type="number"/>
          {/* Gradient picker */}
          <div>
            <p style={{ margin:'0 0 8px',fontSize:12,fontWeight:600,color:'#64748b' }}>Warna Background</p>
            <div style={{ display:'flex',gap:8,flexWrap:'wrap' }}>
              {GRADIENTS.map(g => (
                <button key={g.val} onClick={() => setForm(f=>({...f,gradient:g.val}))}
                  style={{ width:36,height:36,borderRadius:10,background:g.val,border:`2px solid ${form.gradient===g.val?'white':'transparent'}`,cursor:'pointer' }}
                  title={g.label}/>
              ))}
            </div>
          </div>
          {/* Preview */}
          {form.title && (
            <div style={{ background:form.gradient,borderRadius:14,padding:'16px',position:'relative',overflow:'hidden' }}>
              <div style={{ position:'absolute',top:-20,right:-20,width:80,height:80,borderRadius:'50%',background:'rgba(255,255,255,0.08)' }}/>
              <div style={{ display:'flex',alignItems:'center',gap:12 }}>
                {form.imageUrl && <img src={form.imageUrl} alt="" style={{ width:44,height:44,borderRadius:10,objectFit:'cover' }}/>}
                <div>
                  <p style={{ margin:0,fontSize:14,fontWeight:800,color:'white' }}>{form.title}</p>
                  {form.subtitle && <p style={{ margin:'2px 0 0',fontSize:11,color:'rgba(255,255,255,0.75)' }}>{form.subtitle}</p>}
                </div>
              </div>
            </div>
          )}
          {/* Active toggle */}
          <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between' }}>
            <span style={{ fontSize:13,color:'#94a3b8' }}>Status Aktif</span>
            <button onClick={() => setForm(f=>({...f,isActive:!f.isActive}))}
              style={{ width:44,height:24,borderRadius:99,background:form.isActive?'#2563eb':'#334155',border:'none',cursor:'pointer',position:'relative',transition:'all 0.2s' }}>
              <span style={{ position:'absolute',top:2,left:form.isActive?22:2,width:20,height:20,borderRadius:'50%',background:'white',transition:'all 0.2s' }}/>
            </button>
          </div>
          <div style={{ display:'flex',gap:8 }}>
            <button onClick={save} disabled={saving||!form.title}
              style={{ flex:1,padding:'12px',background:'#2563eb',border:'none',borderRadius:12,color:'white',fontSize:13,fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:6,opacity:saving||!form.title?0.6:1 }}>
              <Icon name="check" size={15} color="white"/>
              {saving?'Menyimpan...': editing?'Perbarui':'Simpan'}
            </button>
            {editing && (
              <button onClick={() => { setEditing(null); setForm({ title:'',subtitle:'',imageUrl:'',linkUrl:'',gradient:'linear-gradient(135deg,#1e40af,#2563eb)',isActive:true,order:0 }) }}
                style={{ padding:'12px 16px',background:'#334155',border:'none',borderRadius:12,color:'#94a3b8',fontSize:13,cursor:'pointer' }}>
                Batal
              </button>
            )}
          </div>
        </div>
      </div>

      {/* List */}
      <p style={{ margin:'0 0 12px',fontSize:12,fontWeight:700,color:'#64748b',textTransform:'uppercase',letterSpacing:0.8 }}>Banner Aktif ({banners.length})</p>
      {loading ? <div className="shimmer" style={{ height:80,borderRadius:14 }}/> :
        banners.map(b => (
          <div key={b._id} style={{ background:'#1e293b',borderRadius:14,padding:14,marginBottom:10,border:'1px solid #334155',display:'flex',alignItems:'center',gap:12 }}>
            <div style={{ width:48,height:48,borderRadius:12,background:b.gradient||'#334155',flexShrink:0,overflow:'hidden' }}>
              {b.imageUrl && <img src={b.imageUrl} alt="" style={{ width:'100%',height:'100%',objectFit:'cover' }}/>}
            </div>
            <div style={{ flex:1,minWidth:0 }}>
              <p style={{ margin:0,fontSize:13,fontWeight:700,color:'white' }}>{b.title}</p>
              {b.linkUrl && <p style={{ margin:'2px 0 0',fontSize:11,color:'#3b82f6',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis' }}>{b.linkUrl}</p>}
              <span style={{ display:'inline-block',marginTop:4,padding:'2px 8px',borderRadius:99,fontSize:10,fontWeight:700,background:b.isActive?'#16223a':b.isActive?'#022c22':'#2a1a1a',color:b.isActive?'#60a5fa':'#64748b' }}>
                {b.isActive?'Aktif':'Nonaktif'}
              </span>
            </div>
            <div style={{ display:'flex',gap:6 }}>
              <button onClick={() => startEdit(b)} style={{ width:34,height:34,borderRadius:10,background:'#334155',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}>
                <Icon name="edit" size={15} color="#60a5fa"/>
              </button>
              <button onClick={() => del(b._id)} style={{ width:34,height:34,borderRadius:10,background:'#2a1a1a',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}>
                <Icon name="trash" size={15} color="#f87171"/>
              </button>
            </div>
          </div>
        ))
      }
    </div>
  )
}

/* ─────────────── USERS ─────────────── */
function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [saldoInput, setSaldoInput] = useState('')
  const [msg, setMsg] = useState('')

  useEffect(() => { loadUsers() }, [])
  useEffect(() => {
    const t = setTimeout(() => loadUsers(), 400)
    return () => clearTimeout(t)
  }, [q])

  const loadUsers = async () => {
    setLoading(true)
    const r = await fetch(`/api/admin/users?q=${q}`).then(res => res.json())
    setUsers(r.users || [])
    setLoading(false)
  }

  const action = async (id, act, val) => {
    await fetch('/api/admin/users', { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ id, action: act, value: val }) })
    setMsg('Berhasil diperbarui')
    await loadUsers()
    if (selectedUser?._id === id) {
      const updated = await fetch('/api/admin/users').then(r=>r.json())
      setSelectedUser(updated.users?.find(u => u._id === id) || null)
    }
    setTimeout(() => setMsg(''), 2000)
  }

  return (
    <div style={{ padding:20,overflowY:'auto',maxHeight:'calc(100dvh - 53px)' }}>
      <h2 style={{ margin:'0 0 16px',color:'white',fontSize:18,fontWeight:700 }}>Kelola User ({users.length})</h2>
      {msg && <div style={{ background:'#d1fae5',borderRadius:10,padding:'10px 14px',color:'#065f46',fontSize:13,marginBottom:14 }}>✓ {msg}</div>}

      <div style={{ position:'relative',marginBottom:14 }}>
        <div style={{ position:'absolute',left:12,top:'50%',transform:'translateY(-50%)' }}><Icon name="user" size={15} color="#64748b"/></div>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Cari email / nama..."
          style={{ width:'100%',padding:'11px 12px 11px 36px',background:'#1e293b',border:'1px solid #334155',borderRadius:12,color:'white',fontSize:13,outline:'none',boxSizing:'border-box',fontFamily:'Inter,sans-serif'}}/>
      </div>

      {loading ? [...Array(4)].map((_,i)=><div key={i} className="shimmer" style={{ height:60,borderRadius:12,marginBottom:8,background:'#1e293b' }}/>) :
        users.map(u => (
          <div key={u._id} onClick={() => setSelectedUser(u)} style={{ background:'#1e293b',borderRadius:12,padding:'12px 14px',marginBottom:8,border:'1px solid #334155',cursor:'pointer',display:'flex',alignItems:'center',gap:10 }}>
            <div style={{ width:38,height:38,borderRadius:12,background:'#334155',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,color:'#60a5fa',flexShrink:0 }}>
              {u.nama?.[0]?.toUpperCase()}
            </div>
            <div style={{ flex:1,minWidth:0 }}>
              <p style={{ margin:0,fontSize:13,fontWeight:700,color:'white' }}>{u.nama}</p>
              <p style={{ margin:'1px 0 0',fontSize:11,color:'#64748b',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis' }}>{u.email}</p>
            </div>
            <div style={{ textAlign:'right',flexShrink:0 }}>
              <p style={{ margin:0,fontSize:12,fontWeight:700,color:'#60a5fa' }}>Rp {(u.saldo||0).toLocaleString('id-ID')}</p>
              <span style={{ fontSize:10,fontWeight:700,color:u.isActive?'#4ade80':'#f87171' }}>{u.isActive?'Aktif':'Blokir'}</span>
            </div>
          </div>
        ))
      }

      {/* User detail modal */}
      {selectedUser && (
        <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',zIndex:200,display:'flex',alignItems:'flex-end',justifyContent:'center' }} onClick={() => setSelectedUser(null)}>
          <div style={{ background:'#1e293b',borderRadius:'20px 20px 0 0',width:'100%',maxWidth:480,padding:24,maxHeight:'80dvh',overflowY:'auto' }} onClick={e=>e.stopPropagation()}>
            <div style={{ width:36,height:4,borderRadius:99,background:'#334155',margin:'0 auto 20px' }}/>
            <div style={{ display:'flex',alignItems:'center',gap:12,marginBottom:20 }}>
              <div style={{ width:48,height:48,borderRadius:14,background:'#334155',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,fontWeight:700,color:'#60a5fa' }}>
                {selectedUser.nama?.[0]?.toUpperCase()}
              </div>
              <div>
                <p style={{ margin:0,fontSize:16,fontWeight:700,color:'white' }}>{selectedUser.nama}</p>
                <p style={{ margin:0,fontSize:12,color:'#64748b' }}>{selectedUser.email}</p>
              </div>
            </div>
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:16 }}>
              {[
                ['Saldo', `Rp ${(selectedUser.saldo||0).toLocaleString('id-ID')}`],
                ['Role', selectedUser.role],
                ['Deposit', selectedUser.totalDeposit||0],
                ['Transaksi', selectedUser.totalTransaksi||0],
              ].map(([l,v]) => (
                <div key={l} style={{ background:'#0f172a',borderRadius:10,padding:'10px 12px' }}>
                  <p style={{ margin:0,fontSize:10,color:'#64748b' }}>{l}</p>
                  <p style={{ margin:'3px 0 0',fontSize:14,fontWeight:700,color:'#60a5fa' }}>{v}</p>
                </div>
              ))}
            </div>
            {/* Add saldo */}
            <div style={{ display:'flex',gap:8,marginBottom:10 }}>
              <input value={saldoInput} onChange={e=>setSaldoInput(e.target.value)} type="number" placeholder="Tambah saldo..."
                style={{ flex:1,padding:'10px 12px',background:'#0f172a',border:'1px solid #334155',borderRadius:10,color:'white',fontSize:13,outline:'none',fontFamily:'Inter,sans-serif' }}/>
              <button onClick={() => { action(selectedUser._id,'add-saldo',saldoInput); setSaldoInput('') }}
                style={{ padding:'10px 14px',background:'#2563eb',border:'none',borderRadius:10,color:'white',fontSize:13,fontWeight:700,cursor:'pointer' }}>
                Tambah
              </button>
            </div>
            <div style={{ display:'flex',gap:8 }}>
              <button onClick={() => action(selectedUser._id,'toggle-block',!selectedUser.isActive)}
                style={{ flex:1,padding:'11px',background:selectedUser.isActive?'#2a1a1a':'#022c22',border:`1px solid ${selectedUser.isActive?'#7f1d1d':'#064e3b'}`,borderRadius:10,color:selectedUser.isActive?'#f87171':'#4ade80',fontSize:13,fontWeight:700,cursor:'pointer' }}>
                {selectedUser.isActive?'Blokir Akun':'Aktifkan Akun'}
              </button>
              <button onClick={() => action(selectedUser._id,'set-role',selectedUser.role==='admin'?'member':'admin')}
                style={{ flex:1,padding:'11px',background:'#16213a',border:'1px solid #334155',borderRadius:10,color:'#60a5fa',fontSize:13,fontWeight:700,cursor:'pointer' }}>
                {selectedUser.role==='admin'?'Set Member':'Set Admin'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─────────────── TRANSAKSI ─────────────── */
function AdminTransaksi() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const STATUS_C = { success:'#4ade80', process:'#60a5fa', pending:'#fbbf24', failed:'#f87171' }

  useEffect(() => {
    fetch('/api/riwayat?tab=all').then(r=>r.json()).then(d => { setData(d.data||[]); setLoading(false) })
  }, [])

  return (
    <div style={{ padding:20,overflowY:'auto',maxHeight:'calc(100dvh - 53px)' }}>
      <h2 style={{ margin:'0 0 16px',color:'white',fontSize:18,fontWeight:700 }}>Semua Transaksi</h2>
      {loading ? [...Array(5)].map((_,i)=><div key={i} className="shimmer" style={{ height:58,borderRadius:12,marginBottom:8 }}/>) :
        data.map((t,i) => (
          <div key={i} style={{ background:'#1e293b',borderRadius:12,padding:'12px 14px',marginBottom:8,border:'1px solid #334155',display:'flex',alignItems:'center',gap:10 }}>
            <div style={{ flex:1,minWidth:0 }}>
              <p style={{ margin:0,fontSize:12,fontWeight:700,color:'white',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis' }}>{t.productName||'Deposit'}</p>
              <p style={{ margin:'2px 0 0',fontSize:10,color:'#64748b' }}>{new Date(t.createdAt).toLocaleString('id-ID')}</p>
            </div>
            <div style={{ textAlign:'right',flexShrink:0 }}>
              <p style={{ margin:0,fontSize:12,fontWeight:700,color:'#60a5fa' }}>Rp {Number(t.price||t.amount||0).toLocaleString('id-ID')}</p>
              <span style={{ fontSize:10,fontWeight:700,color:STATUS_C[t.status]||'#64748b' }}>{t.status}</span>
            </div>
          </div>
        ))
      }
    </div>
  )
}

/* ─────────────── SETTINGS ─────────────── */
function AdminSettings() {
  const [settings, setSettings] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    fetch('/api/admin/settings').then(r=>r.json()).then(d => { setSettings(d.settings||{}); setLoading(false) })
  }, [])

  const save = async () => {
    setSaving(true)
    await fetch('/api/admin/settings', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(settings) })
    setMsg('Pengaturan disimpan!')
    setSaving(false)
    setTimeout(() => setMsg(''), 2500)
  }

  const S = (key, label, placeholder = '', type = 'text') => (
    <div>
      <p style={{ margin:'0 0 6px',fontSize:12,fontWeight:600,color:'#64748b' }}>{label}</p>
      <input value={settings[key]||''} onChange={e => setSettings(s=>({...s,[key]:e.target.value}))} placeholder={placeholder} type={type}
        style={{ width:'100%',padding:'10px 12px',background:'#0f172a',border:'1px solid #334155',borderRadius:10,color:'white',fontSize:13,outline:'none',boxSizing:'border-box',fontFamily:'Inter,sans-serif' }}/>
    </div>
  )

  return (
    <div style={{ padding:20,overflowY:'auto',maxHeight:'calc(100dvh - 53px)' }}>
      <h2 style={{ margin:'0 0 16px',color:'white',fontSize:18,fontWeight:700 }}>Pengaturan Umum</h2>
      {msg && <div style={{ background:'#022c22',borderRadius:10,padding:'10px 14px',color:'#4ade80',fontSize:13,marginBottom:14 }}>✓ {msg}</div>}

      {loading ? <div className="shimmer" style={{ height:300,borderRadius:16 }}/> :
        <div style={{ display:'flex',flexDirection:'column',gap:14 }}>
          <Section title="Identitas Aplikasi" icon="sparkle">
            {S('app_name', 'Nama Aplikasi', 'PremiumKita')}
            {S('app_tagline', 'Tagline', 'Layanan Digital Terpercaya')}
          </Section>

          <Section title="Logo & Branding Email" icon="image">
            {S('app_logo_url', 'URL Logo (dipakai di email & header)', 'https://...')}
            {settings.app_logo_url && (
              <div style={{ background:'#0f172a',borderRadius:10,padding:12,display:'flex',alignItems:'center',gap:10 }}>
                <img src={settings.app_logo_url} alt="logo" style={{ height:40,width:'auto',objectFit:'contain',maxWidth:80,borderRadius:8 }}/>
                <p style={{ margin:0,fontSize:11,color:'#64748b' }}>Preview logo yang akan tampil di email</p>
              </div>
            )}
            {S('email_header_color', 'Warna Header Email (hex)', '#2563eb')}
            <div style={{ height:40,borderRadius:10,background:settings.email_header_color||'#2563eb',display:'flex',alignItems:'center',justifyContent:'center' }}>
              <span style={{ color:'white',fontSize:12,fontWeight:600 }}>Preview warna header email</span>
            </div>
          </Section>

          <Section title="Kontak & CS" icon="phone">
            {S('whatsapp_cs', 'No. WhatsApp CS (628xxx)', '6281234567890')}
          </Section>

          <Section title="Deposit" icon="dollar">
            {S('deposit_fee', 'Fee Deposit (Rp)', '200', 'number')}
            {S('min_deposit', 'Minimal Deposit (Rp)', '10000', 'number')}
            {S('max_deposit', 'Maksimal Deposit (Rp)', '10000000', 'number')}
          </Section>

          <button onClick={save} disabled={saving}
            style={{ width:'100%',padding:'14px',background:'#2563eb',border:'none',borderRadius:14,color:'white',fontSize:14,fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8,opacity:saving?0.7:1 }}>
            <Icon name="check" size={17} color="white"/>
            {saving?'Menyimpan...':'Simpan Semua Pengaturan'}
          </button>
        </div>
      }
    </div>
  )
}

function Section({ title, icon, children }) {
  return (
    <div style={{ background:'#1e293b',borderRadius:16,padding:18,border:'1px solid #334155' }}>
      <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:14,paddingBottom:12,borderBottom:'1px solid #334155' }}>
        <Icon name={icon} size={15} color="#60a5fa"/>
        <p style={{ margin:0,fontSize:13,fontWeight:700,color:'#94a3b8',textTransform:'uppercase',letterSpacing:0.8 }}>{title}</p>
      </div>
      <div style={{ display:'flex',flexDirection:'column',gap:10 }}>{children}</div>
    </div>
  )
}

function AdminInput({ label, val, onChange, placeholder, type='text' }) {
  return (
    <div>
      <p style={{ margin:'0 0 6px',fontSize:12,fontWeight:600,color:'#64748b' }}>{label}</p>
      <input value={val} onChange={e=>onChange(e.target.value)} placeholder={placeholder} type={type}
        style={{ width:'100%',padding:'10px 12px',background:'#0f172a',border:'1px solid #334155',borderRadius:10,color:'white',fontSize:13,outline:'none',boxSizing:'border-box',fontFamily:'Inter,sans-serif' }}/>
    </div>
  )
}

function Spinner() {
  return <span style={{ width:32,height:32,border:'3px solid #334155',borderTopColor:'#2563eb',borderRadius:'50%',display:'inline-block',animation:'spin 0.6s linear infinite' }}/>
}
