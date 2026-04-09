'use client'
import { useState, useEffect, useCallback, use } from 'react'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/BottomNav'
import { Icon, CarrierLogo } from '@/components/Icons'
import { JenisEwallet } from '@/components/EwalletLogos'

const TYPE_CFG = {
  pulsa:      { label:'Pulsa Reguler',    icon:'phone',    needsPhone:true,  api:'pulsa'      },
  data:       { label:'Paket Data',       icon:'wifi',     needsPhone:true,  api:'data'       },
  emoney:     { label:'E-Money',          icon:'wallet',   needsPhone:false, api:'emoney'     },
  pln:        { label:'Token PLN',        icon:'zap',      needsPhone:false, api:'pln'        },
  games:      { label:'Top Up Games',     icon:'gamepad',  needsPhone:false, api:'games'      },
  voucher:    { label:'Voucher',          icon:'tag',      needsPhone:false, api:'voucher'    },
  premium:    { label:'Akun Premium',     icon:'crown',    needsPhone:false, api:'premium'    },
  perdana:    { label:'Aktivasi Perdana', icon:'sim',      needsPhone:true,  api:'perdana'    },
  aktvoucher: { label:'Aktiv. Voucher',   icon:'tag',      needsPhone:false, api:'voucher'    },
  masaaktif:  { label:'Masa Aktif',       icon:'calendar', needsPhone:true,  api:'masaaktif'  },
  sms:        { label:'Paket SMS & Telpon',icon:'msg',     needsPhone:true,  api:'sms'        },
  tv:         { label:'Tagihan TV',       icon:'tv',       needsPhone:false, api:'tv'         },
  nokos:      { label:'Nomor Virtual',    icon:'number',   needsPhone:false, api:'nokos', redirect:'/layanan/nokos' },
}

const EWALLET = [
  { code:'DANA',       name:'DANA'       },
  { code:'OVO',        name:'OVO'        },
  { code:'GOPAY',      name:'GoPay'      },
  { code:'SHOPEEPAY',  name:'ShopeePay'  },
  { code:'LINKAJA',    name:'LinkAja'    },
  { code:'ISAKU',      name:'iSaku'      },
]

const TYPE_COLOR = { pulsa:'#2563eb', data:'#0891b2', emoney:'#059669', pln:'#d97706', games:'#7c3aed', premium:'#b45309', nokos:'#6d28d9' }

export default function LayananPage({ params }) {
  const { type } = use(params)
  const router = useRouter()
  const cfg = TYPE_CFG[type] || { label:type, icon:'package', needsPhone:false, api:type }

  useEffect(() => { if (cfg.redirect) router.replace(cfg.redirect) }, [cfg.redirect])

  const [phone, setPhone] = useState('')
  const [target, setTarget] = useState('')
  const [carrier, setCarrier] = useState(null)
  const [detecting, setDetecting] = useState(false)
  const [products, setProducts] = useState([])
  const [loadingProd, setLoadingProd] = useState(false)
  const [selected, setSelected] = useState(null)
  const [selEw, setSelEw] = useState(null)
  const [ordering, setOrdering] = useState(false)
  const [done, setDone] = useState(null)
  const [error, setError] = useState('')
  const [user, setUser] = useState(null)

  useEffect(() => {
    fetch('/api/user/me').then(r=>r.json()).then(d => { if (!d.success) router.push('/login'); else setUser(d.user) })
    if (!cfg.needsPhone) fetchProds()
  }, [type])

  const detect = useCallback(async (num) => {
    if (num.length < 4) { setCarrier(null); setProducts([]); return }
    setDetecting(true)
    const r = await fetch(`/api/layanan/carrier?phone=${num}&type=${cfg.api}`).then(res=>res.json())
    if (r.success) { setCarrier(r.carrier); setProducts(r.products||[]) }
    else { setCarrier(null); setProducts([]) }
    setDetecting(false)
  }, [cfg.api])

  const fetchProds = async (carr='') => {
    setLoadingProd(true)
    const r = await fetch(`/api/layanan/products?type=${cfg.api}&carrier=${carr}`).then(res=>res.json())
    setProducts(r.products||[])
    setLoadingProd(false)
  }

  const onPhone = (v) => {
    const c = v.replace(/[^\d]/g,'')
    setPhone(c); setSelected(null)
    if (c.length >= 4) detect(c); else { setCarrier(null); setProducts([]) }
  }

  const order = async () => {
    if (!selected) { setError('Pilih produk terlebih dahulu'); return }
    const tgt = cfg.needsPhone ? phone : target
    if (!tgt && type !== 'premium') { setError('Masukkan nomor/ID tujuan'); return }
    if ((user?.saldo||0) < (selected.price||selected.sell_price||0)) { setError('Saldo tidak mencukupi, lakukan Top Up'); return }
    setError(''); setOrdering(true)
    const r = await fetch('/api/layanan/order',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({ type:cfg.api, productCode:selected.code||selected.product_code, productName:selected.name||selected.product_name, target:tgt, carrier:carrier?.name||'', price:selected.price||selected.sell_price||0 })}).then(res=>res.json())
    if (r.success) setDone(r)
    else setError(r.message)
    setOrdering(false)
  }

  if (done) return <OrderOK data={done} onBack={() => { setDone(null); setSelected(null); setPhone('') }} router={router}/>

  const accentColor = TYPE_COLOR[type] || '#2563eb'

  return (
    <div style={{ background:'#f0f4ff',minHeight:'100dvh' }} className="page-content">
      {/* Header */}
      <div style={{ background:`linear-gradient(150deg,#0f172a,${accentColor})`,padding:'48px 20px 22px' }}>
        <div style={{ display:'flex',alignItems:'center',gap:12 }}>
          <button onClick={() => router.back()} style={{ width:38,height:38,borderRadius:12,background:'rgba(255,255,255,0.12)',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}>
            <Icon name="arrow-left" size={18} color="white"/>
          </button>
          <div style={{ width:38,height:38,borderRadius:12,background:'rgba(255,255,255,0.15)',display:'flex',alignItems:'center',justifyContent:'center' }}>
            <Icon name={cfg.icon} size={20} color="white" strokeWidth={1.9}/>
          </div>
          <h1 style={{ margin:0,fontSize:18,fontWeight:800,color:'white' }}>{cfg.label}</h1>
          {user && (
            <div style={{ marginLeft:'auto',background:'rgba(255,255,255,0.12)',borderRadius:10,padding:'6px 12px' }}>
              <p style={{ margin:0,fontSize:9,color:'rgba(255,255,255,0.6)' }}>Saldo</p>
              <p style={{ margin:0,fontSize:13,fontWeight:800,color:'white' }}>Rp {(user.saldo||0).toLocaleString('id-ID')}</p>
            </div>
          )}
        </div>
      </div>

      <div style={{ padding:'14px' }}>
        {/* Phone input */}
        {cfg.needsPhone && (
          <div style={{ background:'white',borderRadius:20,padding:18,marginBottom:12,boxShadow:'0 2px 10px rgba(0,0,0,0.05)' }}>
            <div style={{ display:'flex',alignItems:'center',gap:7,marginBottom:12 }}>
              <Icon name="phone" size={15} color="#2563eb"/>
              <p style={{ margin:0,fontSize:13,fontWeight:700,color:'#374151' }}>Nomor Tujuan</p>
            </div>
            <div style={{ position:'relative' }}>
              <input className="input-field" type="tel" placeholder="08xx xxxx xxxx"
                value={phone} onChange={e => onPhone(e.target.value)}
                style={{ fontSize:18,fontWeight:700,letterSpacing:0.5,paddingRight:carrier?130:16 }}/>
              {carrier && (
                <div style={{ position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',display:'flex',alignItems:'center',gap:7 }}>
                  <CarrierLogo name={carrier.name} size={28}/>
                  <span style={{ fontSize:12,fontWeight:700,color:'#374151' }}>{carrier.name}</span>
                </div>
              )}
              {detecting && (
                <div style={{ position:'absolute',right:14,top:'50%',transform:'translateY(-50%)' }}>
                  <span style={{ width:18,height:18,border:'2px solid #bfdbfe',borderTopColor:'#2563eb',borderRadius:'50%',display:'inline-block',animation:'spin 0.6s linear infinite' }}/>
                </div>
              )}
            </div>
            {phone.length >= 4 && !carrier && !detecting && (
              <div style={{ display:'flex',alignItems:'center',gap:6,marginTop:8 }}>
                <Icon name="alert-tri" size={13} color="#ef4444"/>
                <p style={{ margin:0,fontSize:12,color:'#ef4444' }}>Nomor tidak dikenal atau format salah</p>
              </div>
            )}
            {carrier && (
              <div style={{ marginTop:10,background:'#eff6ff',borderRadius:12,padding:'10px 14px',display:'flex',alignItems:'center',gap:10 }}>
                <CarrierLogo name={carrier.name} size={34}/>
                <div>
                  <p style={{ margin:0,fontSize:12,fontWeight:700,color:'#1e40af' }}>Terdeteksi: {carrier.name}</p>
                  <p style={{ margin:0,fontSize:11,color:'#64748b' }}>Produk ditampilkan untuk operator ini</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Target input */}
        {!cfg.needsPhone && type !== 'premium' && type !== 'games' && type !== 'voucher' && type !== 'emoney' && (
          <div style={{ background:'white',borderRadius:20,padding:18,marginBottom:12,boxShadow:'0 2px 10px rgba(0,0,0,0.05)' }}>
            <div style={{ display:'flex',alignItems:'center',gap:7,marginBottom:12 }}>
              <Icon name={type==='pln'?'zap':'number'} size={15} color="#2563eb"/>
              <p style={{ margin:0,fontSize:13,fontWeight:700,color:'#374151' }}>
                {type==='pln' ? 'ID Pelanggan PLN' : 'Nomor / ID Tujuan'}
              </p>
            </div>
            <input className="input-field" type="tel" placeholder={type==='pln'?'Contoh: 12345678910':'Masukkan nomor/ID'} value={target} onChange={e=>setTarget(e.target.value)}/>
          </div>
        )}

        {/* E-wallet picker */}
        {type === 'emoney' && (
          <div style={{ background:'white',borderRadius:20,padding:18,marginBottom:12,boxShadow:'0 2px 10px rgba(0,0,0,0.05)' }}>
            <div style={{ display:'flex',alignItems:'center',gap:7,marginBottom:12 }}>
              <Icon name="wallet" size={15} color="#059669"/>
              <p style={{ margin:0,fontSize:13,fontWeight:700,color:'#374151' }}>Pilih E-Wallet</p>
            </div>
            <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:12 }}>
              {EWALLET.map(ew => (
                <button key={ew.code} onClick={() => { setSelEw(ew); fetchProds(ew.code) }}
                  style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:6,padding:'12px 8px',borderRadius:14,border:`2px solid ${selEw?.code===ew.code?'#059669':'#e2e8f0'}`,background:selEw?.code===ew.code?'#d1fae5':'white',cursor:'pointer' }}>
                  <JenisEwallet kode={ew.code} size={38}/>
                  <span style={{ fontSize:10,fontWeight:700,color:'#374151' }}>{ew.name}</span>
                </button>
              ))}
            </div>
            {selEw && (
              <div>
                <div style={{ display:'flex',alignItems:'center',gap:7,marginBottom:10 }}>
                  <Icon name="phone" size={14} color="#64748b"/>
                  <p style={{ margin:0,fontSize:12,fontWeight:600,color:'#64748b' }}>Nomor {selEw.name}</p>
                </div>
                <input className="input-field" type="tel" placeholder="08xx xxxx xxxx" value={target} onChange={e=>setTarget(e.target.value)}/>
              </div>
            )}
          </div>
        )}

        {/* Products */}
        {(products.length > 0 || loadingProd) && (
          <div style={{ background:'white',borderRadius:20,padding:18,marginBottom:12,boxShadow:'0 2px 10px rgba(0,0,0,0.05)' }}>
            <div style={{ display:'flex',alignItems:'center',gap:7,marginBottom:12 }}>
              <Icon name="package" size={15} color={accentColor}/>
              <p style={{ margin:0,fontSize:13,fontWeight:700,color:'#374151' }}>
                {type==='premium'?'Pilih Paket':type==='data'?'Pilih Paket Data':'Pilih Nominal'}
              </p>
            </div>
            {loadingProd ? (
              [...Array(4)].map((_,i)=><div key={i} className="shimmer" style={{ height:58,borderRadius:12,marginBottom:8 }}/>)
            ) : (
              products.map((p, i) => {
                const name  = p.name||p.product_name||p.title||'-'
                const price = p.price||p.sell_price||0
                const desc  = p.desc||p.description||''
                const code  = p.code||p.product_code
                const sel   = (selected?.code===code||selected?.product_code===code)
                return (
                  <button key={i} onClick={() => setSelected(p)}
                    style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'13px 14px',background:sel?'#eff6ff':'white',border:`1.5px solid ${sel?accentColor:'#e8edf5'}`,borderRadius:14,cursor:'pointer',width:'100%',textAlign:'left',marginBottom:8,transition:'all 0.15s' }}>
                    <div style={{ flex:1,minWidth:0 }}>
                      <p style={{ margin:0,fontSize:13,fontWeight:700,color:'#0f172a' }}>{name}</p>
                      {desc && <p style={{ margin:'2px 0 0',fontSize:11,color:'#64748b' }}>{desc}</p>}
                    </div>
                    <div style={{ textAlign:'right',flexShrink:0,marginLeft:10 }}>
                      <p style={{ margin:0,fontSize:14,fontWeight:800,color:sel?accentColor:'#0f172a' }}>Rp {Number(price).toLocaleString('id-ID')}</p>
                      {sel && <div style={{ display:'flex',alignItems:'center',justifyContent:'flex-end',gap:3,marginTop:2 }}><Icon name="check" size={11} color={accentColor}/><span style={{ fontSize:10,color:accentColor,fontWeight:600 }}>Terpilih</span></div>}
                    </div>
                  </button>
                )
              })
            )}
          </div>
        )}

        {/* Empty state */}
        {cfg.needsPhone && phone.length < 4 && (
          <div style={{ background:'white',borderRadius:20,padding:32,textAlign:'center',border:'1.5px solid #e8edf5' }}>
            <div style={{ width:56,height:56,background:'#f0f4ff',borderRadius:18,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 14px' }}>
              <Icon name={cfg.icon} size={26} color="#cbd5e1"/>
            </div>
            <p style={{ margin:0,color:'#94a3b8',fontSize:14 }}>Masukkan nomor HP untuk melihat produk</p>
          </div>
        )}

        {error && (
          <div style={{ background:'#fee2e2',borderRadius:12,padding:'11px 14px',color:'#991b1b',fontSize:13,marginBottom:12,display:'flex',gap:8 }}>
            <Icon name="alert-tri" size={15} color="#ef4444"/> {error}
          </div>
        )}

        {/* Order summary + button */}
        {selected && (
          <div style={{ background:'white',borderRadius:20,padding:18,boxShadow:'0 2px 10px rgba(0,0,0,0.05)' }}>
            <div style={{ display:'flex',alignItems:'center',gap:7,marginBottom:14,paddingBottom:14,borderBottom:'1px dashed #e2e8f0' }}>
              <Icon name="package" size={15} color="#64748b"/>
              <p style={{ margin:0,fontSize:13,fontWeight:700,color:'#374151' }}>Ringkasan Order</p>
            </div>
            {[
              ['Produk', selected.name||selected.product_name],
              (phone||target)&&['Tujuan', phone||target],
              carrier&&['Operator', carrier.name],
            ].filter(Boolean).map(([l,v]) => v && (
              <div key={l} style={{ display:'flex',justifyContent:'space-between',marginBottom:10 }}>
                <span style={{ fontSize:12,color:'#64748b' }}>{l}</span>
                <span style={{ fontSize:12,fontWeight:700,color:'#0f172a',textAlign:'right',maxWidth:'60%' }}>{v}</span>
              </div>
            ))}
            <div style={{ display:'flex',justifyContent:'space-between',marginBottom:16,paddingTop:10,borderTop:'1px dashed #e2e8f0' }}>
              <span style={{ fontSize:14,fontWeight:700,color:'#374151' }}>Total Bayar</span>
              <span style={{ fontSize:20,fontWeight:900,color:accentColor }}>Rp {Number(selected.price||selected.sell_price||0).toLocaleString('id-ID')}</span>
            </div>
            <button className="btn-primary" onClick={order} disabled={ordering} style={{ background:`linear-gradient(135deg,${accentColor},${accentColor}dd)` }}>
              {ordering ? <Spin/> : <span style={{ display:'flex',alignItems:'center',justifyContent:'center',gap:8 }}><Icon name="zap" size={18} color="white" strokeWidth={0}/> Beli Sekarang</span>}
            </button>
          </div>
        )}
      </div>
      <BottomNav/>
    </div>
  )
}

function OrderOK({ data, onBack, router }) {
  return (
    <div style={{ minHeight:'100dvh',background:'#f0f4ff',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:24 }}>
      <div style={{ background:'white',borderRadius:24,padding:32,width:'100%',maxWidth:400,textAlign:'center',boxShadow:'0 8px 32px rgba(0,0,0,0.08)' }}>
        <div style={{ width:76,height:76,background:'#d1fae5',borderRadius:'50%',margin:'0 auto 20px',display:'flex',alignItems:'center',justifyContent:'center' }}>
          <Icon name="check-circle" size={40} color="#059669" strokeWidth={1.5}/>
        </div>
        <h2 style={{ margin:'0 0 8px',fontSize:20,fontWeight:800,color:'#065f46' }}>Order Berhasil!</h2>
        <p style={{ margin:'0 0 20px',color:'#64748b',fontSize:14 }}>Pesanan sedang diproses sistem</p>
        <div style={{ background:'#f8faff',borderRadius:14,padding:16,marginBottom:20,textAlign:'left' }}>
          <div style={{ display:'flex',justifyContent:'space-between',marginBottom:8 }}>
            <span style={{ fontSize:12,color:'#64748b' }}>Invoice</span>
            <span style={{ fontSize:12,fontWeight:700,color:'#0f172a',fontFamily:'monospace' }}>{data.invoice}</span>
          </div>
          <div style={{ display:'flex',justifyContent:'space-between' }}>
            <span style={{ fontSize:12,color:'#64748b' }}>Status</span>
            <span style={{ fontSize:11,fontWeight:700,padding:'3px 10px',borderRadius:99,background:'#dbeafe',color:'#1e40af' }}>Diproses</span>
          </div>
        </div>
        <button className="btn-primary" onClick={() => router.push('/riwayat')} style={{ marginBottom:10 }}>Lihat Riwayat</button>
        <button className="btn-outline" onClick={onBack}>Beli Lagi</button>
      </div>
    </div>
  )
}

function Spin() {
  return <span style={{ display:'flex',alignItems:'center',justifyContent:'center',gap:8 }}><span style={{ width:18,height:18,border:'2px solid rgba(255,255,255,0.3)',borderTopColor:'white',borderRadius:'50%',display:'inline-block',animation:'spin 0.6s linear infinite' }}/> Memproses...</span>
}
