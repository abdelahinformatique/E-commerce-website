import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from './Navbar.jsx'

const STATUT_META = {
  'en attente': { label: '⏳ En attente', cls: 'badge-waiting'   },
  'confirmée':  { label: '✅ Confirmée',  cls: 'badge-confirmed' },
  'expédiée':   { label: '🚚 Expédiée',  cls: 'badge-shipped'   },
  'livrée':     { label: '📦 Livrée',    cls: 'badge-delivered' },
  'annulée':    { label: '❌ Annulée',   cls: 'badge-cancelled' },
}

export default function ClientDashboard() {
  const token = localStorage.getItem('token')
  const [orders, setOrders] = useState([])
  const [error,  setError]  = useState('')

  useEffect(() => {
    fetch('http://localhost:3000/mes-achats', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(setOrders)
      .catch(() => setError('Impossible de charger vos commandes'))
  }, [token])

  return (
    <div className="cat-page">
      <Navbar />
      <main className="db-main">
        <div className="db-toolbar">
          <div>
            <h1 className="db-title">Mes commandes</h1>
            <p className="db-subtitle">{orders.length} commande{orders.length !== 1 ? 's' : ''}</p>
          </div>
          <Link to="/" className="db-btn-add">🛍 Continuer les achats</Link>
        </div>

        {error && <p className="db-error">{error}</p>}

        {orders.length === 0 ? (
          <div className="db-empty">
            <div className="db-empty-icon">📋</div>
            <p className="db-empty-title">Aucune commande pour l'instant</p>
            <p className="db-empty-sub">Parcourez notre catalogue et passez votre première commande</p>
            <Link to="/" className="db-btn-add">Voir le catalogue</Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map(order => {
              const meta = STATUT_META[order.statut] ?? { label: order.statut, cls: '' }
              return (
                <div className="order-card" key={order._id}>
                  <div className="order-card-header">
                    <div>
                      <span className="order-id">Commande #{order._id.slice(-6).toUpperCase()}</span>
                      <span className="order-date">
                        {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                          day: '2-digit', month: 'long', year: 'numeric'
                        })}
                      </span>
                    </div>
                    <span className={`badge ${meta.cls}`}>{meta.label}</span>
                  </div>

                  <div className="order-items">
                    {order.items.map((item, i) => (
                      <div className="order-item-row" key={i}>
                        <span className="order-item-name">{item.nom}</span>
                        <span className="order-item-qty">× {item.quantite}</span>
                        <span className="order-item-price">{(item.prix * item.quantite).toFixed(2)} €</span>
                        <form>
                          
                        </form>
                      </div>
                    ))}
                  </div>

                  <div className="order-card-footer">
                    <span className="order-total-label">Total</span>
                    <span className="order-total-value">{Number(order.total).toFixed(2)} €</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
