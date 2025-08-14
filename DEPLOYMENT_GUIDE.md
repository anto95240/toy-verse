# 🚀 Guide de déploiement ToyVerse

## 📋 Table des matières
1. [Configuration Supabase](#1-configuration-supabase)
2. [Préparation du code](#2-préparation-du-code)
3. [Déploiement sur Vercel](#3-déploiement-sur-vercel)
4. [Configuration PWA](#4-configuration-pwa)
5. [Tests et validation](#5-tests-et-validation)
6. [Maintenance](#6-maintenance)

---

## 1. 🗄️ Configuration Supabase

### 1.1 Création du projet Supabase

1. **Aller sur [supabase.com](https://supabase.com)**
2. **Créer un compte** ou se connecter
3. **Créer un nouveau projet** :
   - Nom : `toy-verse-prod`
   - Mot de passe de base de données : **NOTEZ-LE BIEN**
   - Région : Choisir la plus proche de vos utilisateurs

### 1.2 Configuration de la base de données

```sql
-- 1. Créer la table themes
CREATE TABLE themes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  image_url TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Créer la table toys
CREATE TABLE toys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  theme_id UUID REFERENCES themes(id) ON DELETE CASCADE,
  nom TEXT NOT NULL,
  taille TEXT,
  nb_pieces INTEGER,
  numero TEXT,
  is_exposed BOOLEAN DEFAULT FALSE,
  is_soon BOOLEAN DEFAULT FALSE,
  photo_url TEXT,
  categorie TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Activer RLS (Row Level Security)
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE toys ENABLE ROW LEVEL SECURITY;

-- 4. Créer les politiques RLS pour themes
CREATE POLICY "Users can view own themes" ON themes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own themes" ON themes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own themes" ON themes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own themes" ON themes
  FOR DELETE USING (auth.uid() = user_id);

-- 5. Créer les politiques RLS pour toys
CREATE POLICY "Users can view own toys" ON toys
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM themes WHERE themes.id = toys.theme_id
    )
  );

CREATE POLICY "Users can insert own toys" ON toys
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM themes WHERE themes.id = toys.theme_id
    )
  );

CREATE POLICY "Users can update own toys" ON toys
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT user_id FROM themes WHERE themes.id = toys.theme_id
    )
  );

CREATE POLICY "Users can delete own toys" ON toys
  FOR DELETE USING (
    auth.uid() IN (
      SELECT user_id FROM themes WHERE themes.id = toys.theme_id
    )
  );
```

### 1.3 Configuration du Storage

1. **Aller dans Storage** dans le dashboard Supabase
2. **Créer un bucket** :
   - Nom : `toys-images`
   - Public : `false` (privé)
3. **Créer les politiques Storage** :

```sql
-- Politique pour voir les images
CREATE POLICY "Users can view own images" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'toys-images' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Politique pour uploader des images
CREATE POLICY "Users can upload own images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'toys-images' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Politique pour supprimer des images
CREATE POLICY "Users can delete own images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'toys-images' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

### 1.4 Configuration de l'authentification

1. **Aller dans Authentication > Settings**
2. **Site URL** : `http://localhost:3000` (temporaire)
3. **Redirect URLs** : `http://localhost:3000/auth/callback`
4. **Disable email confirmations** : `true` (pour simplifier)

### 1.5 Récupérer les clés

1. **Aller dans Settings > API**
2. **Noter ces valeurs** :
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 2. 🔧 Préparation du code

### 2.1 Créer le fichier .env.local

```bash
# .env.local (NE PAS COMMITER)
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anonyme_ici
```

### 2.2 Vérifier le .gitignore

```bash
# .gitignore
.env.local
.env
.env.production
.env.development
```

### 2.3 Tester en local

```bash
npm run dev
```

Vérifiez que :
- ✅ L'inscription fonctionne
- ✅ La connexion fonctionne
- ✅ Création de thèmes fonctionne
- ✅ Upload d'images fonctionne
- ✅ Création de jouets fonctionne

---

## 3. 🌐 Déploiement sur Vercel

### 3.1 Préparation

1. **Pusher le code sur GitHub** :
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

2. **Aller sur [vercel.com](https://vercel.com)**
3. **Se connecter avec GitHub**

### 3.2 Déploiement

1. **Cliquer sur "New Project"**
2. **Importer votre repository GitHub**
3. **Configuration** :
   - Framework Preset : `Next.js`
   - Root Directory : `./`
   - Build Command : `npm run build`
   - Output Directory : `.next`

4. **Variables d'environnement** :
   ```
   NEXT_PUBLIC_SUPABASE_URL = https://votre-projet.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = votre_cle_anonyme
   ```

5. **Cliquer sur "Deploy"**

### 3.3 Configuration post-déploiement

1. **Noter l'URL de production** : `https://votre-app.vercel.app`

2. **Retourner dans Supabase** :
   - Authentication > Settings
   - **Site URL** : `https://votre-app.vercel.app`
   - **Redirect URLs** : 
     ```
     https://votre-app.vercel.app/auth/callback
     https://votre-app.vercel.app
     ```

---

## 4. 📱 Configuration PWA

### 4.1 Vérification des fichiers PWA

Assurez-vous que ces fichiers existent :
- ✅ `public/manifest.json`
- ✅ `public/sw.js`
- ✅ `public/images/logo.webp`

### 4.2 Test PWA

1. **Ouvrir votre site en production**
2. **Ouvrir DevTools** (F12)
3. **Onglet Application**
4. **Vérifier** :
   - ✅ Manifest
   - ✅ Service Worker
   - ✅ Cache Storage

### 4.3 Installation PWA

Sur mobile :
1. **Ouvrir le site dans Chrome/Safari**
2. **Menu** → "Ajouter à l'écran d'accueil"

Sur desktop :
1. **Icône d'installation** dans la barre d'adresse
2. **Cliquer pour installer**

---

## 5. ✅ Tests et validation

### 5.1 Tests fonctionnels

- [ ] Inscription d'un nouvel utilisateur
- [ ] Connexion/déconnexion
- [ ] Création d'un thème avec image
- [ ] Création d'un jouet avec image
- [ ] Modification d'un jouet
- [ ] Suppression d'un jouet
- [ ] Recherche de jouets
- [ ] Filtres par catégorie
- [ ] Responsive mobile/desktop
- [ ] PWA installable

### 5.2 Tests de performance

1. **Google PageSpeed Insights** : https://pagespeed.web.dev/
2. **Lighthouse** dans DevTools
3. **Vérifier** :
   - Performance > 90
   - Accessibility > 90
   - Best Practices > 90
   - SEO > 90
   - PWA : ✅

---

## 6. 🔧 Maintenance

### 6.1 Monitoring

1. **Vercel Analytics** : Activer dans le dashboard
2. **Supabase Logs** : Surveiller les erreurs
3. **Error Tracking** : Considérer Sentry

### 6.2 Sauvegardes

1. **Base de données** : Supabase fait des sauvegardes automatiques
2. **Code** : GitHub comme backup
3. **Images** : Supabase Storage est répliqué

### 6.3 Mises à jour

```bash
# Déploiement d'une nouvelle version
git add .
git commit -m "New feature: ..."
git push origin main
# Vercel déploie automatiquement
```

---

## 🚨 Checklist finale

Avant de considérer le déploiement comme terminé :

### Supabase
- [ ] Base de données créée avec toutes les tables
- [ ] RLS activé sur toutes les tables
- [ ] Politiques RLS configurées
- [ ] Storage bucket créé avec politiques
- [ ] URLs de redirection configurées
- [ ] Confirmation email désactivée (optionnel)

### Vercel
- [ ] Projet déployé sans erreurs
- [ ] Variables d'environnement configurées
- [ ] URL de production fonctionnelle
- [ ] HTTPS activé automatiquement

### Application
- [ ] Toutes les fonctionnalités testées
- [ ] PWA installable
- [ ] Responsive sur tous les appareils
- [ ] Performance optimisée
- [ ] Pas d'erreurs dans la console

### Sécurité
- [ ] Clés sensibles dans les variables d'environnement
- [ ] .env.local dans .gitignore
- [ ] RLS correctement configuré
- [ ] Pas de clés hardcodées dans le code

---

## 🎉 Félicitations !

Votre application ToyVerse est maintenant déployée et accessible à tous ! 

**URL de production** : `https://votre-app.vercel.app`

N'oubliez pas de partager le lien avec vos utilisateurs et de surveiller les performances dans les premiers jours.