import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from './Navbar.jsx'

const PLACEHOLDER = 'https://placehold.co/400x300/e2e8f0/94a3b8?text=Produit'

export default function Catalog() {
  const navigate  = useNavigate()
  const [products, setProducts] = useState([])
  const [search,   setSearch]   = useState('')
  const [toast,    setToast]    = useState('')

  useEffect(() => {
    fetch('http://localhost:3000/catalogue')
      .then(r => r.json())
      .then(setProducts)
      .catch(() => {})
  }, [])

  const addToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const idx  = cart.findIndex(i => i.productId === product._id)
    if (idx !== -1) {
      if (cart[idx].quantite >= product.stock) {
        showToast('Stock maximum atteint')
        return
      }
      cart[idx].quantite++
    } else {
      cart.push({
        productId:  product._id,
        merchantId: product.userId._id,
        nom:        product.nom,
        prix:       product.prix,
        image:      product.image,
        quantite:   1,
        stock:      product.stock,
      })
    }
    localStorage.setItem('cart', JSON.stringify(cart))
    window.dispatchEvent(new Event('cart-updated'))
    showToast(`"${product.nom}" ajouté au panier`)
  }

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  const filtered = products.filter(p =>
    p.nom.toLowerCase().includes(search.toLowerCase()) ||
    p.designation.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="cat-page">
      <Navbar />

      {/* Hero */}
      <div className="cat-hero">
        <h1 className="cat-hero-title">Découvrez nos produits</h1>
        <p className="cat-hero-sub">Des milliers de produits, livrés chez vous</p>
        <input
          className="cat-search"
          type="text"
          placeholder="🔍  Rechercher un produit..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Grille */}
      <main className="cat-main">
        {filtered.length === 0 ? (
          <p className="cat-empty">Aucun produit trouvé</p>
        ) : (
          <div className="cat-grid">
            {filtered.map(p => (
              <div className="cat-card" key={p._id}>
                <div className="cat-card-img-wrap">
                  <img
                    className="cat-card-img"
                    src={p.image || PLACEHOLDER}
                    alt={p.nom}
                    onError={e => { e.target.src = PLACEHOLDER }}
                  />
                  {p.stock <= 5 && (
                    <span className="cat-stock-badge">⚡ Plus que {p.stock}</span>
                  )}
                </div>
                <div className="cat-card-body">
                  <p className="cat-merchant">🏪 {p.userId?.name ?? 'Vendeur'}</p>
                  <h3 className="cat-card-name">{p.nom}</h3>
                  <p className="cat-card-desig">{p.designation}</p>
                  <div className="cat-card-footer">
                    <span className="cat-card-prix">{Number(p.prix).toFixed(2)} €</span>
                    <button className="cat-btn-cart" onClick={() => addToCart(p)}>
                      + Panier
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Toast notification */}
      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
