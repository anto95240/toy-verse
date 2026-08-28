# Plan : Nettoyage, Optimisation & Fix UI

> [!NOTE]
> ✅ **Fix immédiat déjà appliqué** : Le fond blanc des inputs/selects en dark mode est corrigé dans `globals.css`. Les textes sont maintenant lisibles.

---

## Fichiers > 150 lignes (scan complet du projet)

| Fichier | Lignes | Priorité |
|---|---|---|
| `components/toys/ToyForm.tsx` | **448** | 🔴 Haute |
| `lib/supabase/type.ts` | 442 | 🟡 Moyen (types, pas de logique) |
| `lib/themeProfile.ts` | **395** | 🔴 Haute (code mort à purger) |
| `lib/supabase/referential.ts` | 368 | 🟡 Moyen |
| `app/actions/referential.ts` | 305 | 🟡 Moyen |
| `app/(protected)/admin/migration/page.tsx` | 303 | 🟡 Moyen |
| `hooks/useSearchWithHistory.ts` | 291 | 🟡 Moyen |
| `components/profile/ThemeProfileFormModal.tsx` | **288** | 🔴 Haute |
| `lib/supabase/toyFilters.ts` | 250 | 🟡 Moyen |
| `components/ui/SmartSelectMulti.tsx` | **244** | 🔴 Haute (duplique la logique de SmartSelect) |
| `scripts/analyze-legacy-data.ts` | 211 | ⚪ Bas (script one-shot) |
| `components/filters/MultiSelectFilter.tsx` | 195 | 🟡 Moyen |
| `components/theme/ThemeForm.tsx` | 195 | 🟡 Moyen |
| `utils/filterQueries.ts` | 195 | 🟡 Moyen |
| `components/theme/ThemeList.tsx` | 190 | 🟡 Moyen |
| `app/(protected)/profile/page.tsx` | 189 | 🟡 Moyen |
| `app/page.tsx` | 185 | 🟡 Moyen |
| `components/layout/Navbar.tsx` | 185 | 🟡 Moyen |
| `components/filters/FilterContent.tsx` | 176 | 🟡 Moyen |
| `components/ui/SmartSelect.tsx` | 166 | ✅ Acceptable |
| `utils/imageStorage.ts` | 160 | ✅ Acceptable |

---

## Étape 1 : ✅ FAIT — Fix des inputs illisibles

Corrigé dans `globals.css` : `color-scheme: dark`, couleur de texte et fond forcés sur tous les inputs/selects/textareas.

---

## Étape 2 : Suppression du code mort (impact maximal)

### [MODIFY] `lib/themeProfile.ts` → `lib/themeProfile.ts` réduit
- **Garder** : types `ThemeProfile`, `FieldKey`, fonctions `getThemeProfile()`, `getFieldLabel()`, `getFieldPlaceholder()`, `isFieldHidden()`.
- **Supprimer** : `ALL_PROFILES`, `PROFILES` (record de 11 profils), `DETECTION_RULES` — tout ça est en DB maintenant.
- **Réduction estimée : -250 lignes** (395 → ~145 lignes)

### [MODIFY] `components/toys/ToyForm.tsx`
- Retirer l'import de `ALL_PROFILES` (plus utilisé depuis la migration DB).
- Retirer la variable `legacyProfile` maintenant inutile.

---

## Étape 3 : Refactoring des 4 fichiers prioritaires

### `components/ui/SmartSelectMulti.tsx` (244 lignes)
- Utiliser le hook `useSmartSelect` déjà créé (actuellement dupliqué dans SmartSelectMulti).
- Utiliser `SmartSelectDropdown` pour la liste déroulante.
- **Réduction estimée : -100 lignes**

### `components/toys/ToyForm.tsx` (448 lignes)
- Extraire la section `showDetails` dans `ToyFormDetailsSection.tsx`.
- **Réduction estimée : -150 lignes**

### `components/profile/ThemeProfileFormModal.tsx` (288 lignes)
- Extraire chaque onglet dans son propre composant léger.
- **Réduction estimée : -80 lignes**

### `app/(protected)/admin/migration/page.tsx` (303 lignes)
- Extraire la logique d'état dans un hook `useMigration`.

---

## Étape 4 : Optimisations Performance

### React
- `React.memo` sur : `ThemeProfileCard`, `SmartSelectDropdown`, `UniversTag`.
- `useCallback` sur les handlers passés aux enfants dans `ThemeProfilesManager`.

### Données
- Ajouter `useMemo` sur les calculs de filtres coûteux dans `useToyFilters`.
- Remplacer les `fetch` répétés des profils par un cache simple (SWR ou `useState` partagé via contexte).

### Imports morts
- Scan de tous les imports non utilisés dans les fichiers modifiés.

---

## Ordre d'exécution proposé

1. ✅ Fix inputs dark mode
2. Purge `lib/themeProfile.ts` (dead code — impact : -250 lignes, 0 risque)
3. Refactoring `SmartSelectMulti` (utiliser le hook existant)
4. Refactoring `ToyForm` (extraire section détails)
5. Optimisations React.memo / useCallback
6. Refactoring des autres fichiers 🟡 Moyen

> [!IMPORTANT]
> **Approuve ce plan pour que je commence.** Je peux tout faire en une session.
> Souhaites-tu qu'on garde `lib/themeProfile.ts` en tant que fallback legacy (recommandé pendant la transition) ou on le supprime complètement ?
