import { redirect } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import Image from "next/image"
import Link from "next/link"

export default async function HomePage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect("/home")
  }

  return (
    <main className="min-h-screen w-full bg-background flex flex-col">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <Image
              src="/icons/icon-192x192.png"
              alt="Jouetopia"
              width={34}
              height={34}
              className="group-hover:scale-110 transition-transform duration-300"
            />
            <span className="font-title text-xl font-bold bg-gradient-brand bg-clip-text text-transparent hidden sm:inline-block">
              Jouetopia
            </span>
          </Link>
          <div className="flex gap-2 sm:gap-3 items-center">
            <Link href="/auth?tab=login">
              <button className="px-2 sm:px-4 py-2 text-foreground hover:text-primary transition-colors font-medium text-sm">
                Connexion
              </button>
            </Link>
            <Link href="/auth?tab=register">
              <button className="btn-primary px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-semibold text-sm">
                S&apos;inscrire
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Hero Section */}
        <section className="relative flex-1 flex items-center justify-center px-4 py-16 lg:py-24">
          <div className="max-w-6xl mx-auto w-full">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Left: Text Content */}
              <div className="space-y-8">


                <div className="space-y-5">
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-title leading-[1.1] text-foreground tracking-tight">
                    Votre collection de jouets,{" "}
                    <span className="text-gradient">
                      parfaitement organisée
                    </span>
                  </h1>
                  <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-lg">
                    Créez un espace personnel pour cataloguer, gérer et célébrer votre collection.
                    Chaque trésor mérite d&apos;être valorisé.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/auth?tab=register" className="flex-1 sm:flex-initial">
                    <button className="btn-primary w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-base group">
                      Commencer gratuitement
                      <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform duration-200">→</span>
                    </button>
                  </Link>
                  <Link href="/auth?tab=login" className="flex-1 sm:flex-initial">
                    <button className="btn-secondary w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-base">
                      Connexion
                    </button>
                  </Link>
                </div>

              </div>

              {/* Right: Visual */}
              <div className="hidden lg:flex items-center justify-center relative h-[450px] w-full max-w-lg">
                {/* Glowing background */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-primary opacity-[0.12] rounded-full blur-3xl animate-pulse-slow" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 bg-[var(--gradient-to)] opacity-[0.12] rounded-full blur-2xl animate-pulse-slow" style={{ animationDelay: "1.5s" }} />
                
                {/* Theme Card Mockup */}
                <div className="absolute top-8 right-12 w-64 bg-card rounded-2xl p-4 shadow-elevation-3 border border-border/60 animate-bounce-soft" style={{ animationDuration: '4s' }}>
                  <div className="w-full h-32 bg-secondary rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
                    {/* Simulated image gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20" />
                    <span className="text-4xl relative z-10">🚀</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="space-y-1.5">
                      <div className="h-4 w-32 bg-foreground/90 rounded-md" />
                      <div className="h-3 w-16 bg-muted-foreground/50 rounded-md" />
                    </div>
                  </div>
                </div>

                {/* Toy Card Mockup (Overlapping) */}
                <div className="absolute bottom-16 left-8 w-56 bg-card rounded-xl p-3 shadow-elevation-3 border border-border/60 animate-bounce-soft z-10" style={{ animationDelay: '1s', animationDuration: '4.5s' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 bg-secondary rounded-lg shrink-0 flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-500/20" />
                      <span className="text-2xl relative z-10">🧸</span>
                    </div>
                    <div className="space-y-2 flex-1">
                      <div className="h-3.5 w-full bg-foreground/90 rounded-md" />
                      <div className="h-2.5 w-20 bg-muted-foreground/50 rounded-md" />
                      <div className="flex gap-1 mt-1">
                        <div className="h-2 w-2 rounded-full bg-yellow-400" />
                        <div className="h-2 w-2 rounded-full bg-yellow-400" />
                        <div className="h-2 w-2 rounded-full bg-yellow-400" />
                        <div className="h-2 w-2 rounded-full bg-yellow-400" />
                        <div className="h-2 w-2 rounded-full bg-muted" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating "Add" Button */}
                <div className="absolute bottom-32 right-16 w-12 h-12 bg-primary rounded-full shadow-lg shadow-primary/30 flex items-center justify-center animate-bounce-soft z-20 text-primary-foreground font-bold text-xl border-2 border-background">
                  +
                </div>

                {/* Floating Category Badge */}
                <div className="absolute top-24 left-16 px-4 py-2 bg-background/80 backdrop-blur-md rounded-full shadow-elevation-2 border border-border/50 animate-bounce-soft z-20 flex items-center gap-2" style={{ animationDelay: '2s' }}>
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs font-bold text-foreground">Collection en cours</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 px-4 bg-secondary/30 border-y border-border/30">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16 space-y-4">
              <div className="w-12 h-1 bg-gradient-brand mx-auto rounded-full" />
              <h2 className="text-3xl sm:text-4xl font-bold font-title text-foreground">
                Pourquoi choisir{" "}
                <span className="text-gradient">Jouetopia</span> ?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Une plateforme complète conçue pour les passionnés de jouets
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
              {[
                { icon: "📚", title: "Cataloguez", desc: "Créez des thèmes et catégorisez vos jouets facilement" },
                { icon: "📸", title: "Photographiez", desc: "Ajoutez des photos de haute qualité à chaque jouet" },
                { icon: "📊", title: "Analysez", desc: "Consultez des statistiques détaillées sur votre collection" },
                { icon: "🔍", title: "Trouvez", desc: "Recherchez rapidement vos jouets avec filtres avancés" },
              ].map((f, i) => (
                <div
                  key={i}
                  className="group rounded-2xl bg-card border border-border/50 p-7 hover:shadow-lg hover:border-primary/30 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="space-y-4">
                    <div className="text-3xl w-12 h-12 flex items-center justify-center rounded-xl bg-secondary border border-border/40 group-hover:scale-110 transition-transform duration-300">
                      {f.icon}
                    </div>
                    <h3 className="font-bold text-lg text-foreground">{f.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {f.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border/50 bg-secondary/20 py-8 px-4">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Image
                src="/icons/icon-192x192.png"
                alt="Jouetopia"
                width={20}
                height={20}
              />
              <span>© 2025 Jouetopia</span>
            </div>
            <p>Fait avec ❤️ pour les passionnés</p>
          </div>
        </footer>
      </div>
    </main>
  )
}
