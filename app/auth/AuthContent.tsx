"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons"
import LoginForm from "@/components/auth/LoginForm"
import RegisterForm from "@/components/auth/RegisterForm"

export default function AuthContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialTab = searchParams.get("tab") || "login"
  const [activeTab, setActiveTab] = useState<"login" | "register">(
    initialTab === "register" ? "register" : "login"
  )

  // Sync with URL changes
  useEffect(() => {
    const tab = searchParams.get("tab")
    if (tab === "register" || tab === "login") {
      setActiveTab(tab)
    }
  }, [searchParams])

  return (
    <div className="min-h-screen w-full flex flex-col bg-background">
      {/* Header - consistent with app navbar */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border/50 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between max-w-6xl mx-auto w-full">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors duration-200 font-medium group"
            aria-label="Retour"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="text-base group-hover:-translate-x-1 transition-transform" />
            <span className="hidden sm:inline text-sm">Retour</span>
          </button>
          
          <Link href="/" className="flex items-center gap-2.5 group absolute left-1/2 -translate-x-1/2">
            <Image
              src="/icons/icon-192x192.png"
              alt="Jouetopia Logo"
              width={34}
              height={34}
              priority
              className="group-hover:scale-110 transition-transform duration-300"
            />
            <span className="text-xl font-bold font-title bg-gradient-brand bg-clip-text text-transparent">
              Jouetopia
            </span>
          </Link>
          
          <div className="w-16" />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 md:py-12">
        <div className="w-full max-w-md mx-auto space-y-8">
          {/* Heading */}
          <div className="text-center space-y-3">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground font-title">
              {activeTab === "register" ? "Créer votre compte" : "Bon retour !"}
            </h2>
            <p className="text-muted-foreground">
              {activeTab === "register"
                ? "Rejoignez Jouetopia et organisez votre collection"
                : "Connectez-vous pour retrouver votre collection"}
            </p>
          </div>

          {/* Tab switcher - matches ThemeHeader collection/wishlist toggle style */}
          <div className="flex p-1 bg-secondary/50 rounded-xl border border-border/50">
            {/* Active indicator */}
            <button
              onClick={() => setActiveTab("login")}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 ${
                activeTab === "login"
                  ? "bg-background text-foreground shadow-sm ring-1 ring-border/50"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50"
              }`}
            >
              Connexion
            </button>
            <button
              onClick={() => setActiveTab("register")}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 ${
                activeTab === "register"
                  ? "bg-background text-foreground shadow-sm ring-1 ring-border/50"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50"
              }`}
            >
              Inscription
            </button>
          </div>

          {/* Form card */}
          <div className="bg-card rounded-2xl p-6 sm:p-8 border border-border/60 shadow-elevation-2">
            {/* Gradient accent bar */}
            <div className="w-12 h-1 bg-gradient-brand rounded-full mb-6" />
            
            {activeTab === "login" ? (
              <div className="animate-fade-in">
                <LoginForm />
              </div>
            ) : (
              <div className="animate-fade-in">
                <RegisterForm />
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
