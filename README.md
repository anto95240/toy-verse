# 🧸 Jouetopia - Gestionnaire de Collection de Jouets

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

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

**Développé par Antoine**
