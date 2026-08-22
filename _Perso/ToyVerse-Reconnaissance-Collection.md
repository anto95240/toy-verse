# ToyVerse — Cahier des charges
## Reconnaissance de la collection

---

## 1. Résumé exécutif

ToyVerse — Reconnaissance de la collection est le socle de l'application : un inventaire numérique de jouets, doté d'une recherche complète et d'une reconnaissance visuelle personnalisée capable d'identifier un jouet photographié parmi la collection propre de l'utilisateur (« 1 photo → 1 jouet → 1 fiche »).

Ce document ne couvre pas la gestion des espaces de rangement, de l'exposition ni des rotations, traitées dans un cahier des charges séparé.

---

## 2. Contexte et périmètre

### 2.1 Présentation

ToyVerse doit permettre à l'utilisateur de :
- connaître les jouets de sa collection ;
- retrouver rapidement n'importe quel jouet ;
- reconnaître visuellement un jouet photographié.

Concept central :
> « ToyVerse connaît ma collection et sait reconnaître mes jouets. »

### 2.2 Périmètre inclus

- Fiches jouets complètes (CRUD), photos, statuts.
- Recherche textuelle, filtrée, combinée et visuelle.
- Reconnaissance visuelle personnalisée d'un jouet unique, avec apprentissage progressif.
- Compte utilisateur, authentification, sécurité et confidentialité des données.
- Statistiques et tableau de bord relatifs à la collection et à la reconnaissance.
- Personnalisation (catégories, tags, statuts, thème, langue).

### 2.3 Hors périmètre

- Cartographie des meubles, étagères et compartiments.
- Détection/estimation des dimensions des espaces.
- Vérification visuelle d'un emplacement par caméra.
- Gestion de l'exposition et zones d'exposition.
- Rotations, algorithme de rotation, agenda et notifications liées aux rotations.
- Scan d'étagère, scan de zone/inventaire, scan multi-objets.
- Reconnaissance contextuelle et multi-objets (niveaux 4 et 5, voir 6.3.10).

Le champ « emplacement » sur la fiche jouet reste ici un **champ texte simple** renseigné manuellement (ex. « Chambre → Étagère 3 »), sans modélisation des meubles ni vérification par caméra.

### 2.4 Personas

| Persona | Besoin principal |
|---|---|
| Le collectionneur organisé | Recherche rapide et fiable, filtres avancés |
| Le collectionneur passionné | Ajout de jouets facilité par le scanner, reconnaissance fiable |
| Le collectionneur nomade | Suivi de sa collection même quand les jouets changent de rangement fréquemment |

---

## 3. Vision produit

- 🧸 **La collection** — Quels jouets l'utilisateur possède-t-il ?
- 👁️ **La reconnaissance** — Quel jouet est actuellement visible devant la caméra ?

---

## 4. Objectifs

### 4.1 Objectifs fonctionnels

1. **Centraliser la collection** — base personnelle complète de tous les jouets.
2. **Retrouver instantanément un jouet** — par nom, catégorie, marque, personnage, univers, emplacement (texte libre), tags, filtres, ou photo.
3. **Reconnaître visuellement les jouets** — la caméra identifie un jouet photographié et retrouve la fiche correspondante dans la collection personnelle.

### 4.2 Objectifs non fonctionnels

4. **Protéger la vie privée** — photos et données de reconnaissance isolées par utilisateur et contrôlables (suppression, désactivation).
5. **Rester fiable malgré l'incertitude de l'IA** — ne jamais modifier automatiquement une donnée importante sur la seule base d'une reconnaissance non confirmée.
6. **Rester utilisable hors ligne** — consultation et ajout de fiches possibles sans connexion, synchronisation différée.

---

## 5. Architecture fonctionnelle

1. Collection
2. Recherche
3. Scanner / reconnaissance visuelle (jouet unique)
4. Statistiques (collection & reconnaissance)
5. Personnalisation
6. Compte et paramètres
7. Sécurité, confidentialité et gestion des données
8. Import / export de données

---

## 6. Spécifications fonctionnelles

### 6.1 Gestion de la collection

**Fiche jouet** — ID unique, nom, nom alternatif, photo principale, photos secondaires, catégorie, sous-catégorie, marque, gamme, licence, univers, personnage, fabricant, année, date d'acquisition, prix d'achat, état, quantité, statut, emplacement (texte libre), tags personnalisés, notes personnelles.

**Statuts** : `en_collection` · `stocké` · `à_déplacer` · `à_réparer` · `à_vendre` · `à_donner` · `prêté` · `manquant`

**Photos du jouet** : vue principale, vue avant, vue arrière, vue latérale, détail, emballage, accessoires, photo personnalisée. Ces images alimentent le système de reconnaissance (6.3).

### 6.2 Recherche classique

- **Textuelle** : ex. « Harry Potter ».
- **Filtrée** : marque, univers, catégorie, personnage, année, état, emplacement, statut, tags.
- **Combinée** : ex. « LEGO + Harry Potter ».
- **Visuelle** : voir 6.3.

*Exigence de performance* : résultat en moins de 500 ms perçus jusqu'à ~2000 jouets.

### 6.3 Reconnaissance visuelle du jouet

#### 6.3.1 Principe

« 📷 Scanner un jouet » : l'utilisateur photographie un jouet, ToyVerse recherche une correspondance dans **sa collection personnelle**. Résultat cible : *1 photo → 1 jouet → 1 fiche*.

#### 6.3.2 Base de référence personnelle

Chaque jouet construit une « empreinte visuelle » à partir de : photo principale, photos secondaires, photos prises lors des scans, différentes orientations/distances/conditions lumineuses, présence/absence d'accessoires, emballage, détails caractéristiques.

#### 6.3.3 Apprentissage progressif

Une confirmation utilisateur (« Oui, c'est ce jouet ») améliore la reconnaissance future de ce jouet précis. Exemple : 1er scan → 60 % de confiance ; après plusieurs confirmations → 94 %, ouverture directe de la fiche.

#### 6.3.4 Gestion des niveaux de confiance

| Confiance | Comportement |
|---|---|
| Élevée (seuil configurable, ex. ≥ 90 %) | Ouverture automatique de la fiche |
| Moyenne (ex. 50–89 %) | Affichage des meilleures correspondances, choix laissé à l'utilisateur |
| Faible (< 50 %) | Nouvelle photo demandée |

#### 6.3.5 Plusieurs jouets similaires

Lorsque plusieurs jouets de la collection se ressemblent, ToyVerse affiche uniquement les correspondances pertinentes : « Quel jouet recherchez-vous ? » — la confirmation devient une donnée d'apprentissage.

#### 6.3.6 Scanner pour ajouter un jouet

Workflow : Ajouter un jouet → Scanner → reconnaissance → préremplissage de la fiche (nom, marque, gamme, licence, personnage, catégorie), modifiable par l'utilisateur.

#### 6.3.7 Correction de reconnaissance

« Ce n'est pas ce jouet » → l'utilisateur sélectionne le bon jouet → ToyVerse enregistre la correction, réutilisée pour améliorer la reconnaissance future.

#### 6.3.8 Garde-fous IA

Une reconnaissance incertaine ne doit **jamais** déclencher automatiquement une modification de fiche ou une suppression. Toute action de ce type nécessite une confirmation explicite lorsque la confiance est insuffisante.

#### 6.3.9 Confidentialité de la reconnaissance

L'utilisateur doit pouvoir à tout moment :
- supprimer ses photos ;
- supprimer les données de reconnaissance (embeddings) d'un jouet ou de l'ensemble du compte ;
- désactiver l'apprentissage automatique ;
- réinitialiser la reconnaissance d'un jouet spécifique ;
- exporter puis supprimer l'intégralité de ses données.

#### 6.3.10 Architecture évolutive (niveaux 1 à 3 — portée de ce document)

| Niveau | Description |
|---|---|
| 1 | Recherche visuelle simple — comparaison directe des photos enregistrées |
| 2 | Embeddings visuels — représentation vectorielle des images, comparée par similarité |
| 3 | Reconnaissance personnalisée — accumulation des images confirmées par jouet |

*Les niveaux 4 (reconnaissance contextuelle) et 5 (multi-objets) nécessitent la connaissance de l'environnement et relèvent du périmètre espace/rotation, hors de ce document.*

### 6.4 Tableau de bord et statistiques

- Nombre total de jouets, dernières acquisitions, alertes.
- *Collection* : nombre de jouets, valeur estimée, répartition par catégories/marques/univers.
- *Reconnaissance* : scans effectués, reconnaissances réussies, corrections utilisateur, taux de confiance moyen.

### 6.5 Personnalisation

Catégories, tags, statuts, affichage, thème, langue.

---

## 7. Exigences non fonctionnelles

- **Performance** : recherche < 500 ms perçus (≤2000 jouets) ; résultat de scan < 3 s en conditions réseau normales ; chargement initial PWA < 2 s en 4G.
- **Sécurité et RGPD** : isolation stricte des données par compte, chiffrement au repos et en transit, droit d'accès/rectification/portabilité/effacement, consentement révocable pour l'apprentissage automatique.
- **Accessibilité** : conformité raisonnable WCAG 2.1 AA, alternatives textuelles aux indicateurs colorés (🟢🟡).
- **Disponibilité hors ligne** : consultation de la collection déjà synchronisée disponible hors ligne ; ajout de fiches hors ligne avec synchronisation différée ; le scanner (niveaux 2-3) nécessite une connexion, un mode dégradé de recherche texte reste disponible hors ligne.
- **Scalabilité** : modèle de données et pipeline performants jusqu'à plusieurs milliers de jouets par utilisateur.
- **Internationalisation** : français et anglais dès la V1, toutes les chaînes passent par le système d'i18n.

---

## 8. Expérience utilisateur

Actions principales accessibles : 🔎 Rechercher, 📷 Scanner, ➕ Ajouter, 📊 Statistiques.

**Parcours scanner** : appui sur « 📷 Scanner » → caméra ouverte → détection → analyse → résultat (« Jouet reconnu — LEGO Harry Potter — Confiance : 97 % — Ouvrir la fiche ») → accès direct à la fiche.

**Design** : identité moderne et technologique, éléments arrondis, gradients, animations légères, mode sombre/clair, expérience mobile fluide.

---

## 9. Architecture technique

### 9.1 Frontend
React, Vite, TypeScript, Tailwind, architecture par composants, PWA à terme.

### 9.2 Backend
Node.js, Express, API REST, authentification JWT.

### 9.3 Base de données
Utilisateurs, jouets, catégories, tags, photos, données de reconnaissance (embeddings).

### 9.4 Pipeline de reconnaissance

- **Extraction d'embeddings** : modèle de vision transformant chaque photo en vecteur.
- **Stockage vectoriel** : indexé par utilisateur, isolation stricte des données.
- **Comparaison** : la photo scannée est comparée aux embeddings de la collection de l'utilisateur uniquement.
- **Coût et latence** : à budgétiser dès la phase reconnaissance (voir 10. Risques).

### 9.5 Modèle de données simplifié

```
Utilisateur (1) ──< Jouet (N)
Jouet (1) ──< Photo (N) ──< Embedding (N)
Utilisateur (1) ──< ScanEvent (N) ── résultat ──> Jouet (0..1)
```

### 9.6 PWA
Installation sur smartphone, accès rapide à la caméra, cache local, expérience proche du natif.

### 9.7 Authentification
Inscription, connexion, déconnexion, récupération de compte, JWT, gestion du profil. Données isolées par compte.

---

## 10. Gestion des risques

| Risque | Impact | Mitigation |
|---|---|---|
| Précision insuffisante sur jouets très similaires | Frustration, perte de confiance | Seuils de confiance prudents, confirmation systématique |
| Coût des appels d'inférence à grande échelle | Dérive budgétaire | Cache des embeddings, quotas, dimensionnement progressif |
| Fausse confiance élevée → modification erronée | Perte de données/confiance | Garde-fous IA stricts (6.3.8) |
| Qualité variable des photos (lumière, flou) | Reconnaissance peu fiable | Conseils UX à la prise de photo, détection de flou avant envoi |
| Confusion entre exemplaires identiques du même jouet | Association à la mauvaise instance | Modéliser explicitement les quantités/instances dans le modèle de données |
| Dépendance à un fournisseur tiers de vision | Risque disponibilité/coût | Interface d'abstraction permettant de changer de fournisseur |

---

## 11. Roadmap

### V1 — Fondations
Authentification, collection, CRUD jouets, fiches, photos, recherche, filtres, catégories, tags, emplacement texte simple, responsive mobile, chiffrement de base, export/suppression de compte.

### V2 — Reconnaissance
Scanner d'un jouet, reconnaissance visuelle niveaux 1-3, recherche visuelle, historique des scans, confirmation/correction, empreinte visuelle, statistiques, notifications de base.

---

## 12. Critères d'acceptation

1. Enregistrement d'une fiche complète en moins de 2 minutes.
2. Taux de reconnaissance correcte ≥ 85 % pour un jouet photographié au moins 3 fois, en conditions normales de luminosité.
3. Une correction améliore mesurablement la confiance lors du scan suivant du même jouet.
4. Recherche → résultat → fiche en moins de 3 actions.
5. Export puis suppression totale des données possible en un seul parcours utilisateur.
6. Aucune action destructrice automatique sans confirmation explicite (vérifié par tests automatisés).

---

## 13. Glossaire

- **Embedding** : représentation vectorielle d'une image utilisée pour comparer des jouets par similarité.
- **Empreinte visuelle** : ensemble des embeddings/photos de référence d'un jouet.
- **Niveau de confiance** : score (%) de fiabilité estimée d'une reconnaissance.
- **Garde-fou IA** : règle empêchant toute modification automatique sur la base d'une prédiction incertaine.

---

## 14. Points ouverts

1. Le pipeline de reconnaissance doit-il s'appuyer sur un service tiers ou un modèle hébergé en interne ?
2. Quel est le quota de scans gratuit vs payant ?
3. Le prix d'achat/valeur estimée doivent-ils être masqués par défaut ?

---

## 15. Note d'interopérabilité future

Si ce périmètre doit un jour se connecter à une gestion des espaces/rotations (déjà spécifiée par ailleurs), il est recommandé d'exposer :
- une API de lecture des fiches jouets (ID, nom, photo principale, catégorie) ;
- une API de reconnaissance réutilisable (photo en entrée → correspondances + niveau de confiance en sortie) ;
- un flux d'événements de confirmation/correction, consommable par un système tiers.

Cela permet d'ajouter des données liées (emplacement structuré, statut d'exposition, historique) par relation externe indexée sur l'ID du jouet, sans modifier ce périmètre.
