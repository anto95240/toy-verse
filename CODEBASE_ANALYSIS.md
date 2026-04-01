# 📊 Analyseur du Projet Toy-Verse

**Date:** 1 Avril 2026  
**Projet:** TypeScript/React Next.js (App Router)  
**Objectif:** Identifier les fichiers volumineux et complexes pour refactorisation potentielle

---

## 🔴 FILES VOLUMINEUX (>400 lignes) - PRIORITAIRES

### 1. **SearchOverlay.tsx** (440 lignes)
- **Chemin:** `components/search/SearchOverlay.tsx`
- **Purpose:** Modal de recherche intégral avec historique persistant
- **Complexité:** 🔴 ÉLEVÉE
- **Problèmes identifiés:**
  - Gestion d'historique côté localStorage
  - Recherche Supabase en temps réel (debounce 150ms)
  - Navigation vers jouets spécifiques
  - Plusieurs state (query, results, history, loading)
  - Logique de recherche + historique + navigation mélangées
- **Refactorisation suggérée:**
  - ✂️ Extraire `useSearchHistory` hook
  - ✂️ Extraire `useSupabaseSearch` hook  
  - ✂️ Créer composant `SearchResults` 
  - ✂️ Créer composant `SearchHistory`

### 2. **useToyFilters.ts** (335 lignes)
- **Chemin:** `hooks/toys/useToyFilters.ts`
- **Purpose:** Logique centralisée pour tous les filtres de jouets
- **Complexité:** 🔴 ÉLEVÉE
- **Problèmes identifiés:**
  - 3 useEffect pour charger catégories, studios, années
  - Supabase subscriptions complexes (réaltime)
  - `updateCountsOptimistically` fait beaucoup de calculs
  - Mélange de logique data + filtres + counts
  - Difficile à tester unitairement
- **Refactorisation suggérée:**
  - ✂️ Extraire `useFilterCounts` hook
  - ✂️ Extraire `useToyData` hook (chargement toys)
  - ✂️ Extraire `useFilterActions` hook (toggle, reset)
  - ✂️ Créer une fonction utilitaire `calculateOptimisticCounts()`

### 3. **SearchBar.tsx** (270 lignes)
- **Chemin:** `components/search/SearchBar.tsx`
- **Purpose:** Barre de recherche avec dropdown, suggestions et historique
- **Complexité:** 🟠 MOYENNE-ÉLEVÉE
- **Problèmes identifiés:**
  - Hook personnalisé `useSearchWithHistory` pas inspecté
  - Rendu conditionnel complexe (4+ conditions)
  - Gestion du dropdown + history affichage
  - Logique de navigation entrecroisée
- **Refactorisation suggérée:**
  - ✂️ Extraire composant `SearchDropdown`
  - ✂️ Extraire composant `SearchHistoryList`
  - ✂️ Extraire composant `SearchResults` (réutiliser si possible)

### 4. **ToyCard.tsx** (245 lignes)
- **Chemin:** `components/toyGrid/ToyCard.tsx`
- **Purpose:** Carte affichage d'un jouet (mobile + desktop double layout)
- **Complexité:** 🟠 MOYENNE-ÉLEVÉE
- **Problèmes identifiés:**
  - Deux layouts complètement différents (mobile vs desktop)
  - Multiples sous-composants imbriqués (NumberBadge, InfoBadge, ToyCategories, etc.)
  - Logique de rendu conditionnelle complexe
  - Actions répétées dans les deux layouts
- **Refactorisation suggérée:**
  - ✂️ Scinder en `ToyCardMobile` et `ToyCardDesktop` (ou utiliser wrapper)
  - ✂️ Composants sous-composants ne sont actuellement helpers, extraire en vrais composants
  - ✂️ Centraliser logique d'édition/suppression

---

## 🟠 FILES MOYENS (200-250 lignes) - À SURVEILLER

### 5. **ToyPageContent.tsx** (215 lignes)
- **Chemin:** `app/[themeSlug]/ToyPageContent.tsx`
- **Purpose:** Page d'un thème avec grille, filtres, pagination
- **Complexité:** 🟠 MOYENNE
- **Détails:**
  - Orchestration de multiples hooks (useToySorting, useRouter, useSearchParams)
  - Gestion complexe du `selectedToyId` avec ref
  - Réinitialisation entrelacée (resetPage, clearSelection)
  - Affichage conditionnel desktop/mobile des filtres
- **À considérer:**
  - Logique du `selectedToyId` est complexe (3 useEffect)
  - Pourrait se diviser en sous-pages

### 6. **ThemeList.tsx** (225 lignes)
- **Chemin:** `components/theme/ThemeList.tsx`
- **Purpose:** Gestion CRUD des thèmes (create, edit, delete)
- **Complexité:** 🟠 MOYENNE
- **Détails:**
  - Gestion d'état CRUD complet
  - Upload image avec conversion WebP
  - Gestion d'erreurs (duplicate slug)

### 7. **Navbar.tsx** (210 lignes)
- **Chemin:** `components/layout/Navbar.tsx`
- **Purpose:** Barre navigation avec dropdown thèmes + menu mobile
- **Complexité:** 🟠 MOYENNE
- **Détails:**
  - 3 niveaux de rendu (desktop, tablet, mobile)
  - Dropdown thèmes dynamique
  - SearchBar intégrée (sur desktop seulement)
  - Gestion du hook `useNavbarLogic`

---

## 🟡 FILES MODÉRÉS (130-200 lignes) - COMPLEXITÉ MOYENNE

| Fichier | Lignes | Complexité | Notes |
|---------|--------|-----------|-------|
| **useProfileLogic.ts** | 130 | 🟠 Moyenne | Validations, upload profile, password update |
| **useToyModal.ts** | 135 | 🟠 Moyenne | Gestion modal jouet + upload image |
| **FilterContent.tsx** | 160 | 🟠 Moyenne | Affichage de tous les types de filtres |
| **ImageUploadPopup.tsx** | 165 | 🟠 Moyenne | Popup avec tabs (local/URL), capture caméra |
| **LoginForm.tsx** | 145 | 🟡 Légère | Mode login + password reset toggle |
| **ThemeForm.tsx** | 140 | 🟡 Légère | Form avec image preview |
| **ToyPageClient.tsx** | 150 | 🟠 Moyenne | Orchestration page thème + modales |
| **useToyImages.ts** | 105 | 🟠 Moyenne | Loading images par batch (8 parallèles) |
| **useNavbarLogic.ts** | 55 | 🟡 Légère | Fetch thèmes + gestion dropdown |

---

## 📋 ANALYSE PAR CATÉGORIE

### **HOOKS (Logique Métier)**
```
✂️ À REFACTORISER - TOP PRIORITY:
├── useToyFilters.ts         (335 lignes) - 🔴 SPLIT EN 3 HOOKS
├── SearchBar (via hook)      (270 lignes) - 🟠 À vérifier useSearchWithHistory
├── useProfileLogic.ts        (130 lignes) - 🟡 OK mais + validations = complexe
└── useToyModal.ts           (135 lignes) - 🟠 Upload + form logic mélangés

OK - N'EXIGE PAS REFACTORISATION:
├── useNavbarLogic.ts        (55 lignes) - Simple fetch + dropdown
├── useToyImages.ts          (105 lignes) - Batching smart
└── useHomeLogic.ts          (50 lignes) - Routing logic
```

### **COMPOSANTS (UI - Components)**
```
✂️ À REFACTORISER - TOP PRIORITY:
├── SearchOverlay.tsx        (440 lignes) - 🔴 SPLIT EN 3 COMPOSANTS
├── SearchBar.tsx            (270 lignes) - 🟠 DROPDOWN + HISTORIQUE extraire
├── ToyCard.tsx              (245 lignes) - 🟠 MOBILE/DESKTOP split
└── ToyPageContent.tsx       (215 lignes) - 🟠 SÉLECTION TOY logic complexe

À SURVEILLER:
├── Navbar.tsx               (210 lignes) - 🟠 3 rendus différents
├── ThemeList.tsx            (225 lignes) - 🟠 CRUD + Upload mélangés
└── FilterContent.tsx        (160 lignes) - 🟠 Beaucoup d'imbrication

OK - TAILLE RAISONNABLE:
├── ImageUploadPopup.tsx     (165 lignes) - 🟡 OK, tabs bien séparés
├── LoginForm.tsx            (145 lignes) - 🟡 OK, toggle reset intégré
├── ThemeForm.tsx            (140 lignes) - 🟡 OK
└── ProfileSettings.tsx      (80 lignes)  - ✅ Bien composé
```

### **PAGES (Server/Client Components)**
```
OK - BIEN ORGANISÉES:
├── ToyPageClient.tsx        (150 lignes) - Orchestration clean
├── HomePageClient.tsx       (85 lignes)  - Routing logic
└── [themeSlug]/page.tsx     (Server) - Non inspecté

À REFACTORISER:
└── ToyPageContent.tsx       (215 lignes) - Voir ci-dessus
```

---

## 🎯 PRIORITÉS DE REFACTORISATION

### **NIVEAU 1 - URGENT (Impact maximal)**
1. **useToyFilters.ts** (335 → 3 hooks de ~100 lignes chacun)
   - Difficulté: 🟠 Moyenne
   - Temps estimation: 4-6 heures
   - Bénéfice: Testabilité +++, Réutilisabilité +++
   - Plan:
     ```
     useFilterCounts (50 lignes)          - Gestion des counts
     useToyData (100 lignes)               - Fetch des toys
     useFilterToggle (85 lignes)           - Toutes les actions (toggle, reset)
     ```

2. **SearchOverlay.tsx** (440 → 3 composants de ~120 lignes chacun)
   - Difficulté: 🟠 Moyenne
   - Temps estimation: 3-4 heures
   - Bénéfice: Réutilisabilité, Maintenance
   - Plan:
     ```
     SearchOverlay (wrapper)                      - Modal container
     SearchResults (120 lignes)                   - Rendu résultats
     SearchHistorySection (120 lignes)            - Historique display
     useSearchOverlay (hook logique séparé)       - Logique métier
     ```

### **NIVEAU 2 - IMPORTANT (Moyen impact)**
3. **SearchBar.tsx** (270 lignes) - Complexité côté affichage
4. **ToyCard.tsx** (245 lignes) - Double layout mobile/desktop
5. **ToyPageContent.tsx** (215 lignes) - Logique selectedToyId complexe

### **NIVEAU 3 - MAINTENANCE (Faible impact immédiat)**
6. **Navbar.tsx** (210 lignes) - Rendu complexe mais composant stable
7. **ThemeList.tsx** (225 lignes) - CRUD + upload, pourrait être séparé

---

## 📊 STATISTIQUES

| Métrique | Valeur |
|----------|--------|
| **Fichiers > 200 lignes** | 8 fichiers |
| **Fichiers > 300 lignes** | 2 fichiers |
| **Fichiers > 400 lignes** | 1 fichier |
| **Lignes "dangereuses"** | 2000+ |
| **Score complexité moyen** | 🟠 MOYEN |

---

## ✅ RECOMMANDATIONS GÉNÉRALES

### Pour les Hooks:
- ✂️ Limiter chaque hook à < 150 lignes
- ✂️ 1 responsabilité = 1 hook
- ✂️ Extraire les subscriptions Supabase en hooks séparés

### Pour les Composants:
- ✂️ Composants presentational < 200 lignes
- ✂️ Composants avec logique < 250 lignes  
- ✂️ Extraire les sous-sections en sous-composants
- ✂️ Éviter 2+ rendus conditionels majeurs

### Pour les Pages:
- ✂️ Garder les pages < 200 lignes
- ✂️ Déléguer la logique à des composants/hooks
- ✂️ Les pages doivent orchestrer, pas implémenter

---

## 🚀 BÉNÉFICES DE LA REFACTORISATION

| Aspect | Avant | Après |
|--------|-------|-------|
| **Testabilité** | 🔴 Difficile | 🟢 Aisée |
| **Réutilisabilité** | 🟡 Partielle | 🟢 Maximale |
| **Maintenance** | 🟠 Complexe | 🟢 Simple |
| **Performance** | 🟡 OK | 🟢 Optimisée |
| **Onboarding** | 🔴 Difficile | 🟢 Rapide |

---

Généré automatiquement par l'analyseur du codebase.
