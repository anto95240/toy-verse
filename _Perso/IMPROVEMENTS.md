# Boîte à idées & Améliorations Futures pour Jouetopia (toy-verse)

Ce document liste plusieurs axes d'amélioration possibles pour le projet. L'objectif est d'avoir une référence pour de futures sessions de développement, que ce soit pour ajouter des fonctionnalités utiles ou pour explorer de nouvelles technologies.

---

## Axe 1 : Expérience Utilisateur (UX) & PWA Avancée

*   **Mode Hors-Ligne (Offline Support)** : 
    *   *Idée* : Utiliser un outil comme `next-pwa` ou configurer un Service Worker personnalisé pour mettre en cache les requêtes API (Supabase) et les images.
    *   *Bénéfice* : Permettre de consulter sa collection même dans une zone sans réseau (ex: dans une brocante ou un vide-grenier).
*   **Compression d'images plus robuste** : 
    *   *Idée* : Remplacer la conversion manuelle (Canvas) dans `imageConverter.ts` par une librairie spécialisée comme `browser-image-compression`.
    *   *Bénéfice* : Mieux gérer les très grosses photos issues de smartphones récents sans risquer de faire planter le navigateur par manque de mémoire.
*   **Animations Fluides** :
    *   *Idée* : Intégrer `Framer Motion` pour animer les transitions entre les pages, l'ouverture des modales, ou l'apparition des jouets dans la grille.

## Axe 2 : Nouvelles Fonctionnalités "Collectionneur"

*   **Partage Public (Social)** :
    *   *Idée* : Créer un système de "lien de partage". Un utilisateur pourrait rendre un de ses thèmes "Public". Une page dédiée (sans authentification) permettrait à n'importe qui de voir cette collection via une URL unique.
*   **Export / Import de Données** :
    *   *Idée* : Permettre l'export de toute sa collection au format `.csv` ou `.json`.
    *   *Bénéfice* : Le "Zero Vendor Lock-in". C'est très rassurant pour un utilisateur de savoir qu'il peut récupérer ses données à tout moment pour en faire une sauvegarde personnelle.
*   **Dashboard Avancé (Statistiques)** :
    *   *Idée* : Ajouter une page de statistiques utilisant une librairie de graphiques (ex: `Recharts` ou `Chart.js`).
    *   *Bénéfice* : Visualiser sa collection avec des camemberts (répartition par thème/marque), ou des courbes (évolution de la valeur estimée de la collection).

## Axe 3 : Qualité du Code & DevEx (Expérience Développeur)

Idéal pour monter en compétences sur des standards très demandés en entreprise.

*   **Tests Automatisés (Unitaires)** :
    *   *Idée* : Mettre en place `Vitest` (plus rapide que Jest) et `React Testing Library`.
    *   *Cible* : Commencer par tester les fonctions utilitaires (ex: `statsCalculator.ts`, `filterQueries.ts`) qui contiennent beaucoup de logique métier critique.
*   **Intégration Continue (CI)** :
    *   *Idée* : Créer un workflow `GitHub Actions` qui se lance à chaque `push`.
    *   *Tâches CI* : Lancer le linter (`npm run lint`), la vérification des types (`tsc --noEmit`), et les tests automatisés pour éviter les régressions.
*   **Pre-commit Hooks (Husky)** :
    *   *Idée* : Configurer `husky` et `lint-staged` pour formater le code (Prettier) et vérifier les erreurs (ESLint) automatiquement juste avant chaque commit.
