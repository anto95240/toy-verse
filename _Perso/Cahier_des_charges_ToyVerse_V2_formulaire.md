# Cahier des charges — Fonctionnalité
## Refonte de « Catégorie » et « Studio/Licence/Lieux » (migration progressive et rétrocompatible)

**Version :** 1.0
**Date :** 22/08/2026

---

## 1. Objectif de la fonctionnalité

Améliorer fortement les dimensions **Catégorie** et **Studio/Licence/Lieux** sans casser la base de données existante.

**Principe fondamental :**
> On ne remplace pas les données actuelles. On ajoute une nouvelle couche structurée au-dessus, puis on migre progressivement.

Les jouets actuels continuent de fonctionner pendant toute l'évolution.

---

## 2. Constat de l'existant

Actuellement, la base contient essentiellement :
```
Catégorie
Studio/Licence/Lieux
```
Deux champs plats qui mélangent plusieurs notions distinctes.

---

## 3. Cible fonctionnelle — Catégorie

### 3.1 Structure hiérarchique
```
Catégorie
└── Sous-catégorie
    └── Type
```
Exemple :
```
Figurine
├── Figurine articulée
├── Figurine statique
├── Mini-figurine
└── Figurine à collectionner
```

> **Note de périmètre :** l'entité `Feature`/`ToyFeature` (caractéristiques indépendantes type "Articulé", "Électronique", "Lumineux"...) a été envisagée mais est **écartée de la V2**. En pratique, très peu de jouets de la collection sont concernés (quelques unités seulement) — le rapport coût/bénéfice d'ajouter une entité, un référentiel, une UI dédiée et une facette de filtre pour un usage aussi marginal n'est pas justifié. Ces informations continuent d'être indiquées directement dans le **nom du jouet**, comme c'est déjà le cas aujourd'hui (ex : "Figurine articulée lumineuse XYZ"). Ce point pourra être reconsidéré plus tard si la collection évolue dans cette direction, sans impact sur le reste du modèle (voir section 5).

### 3.3 Entité `Category`
```
Category
├── id
├── name
├── slug
├── parentId
├── level
├── description
├── icon
├── active
└── order
```
- Pas de profondeur fixe en dur (pas de `category`/`subcategory`/`subsubcategory` codés en dur) : utiliser `parentId` pour permettre une arborescence évolutive sans modifier le schéma.
- Exemple :
```
Figurine            id: cat_001, parentId: null, level: 0
Figurine articulée  id: cat_002, parentId: cat_001, level: 1
Figurine articulée 1/12  id: cat_003, parentId: cat_002, level: 2
```

### 3.4 Gestion des doublons/alias (catégories)
```
Figurine
slug: figurine
aliases: ["Figurines", "Figure", "Action figure"]
```

---

## 4. Cible fonctionnelle — Studio/Licence/Lieux

Le plus gros changement : arrêter de tout mélanger dans un seul champ. Séparer en entités distinctes : **Studio**, **Licence**, **Franchise**, **Personnage**, **Lieu**.

### 4.1 Entité `Studio`
```
Studio
├── id
├── name
├── slug
├── description
├── parentStudioId
├── country
├── active
└── aliases
```
- Relation hiérarchique via `parentStudioId` (ex : Pixar rattaché à Disney).
- Permet une recherche stricte (Pixar uniquement) ou étendue (Disney + tout ce qui lui est rattaché).
- Gestion des doublons via `aliases` :
```
name: Pixar Animation Studios
slug: pixar-animation-studios
aliases: ["Pixar", "Pixar Studios"]
```

### 4.2 Entité `License`
```
License
├── id
├── name
├── slug
├── description
├── parentLicenseId
├── active
└── aliases
```
Exemples : Toy Story, Star Wars, Harry Potter, Marvel, Jurassic Park.

### 4.3 Entité `Franchise`
```
Franchise
├── id
├── name
├── slug
├── description
├── parentFranchiseId
└── active
```
Exemple de distinction : Pixar ≠ Toy Story (Toy Story est une franchise sous Pixar). Permet de filtrer « tous les jouets Pixar » ou « tous les jouets Toy Story » sans les confondre.

### 4.4 Entité `Character`
```
Character
├── id
├── name
├── slug
├── description
├── image
├── franchiseIds
└── active
```
Relation N:N entre jouet et personnage (un jouet peut représenter Woody, Buzz, Jessie, etc.).

### 4.5 Entité `Location` — lieu d'achat (souvenir)

> **Précision importante :** contrairement à ce qui était envisagé initialement, `Lieu` ne désigne pas un lieu fictif de l'univers du jouet, mais **le lieu réel où le jouet a été acheté** (magasin, ville, événement, voyage, cadeau…). C'est une information à valeur de souvenir personnel, indépendante de la Franchise/du Studio/de la Licence.

```
Location
├── id
├── name
├── slug
├── description
├── parentLocationId
└── active
```
- Hiérarchie possible via `parentLocationId`, par exemple :
```
France
└── Paris
    └── Disneyland Paris
```
ou
```
Convention
└── Paris Manga 2023
```
- Exemples de valeurs : "Disneyland Paris", "Auchan", "Convention Paris Manga 2023", "Voyage à Tokyo", "Offert par [proche]", "Bretagne".
- Cette entité n'a **pas de lien logique automatique** avec Studio/Licence/Franchise/Personnage (contrairement à ces dernières, on ne peut pas déduire le lieu d'achat à partir du personnage ou de la licence) — elle ne doit donc jamais faire partie des suggestions d'auto-complétion (voir section 11).

#### Exemple concret issu de l'existant
Aujourd'hui, un objet de la collection est saisi ainsi :
```
Nom : Saint Mathieu
Catégorie : Phare
Studio/License/Lieux : Bretagne
Année de sortie : 2022
```
Ce cas illustre bien deux points :
1. La collection ne contient pas uniquement des jouets/figurines de licences (ex : "Phare" est une catégorie de souvenirs, sans studio ni licence associée).
2. La valeur "Bretagne" placée aujourd'hui dans `Studio/License/Lieux` est en réalité une **`Location` (lieu d'achat/vacances)**, pas un studio ni une licence. Après migration, cet objet deviendrait :
```
categoryIds: [cat_phare]
studioIds: []
licenseIds: []
locationIds: [location_bretagne]
```

---

## 5. Structure finale autour d'un jouet

```
Toy
├── categories[]
├── studios[]
├── licenses[]
├── franchises[]
├── characters[]
├── locations[]
└── ...
```
Extensible plus tard sans refonte : `manufacturers[]`, `brands[]`, `collections[]`, `series[]`.

### Exemple concret (Woody de Toy Story)
```
Nom : Woody
Catégories : Figurine
Sous-catégorie : Figurine articulée
Studio : Pixar
Licence : Disney
Franchise : Toy Story
Personnages : Woody
Lieu d'achat : Disneyland Paris
Année : 2010
```

---

## 6. Règle de non-régression (règle n°1)

Ne pas supprimer les champs actuels :
```json
{
    "name": "Woody",
    "category": "Figurine",
    "studioLicensePlaces": "Disney / Pixar / Toy Story"
}
```
On ajoute les nouveaux champs sans retirer les anciens :
```json
{
    "name": "Woody",
    "category": "Figurine",
    "studioLicensePlaces": "Disney / Pixar / Toy Story",
    "categoryIds": ["..."],
    "studioIds": ["..."],
    "licenseIds": ["..."],
    "franchiseIds": ["..."],
    "characterIds": ["..."],
    "locationIds": ["..."]
}
```
Les deux systèmes coexistent pendant la transition : l'ancien frontend continue d'utiliser `category` et `studioLicensePlaces`, le nouveau système utilise `categoryIds`, `studioIds`, etc. — aucune rupture.

---

## 7. Phasage de la migration (6 phases)

**Phase 1 — Ajouter les nouvelles structures**
Créer `Category`, `Studio`, `License`, `Franchise`, `Character`, `Location`, sans toucher aux jouets existants.

**Phase 2 — Ajouter les relations aux jouets**
Ajouter `toy.categoryIds`, `toy.studioIds`, `toy.licenseIds`, `toy.franchiseIds`, `toy.characterIds`, `toy.locationIds`. Champs vides au départ.

**Phase 3 — Migration automatique**
Convertir `Catégorie = "Figurine"` en `categoryIds = ["cat_figurine"]`, et analyser `Studio/Licence/Lieux = "Disney / Pixar / Toy Story"` pour en déduire `studioIds`, `licenseIds`, `franchiseIds`.
Ne pas migrer aveuglément : prévoir trois états —
- Correspondance certaine (ex : "Pixar" → Pixar)
- Correspondance probable (ex : "Disney Pixar" → ?)
- Correspondance inconnue (ex : "Disney/Pixar/Toy Story")
Dans les cas incertains, garder l'ancienne valeur et demander une validation.

**Phase 4 — Nouveau formulaire**
Affiche progressivement la nouvelle structure sans faire remplir 15 champs d'un coup (voir section 8).

**Phase 5 — Le moteur de filtres utilise les nouvelles données**
(voir section 9)

**Phase 6 — L'ancien champ reste en lecture de sécurité, puis devient legacy**
Ne pas le supprimer même une fois la migration achevée.

---

## 8. Spécification du formulaire

### Catégorie
```
[ Figurine                  ▼ ]

Sous-catégorie
[ Figurine articulée        ▼ ]
```

### Univers
```
Studio
[ Pixar                     ]

Licence
[ Disney                    ]

Franchise
[ Toy Story                 ]

Personnage
[ Woody                     ]

Lieu
[ Andy's Room               ]
```

### Champs = sélecteurs intelligents, pas de texte libre
Pas de `<input type="text">` simple. Système de recherche assistée :
```
[ Pixar                         × ]
[ Rechercher un studio...       ]
```
En tapant « pix », le système propose « Pixar », « Pixar Animation Studios », avec une option « Créer une nouvelle entrée » si l'entité n'existe pas.

### Expérience utilisateur simple par défaut
Le formulaire normal reste simple :
```
Catégorie
[ Figurine ▼ ]

Univers
[ Ajouter ▼ ]

Année
[ 2010 ]

...
```
Le bouton **+ Plus de détails** ouvre : Sous-catégorie, Studio, Licence, Franchise, Personnage, Lieu.

> BDD complexe ≠ interface complexe.

---

## 9. Spécification du moteur de filtres

### 9.1 Filtres par ID, pas par nom
```
Mauvais : category = "Figurine"
Meilleur : categoryId = "cat_001"
```
Permet de renommer une catégorie (ex : « Figurine » → « Figurine à collectionner ») sans modifier tous les jouets.

### 9.2 Prise en compte de la hiérarchie
Si l'utilisateur sélectionne « Figurine », le moteur peut chercher `cat_figurine` OU toutes les catégories descendantes.

### 9.3 Mode strict / mode étendu
```
Catégorie : Figurine
○ Exactement cette catégorie
● Inclure les sous-catégories
```
Même principe pour un studio/une licence :
```
○ Disney uniquement
● Disney + descendants
```

### 9.4 Filtres dynamiques (facettés)
En sélectionnant un filtre (ex : Pixar), les autres facettes se recalculent :
```
Catégories
Figurines       43
Construction    21
Peluche          8
Véhicules        5
```
Puis en sélectionnant « Figurines » : « Figurines Pixar : 43 » et les autres facettes se recalculent à nouveau.

### 9.5 Gestion des valeurs à 0
```
Pixar
Figurine       43
Peluche          8
Véhicule         5
Jeu              0
```
Préférence énoncée : afficher les valeurs à 0 grisées dans les filtres avancés (plutôt que de les cacher), pour rester transparent.

### 9.6 Logique AND / OR
- **OR** à l'intérieur d'un même filtre : Studio = Pixar OU Disney.
- **AND** entre différentes dimensions : Studio ET Catégorie ET Année.

### 9.7 Mode avancé
```
Studio
[ Pixar ] [ Disney ]

Catégorie
[ Figurine ]

Année
[ 1995 ] → [ 2015 ]

Personnage
[ Woody ] [ Buzz ]

☑ Inclure les sous-catégories
```
Avec, potentiellement, un bouton « Ajouter une condition » pour construire des combinaisons du type :
```
( Pixar OU Disney ) AND Figurine AND ( Woody OU Buzz )
```

---

## 10. Gestionnaire de référentiels (back-office)

Partie administration permettant de modifier les entités sans modifier directement les jouets :

- Gestion des catégories (arborescence, ex : Figurine → Figurine articulée / Figurine statique / Mini-figurine)
- Gestion des studios (arborescence, ex : Disney → Pixar)
- Gestion des licences (ex : Toy Story, Star Wars, Harry Potter, …)
- Gestion des personnages (ex : Woody, Buzz, Jessie, …)

---

## 11. Règles de cohérence et auto-complétion assistée

- Le système peut connaître des relations implicites, par exemple : Toy Story → Pixar, ou Woody → Toy Story → Pixar.
- Cela permet de l'auto-complétion intelligente, mais **jamais d'auto-remplissage silencieux**.
- Comportement attendu : afficher une suggestion à valider explicitement.
```
Informations associées détectées

Personnage : Woody

Licence suggérée : Toy Story ✓
Studio suggéré : Pixar ✓

[Appliquer]
```
- L'utilisateur doit toujours pouvoir corriger :
```
Studio détecté : Pixar
☑ Confirmé
```
ou
```
Studio : [ Aucun ]
```
- L'utilisateur doit pouvoir dire explicitement que ce jouet n'est pas associé à un studio détecté.

---

## 12. Notion de source/confiance (option pour aller plus loin)

Une relation peut porter les métadonnées suivantes :
```
source: manual
confidence: 100%
```
ou
```
source: user
confidence: 100%
```
ou
```
source: automatic-import
confidence: 85%
```
Utile en particulier si un import automatique de données est envisagé plus tard.

---

## 13. Ce que la BDD doit conserver / ajouter concrètement

**Champs actuels conservés (au moins temporairement) :**
```
name
size
pieceCount
number
category
studioLicensePlaces
releaseYear
exposed
upcoming
photo
```

**Champs ajoutés :**
```
categoryIds[]
studioIds[]
licenseIds[]
franchiseIds[]
characterIds[]
locationIds[]
```

**Champs envisageables plus tard (pas forcément immédiatement) :**
```
manufacturerIds[]
brandIds[]
collectionIds[]
seriesIds[]
```

### Règle de compatibilité — trois formats de jouet doivent tous être lisibles

**Ancien jouet**
```json
{ "category": "Figurine", "studioLicensePlaces": "Disney / Pixar" }
```

**Nouveau jouet**
```json
{
  "category": "Figurine",
  "categoryIds": ["cat_001"],
  "studioIds": ["studio_pixar"],
  "licenseIds": ["license_disney"]
}
```

**Jouet en cours de migration**
```json
{
  "category": "Figurine",
  "categoryIds": ["cat_001"],
  "studioLicensePlaces": "Disney / Pixar",
  "studioIds": ["studio_pixar"],
  "licenseIds": ["license_disney"]
}
```

### Fallback côté frontend (logique conceptuelle)
```
Si categoryIds existe :
    utiliser categoryIds
Sinon :
    utiliser category

Si studioIds existe :
    utiliser studioIds
Sinon :
    analyser/afficher studioLicensePlaces
```

---

## 14. Compatibilité API

L'API (ex : `GET /toys`) ne change pas forcément de contrat. La réponse peut simplement s'enrichir :
```json
{
   "category": "Figurine",
   "categoryIds": ["cat_001"],
   "studioLicensePlaces": "Disney / Pixar",
   "studios": ["..."],
   "licenses": ["..."],
   "franchises": ["..."]
}
```
L'ancien frontend continue de fonctionner ; le nouveau frontend peut utiliser les nouvelles propriétés.

---

## 15. Points explicitement déconseillés

- ❌ Supprimer `Studio/Licence/Lieux` (trop risqué)
- ❌ Remplacer immédiatement `category` (risque de casser les requêtes existantes)
- ❌ Faire une migration automatique irréversible (risque de mal transformer des données ambiguës)
- ❌ Stocker uniquement des noms (`studio = "Pixar"`) plutôt qu'une référence
- ❌ Créer des catégories pour chaque combinaison (ex : « Figurine Disney », « Figurine Pixar », « Figurine Toy Story ») — deviendrait ingérable
- ❌ Tout mettre dans une seule colonne JSON — perte de qualité de filtrage/indexation/gestion

---

## 16. Schéma cible final (vue d'ensemble)

```
TOY
│
├── Informations
│   ├── Nom
│   ├── Référence
│   ├── Année
│   └── Nombre de pièces
│
├── Classification
│   ├── Catégorie
│   └── Sous-catégorie
│
├── Univers
│   ├── Studio
│   ├── Licence
│   ├── Franchise
│   └── Personnage
│
├── Dimensions
│   ├── Hauteur
│   ├── Largeur
│   └── Profondeur
│
└── Collection personnelle
    ├── Lieu d'achat (souvenir)
    ├── Exposé
    ├── Prochainement
    ├── Emplacement
    └── Rotation
```

`Studio/Licence/Lieux` devient progressivement une vue historique/legacy plutôt que la structure principale.

---

## 17. Perspectives ouvertes par cette fonctionnalité (mentionnées comme suite possible)

- Recherche intelligente (« Affiche mes figurines Pixar de Toy Story »)
- Scanner : photo → reconnaissance → jouet correspondant → ses métadonnées
- Gestion de collection (ex : tous les jouets Marvel non exposés)
- Rotation (sélection de jouets d'une franchise donnée pour la prochaine rotation)
- Gestion des meubles (quels jouets rentrent dans une étagère donnée)
- Statistiques (ex : 32 % de la collection composée de figurines)
- Recommandations (ex : beaucoup de Pixar mais peu de véhicules)

---

## 18. Synthèse

Pas de refonte destructive de la base de données. Une **V2 additive** : les champs actuels sont conservés, les nouvelles entités et relations sont ajoutées, les données sont migrées progressivement, puis le formulaire et le moteur de filtres basculent sur la nouvelle structure.

Changement clé pour `Studio/Licence/Lieux` :
> D'une information mélangée → à Studio + Licence + Franchise + Personnage + Lieu, cinq dimensions indépendantes et reliées.

Changement clé pour `Catégorie` :
> Catégorie hiérarchique + sous-catégories. *(Les caractéristiques indépendantes type "Lumineux"/"Électronique" restent hors périmètre V2 — cas trop marginal dans la collection actuelle ; l'information continue de figurer dans le nom du jouet.)*
