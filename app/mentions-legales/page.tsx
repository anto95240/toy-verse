import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Mentions légales | Jouetopia",
  description: "Éditeur, données collectées, cookies et suppression de compte sur Jouetopia.",
};

const collected = [
  ["Compte", "E-mail, prénom, nom, mot de passe chiffré", "Connexion et profil"],
  ["Collection", "Thèmes, jouets, champs, photos", "Afficher et retrouver vos objets"],
  ["Préférences", "Statistiques choisies, thème clair ou sombre", "Affichage de l’interface"],
  ["Recherche", "Dernières recherches, sur cet appareil seulement", "Retrouver une recherche récente"],
  ["Retours", "Message envoyé depuis le profil", "Répondre à une idée ou un bug"],
];

export default function MentionsLegalesPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-4 py-10 sm:py-16 space-y-6">
        <div className="space-y-3">
          <Link href="/" className="text-sm text-primary font-medium">
            ← Retour à l&apos;accueil
          </Link>
          <h1 className="text-3xl sm:text-4xl font-title">Mentions légales</h1>
          <p className="text-muted-foreground">
            Jouetopia sert à cataloguer une collection de jouets. Les informations ci-dessous décrivent qui édite le site, ce qui est enregistré, et comment le récupérer ou le supprimer.
          </p>
        </div>

        <section className="bg-card border border-border rounded-2xl p-5 sm:p-6 space-y-2">
          <h2 className="text-xl">Éditeur et contact</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Site réalisé et édité par Antoine Richard. Une fois connecté, le moyen de contact est la rubrique
            « Idée ou signalement de bug » dans Profil. Le message part avec l&apos;adresse du compte, pour pouvoir répondre.
          </p>
        </section>

        <section className="bg-card border border-border rounded-2xl p-5 sm:p-6 space-y-2">
          <h2 className="text-xl">Hébergement</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Le site est hébergé par Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis.
            Les comptes, la collection et les photos sont stockés chez Supabase. Les photos ne sont pas publiques : un lien temporaire est généré pour les afficher.
          </p>
        </section>

        <section className="bg-card border border-border rounded-2xl p-5 sm:p-6 space-y-4">
          <h2 className="text-xl">Ce qui est enregistré</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Rien n&apos;est vendu, et il n&apos;y a pas de publicité. Les données servent à faire fonctionner votre espace.
          </p>
          <ul className="space-y-3">
            {collected.map(([label, content, why]) => (
              <li key={label} className="text-sm">
                <p className="font-semibold text-foreground">{label}</p>
                <p className="text-muted-foreground">{content}</p>
                <p className="text-muted-foreground">Usage : {why}.</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-card border border-border rounded-2xl p-5 sm:p-6 space-y-2">
          <h2 className="text-xl">Cookies et stockage local</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Un cookie de session garde la connexion. Sur l&apos;appareil, le navigateur mémorise aussi le thème clair ou sombre et l&apos;historique de recherche. Vous pouvez effacer cet historique dans la recherche, ou vider les données du site dans le navigateur. Vercel Analytics mesure des visites anonymes (pages vues), sans profil publicitaire.
          </p>
        </section>

        <section className="bg-card border border-border rounded-2xl p-5 sm:p-6 space-y-2">
          <h2 className="text-xl">Vos actions</h2>
          <ul className="text-sm text-muted-foreground leading-relaxed list-disc pl-5 space-y-1">
            <li>Corriger le nom ou l&apos;e-mail : Profil, informations du compte.</li>
            <li>Changer le mot de passe : Profil, sécurité.</li>
            <li>Supprimer le compte, la collection et les photos : Profil, zone de danger. La confirmation demandée est le mot SUPPRIMER.</li>
          </ul>
        </section>

        <section className="bg-card border border-border rounded-2xl p-5 sm:p-6 space-y-2">
          <h2 className="text-xl">Contenus et marques</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            L&apos;interface et le nom Jouetopia appartiennent à leur auteur. Les photos et textes que vous ajoutez restent les vôtres. Les noms de marques, de licences et de personnages servent uniquement à décrire les objets de la collection et appartiennent à leurs titulaires.
          </p>
        </section>
      </div>
    </main>
  );
}
