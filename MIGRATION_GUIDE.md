# 📁 Guide de migration du Storage Supabase

## 🎯 Objectif
Réorganiser les images dans Supabase Storage pour avoir une structure par utilisateur :
```
toys-images/
├── themes/
│   ├── [userId1]/
│   │   ├── image1.jpg
│   │   └── image2.jpg
│   └── [userId2]/
│       └── image3.jpg
└── toys/
    ├── [userId1]/
    │   ├── toy1.jpg
    │   └── toy2.jpg
    └── [userId2]/
        └── toy3.jpg
```

## ⚠️ Important
Cette migration est **optionnelle** et peut être faite après avoir déjà des données. Les anciennes images continueront de fonctionner.

## 🔧 Comment migrer

### Option 1 : Migration automatique (recommandée)
```typescript
import { migrateUserImages } from '@/utils/imageStorage'

// Dans votre composant ou page
const handleMigration = async () => {
  const userId = session?.user?.id
  if (!userId) return
  
  const result = await migrateUserImages(userId)
  if (result.success) {
    console.log(`${result.migratedCount} fichiers migrés`)
  } else {
    console.error('Erreur migration:', result.error)
  }
}
```

### Option 2 : Migration manuelle via Supabase Dashboard
1. Aller dans **Storage** > **toys-images**
2. Créer les dossiers `themes/[userId]` et `toys/[userId]`
3. Déplacer manuellement les fichiers dans les bons dossiers

## 🔄 Mise à jour du code
Les nouveaux uploads utiliseront automatiquement la nouvelle structure grâce à la fonction `getImagePath()`.

## 🗄️ Mise à jour des politiques Storage
```sql
-- Nouvelles politiques pour la structure par utilisateur
CREATE POLICY "Users can view own images v2" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'toys-images' AND 
    (
      -- Ancienne structure (compatibilité)
      auth.uid()::text = (storage.foldername(name))[1] OR
      -- Nouvelle structure
      auth.uid()::text = (storage.foldername(name))[2]
    )
  );

CREATE POLICY "Users can upload own images v2" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'toys-images' AND 
    auth.uid()::text = (storage.foldername(name))[2]
  );
```

## ✅ Avantages de la nouvelle structure
- 🗂️ Organisation claire par utilisateur
- 🔒 Sécurité renforcée
- 🧹 Nettoyage plus facile
- 📊 Statistiques par utilisateur