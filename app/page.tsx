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
    <main className="min-h-screen w-full bg-gradient-to-br from-background via-background/95 to-secondary/5 flex flex-col">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/icons/icon-192x192.png"
              alt="Jouetopia"
              width={32}
              height={32}
            />
            <span className="font-bold text-lg text-foreground font-title hidden sm:inline">
              Jouetopia
            </span>
          </Link>
          <div className="flex gap-3">
            <Link href="/auth?tab=login">
              <button className="px-4 py-2 text-foreground hover:text-primary transition-colors font-medium">
                Connexion
              </button>
            </Link>
            <Link href="/auth?tab=register">
              <button className="btn-primary px-6 py-2 rounded-lg font-medium">
                S&apos;inscrire
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Hero Section */}
        <section className="flex-1 flex items-center justify-center px-4 py-12 lg:py-20">
          <div className="max-w-5xl mx-auto w-full">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left: Text Content */}
              <div className="space-y-8">
                <div className="space-y-4">
                  <h1 className="text-5xl lg:text-6xl font-bold font-title leading-tight text-foreground">
                    Votre collection de jouets,{" "}
                    <span className="text-gradient">
                      parfaitement organisée
                    </span>
                  </h1>
                  <p className="text-xl text-muted-foreground leading-relaxed">
                    Créez un espace personnel pour cataloguer, gérer et célébrer votre collection de jouets.
                    Chaque trésor mérite d&apos;être valorisé.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/auth?tab=register" className="flex-1 sm:flex-initial">
                    <button className="btn-primary w-full sm:w-auto px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300 hover:shadow-lg hover:scale-105">
                      Commencer
                    </button>
                  </Link>
                  <Link href="/auth?tab=login" className="flex-1 sm:flex-initial">
                    <button className="btn-secondary w-full sm:w-auto px-8 py-4 rounded-lg font-bold text-lg border border-primary/30 transition-all duration-300 hover:border-primary/60 hover:bg-primary/5">
                      Connexion
                    </button>
                  </Link>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 pt-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">✨</span>
                    <div>
                      <p className="font-semibold text-foreground">Gratuit</p>
                      <p className="text-sm text-muted-foreground">Commencez sans engagement</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🔒</span>
                    <div>
                      <p className="font-semibold text-foreground">Sécurisé</p>
                      <p className="text-sm text-muted-foreground">Vos données protégées</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Visual */}
              <div className="hidden lg:flex items-center justify-center">
                <div className="relative w-full aspect-square max-w-sm">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl blur-2xl" />
                  <div className="relative w-full h-full bg-gradient-to-br from-card to-card/50 rounded-3xl border border-border/50 shadow-2xl p-8 flex items-center justify-center">
                    <Image
                      src="/icons/icon-512x512.png"
                      alt="Jouetopia"
                      width={300}
                      height={300}
                      priority
                      className="drop-shadow-xl"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 bg-secondary/30">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold font-title text-foreground mb-4">
                Pourquoi choisir Jouetopia ?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Une plateforme complète conçue pour les passionnés de jouets
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Feature 1 */}
              <div className="group relative overflow-hidden rounded-2xl bg-card border border-border/50 p-8 hover:shadow-lg hover:border-primary/30 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative space-y-4">
                  <div className="text-4xl">📚</div>
                  <h3 className="font-bold text-lg text-foreground">Cataloguez</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Créez des thèmes et catégorisez vos jouets facilement
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="group relative overflow-hidden rounded-2xl bg-card border border-border/50 p-8 hover:shadow-lg hover:border-primary/30 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative space-y-4">
                  <div className="text-4xl">📸</div>
                  <h3 className="font-bold text-lg text-foreground">Photographiez</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Ajoutez des photos de haute qualité à chaque jouet
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="group relative overflow-hidden rounded-2xl bg-card border border-border/50 p-8 hover:shadow-lg hover:border-primary/30 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative space-y-4">
                  <div className="text-4xl">📊</div>
                  <h3 className="font-bold text-lg text-foreground">Analysez</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Consultez des statistiques détaillées sur votre collection
                  </p>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="group relative overflow-hidden rounded-2xl bg-card border border-border/50 p-8 hover:shadow-lg hover:border-primary/30 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative space-y-4">
                  <div className="text-4xl">🔍</div>
                  <h3 className="font-bold text-lg text-foreground">Trouvez</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Recherchez rapidement vos jouets avec filtres avancés
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl font-bold font-title text-foreground">
                Prêt à organiser votre collection ?
              </h2>
              <p className="text-lg text-muted-foreground">
                Rejoignez des centaines d&apos;utilisateurs qui font confiance à Jouetopia
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth?tab=register">
                <button className="btn-primary px-10 py-4 rounded-lg font-bold text-lg transition-all duration-300 hover:shadow-lg hover:scale-105">
                  Créer mon compte
                </button>
              </Link>
              <Link href="/auth?tab=login">
                <button className="btn-secondary px-10 py-4 rounded-lg font-bold text-lg border border-primary/30 transition-all duration-300 hover:border-primary/60">
                  Se connecter
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border/50 bg-background/50 py-8 px-4">
          <div className="max-w-6xl mx-auto text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Jouetopia. Tous les droits réservés.
          </div>
        </footer>
      </div>
    </main>
  )
}
