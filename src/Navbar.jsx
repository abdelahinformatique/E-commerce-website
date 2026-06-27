import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function Navbar() {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const name  = localStorage.getItem('name')
  const role  = localStorage.getItem('role')

  const [cartCount, setCartCount] = useState(0)

  const updateCount = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    setCartCount(cart.reduce((s, i) => s + i.quantite, 0))
  }

  useEffect(() => {
    updateCount()
    window.addEventListener('cart-updated', updateCount)
    return () => window.removeEventListener('cart-updated', updateCount)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('name')
    localStorage.removeItem('role')
    navigate('/')
    window.dispatchEvent(new Event('cart-updated'))
  }

  return (
    <header className="navbar">
      <Link to="/" className="nav-logo">
        <span>🛍</span> ShopApp
      </Link>

      <nav className="nav-right">
        <Link to="/panier" className="nav-cart">
          🛒 Panier
          {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
        </Link>

        {!token ? (
          <>
            <Link to="/login"    className="nav-ghost">Connexion</Link>
            <Link to="/register" className="nav-solid">S'inscrire</Link>
          </>
        ) : (
          <>
            <span className="nav-name">{name}</span>
            {role === 'client'     && <Link to="/mon-compte" className="nav-ghost">Mes commandes</Link>}
            {role === 'commercant' && <Link to="/commercant" className="nav-ghost">Mon espace</Link>}
            <button className="nav-logout" onClick={handleLogout}>Déconnexion</button>
          </>
        )}
      </nav>
    </header>
  )
}
