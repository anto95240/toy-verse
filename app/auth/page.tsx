// app/(auth)/page.tsx
'use client'

import LoginForm from '@/components/auth/LoginForm'
import RegisterForm from '@/components/auth/RegisterForm'

export default function AuthPage() {
  return (
    <div className="flex flex-col items-center px-4 py-6 space-y-8">
      <h1 className="text-3xl font-bold text-center lg:mb-20 mb-10">
        Bienvenue à ToyVerse
      </h1>

      <div className="flex flex-col lg:flex-row lg:gap-20 gap-8 w-full max-w-6xl">
        
        <section className="flex-1 rounded-xl p-6 w-full lg:w-96 bg-white shadow-[0_0_10px_0_rgba(0,0,0,0.3)]">
          <h2 className="text-xl text-center mb-6">Connexion</h2>
          <LoginForm />
        </section>

        <section className="flex-1 bg-white shadow-[0_0_10px_0_rgba(0,0,0,0.3)] rounded-xl p-6">
          <h2 className="text-xl text-center mb-6">Inscription</h2>
          <RegisterForm />
        </section>
      </div>
    </div>
  )
}
