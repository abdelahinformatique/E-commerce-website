import { useEffect, useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

const PLACEHOLDER = 'https://placehold.co/400x300/e2e8f0/94a3b8?text=Produit'

function Dashboard() {
  const navigate = useNavigate()
  const token    = localStorage.getItem('token')
  const name     = localStorage.getItem('name')

  return token ? <ProductsPage name={name} navigate={navigate} /> : <LandingPage />
}

/* ══════════════════════════════════════════════════
   PAGE PUBLIQUE (non connecté)
══════════════════════════════════════════════════ */
function LandingPage() {
  return (
    <div className="db-page">
      <Navbar />
      <div className="landing-hero">
        <div className="landing-badge"><h1>🛒 Plateforme e-commerce</h1></div>
        <h1 className="landing-title">Gérez vos produits<br />simplement</h1>
        <p className="landing-sub">
          Créez votre catalogue, ajoutez des images, modifiez ou supprimez vos produits en quelques clics.
        </p>
        <div className="landing-actions">
          <Link to="/register" className="landing-btn-primary">Commencer gratuitement</Link>
          <Link to="/login"    className="landing-btn-ghost">Se connecter</Link>
        </div>
      </div>

      <div className="landing-features">
        <div className="feature-card">
          <span className="feature-icon">📦</span>
          <h3>Catalogue produits</h3>
          <p>Ajoutez nom, description, image et prix pour chaque produit.</p>
        </div>
        <div className="feature-card">
          <span className="feature-icon">✏️</span>
          <h3>Modification facile</h3>
          <p>Modifiez ou supprimez vos produits à tout moment.</p>
        </div>
        <div className="feature-card">
          <span className="feature-icon">🔒</span>
          <h3>Compte sécurisé</h3>
          <p>Chaque utilisateur gère uniquement ses propres produits.</p>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════
   NAVBAR (partagée)
══════════════════════════════════════════════════ */
function Navbar({ name, onLogout }) {
  const token = localStorage.getItem('token')

  return (
    <header className="db-header">
      <div className="db-logo">
        <span className="db-logo-icon">🛍</span>
        <span className="db-logo-text">Rusica Shop</span>
      </div>

      <nav className="db-nav">
        {token ? (
          <>
            <div className="db-avatar">{name?.[0]?.toUpperCase() ?? '?'}</div>
            <span className="db-username">{name}</span>
            <button className="db-logout" onClick={onLogout}>Déconnexion</button>
          </>
        ) : (
          <>
            <Link to="/login"    className="nav-btn-ghost">Connexion</Link>
            <Link to="/register" className="nav-btn-primary">S'inscrire</Link>
          </>
        )}
      </nav>
    </header>
  )
}

/* ══════════════════════════════════════════════════
   PAGE PRODUITS (connecté)
══════════════════════════════════════════════════ */
function ProductsPage({ name, navigate }) {
  const token   = localStorage.getItem('token')
  const fileRef = useRef()

  const [products, setProducts]             = useState([])
  const [showModal, setShowModal]           = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [form, setForm]                     = useState({ nom: '', designation: '', image: '', prix: '' })
  const [error, setError]                   = useState('')
  const [deleteTarget, setDeleteTarget]     = useState(null)

  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }

  useEffect(() => {
    let cancelled = false
    fetch('http://localhost:3000/products', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => { if (!cancelled) setProducts(data) })
      .catch(() => { if (!cancelled) setError('Impossible de charger les produits') })
    return () => { cancelled = true }
  }, [token])

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setForm(prev => ({ ...prev, image: ev.target.result }))
    reader.readAsDataURL(file)
  }

  const openAdd = () => {
    setEditingProduct(null)
    setForm({ nom: '', designation: '', image: '', prix: '' })
    setError('')
    setShowModal(true)
  }

  const openEdit = (p) => {
    setEditingProduct(p)
    setForm({ nom: p.nom, designation: p.designation, image: p.image || '', prix: p.prix ?? '' })
    setError('')
    setShowModal(true)
  }

  const closeModal = () => { setShowModal(false); setError('') }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.nom.trim() || !form.designation.trim() || form.prix === '') {
      setError('Nom, désignation et prix sont obligatoires')
      return
    }
    try {
      const url    = editingProduct
        ? `http://localhost:3000/products/${editingProduct._id}`
        : 'http://localhost:3000/products'
      const method = editingProduct ? 'PUT' : 'POST'
      const res    = await fetch(url, { method, headers, body: JSON.stringify(form) })
      const data   = await res.json()
      if (!res.ok) { setError(data.message || "Impossible d'enregistrer le produit"); return }
      setProducts(prev =>
        editingProduct
          ? prev.map(p => p._id === data._id ? data : p)
          : [data, ...prev]
      )
      closeModal()
    } catch {
      setError('Erreur de connexion au serveur')
    }
  }

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`http://localhost:3000/products/${id}`, { method: 'DELETE', headers })
      if (!res.ok) throw new Error()
      setProducts(prev => prev.filter(p => p._id !== id))
      setDeleteTarget(null)
    } catch {
      setError('Impossible de supprimer le produit')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('name')
    navigate('/login')
  }

  return (
    <div className="db-page">
      <Navbar name={name} onLogout={handleLogout} />

      <main className="db-main">
        <div className="db-toolbar">
          <div>
            <h1 className="db-title">Mes Produits</h1>
            <p className="db-subtitle">{products.length} produit{products.length !== 1 ? 's' : ''}</p>
          </div>
          <button className="db-btn-add" onClick={openAdd}>＋ Ajouter un produit</button>
        </div>

        {error && !showModal && <p className="db-error">{error}</p>}

        {products.length === 0 ? (
          <div className="db-empty">
            <div className="db-empty-icon">📦</div>
            <p className="db-empty-title">Aucun produit pour l'instant</p>
            <p className="db-empty-sub">Commencez par ajouter votre premier produit</p>
            <button className="db-btn-add" onClick={openAdd}>＋ Ajouter un produit</button>
          </div>
        ) : (
          <div className="db-grid">
            {products.map(p => (
              <div className="db-card" key={p._id}>
                <div className="db-card-img-wrap">
                  <img
                    className="db-card-img"
                    src={p.image || PLACEHOLDER}
                    alt={p.nom}
                    onError={e => { e.target.src = PLACEHOLDER }}
                  />
                  <div className="db-card-overlay">
                    <button className="db-ov-btn edit" onClick={() => openEdit(p)}>✏️</button>
                    <button className="db-ov-btn del"  onClick={() => setDeleteTarget(p)}>🗑️</button>
                  </div>
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
      </main>

      {/* ── Modal ajouter / modifier ── */}
      {showModal && (
        <div className="db-backdrop" onClick={closeModal}>
          <div className="db-modal" onClick={e => e.stopPropagation()}>
            <div className="db-modal-header">
              <h2 className="db-modal-title">
                {editingProduct ? 'Modifier le produit' : 'Nouveau produit'}
              </h2>
              <button className="db-modal-close" onClick={closeModal}>✕</button>
            </div>
            <form onSubmit={handleSubmit} className="db-modal-form">
              <div className="form-group">
                <label className="form-label">Nom du produit</label>
                <input className="form-input" type="text" placeholder="Ex : Nike Air Max"
                  value={form.nom} onChange={e => setForm(prev => ({ ...prev, nom: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Désignation</label>
                <textarea className="form-input db-textarea" rows={3} placeholder="Description..."
                  value={form.designation} onChange={e => setForm(prev => ({ ...prev, designation: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Prix (€)</label>
                <input className="form-input" type="number" min="0" step="0.01" placeholder="29.99"
                  value={form.prix} onChange={e => setForm(prev => ({ ...prev, prix: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Image du produit</label>
                <label className="db-file-label" onClick={() => fileRef.current.click()}>
                  📷 {form.image ? "Changer l'image" : 'Choisir une image'}
                </label>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
                {form.image && (
                  <div className="db-img-preview-wrap">
                    <img className="db-img-preview" src={form.image} alt="preview" />
                    <button type="button" className="db-img-remove"
                      onClick={() => { setForm(prev => ({ ...prev, image: '' })); fileRef.current.value = '' }}>✕</button>
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

      {/* ── Modal confirmation suppression ── */}
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
    </div>
  )
}

export default Dashboard
