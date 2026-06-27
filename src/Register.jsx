import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', age: '', email: '', password: '', role: 'client' })
  const [errorMessage,   setErrorMessage]   = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')
    if (!form.name || !form.age || !form.email || !form.password) {
      setErrorMessage('Tous les champs sont obligatoires')
      return
    }
    try {
      const response = await fetch('http://localhost:3000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, age: Number(form.age) }),
      })
      const data = await response.json()
      if (!response.ok) { setErrorMessage(data.message); return }
      setSuccessMessage('Inscription réussie ! Redirection...')
      setTimeout(() => navigate('/login'), 1500)
    } catch {
      setErrorMessage('Erreur de connexion au serveur')
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">✨</div>
        <h1 className="auth-title">Créer un compte</h1>
        <p className="auth-subtitle">Rejoignez notre plateforme</p>

        {/* Choix du rôle */}
        <div className="role-selector">
          <button
            type="button"
            className={`role-btn ${form.role === 'client' ? 'active' : ''}`}
            onClick={() => setForm(p => ({ ...p, role: 'client' }))}
          >
            <span className="role-icon">🛒</span>
            <span className="role-label">Client</span>
            <span className="role-sub">Acheter des produits</span>
          </button>
          <button
            type="button"
            className={`role-btn ${form.role === 'commercant' ? 'active' : ''}`}
            onClick={() => setForm(p => ({ ...p, role: 'commercant' }))}
          >
            <span className="role-icon">🏪</span>
            <span className="role-label">Commerçant</span>
            <span className="role-sub">Vendre des produits</span>
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nom complet</label>
            <input className="form-input" type="text" name="name"
              placeholder="Jean Dupont" value={form.name} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Âge</label>
            <input className="form-input" type="number" name="age"
              placeholder="25" value={form.age} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" name="email"
              placeholder="vous@exemple.com" value={form.email} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Mot de passe</label>
            <input className="form-input" type="password" name="password"
              placeholder="••••••••" value={form.password} onChange={handleChange} />
          </div>

          {errorMessage   && <p className="error-msg">{errorMessage}</p>}
          {successMessage && <p className="success-msg">{successMessage}</p>}

          <button className="btn-primary" type="submit">
            S'inscrire en tant que {form.role === 'client' ? 'client' : 'commerçant'}
          </button>
        </form>

        <p className="auth-footer">
          Déjà un compte ? <Link to="/login">Se connecter</Link>
        </p>
      </div>
    </div>
  )
}
