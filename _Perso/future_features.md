# Fonctionnalité Future : Profils de Thèmes Personnalisés

Ce document trace la conception de l'idée "pouvoir personnaliser le type de jouet et des champs qu'il affichera dans les paramètres".

## Objectif
Actuellement, les profils (Lego, Funko Pop, etc.) sont écrits en dur dans le fichier `lib/themeProfile.ts`. Le but est de les transférer dans la base de données pour permettre à l'utilisateur de :
1. Créer de nouveaux profils personnalisés (ex: "Mes Cartes Pokémon").
2. Définir quels champs doivent s'afficher, quels champs doivent être "principaux" ou cachés.
3. Attacher ces profils personnalisés aux thèmes.

## Plan d'Implémentation

### 1. Base de données (Supabase)
Créer une table `theme_profiles` :
- `id` (uuid, primary key)
- `user_id` (uuid, foreign key vers auth.users)
- `label` (texte, ex: "Lego", "Figurine")
- `emoji` (texte, ex: "🧱")
- `primary_fields` (jsonb, liste des champs obligatoires/principaux)
- `details_first_fields` (jsonb, liste des champs affichés en premier dans "Plus de détails")
- `hidden_fields` (jsonb, liste des champs masqués pour ce type)
- `auto_open_details` (boolean)
- `created_at` (timestamp)

### 2. Migration des données existantes
- Un script d'insertion devra lire le fichier actuel `ALL_PROFILES` et insérer chaque profil dans la table `theme_profiles` pour chaque utilisateur (ou créer des profils globaux si l'architecture le préfère, ex: `user_id` null = profil système).

### 3. Interface (Paramètres)
- Ajouter un onglet "Profils" dans le back-office / paramètres de l'application.
- Composant liste : affichage des profils existants.
- Formulaire complet (avec cases à cocher pour chaque champ possible de `ToyFormValues`) pour paramétrer le profil (Quels champs sont primaires ? Lesquels sont masqués ?).

### 4. Code de l'application
- `ThemeForm.tsx` : Le menu déroulant devra récupérer la liste des profils depuis la DB au lieu du fichier local.
- `ToyForm.tsx` : Le formulaire devra récupérer les paramètres du profil (depuis la DB) pour déterminer si un champ doit être masqué, prioritaire, etc.
