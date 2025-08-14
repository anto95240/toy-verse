# 🧸 ToyVerse - Gestionnaire de Collection de Jouets

Une application web moderne pour gérer et organiser votre collection de jouets avec Supabase et Next.js.

## ✨ Fonctionnalités

- 🔐 **Authentification sécurisée** avec Supabase Auth
- 🎨 **Gestion de thèmes** (Lego, Playmobil, etc.)
- 🧸 **Catalogue de jouets** avec photos et détails
- 🔍 **Recherche avancée** et filtres intelligents
- 📱 **PWA** - Installable sur mobile et desktop
- 🎯 **Interface responsive** et moderne
- ☁️ **Stockage cloud** des images avec Supabase Storage

## 🚀 Démarrage rapide

### Prérequis

- Node.js 18+ 
- Compte Supabase
- Git

### Installation

1. **Cloner le repository**
```bash
git clone https://github.com/votre-username/toy-verse.git
cd toy-verse
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configuration Supabase**
   - Créer un projet sur [supabase.com](https://supabase.com)
   - Exécuter le script SQL dans `scripts/setup-supabase.sql`
   - Créer un bucket Storage nommé `toys-images`

4. **Variables d'environnement**
```bash
cp .env.example .env.local
# Remplir avec vos clés Supabase
```

5. **Lancer en développement**
```bash
npm run dev
```

## 📖 Guide de déploiement

Consultez le fichier [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) pour un guide complet de déploiement en production.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

## 🛠️ Technologies utilisées

- **Frontend** : Next.js 15, React 19, TypeScript
- **Styling** : Tailwind CSS, FontAwesome
- **Backend** : Supabase (PostgreSQL, Auth, Storage)
- **Déploiement** : Vercel
- **PWA** : Service Worker, Web App Manifest

## 📱 PWA (Progressive Web App)

ToyVerse est une PWA complète :
- ✅ Installable sur mobile et desktop
- ✅ Fonctionne hors ligne (cache intelligent)
- ✅ Notifications push (à venir)
- ✅ Interface native

## 🔒 Sécurité

- **Row Level Security (RLS)** : Chaque utilisateur ne voit que ses données
- **Authentification JWT** : Tokens sécurisés avec Supabase
- **Upload sécurisé** : Images stockées avec permissions utilisateur
- **Variables d'environnement** : Clés sensibles protégées

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
- Ouvrir une issue pour signaler un bug
- Proposer de nouvelles fonctionnalités
- Soumettre une pull request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

**Développé avec ❤️ par [Votre Nom]**

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
