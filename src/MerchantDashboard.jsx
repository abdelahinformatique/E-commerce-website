import { useEffect, useRef, useState } from 'react'
import Navbar from './Navbar.jsx'

const PLACEHOLDER  = 'https://placehold.co/400x300/e2e8f0/94a3b8?text=Produit'
const STATUTS      = ['en attente', 'confirmée', 'expédiée', 'livrée', 'annulée']
const STATUT_META  = {
  'en attente': { label: '⏳ En attente', cls: 'badge-waiting'   },
  'confirmée':  { label: '✅ Confirmée',  cls: 'badge-confirmed' },
  'expédiée':   { label: '🚚 Expédiée',  cls: 'badge-shipped'   },
  'livrée':     { label: '📦 Livrée',    cls: 'badge-delivered' },
  'annulée':    { label: '❌ Annulée',   cls: 'badge-cancelled' },
}

export default function MerchantDashboard() {
  const [tab, setTab] = useState('produits')

  return (
    <div className="cat-page">
      <Navbar />
      <main className="db-main">
        <div className="merch-tabs">
          <button
            className={`merch-tab ${tab === 'produits'  ? 'active' : ''}`}
            onClick={() => setTab('produits')}
          >📦 Mes Produits</button>
          <button
            className={`merch-tab ${tab === 'commandes' ? 'active' : ''}`}
            onClick={() => setTab('commandes')}
          >📋 Commandes reçues</button>
        </div>

        {tab === 'produits'  && <ProduitsTab />}
        {tab === 'commandes' && <CommandesTab />}
      </main>
    </div>
  )
}

/* ── Onglet Produits ──────────────────────────────────────── */
function ProduitsTab() {
  const token   = localStorage.getItem('token')
  const fileRef = useRef()
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }

  const [products,       setProducts]       = useState([])
  const [showModal,      setShowModal]      = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [form, setForm] = useState({ nom: '', designation: '', image: '', prix: '', stock: '' })
  const [error,          setError]          = useState('')
  const [deleteTarget,   setDeleteTarget]   = useState(null)

  useEffect(() => {
    fetch('http://localhost:3000/mes-produits', { headers })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(setProducts)
      .catch(() => setError('Impossible de charger les produits'))
  }, [])

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setForm(prev => ({ ...prev, image: ev.target.result }))
    reader.readAsDataURL(file)
  }

  const openAdd = () => {
    setEditingProduct(null)
    setForm({ nom: '', designation: '', image: '', prix: '', stock: '' })
    setError('')
    setShowModal(true)
  }

  const openEdit = (p) => {
    setEditingProduct(p)
    setForm({ nom: p.nom, designation: p.designation, image: p.image || '', prix: p.prix, stock: p.stock })
    setError('')
    setShowModal(true)
  }

  const closeModal = () => { setShowModal(false); setError('') }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.nom.trim() || !form.designation.trim() || form.prix === '' || form.stock === '') {
      setError('Tous les champs sont obligatoires')
      return
    }
    const url    = editingProduct ? `http://localhost:3000/mes-produits/${editingProduct._id}` : 'http://localhost:3000/mes-produits'
    const method = editingProduct ? 'PUT' : 'POST'
    const res    = await fetch(url, { method, headers, body: JSON.stringify(form) })
    const data   = await res.json()
    if (!res.ok) { setError(data.message || 'Erreur'); return }
    setProducts(prev => editingProduct ? prev.map(p => p._id === data._id ? data : p) : [data, ...prev])
    closeModal()
  }

  const handleDelete = async (id) => {
    const res = await fetch(`http://localhost:3000/mes-produits/${id}`, { method: 'DELETE', headers })
    if (res.ok) {
      setProducts(prev => prev.filter(p => p._id !== id))
      setDeleteTarget(null)
    }
  }

  return (
    <>
      <div className="db-toolbar" style={{ marginTop: 24 }}>
        <div>
          <h2 className="db-title" style={{ fontSize: 22 }}>Mes Produits</h2>
          <p className="db-subtitle">{products.length} produit{products.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="db-btn-add" onClick={openAdd}>＋ Nouveau produit</button>
      </div>

      {error && !showModal && <p className="db-error">{error}</p>}

      {products.length === 0 ? (
        <div className="db-empty">
          <div className="db-empty-icon">📦</div>
          <p className="db-empty-title">Aucun produit</p>
          <p className="db-empty-sub">Ajoutez votre premier produit à vendre</p>
          <button className="db-btn-add" onClick={openAdd}>＋ Ajouter</button>
        </div>
      ) : (
        <div className="db-grid">
          {products.map(p => (
            <div className="db-card" key={p._id}>
              <div className="db-card-img-wrap">
                <img className="db-card-img" src={p.image || PLACEHOLDER} alt={p.nom}
                  onError={e => { e.target.src = PLACEHOLDER }} />
                <div className="db-card-overlay">
                  <button className="db-ov-btn edit" onClick={() => openEdit(p)}>✏️</button>
                  <button className="db-ov-btn del"  onClick={() => setDeleteTarget(p)}>🗑️</button>
                </div>
                <span className={`stock-pill ${p.stock === 0 ? 'stock-out' : p.stock <= 5 ? 'stock-low' : 'stock-ok'}`}>
                  {p.stock === 0 ? 'Rupture' : `Stock : ${p.stock}`}
                </span>
              </div>
              <div className="db-card-body">
                <div className="db-card-top">
                  <h3 className="db-card-name">{p.nom}</h3>
                  <span className="db-card-prix">{Number(p.prix).toFixed(2)} €</span>
                </div>
                <p className="db-card-desig">{p.designation}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="db-backdrop" onClick={closeModal}>
          <div className="db-modal" onClick={e => e.stopPropagation()}>
            <div className="db-modal-header">
              <h2 className="db-modal-title">{editingProduct ? 'Modifier' : 'Nouveau produit'}</h2>
              <button className="db-modal-close" onClick={closeModal}>✕</button>
            </div>
            <form className="db-modal-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Nom</label>
                <input className="form-input" type="text" placeholder="Ex : Nike Air Max"
                  value={form.nom} onChange={e => setForm(p => ({ ...p, nom: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Désignation</label>
                <textarea className="form-input db-textarea" rows={3}
                  value={form.designation} onChange={e => setForm(p => ({ ...p, designation: e.target.value }))} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Prix (€)</label>
                  <input className="form-input" type="number" min="0" step="0.01" placeholder="29.99"
                    value={form.prix} onChange={e => setForm(p => ({ ...p, prix: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Stock</label>
                  <input className="form-input" type="number" min="0" placeholder="100"
                    value={form.stock} onChange={e => setForm(p => ({ ...p, stock: e.target.value }))} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Image</label>
                <label className="db-file-label" onClick={() => fileRef.current.click()}>
                  📷 {form.image ? "Changer l'image" : 'Choisir une image'}
                </label>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
                {form.image && (
                  <div className="db-img-preview-wrap">
                    <img className="db-img-preview" src={form.image} alt="preview" />
                    <button type="button" className="db-img-remove"
                      onClick={() => { setForm(p => ({ ...p, image: '' })); fileRef.current.value = '' }}>✕</button>
                  </div>
                )}
              </div>
              {error && <p className="db-error">{error}</p>}
              <div className="db-modal-footer">
                <button type="button" className="db-btn-cancel" onClick={closeModal}>Annuler</button>
                <button type="submit" className="db-btn-save">{editingProduct ? 'Enregistrer' : 'Ajouter'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="db-backdrop" onClick={() => setDeleteTarget(null)}>
          <div className="db-modal db-modal-sm" onClick={e => e.stopPropagation()}>
            <div className="db-confirm-icon">🗑️</div>
            <h3 className="db-confirm-title">Supprimer ce produit ?</h3>
            <p className="db-confirm-sub">« {deleteTarget.nom} » sera définitivement supprimé.</p>
            <div className="db-modal-footer">
              <button className="db-btn-cancel" onClick={() => setDeleteTarget(null)}>Annuler</button>
              <button className="db-btn-danger" onClick={() => handleDelete(deleteTarget._id)}>Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

/* ── Onglet Commandes ─────────────────────────────────────── */
function CommandesTab() {
  const token   = localStorage.getItem('token')
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }

  const [orders, setOrders] = useState([])
  const [error,  setError]  = useState('')

  useEffect(() => {
    fetch('http://localhost:3000/mes-commandes', { headers })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(setOrders)
      .catch(() => setError('Impossible de charger les commandes'))
  }, [])

  const updateStatut = async (orderId, statut) => {
    const res  = await fetch(`http://localhost:3000/mes-commandes/${orderId}/statut`, {
      method: 'PATCH', headers, body: JSON.stringify({ statut }),
    })
    const data = await res.json()
    if (res.ok) setOrders(prev => prev.map(o => o._id === orderId ? data : o))
  }

  return (
    <div style={{ marginTop: 24 }}>
      <div className="db-toolbar">
        <div>
          <h2 className="db-title" style={{ fontSize: 22 }}>Commandes reçues</h2>
          <p className="db-subtitle">{orders.length} commande{orders.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {error && <p className="db-error">{error}</p>}

      {orders.length === 0 ? (
        <div className="db-empty">
          <div className="db-empty-icon">📋</div>
          <p className="db-empty-title">Aucune commande reçue</p>
          <p className="db-empty-sub">Les commandes de vos clients apparaîtront ici</p>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(order => {
            const meta = STATUT_META[order.statut] ?? { label: order.statut, cls: '' }
            return (
              <div className="order-card" key={order._id}>
                <div className="order-card-header">
                  <div>
                    <span className="order-id">#{order._id.slice(-6).toUpperCase()}</span>
                    <span className="order-client">👤 {order.clientName}</span>
                    <span className="order-date">
                      {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className={`badge ${meta.cls}`}>{meta.label}</span>
                    <select
                      className="statut-select"
                      value={order.statut}
                      onChange={e => updateStatut(order._id, e.target.value)}
                    >
                      {STATUTS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="order-items">
                  {order.items.map((item, i) => (
                    <div className="order-item-row" key={i}>
                      <span className="order-item-name">{item.nom}</span>
                      <span className="order-item-qty">× {item.quantite}</span>
                      <span className="order-item-price">{(item.prix * item.quantite).toFixed(2)} €</span>
                    </div>
                  ))}
                </div>
                {order.livraison?.nom && (
                  <div className="order-livraison">
                    <span className="order-livraison-title">📦 Livraison</span>
                    <div className="order-livraison-grid">
                      <span>👤 {order.livraison.nom}</span>
                      <span>📞 {order.livraison.telephone}</span>
                      <span>📍 {order.livraison.adresse}</span>
                    </div>
                  </div>
                )}
                <div className="order-card-footer">
                  <span className="order-total-label">Total</span>
                  <span className="order-total-value">{Number(order.total).toFixed(2)} €</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
