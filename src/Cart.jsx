import { useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from './Navbar.jsx'

const PLACEHOLDER = 'https://placehold.co/80x80/e2e8f0/94a3b8?text=IMG'

export default function Cart() {
  const token    = localStorage.getItem('token')
  const role     = localStorage.getItem('role')

  const [cart,    setCart]    = useState(() => JSON.parse(localStorage.getItem('cart') || '[]'))
  const [step,    setStep]    = useState('cart') // 'cart' | 'form' | 'success'
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [livraison, setLivraison] = useState({ nom: '', telephone: '', adresse: '' })

  const saveCart = (updated) => {
    setCart(updated)
    localStorage.setItem('cart', JSON.stringify(updated))
    window.dispatchEvent(new Event('cart-updated'))
  }

  const changeQty = (idx, delta) => {
    const updated = [...cart]
    const item = updated[idx]
    const newQty = item.quantite + delta
    if (newQty < 1)          { removeItem(idx); return }
    if (newQty > item.stock) return
    updated[idx] = { ...item, quantite: newQty }
    saveCart(updated)
  }

  const removeItem = (idx) => {
    saveCart(cart.filter((_, i) => i !== idx))
  }

  const total = cart.reduce((s, i) => s + i.prix * i.quantite, 0)

  const handleLivraisonChange = (e) => {
    setLivraison(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!livraison.nom.trim() || !livraison.telephone.trim() || !livraison.adresse.trim()) {
      setError('Tous les champs de livraison sont obligatoires')
      return
    }
    setLoading(true)
    try {
      const res  = await fetch('http://localhost:3000/commandes', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ items: cart, livraison }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.message || 'Erreur lors de la commande'); return }
      saveCart([])
      setStep('success')
    } catch {
      setError('Erreur de connexion au serveur')
    } finally {
      setLoading(false)
    }
  }

  /* ── Step: success ─────────────────────────────────────── */
  if (step === 'success') {
    return (
      <div className="cat-page">
        <Navbar />
        <div className="cart-success">
          <div className="cart-success-icon">🎉</div>
          <h2 className="cart-success-title">Commande confirmée !</h2>
          <p className="cart-success-sub">
            Votre commande a bien été enregistrée. Le vendeur va la traiter.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 20 }}>
            <Link to="/"           className="landing-btn-primary">Continuer les achats</Link>
            <Link to="/mon-compte" className="landing-btn-ghost">Mes commandes</Link>
          </div>
        </div>
      </div>
    )
  }

  /* ── Step: delivery form ───────────────────────────────── */
  if (step === 'form') {
    return (
      <div className="cat-page">
        <Navbar />
        <main className="cart-main">
          <button className="livraison-back" onClick={() => { setStep('cart'); setError('') }}>
            ← Retour au panier
          </button>

          <div className="livraison-wrap">
            <div className="livraison-icon">🚚</div>
            <h1 className="livraison-title">Informations de livraison</h1>
            <p className="livraison-sub">Ces informations seront transmises au vendeur.</p>

            <form className="livraison-form" onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label className="form-label">Nom et prénom</label>
                <input
                  className="form-input"
                  type="text"
                  name="nom"
                  placeholder="Jean Dupont"
                  value={livraison.nom}
                  onChange={handleLivraisonChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Numéro de téléphone</label>
                <input
                  className="form-input"
                  type="tel"
                  name="telephone"
                  placeholder="+33 6 00 00 00 00"
                  value={livraison.telephone}
                  onChange={handleLivraisonChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Adresse de livraison</label>
                <textarea
                  className="form-input db-textarea"
                  name="adresse"
                  placeholder="12 rue de la Paix, 75001 Paris"
                  rows={3}
                  value={livraison.adresse}
                  onChange={handleLivraisonChange}
                />
              </div>

              <div className="livraison-recap">
                <span className="livraison-recap-label">Total de la commande</span>
                <span className="livraison-recap-total">{total.toFixed(2)} €</span>
              </div>

              {error && <p className="db-error">{error}</p>}

              <button className="cart-btn-order" type="submit" disabled={loading}>
                {loading ? 'Traitement...' : '✅ Confirmer la commande'}
              </button>
            </form>
          </div>
        </main>
      </div>
    )
  }

  /* ── Step: cart ────────────────────────────────────────── */
  return (
    <div className="cat-page">
      <Navbar />

      <main className="cart-main">
        <h1 className="db-title">Mon Panier</h1>

        {cart.length === 0 ? (
          <div className="db-empty">
            <div className="db-empty-icon">🛒</div>
            <p className="db-empty-title">Votre panier est vide</p>
            <p className="db-empty-sub">Découvrez nos produits et ajoutez-en au panier</p>
            <Link to="/" className="landing-btn-primary">Voir le catalogue</Link>
          </div>
        ) : (
          <div className="cart-layout">
            <div className="cart-items-list">
              {cart.map((item, idx) => (
                <div className="cart-item" key={item.productId + idx}>
                  <img
                    className="cart-item-img"
                    src={item.image || PLACEHOLDER}
                    alt={item.nom}
                    onError={e => { e.target.src = PLACEHOLDER }}
                  />
                  <div className="cart-item-info">
                    <h3 className="cart-item-name">{item.nom}</h3>
                    <p className="cart-item-price">{Number(item.prix).toFixed(2)} € / unité</p>
                  </div>
                  <div className="cart-item-right">
                    <div className="cart-qty">
                      <button className="cart-qty-btn" onClick={() => changeQty(idx, -1)}>−</button>
                      <span className="cart-qty-val">{item.quantite}</span>
                      <button className="cart-qty-btn" onClick={() => changeQty(idx,  1)}>＋</button>
                    </div>
                    <span className="cart-item-total">{(item.prix * item.quantite).toFixed(2)} €</span>
                    <button className="cart-remove-btn" onClick={() => removeItem(idx)}>🗑</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <h2 className="cart-summary-title">Récapitulatif</h2>
              <div className="cart-summary-row">
                <span>Articles ({cart.reduce((s, i) => s + i.quantite, 0)})</span>
                <span>{total.toFixed(2)} €</span>
              </div>
              <hr className="cart-summary-divider" />
              <div className="cart-summary-total">
                <span>Total</span>
                <span>{total.toFixed(2)} €</span>
              </div>

              {!token ? (
                <div>
                  <p style={{ fontSize: 13, color: '#64748b', marginBottom: 10 }}>
                    Connectez-vous pour confirmer votre commande
                  </p>
                  <Link to="/login" className="landing-btn-primary" style={{ display: 'block', textAlign: 'center' }}>
                    Se connecter
                  </Link>
                </div>
              ) : role !== 'client' ? (
                <p className="db-error">Les commerçants ne peuvent pas passer de commande.</p>
              ) : (
                <button className="cart-btn-order" onClick={() => setStep('form')}>
                  Passer la commande →
                </button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
