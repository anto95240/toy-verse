'use client'

import LoginForm from '@/components/auth/LoginForm'
import RegisterForm from '@/components/auth/RegisterForm'
import './auth.css'

export default function AuthPage() {
  return (
    <div className="auth-container">
      <div className="auth-column left">
        <h2>Connexion</h2>
        <LoginForm />
      </div>
      <div className="auth-column right">
        <h2>Inscription</h2>
        <RegisterForm />
      </div>
    </div>
  )
}
