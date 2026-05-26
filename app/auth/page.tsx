"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useRef, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons"
import LoginForm from "@/components/auth/LoginForm"
import RegisterForm from "@/components/auth/RegisterForm"

export default function AuthPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const tab = searchParams.get("tab") || "login"
  const loginRef = useRef<HTMLDivElement>(null)
  const registerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (tab === "register" && registerRef.current) {
      registerRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
    } else if (tab === "login" && loginRef.current) {
      loginRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }, [tab])

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-background via-background to-secondary/10 flex flex-col">
      {/* Header with return button */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between max-w-6xl mx-auto w-full">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors duration-200 font-medium group"
            aria-label="Retour"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="text-lg group-hover:-translate-x-1 transition-transform" />
            <span className="hidden sm:inline">Retour</span>
          </button>
          
          <Link href="/" className="text-center flex items-center justify-center gap-2">
            <Image
              src="/icons/icon-192x192.png"
              alt="Jouetopia Logo"
              width={40}
              height={40}
              priority
            />
            <h1 className="text-2xl md:text-3xl font-bold text-foreground hover:text-primary transition-colors">
              Jouetopia
            </h1>
          </Link>
          
          <div className="w-12" />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center px-4 py-8 md:py-12 max-w-6xl mx-auto w-full">
        <div className="w-full max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-foreground font-title">
            {tab === "register" ? "Créer votre compte" : "Se connecter"}
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            {tab === "register" 
              ? "Rejoignez Jouetopia et commencez à organiser votre collection dès maintenant"
              : "Bienvenue de retour ! Connectez-vous pour gérer votre collection"}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row lg:gap-12 gap-8 w-full max-w-6xl">
          {/* Login Section */}
          <section 
            ref={loginRef}
            className={`flex-1 rounded-2xl p-8 bg-card shadow-lg border border-border/50 transition-all duration-300 ${
              tab === "login" ? "ring-2 ring-primary" : ""
            }`}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="h-1 w-8 bg-primary rounded-full" />
              <h3 className="text-2xl font-bold text-foreground font-title">Connexion</h3>
            </div>
            <LoginForm />
            <div className="mt-6 pt-6 border-t border-border/50 text-center text-sm text-muted-foreground">
              Pas encore inscrit ?{" "}
              <button
                onClick={() => registerRef.current?.scrollIntoView({ behavior: "smooth" })}
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                S&apos;inscrire
              </button>
            </div>
          </section>

          {/* Register Section */}
          <section 
            ref={registerRef}
            className={`flex-1 rounded-2xl p-8 bg-card shadow-lg border border-border/50 transition-all duration-300 ${
              tab === "register" ? "ring-2 ring-primary" : ""
            }`}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="h-1 w-8 bg-primary rounded-full" />
              <h3 className="text-2xl font-bold text-foreground font-title">Inscription</h3>
            </div>
            <RegisterForm />
            <div className="mt-6 pt-6 border-t border-border/50 text-center text-sm text-muted-foreground">
              Déjà inscrit ?{" "}
              <button
                onClick={() => loginRef.current?.scrollIntoView({ behavior: "smooth" })}
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Se connecter
              </button>
            </div>
          </section>
        </div>

        {/* Security note */}
        <div className="mt-12 text-center text-xs text-muted-foreground max-w-2xl">
          <p>🔒 Vos données sont sécurisées et chiffrées</p>
        </div>
      </div>
    </div>
  )
}
