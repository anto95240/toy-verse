# Cahier des charges — Module ToyVerse
## « Gestion intelligente des espaces et rotations d'exposition »

*Faire vivre une collection dans son espace réel : organiser, exposer, faire tourner, se souvenir.*

| Champ | Valeur |
|---|---|
| Projet | ToyVerse – Module Espaces & Rotations |
| Type de document | Cahier des charges fonctionnel et technique (hors code) |
| Version du document | 2.0 |
| Date | 3 août 2026 |
| Statut | Version enrichie – prête pour revue |

---

## Sommaire

1. Introduction et contexte
2. Vision et objectifs du module
3. Périmètre du projet
4. Acteurs et utilisateurs cibles
5. Architecture générale des données (modèle conceptuel)
6. Fonctionnalités détaillées
   - 6.1 Gestion de l'environnement réel
   - 6.2 Analyse automatique par photo
   - 6.3 Gestion des jouets exposables
   - 6.4 Règles de cohérence des espaces
   - 6.5 Configurations d'exposition
   - 6.6 Historique
   - 6.7 Rotation intelligente
   - 6.8 Suggestions automatiques et score de variété
   - 6.9 Planification des rotations et agenda
   - 6.10 Notifications
   - 6.11 Tableau de bord et statistiques
   - 6.12 Évolutions futures (plan 2D, 3D, IA complète)
7. Règles de gestion transverses
8. Gestion des cas particuliers et des erreurs
9. Exigences non fonctionnelles
10. Parcours utilisateurs clés
11. Indicateurs de succès (KPI)
12. Plan de développement par version
13. Risques et mitigation
14. Glossaire
15. Annexes — exemples illustratifs

---

## 1. Introduction et contexte

### 1.1 Présentation de ToyVerse

ToyVerse est une application de gestion de collection de jouets et figurines. Dans sa forme actuelle, l'application répond principalement à la question « quels jouets est-ce que je possède ? » : inventaire, fiches produits, valorisation, recherche.

Le module décrit dans ce document — « Gestion intelligente des espaces et rotations d'exposition » — a pour ambition d'aller au-delà de l'inventaire, en s'intéressant à la vie quotidienne de la collection une fois celle-ci acquise : où elle est rangée, comment elle est exposée, et comment cette exposition évolue dans le temps.

### 1.2 Problématique

Les collectionneurs possédant un nombre important de pièces font face à des difficultés récurrentes :

- Une partie importante de la collection reste rangée en boîte ou en carton et n'est jamais mise en valeur ;
- Les mêmes jouets restent exposés pendant de longues périodes, par manque de visibilité sur ce qui pourrait être changé ;
- Il est difficile de se souvenir de ce qui a déjà été exposé, quand, et pendant combien de temps ;
- Organiser une nouvelle exposition thématique cohérente (par licence, univers, saison) demande du temps et de la mémoire ;
- Il n'existe aujourd'hui aucun outil qui relie l'inventaire d'une collection à l'espace physique réel dans lequel elle vit.

### 1.3 Objet du document

Ce cahier des charges décrit, de façon fonctionnelle et non technique, l'ensemble des besoins, règles de gestion, cas d'usage et exigences du module. Il ne contient aucun code ni aucune spécification d'implémentation : il constitue la référence commune entre les parties prenantes (porteur de projet, futurs développeurs, testeurs) pour définir « quoi construire » avant de définir « comment le construire ».

Ce document est volontairement rédigé pour être compréhensible par un lecteur non technique, tout en étant suffisamment précis et structuré (règles de gestion identifiées, exigences numérotées, critères d'acceptation) pour servir de base à une spécification technique ultérieure.

---

## 2. Vision et objectifs du module

### 2.1 Vision

ToyVerse ne doit pas se limiter à répondre à « quels jouets est-ce que je possède ? ». Il doit également permettre de répondre aux questions suivantes :

- Comment ma collection est-elle organisée dans mon espace de vie ?
- Quels jouets sont actuellement mis en valeur, et depuis combien de temps ?
- Quand devrais-je renouveler mon exposition ?
- Quelle nouvelle configuration serait intéressante à essayer ?

L'objectif final est d'aider les collectionneurs à faire vivre leur collection dans leur environnement réel, en transformant ToyVerse en un assistant qui connaît la collection, l'espace où elle vit, son organisation, son histoire, et qui aide le collectionneur à la renouveler au fil du temps.

### 2.2 Objectifs principaux

Le module doit permettre à l'utilisateur de :

1. Créer une représentation fidèle de son espace d'exposition (pièces, meubles, zones) ;
2. Enregistrer où sont rangés et/ou exposés ses jouets ;
3. Connaître à tout moment la configuration d'exposition actuelle ;
4. Créer, sauvegarder et comparer plusieurs configurations possibles ;
5. Changer les thèmes exposés sans perdre en cohérence visuelle ou thématique ;
6. Éviter d'exposer toujours les mêmes jouets au détriment des autres ;
7. Planifier ses rotations d'exposition dans le temps ;
8. Recevoir des rappels et suggestions pertinentes ;
9. Conserver un historique complet et consultable de toutes ses expositions passées.

### 2.3 Bénéfices attendus pour l'utilisateur

| Bénéfice | Description |
|---|---|
| Valorisation de la collection | Plus de jouets sortent du carton et sont réellement mis en valeur dans l'espace de vie. |
| Gain de temps | Moins de charge mentale pour décider quoi exposer et où : ToyVerse propose, l'utilisateur valide. |
| Renouvellement facilité | Des suggestions de rotation évitent la lassitude visuelle et la routine d'exposition. |
| Mémoire de la collection | L'historique permet de se souvenir de ce qui a été exposé, quand, et pendant combien de temps. |
| Cohérence esthétique | Les règles de compatibilité thématique évitent les associations visuellement ou thématiquement incongrues. |

---

## 3. Périmètre du projet

### 3.1 Fonctionnalités incluses dans le périmètre du module

Le périmètre couvert par ce cahier des charges inclut l'ensemble des fonctionnalités listées à la section 6, réparties selon quatre versions de développement (voir section 12) : la gestion de l'environnement réel, l'analyse par photo, la gestion des jouets exposables, les configurations et leur historique, la rotation intelligente, la planification et les notifications, ainsi que le tableau de bord et les statistiques.

### 3.2 Fonctionnalités explicitement hors périmètre à ce stade

Les éléments suivants sont documentés (section 6.12) à titre de vision à long terme, mais sont explicitement exclus des trois premières versions de développement :

- La génération d'un plan 2D interactif et manipulable de la pièce ;
- La reproduction virtuelle en 3D d'une pièce ou d'un meuble ;
- L'assistant IA complet capable de croiser habitudes, goûts, saisons et cohérence de façon totalement autonome ;
- La reconnaissance fine et automatique du nombre exact de jouets par simple photo, sans validation manuelle (une reconnaissance assistée avec confirmation systématique de l'utilisateur est en revanche prévue en version 4, voir 6.2 et 6.12) ;
- Toute fonctionnalité de partage social ou communautaire entre collectionneurs (comparaison de collections, partage de configurations entre utilisateurs).

### 3.3 Hypothèses et contraintes

| Type | Hypothèse ou contrainte |
|---|---|
| Utilisateur | Le module est conçu pour un usage individuel (un collectionneur gère son propre espace). La gestion multi-utilisateurs d'un même espace n'est pas couverte par ce document. |
| Connectivité | Les fonctionnalités d'analyse par photo et de suggestions nécessitent une connexion réseau ; un mode dégradé hors-ligne (consultation seule) doit rester possible. |
| Données existantes | Le module s'appuie sur l'inventaire de jouets déjà existant dans ToyVerse (fiches jouets) ; il ne redéfinit pas la gestion de l'inventaire lui-même. |
| Appareil photo | La fonctionnalité d'analyse par photo suppose que l'utilisateur dispose d'un appareil (smartphone) permettant de prendre des photos de qualité suffisante. |
| Langue | Le contenu de ce document et les exemples sont rédigés en français ; le module devra néanmoins prévoir une architecture de textes compatible avec une future traduction (voir 9.5). |

---

## 4. Acteurs et utilisateurs cibles

### 4.1 Persona principal : le collectionneur

L'utilisateur cible est un collectionneur de jouets et figurines (toutes licences confondues : Disney, Pixar, Marvel, Pokémon, LEGO, dinosaures, jeux vidéo, etc.) possédant une collection suffisamment grande pour qu'une partie significative reste rangée plutôt qu'exposée. Il dispose d'un ou plusieurs espaces d'exposition dans son logement (salon, bureau, pièce dédiée) et souhaite organiser, faire évoluer et se souvenir de la mise en valeur de sa collection.

### 4.2 Niveaux d'usage

| Profil | Comportement attendu | Fonctionnalités clés utilisées |
|---|---|---|
| Collectionneur occasionnel | Consulte sa configuration actuelle, reçoit des rappels, applique des suggestions simples. | Tableau de bord, notifications, suggestions automatiques. |
| Collectionneur avancé | Crée plusieurs configurations, planifie des rotations saisonnières, consulte les statistiques en détail. | Configurations multiples, planification, statistiques, score de variété. |
| Collectionneur « power user » | Utilise l'analyse par photo pour cartographier tout son espace, ajuste finement les règles de cohérence par zone. | Analyse par photo, règles de compatibilité personnalisées, historique complet. |

### 4.3 Rôles système

À ce stade, un seul rôle applicatif est nécessaire : l'utilisateur propriétaire de sa collection et de son espace. Il n'existe pas de rôle « administrateur » ni de distinction de droits au sein d'un même compte. Toute évolution vers un compte partagé (par exemple au sein d'un foyer) devra faire l'objet d'un cahier des charges complémentaire.

---

## 5. Architecture générale des données (modèle conceptuel)

Cette section décrit, de façon conceptuelle et sans aucune notation technique, les entités manipulées par le module et leurs relations. Elle sert de socle commun de vocabulaire pour l'ensemble du document.

### 5.1 Hiérarchie des entités

Les données du module s'organisent selon la hiérarchie suivante, de la plus englobante à la plus précise :

1. Maison (l'espace de vie global de l'utilisateur) ;
2. Pièces (salon, bureau, salle de collection, etc.) ;
3. Supports d'exposition (bibliothèque, étagère, vitrine, meuble TV, présentoir, mur d'exposition) ;
4. Zones d'exposition (subdivisions d'un support : étagères d'une bibliothèque, compartiments d'une vitrine) ;
5. Configurations (organisation complète d'une pièce à un instant donné, associant zones, thèmes et jouets) ;
6. Jouets exposés (les jouets de l'inventaire ToyVerse positionnés dans une zone donnée).

### 5.2 Description des entités et de leurs attributs

**Entité : Pièce**

| Attribut | Description |
|---|---|
| Nom | Nom donné par l'utilisateur (ex. « Salon »). |
| Type | Catégorie de pièce (pièce de vie, bureau, pièce dédiée collection, autre). |
| Description | Texte libre décrivant l'usage de la pièce. |
| Photo (facultative) | Illustration générale de la pièce. |
| Liste des supports | Ensemble des supports d'exposition présents dans la pièce. |

**Entité : Support d'exposition**

| Attribut | Description |
|---|---|
| Nom | Nom donné par l'utilisateur (ex. « Grande bibliothèque »). |
| Type | Bibliothèque, étagère, vitrine, meuble TV, présentoir, mur d'exposition, autre. |
| Dimensions | Largeur, hauteur, profondeur (unités métriques). |
| Capacité | Nombre indicatif de jouets pouvant être exposés. |
| Photo | Illustration du support, prise manuellement ou issue de l'analyse par photo. |
| Zones disponibles | Liste des zones découpant ce support. |

**Entité : Zone d'exposition**

| Attribut | Description |
|---|---|
| Nom | Ex. « Étage 2 ». |
| Dimensions | Dimensions propres à la zone, si pertinentes. |
| Capacité | Nombre maximal de jouets pouvant occuper la zone simultanément. |
| Thème actuel | Thème associé à la zone dans la configuration active. |
| Jouets présents | Liste des jouets actuellement exposés dans la zone. |
| Règles de compatibilité | Licences ou catégories autorisées / déconseillées (voir section 6.4). |

**Entité : Configuration**

| Attribut | Description |
|---|---|
| Nom | Nom donné par l'utilisateur (ex. « Configuration Été »). |
| Pièce associée | Pièce à laquelle la configuration s'applique. |
| Zones utilisées | Ensemble des zones concernées et de leur thème respectif. |
| Jouets exposés | Liste complète des jouets exposés dans cette configuration. |
| Statut | Active, planifiée, archivée. |
| Date d'activation / de fin | Période durant laquelle la configuration a été (ou sera) active. |

**Entité : Jouet exposé (extension de la fiche jouet existante)**

| Attribut | Description |
|---|---|
| Statut d'exposition | Peut être exposé / stockage uniquement / archive (voir 6.3.1). |
| Priorité d'exposition | Niveau de 0 à 4 étoiles, ou exclusion explicite (voir 6.3.2). |
| Historique d'exposition | Nombre de fois exposé, durée cumulée, date de dernière exposition (voir 6.3.3). |
| Zone actuelle | Zone dans laquelle le jouet est exposé, le cas échéant (vide si en stockage). |

### 5.3 Relations entre entités

| Entité source | Relation | Entité cible | Cardinalité |
|---|---|---|---|
| Maison | contient | Pièce | 1 maison → 0..n pièces |
| Pièce | contient | Support d'exposition | 1 pièce → 0..n supports |
| Support d'exposition | est découpé en | Zone d'exposition | 1 support → 1..n zones |
| Configuration | s'applique à | Pièce | 1 configuration → 1 pièce |
| Configuration | utilise | Zone d'exposition | 1 configuration → 1..n zones |
| Zone d'exposition | expose | Jouet exposé | 1 zone → 0..n jouets, selon capacité |
| Jouet exposé | possède | Historique d'exposition | 1 jouet → 1 historique cumulatif |

> **Règle transversale** : un jouet donné ne peut être positionné que dans une seule zone à la fois au sein d'une configuration active. Un même jouet peut en revanche apparaître dans plusieurs configurations différentes (actives à des moments différents), son historique consolidant alors l'ensemble de ces apparitions.

---

## 6. Fonctionnalités détaillées

Chaque sous-section suivante décrit une fonctionnalité du module selon la structure : description fonctionnelle, règles de gestion (RG), exigences fonctionnelles numérotées (RF) et critères d'acceptation. La colonne « Priorité » suit la méthode MoSCoW (Must have, Should have, Could have, Won't have pour l'instant).

### 6.1 Gestion de l'environnement réel

Cette fonctionnalité permet à l'utilisateur de modéliser fidèlement son espace de vie afin d'y rattacher ensuite ses jouets et ses configurations d'exposition.

**Description fonctionnelle**

L'utilisateur crée manuellement sa structure d'espace selon la hiérarchie Maison > Pièces > Supports > Zones (voir section 5). Chaque niveau peut être créé, modifié, renommé, illustré par une photo et supprimé (avec confirmation, voir section 8).

**Exemple illustratif**

Maison → Salon, Bureau, Salle collection. Le Salon contient une bibliothèque de 120 cm de large, 200 cm de haut, 35 cm de profondeur, pour une capacité indicative de 50 jouets, elle-même découpée en 5 étages numérotés.

**Règles de gestion**

| Réf. | Règle de gestion |
|---|---|
| RG-01 | Une pièce doit obligatoirement appartenir à une seule maison (l'espace de l'utilisateur). |
| RG-02 | Un support d'exposition doit obligatoirement appartenir à une seule pièce. |
| RG-03 | Une zone doit obligatoirement appartenir à un seul support. |
| RG-04 | La suppression d'un support ou d'une pièce contenant des jouets actuellement exposés doit être bloquée ou soumise à confirmation explicite avec proposition de replacement des jouets concernés. |
| RG-05 | La capacité d'une zone est indicative par défaut mais peut devenir une limite stricte si l'utilisateur l'active (voir RG-18 en 6.5). |

**Exigences fonctionnelles**

| Réf. | Exigence | Priorité |
|---|---|---|
| RF-01 | Le système doit permettre de créer, modifier et supprimer une pièce (nom, type, description, photo facultative). | Must |
| RF-02 | Le système doit permettre de créer, modifier et supprimer un support d'exposition rattaché à une pièce (nom, type, dimensions, capacité, photo). | Must |
| RF-03 | Le système doit permettre de découper un support en zones nommées, avec dimensions et capacité propres. | Must |
| RF-04 | Le système doit permettre de visualiser la structure complète de l'espace sous forme arborescente. | Should |
| RF-05 | Le système doit permettre de dupliquer une pièce ou un support existant comme point de départ pour un nouvel espace. | Could |

**Critères d'acceptation**

- Un utilisateur peut créer une maison, au moins une pièce, un support et une zone en moins de dix actions successives.
- La suppression d'un support contenant des jouets exposés déclenche systématiquement un message de confirmation détaillant les jouets impactés.
- La structure créée est immédiatement disponible pour être utilisée dans une configuration d'exposition (section 6.5).

### 6.2 Analyse automatique par photo

Fonctionnalité avancée permettant à l'utilisateur de photographier ses espaces afin que ToyVerse propose automatiquement une structure de configuration, à valider ou corriger.

**6.2.1 Prise de photo**

L'utilisateur peut photographier une étagère, une vitrine, une bibliothèque, un meuble ou une pièce entière. Des conseils de prise de vue sont affichés avant la capture : photo de face, bonne luminosité, espace visible entièrement, éviter les reflets pour les vitrines vitrées.

**6.2.2 Détection automatique**

À partir de la photo, le système propose une détection en trois temps, chacune nécessitant une validation explicite de l'utilisateur avant d'être enregistrée :

1. Détection du type de meuble (bibliothèque, étagère, vitrine, meuble) ;
2. Détection des zones (ex. « 5 étages détectés » sur une photo de bibliothèque, proposées avec des limites modifiables) ;
3. Estimation des dimensions (largeur, hauteur, profondeur, capacité), chaque valeur étant présentée avec un bouton « Confirmer » et un bouton « Modifier ».

Le système détecte également les espaces libres, en distinguant les zones déjà occupées des places disponibles, afin d'orienter les suggestions de rotation (section 6.7).

**6.2.3 Reconnaissance des jouets (fonctionnalité d'évolution)**

En complément, une reconnaissance des jouets peut être proposée : nombre de jouets détectés, catégories, licences et thèmes probables (exemple : 5 dinosaures, 8 Disney, 3 LEGO). Cette reconnaissance reste une proposition : l'utilisateur doit systématiquement confirmer ou corriger le résultat avant tout enregistrement définitif. Cette sous-fonctionnalité est positionnée en version 4 (voir section 12).

**Règles de gestion**

| Réf. | Règle de gestion |
|---|---|
| RG-06 | Aucune donnée issue d'une détection automatique (meuble, zone, dimension, jouet) n'est enregistrée sans validation explicite de l'utilisateur. |
| RG-07 | Une photo dont la qualité est jugée insuffisante (trop sombre, cadrage incomplet) doit être signalée à l'utilisateur avant de lancer l'analyse, avec proposition de reprendre la photo. |
| RG-08 | Les photos d'espaces personnels sont considérées comme des données sensibles et doivent être traitées selon les exigences de confidentialité de la section 9.3. |

**Exigences fonctionnelles**

| Réf. | Exigence | Priorité |
|---|---|---|
| RF-06 | Le système doit permettre de prendre ou importer une photo d'un support ou d'une pièce depuis l'application. | Must |
| RF-07 | Le système doit afficher des conseils de prise de vue avant chaque capture destinée à l'analyse. | Should |
| RF-08 | Le système doit proposer une détection du type de meuble et des zones, modifiable avant validation. | Should |
| RF-09 | Le système doit estimer les dimensions et la capacité, avec possibilité de correction manuelle par l'utilisateur. | Should |
| RF-10 | Le système doit proposer, en évolution, une reconnaissance indicative des jouets présents, à confirmer. | Could |
| RF-11 | Le système doit permettre d'annuler une analyse en cours et de revenir à la saisie manuelle à tout moment. | Must |

**Critères d'acceptation**

- Une photo de bibliothèque à 5 étages aboutit, après validation utilisateur, à la création effective de 5 zones dans le support correspondant.
- Aucune zone, dimension ou jouet n'apparaît dans les données de l'utilisateur sans qu'il ait cliqué sur un bouton de confirmation explicite.
- En cas de photo refusée pour qualité insuffisante, l'utilisateur peut reprendre une photo sans perdre sa progression dans le parcours.

### 6.3 Gestion des jouets exposables

Chaque jouet de l'inventaire ToyVerse reçoit, dans le cadre de ce module, des informations complémentaires relatives à son exposition.

**6.3.1 Statut d'exposition**

Chaque jouet se voit attribuer l'un des trois statuts suivants : « Peut être exposé », « Stockage uniquement » ou « Archive ». Seuls les jouets au statut « Peut être exposé » sont proposés dans les suggestions automatiques (section 6.8).

**6.3.2 Priorité d'exposition**

L'utilisateur peut attribuer un niveau de priorité à chaque jouet : quatre étoiles (toujours exposé), trois étoiles (très souvent), deux étoiles (régulièrement), une étoile (occasionnellement), ou une exclusion explicite (« ne jamais proposer »). Cette priorité influence directement le calcul des suggestions et du score de variété.

**6.3.3 Historique par jouet**

Le système enregistre pour chaque jouet le nombre de fois où il a été exposé, la ou les zones concernées, la durée cumulée d'exposition, et la date de dernière exposition. Exemple : un jouet exposé 7 fois, pour un total de 340 jours, dont la dernière exposition remonte à avril 2026.

**Règles de gestion**

| Réf. | Règle de gestion |
|---|---|
| RG-09 | Un jouet au statut « Archive » ne peut pas être positionné dans une zone d'exposition active. |
| RG-10 | Un jouet marqué « Ne jamais proposer » n'apparaît dans aucune suggestion automatique, mais peut toujours être positionné manuellement par l'utilisateur. |
| RG-11 | L'historique d'un jouet est cumulatif et n'est jamais réinitialisé automatiquement ; seule une action explicite et confirmée de l'utilisateur peut le réinitialiser. |

**Exigences fonctionnelles**

| Réf. | Exigence | Priorité |
|---|---|---|
| RF-12 | Le système doit permettre de définir et modifier le statut d'exposition de chaque jouet. | Must |
| RF-13 | Le système doit permettre de définir un niveau de priorité d'exposition par jouet. | Must |
| RF-14 | Le système doit calculer et afficher automatiquement l'historique d'exposition de chaque jouet. | Must |
| RF-15 | Le système doit permettre de filtrer et trier l'inventaire par statut, priorité ou historique d'exposition. | Should |

### 6.4 Règles de cohérence des espaces

Chaque zone d'exposition peut être associée à des règles de compatibilité thématique, afin d'éviter des suggestions ou des placements incohérents.

**Exemple illustratif**

Une vitrine « Disney » autorise les licences Disney, Pixar et DreamWorks, et déconseille LEGO ou les véhicules. Une étagère « dinosaures » autorise dinosaures, dragons et créatures fantastiques.

**Règles de gestion**

| Réf. | Règle de gestion |
|---|---|
| RG-12 | Une règle de compatibilité comporte une liste de licences/catégories autorisées et une liste de licences/catégories déconseillées ; les deux listes sont facultatives et modifiables à tout moment. |
| RG-13 | Une règle « déconseillée » n'empêche pas le placement manuel par l'utilisateur, mais génère un avertissement visuel non bloquant. |
| RG-14 | En l'absence de règle définie pour une zone, aucune restriction thématique n'est appliquée. |

**Exigences fonctionnelles**

| Réf. | Exigence | Priorité |
|---|---|---|
| RF-16 | Le système doit permettre de définir, par zone, une liste de licences/catégories autorisées et déconseillées. | Should |
| RF-17 | Le système doit afficher un avertissement non bloquant lors du placement manuel d'un jouet dans une zone dont il ne respecte pas les règles. | Should |
| RF-18 | Le système doit exclure automatiquement des suggestions (section 6.8) tout jouet ne respectant pas les règles de la zone ciblée. | Must |

### 6.5 Configurations d'exposition

Une configuration représente l'organisation complète d'une pièce à un instant donné : les zones utilisées, les thèmes appliqués et les jouets exposés.

**Exemple illustratif**

La configuration « Classique » associe, dans le Salon, la vitrine 1 au thème Disney, la vitrine 2 au thème Jurassic World, la bibliothèque au thème Pixar et le meuble TV au thème Marvel. La configuration « Été » associe les mêmes espaces à Pokémon, Dragons, LEGO et Jeux vidéo.

**Règles de gestion**

| Réf. | Règle de gestion |
|---|---|
| RG-15 | Une seule configuration peut être active à la fois pour une pièce donnée. |
| RG-16 | L'activation d'une nouvelle configuration désactive automatiquement (archive) la configuration précédente de la même pièce, en conservant son historique. |
| RG-17 | Une configuration peut être créée et sauvegardée sans être activée, à des fins de préparation à l'avance (voir section 6.9). |
| RG-18 | Le nombre de jouets affectés à une zone au sein d'une configuration ne peut pas dépasser la capacité définie pour cette zone (sauf dépassement explicitement autorisé par l'utilisateur). |

**Exigences fonctionnelles**

| Réf. | Exigence | Priorité |
|---|---|---|
| RF-19 | Le système doit permettre de créer une configuration nommée, associée à une pièce. | Must |
| RF-20 | Le système doit permettre d'affecter un thème et des jouets à chaque zone d'une configuration. | Must |
| RF-21 | Le système doit permettre d'activer une configuration, en archivant automatiquement la précédente pour la même pièce. | Must |
| RF-22 | Le système doit permettre de dupliquer une configuration existante comme base d'une nouvelle configuration. | Should |
| RF-23 | Le système doit permettre de comparer deux configurations (jouets communs, thèmes différents, zones concernées). | Could |
| RF-24 | Le système doit avertir l'utilisateur si le nombre de jouets affectés à une zone dépasse sa capacité définie. | Must |

### 6.6 Historique

ToyVerse conserve l'ensemble des configurations passées, avec leur durée d'activation, les jouets présents et les thèmes utilisés, afin de permettre une consultation rétrospective complète.

**Exemple illustratif**

Historique d'une pièce sur une année : janvier – thème Disney, mars – thème Pokémon, juin – thème Jurassic World, décembre – thème Noël.

**Règles de gestion**

| Réf. | Règle de gestion |
|---|---|
| RG-19 | Une configuration archivée reste consultable indéfiniment et ne peut pas être supprimée sans confirmation explicite et avertissement sur la perte d'historique associée. |
| RG-20 | L'historique consolide, pour chaque jouet, l'ensemble des configurations dans lesquelles il est apparu (voir 6.3.3). |

**Exigences fonctionnelles**

| Réf. | Exigence | Priorité |
|---|---|---|
| RF-25 | Le système doit conserver toutes les configurations archivées avec leurs dates d'activation et de fin. | Must |
| RF-26 | Le système doit permettre de consulter l'historique complet d'une pièce sous forme chronologique. | Should |
| RF-27 | Le système doit permettre de restaurer une configuration archivée comme nouvelle configuration active. | Could |

### 6.7 Rotation intelligente

Cette fonctionnalité aide l'utilisateur à déterminer quand changer son exposition, quoi changer, et pourquoi, à partir d'une analyse combinant durée d'exposition, dernière rotation, jouets oubliés, fréquence des thèmes et préférences déclarées.

**6.7.1 Modes de rotation**

| Mode | Description |
|---|---|
| Rotation complète | L'ensemble des jouets exposés dans la pièce est remplacé. |
| Rotation partielle | Seules certaines zones sélectionnées par l'utilisateur sont modifiées. |
| Rotation libre | L'utilisateur choisit librement, sans suggestion automatique, les jouets et zones à modifier. |
| Rotation automatique | ToyVerse propose une rotation complète ou partielle basée sur son analyse (voir 6.8). |

**6.7.2 Rotation progressive**

Pour les collections importantes, une rotation peut être étalée dans le temps plutôt que réalisée en une seule fois : par exemple, semaine 1 pour la vitrine principale, semaine 2 pour la bibliothèque, semaine 3 pour le bureau.

**Règles de gestion**

| Réf. | Règle de gestion |
|---|---|
| RG-21 | Une rotation partielle ou progressive ne modifie que les zones explicitement sélectionnées ; les zones non sélectionnées conservent leur thème et leurs jouets. |
| RG-22 | Toute rotation (quel que soit son mode) déclenche l'archivage de la configuration précédente et la mise à jour de l'historique des jouets concernés. |

**Exigences fonctionnelles**

| Réf. | Exigence | Priorité |
|---|---|---|
| RF-28 | Le système doit permettre de lancer une rotation complète, partielle, libre ou automatique. | Must |
| RF-29 | Le système doit permettre de planifier une rotation progressive sur plusieurs semaines, zone par zone. | Could |
| RF-30 | Le système doit analyser, avant chaque proposition de rotation automatique, la durée d'exposition, la dernière rotation, les jouets jamais exposés récemment et les thèmes trop fréquents. | Must |

### 6.8 Suggestions automatiques et score de variété

**6.8.1 Suggestions automatiques**

Exemple illustratif : « Votre configuration actuelle date de 120 jours. Suggestion : changer Buzz, Woody et Simba ; ajouter Stitch, Elsa et Mickey. » Les suggestions s'appuient sur le statut et la priorité des jouets (6.3), les règles de cohérence (6.4) et l'analyse de rotation (6.7).

**6.8.2 Score de variété**

Un indicateur de diversité d'exposition (exprimé en pourcentage) est calculé pour informer l'utilisateur de la variété réelle de sa collection exposée. Exemple : diversité de 75 %, avec le constat que le thème Disney a été utilisé cinq fois récemment, que 30 jouets n'ont jamais été exposés, et que le thème Dragons est absent depuis un an.

**Règles de gestion**

| Réf. | Règle de gestion |
|---|---|
| RG-23 | Une suggestion automatique ne propose jamais un jouet au statut « Archive » ou marqué « Ne jamais proposer ». |
| RG-24 | Le score de variété prend en compte, au minimum, la fréquence d'utilisation des thèmes récents et la proportion de jouets jamais exposés. |
| RG-25 | Toute suggestion doit rester une proposition modifiable : l'utilisateur peut l'accepter telle quelle, la modifier partiellement, ou la refuser intégralement. |

**Exigences fonctionnelles**

| Réf. | Exigence | Priorité |
|---|---|---|
| RF-31 | Le système doit générer des suggestions de changements et d'ajouts de jouets, fondées sur l'historique et la priorité. | Must |
| RF-32 | Le système doit calculer un score de variété d'exposition et en afficher le détail (thèmes surreprésentés, jouets jamais exposés, thèmes absents). | Should |
| RF-33 | Le système doit permettre à l'utilisateur d'accepter, modifier ou refuser une suggestion avant toute application. | Must |

### 6.9 Planification des rotations et intégration agenda

**6.9.1 Rythmes de rotation**

L'utilisateur peut définir un rythme de rotation par pièce : hebdomadaire, mensuel, tous les trois mois, tous les six mois, ou annuel.

**6.9.2 Rotations saisonnières et événementielles**

Des rotations peuvent être associées à une saison (printemps – dinosaures, été – vacances, automne – fantastique, hiver – Noël) ou à un événement (Halloween, Noël, anniversaire, sortie de film, sortie de jeu, convention).

**6.9.3 Préparation avant rotation**

Le système accompagne la préparation en trois étapes : J-30, préparation de la configuration cible ; J-7, liste consolidée des changements à effectuer ; jour J, lancement effectif de la rotation.

**6.9.4 Estimation du temps nécessaire**

Chaque type de zone peut disposer d'une durée moyenne estimée (exemple : vitrine 30 minutes, bibliothèque 1 heure, zone LEGO 2 heures), permettant de calculer une estimation globale pour une rotation complète (exemple : 3h30 estimées).

**6.9.5 Intégration avec un agenda externe**

Le module peut se connecter à Google Agenda, Apple Calendrier ou Outlook afin de créer automatiquement un événement de rotation (exemple : « 15 septembre 2026 — Rotation Salon Automne », durée estimée 2 heures, avec les actions « ranger l'ancienne configuration » et « installer la nouvelle configuration »).

**Règles de gestion**

| Réf. | Règle de gestion |
|---|---|
| RG-26 | La connexion à un agenda externe est facultative et doit pouvoir être révoquée à tout moment par l'utilisateur. |
| RG-27 | Une estimation de durée de rotation est recalculée automatiquement si la sélection de zones à modifier change. |

**Exigences fonctionnelles**

| Réf. | Exigence | Priorité |
|---|---|---|
| RF-34 | Le système doit permettre de définir un rythme de rotation par pièce. | Should |
| RF-35 | Le système doit permettre d'associer une rotation à une saison ou à un événement. | Should |
| RF-36 | Le système doit générer automatiquement les jalons J-30 / J-7 / jour J pour toute rotation planifiée. | Could |
| RF-37 | Le système doit calculer une estimation du temps nécessaire à une rotation, par zone et au total. | Should |
| RF-38 | Le système doit permettre de créer un événement dans un agenda externe connecté (Google Agenda, Apple Calendrier, Outlook). | Could |

### 6.10 Notifications

ToyVerse envoie des rappels contextuels pour accompagner l'utilisateur dans le renouvellement de son exposition. Exemple simple : « Votre exposition Disney est installée depuis 90 jours. Préparer une nouvelle rotation ? ». Exemple de notification avancée : rotation recommandée, avec le détail de 8 jouets exposés depuis longtemps, 15 jouets jamais présentés, et 3 nouvelles configurations possibles.

**Règles de gestion**

| Réf. | Règle de gestion |
|---|---|
| RG-28 | L'utilisateur doit pouvoir désactiver ou ajuster la fréquence des notifications, par pièce ou globalement. |
| RG-29 | Une notification ne doit jamais déclencher automatiquement une action (rotation, suppression) : elle informe et propose, l'utilisateur agit. |

**Exigences fonctionnelles**

| Réf. | Exigence | Priorité |
|---|---|---|
| RF-39 | Le système doit envoyer une notification lorsqu'une configuration dépasse un seuil de durée paramétrable. | Must |
| RF-40 | Le système doit permettre de configurer ou désactiver les notifications par pièce. | Should |
| RF-41 | Le système doit proposer une notification enrichie détaillant les éléments justifiant une rotation recommandée. | Should |

### 6.11 Tableau de bord et statistiques

**6.11.1 Tableau de bord**

Le tableau de bord affiche, pour l'exposition en cours : la pièce concernée, le nombre d'espaces utilisés, le nombre de jouets exposés, l'ancienneté de la dernière rotation, ainsi que des suggestions synthétiques (exemple : 12 jouets oubliés, 8 changements recommandés).

**6.11.2 Statistiques**

Les statistiques détaillées incluent : les jouets les plus exposés, les jouets jamais exposés, les thèmes favoris, la durée moyenne des configurations, l'historique complet, et les espaces les plus utilisés.

**Exigences fonctionnelles**

| Réf. | Exigence | Priorité |
|---|---|---|
| RF-42 | Le système doit afficher un tableau de bord synthétique de l'exposition actuelle par pièce. | Must |
| RF-43 | Le système doit proposer une page de statistiques détaillées, filtrable par pièce et par période. | Should |
| RF-44 | Le système doit permettre l'export ou la consultation hors application des statistiques principales. | Could |

### 6.12 Évolutions futures (hors périmètre des versions 1 à 3)

Cette sous-section documente la vision à long terme du module. Ces fonctionnalités sont explicitement positionnées en version 4 ou au-delà (voir section 12) et ne font pas partie des engagements des trois premières versions.

**Plan 2D**

Création d'un plan schématique de la pièce (représentation simplifiée des meubles par blocs de couleur), permettant de déplacer virtuellement les meubles, de modifier les espaces et de tester des configurations avant de les appliquer réellement.

**Vue 3D**

Reproduction virtuelle de la pièce en trois dimensions, permettant une simulation d'exposition et un aperçu avant changement réel.

**Assistant IA complet**

Un assistant capable de formuler des propositions contextualisées (exemple : « Votre vitrine Marvel est installée depuis 8 mois. Voici une proposition basée sur vos jouets rarement exposés. ») en croisant habitudes, goûts, saisons, historique et règles de cohérence, de façon largement autonome tout en conservant la validation finale de l'utilisateur.

---

## 7. Règles de gestion transverses

Les règles suivantes s'appliquent à l'ensemble du module, indépendamment de la fonctionnalité concernée.

| Réf. | Règle de gestion transversale |
|---|---|
| RGT-01 | Un jouet ne peut être présent que dans une seule zone à la fois au sein d'une configuration active donnée. |
| RGT-02 | Toute action destructrice (suppression de pièce, support, zone, configuration ou historique) doit faire l'objet d'une confirmation explicite décrivant précisément les conséquences. |
| RGT-03 | Toute donnée issue d'une détection automatique (photo) reste à l'état de proposition tant qu'elle n'a pas été validée par l'utilisateur. |
| RGT-04 | Le système ne modifie jamais silencieusement une configuration active : toute modification est initiée par une action explicite de l'utilisateur. |
| RGT-05 | L'historique (jouets, configurations) est conservé indéfiniment sauf action explicite et confirmée de purge par l'utilisateur. |
| RGT-06 | Les capacités de zones et de supports sont des garde-fous informatifs par défaut ; leur caractère strict ou non est paramétrable par l'utilisateur (voir RG-18). |

---

## 8. Gestion des cas particuliers et des erreurs

Cette section recense les situations exceptionnelles identifiées à ce stade et le comportement attendu du système face à chacune d'elles.

| Cas | Comportement attendu |
|---|---|
| Photo trop sombre ou mal cadrée soumise à l'analyse | Le système signale le problème avant analyse et propose de reprendre la photo, sans perte des données déjà saisies (RG-07). |
| Détection automatique jugée incorrecte par l'utilisateur | L'utilisateur peut corriger manuellement chaque élément détecté (type de meuble, zones, dimensions) avant validation finale (RG-06). |
| Capacité d'une zone dépassée lors de l'affectation de jouets | Le système avertit l'utilisateur ; si les capacités ne sont pas configurées en mode strict, l'affectation reste possible après confirmation (RG-18). |
| Suppression d'un support contenant des jouets exposés | Confirmation obligatoire avec détail des jouets impactés et proposition de les replacer ou de les repasser en stockage (RG-04). |
| Perte de connexion réseau pendant une analyse par photo | L'analyse est mise en pause ; les données déjà saisies manuellement sont conservées localement ; l'analyse reprend à la reconnexion. |
| Deux configurations que l'utilisateur tente d'activer simultanément pour la même pièce | Le système empêche l'activation simultanée et demande explicitement laquelle doit devenir active (RG-15). |
| Suppression d'une configuration archivée contenant un historique significatif | Confirmation obligatoire rappelant que l'historique associé à cette configuration sera perdu (RG-19). |
| Jouet supprimé de l'inventaire général alors qu'il est actuellement exposé | Le système retire automatiquement le jouet de la zone concernée et notifie l'utilisateur de la modification apportée à sa configuration. |
| Révocation de la connexion à un agenda externe alors que des événements de rotation sont déjà planifiés | Les événements déjà créés dans l'agenda externe ne sont pas supprimés automatiquement ; l'utilisateur en est informé et invité à les gérer manuellement si besoin. |
| Reconnaissance de jouets par photo renvoyant un résultat manifestement incohérent (ex. nombre aberrant) | L'utilisateur peut rejeter intégralement le résultat et repasser en saisie manuelle sans pénalité ni perte de progression. |

---

## 9. Exigences non fonctionnelles

### 9.1 Performance

- Le tableau de bord doit s'afficher en moins de deux secondes pour une collection courante (jusqu'à quelques centaines de jouets).
- L'analyse automatique d'une photo (détection meuble/zones) doit fournir un premier résultat en moins de dix secondes dans des conditions réseau normales.
- Le calcul du score de variété et des suggestions doit pouvoir s'exécuter en tâche de fond sans bloquer la navigation de l'utilisateur.

### 9.2 Compatibilité

- Le module doit fonctionner sur les plateformes déjà supportées par ToyVerse (à préciser selon la stack existante : web et/ou mobile).
- La prise de photo doit être compatible avec les appareils photo standards des smartphones récents.

### 9.3 Sécurité et confidentialité

- Les photos d'espaces personnels (intérieur du domicile) sont des données sensibles et doivent être stockées de façon sécurisée, avec un accès strictement limité au compte de l'utilisateur propriétaire.
- L'utilisateur doit être informé, avant toute prise de photo destinée à l'analyse, de l'usage qui en sera fait (analyse automatique, stockage, éventuelle amélioration du service).
- L'utilisateur doit pouvoir supprimer à tout moment les photos associées à ses espaces, indépendamment des données structurées qui en ont été extraites.

### 9.4 Accessibilité

- Les indicateurs visuels (étoiles de priorité, pastilles de couleur, icônes ✔/✖) doivent être doublés d'un équivalent textuel pour les utilisateurs de lecteurs d'écran.
- Les contrastes de couleur utilisés dans le tableau de bord et les notifications doivent respecter les standards d'accessibilité usuels.

### 9.5 Localisation et langue

- L'ensemble des textes de l'interface doit être externalisé (aucun texte en dur) afin de permettre une traduction future sans modification structurelle.
- Les formats de date et d'unités (cm, jours) doivent pouvoir s'adapter aux conventions régionales.

### 9.6 Fiabilité et sauvegarde des données

- Aucune perte de données (structure d'espace, historique, configurations) ne doit résulter d'une interruption réseau en cours de saisie manuelle.
- Une sauvegarde régulière des données de structure et d'historique doit être assurée, conformément à la politique de sauvegarde générale de ToyVerse.

### 9.7 Évolutivité

- Le modèle de données doit rester performant pour des collections de grande taille (plusieurs milliers de jouets, dizaines de zones).
- L'architecture fonctionnelle doit permettre l'ajout ultérieur des évolutions décrites en section 6.12 (plan 2D, vue 3D, assistant IA complet) sans remise en cause du modèle des versions 1 à 3.

---

## 10. Parcours utilisateurs clés

### 10.1 Parcours « Créer sa première configuration »

1. L'utilisateur crée sa maison et au moins une pièce (ex. Salon).
2. Il ajoute un ou plusieurs supports d'exposition dans cette pièce, manuellement ou via une photo analysée (section 6.2).
3. Il découpe, si nécessaire, ces supports en zones.
4. Il crée une configuration nommée et l'associe à la pièce.
5. Il affecte, zone par zone, un thème et des jouets issus de son inventaire (en respectant les règles de cohérence définies, le cas échéant).
6. Il active la configuration : elle devient la configuration active de la pièce, et son historique commence à être suivi.

### 10.2 Parcours « Recevoir et appliquer une suggestion de rotation »

1. Le système détecte qu'un seuil de durée est dépassé pour une configuration active et envoie une notification (section 6.10).
2. L'utilisateur consulte la suggestion détaillée (jouets à changer, jouets à ajouter, justification via le score de variété).
3. Il choisit un mode de rotation (complète, partielle, libre) et ajuste éventuellement la proposition.
4. Il valide la rotation : la configuration précédente est archivée, la nouvelle devient active, et l'historique des jouets concernés est mis à jour.

### 10.3 Parcours « Analyser une pièce par photo »

1. L'utilisateur sélectionne la pièce concernée et lance la prise de photo, guidée par les conseils affichés.
2. Le système propose une détection des meubles et des zones ; l'utilisateur valide ou corrige chaque élément.
3. Le système propose une estimation des dimensions et de la capacité ; l'utilisateur confirme ou modifie chaque valeur.
4. En option, le système propose une reconnaissance indicative des jouets présents ; l'utilisateur confirme, corrige ou ignore cette proposition.
5. La structure validée (supports, zones, dimensions) est enregistrée et devient immédiatement disponible pour créer une configuration.

---

## 11. Indicateurs de succès (KPI)

Ces indicateurs permettront d'évaluer, une fois le module déployé, s'il répond effectivement aux objectifs fixés en section 2.

| Indicateur | Objectif visé |
|---|---|
| Taux d'adoption du module | Proportion d'utilisateurs actifs de ToyVerse ayant créé au moins une pièce et une configuration. |
| Nombre moyen de configurations créées par utilisateur actif | Mesurer l'appropriation de la fonctionnalité de configurations multiples. |
| Fréquence moyenne de rotation par pièce | Vérifier que les rotations ont bien lieu plus régulièrement qu'en l'absence du module. |
| Taux d'application des suggestions automatiques | Proportion de suggestions acceptées (telles quelles ou modifiées) par rapport aux suggestions proposées. |
| Score de variété moyen des utilisateurs actifs | Suivre l'évolution de la diversité d'exposition dans le temps. |
| Proportion de jouets jamais exposés | Vérifier la diminution progressive de la part de la collection qui reste totalement rangée. |
| Taux d'utilisation de l'analyse par photo | Mesurer l'adoption de la fonctionnalité avancée de cartographie automatique. |

---

## 12. Plan de développement par version

Le développement est découpé en quatre versions successives, permettant de livrer de la valeur dès la version 1 tout en préparant les fondations des versions suivantes.

### Version 1 — Fondations

| Élément | Détail |
|---|---|
| Fonctionnalités couvertes | Gestion de l'environnement réel (6.1) ; configuration actuelle et son activation (6.5, hors historique avancé) ; gestion des jouets exposables — statut et priorité (6.3.1, 6.3.2). |
| Objectif | Permettre à l'utilisateur de modéliser son espace réel et d'y positionner manuellement ses jouets dans une configuration active unique. |
| Critères de sortie | Un utilisateur peut créer une structure d'espace complète et une configuration active fonctionnelle de bout en bout, sans aucune fonctionnalité de suggestion ou d'analyse photo. |

### Version 2 — Rotation

| Élément | Détail |
|---|---|
| Fonctionnalités couvertes | Historique des jouets et des configurations (6.3.3, 6.6) ; changements manuels et modes de rotation (6.7) ; premières statistiques (6.11.2). |
| Objectif | Permettre de faire évoluer manuellement une exposition dans le temps tout en conservant une mémoire complète des changements. |
| Critères de sortie | L'historique d'un jouet et d'une pièce est fiable et consultable ; une rotation manuelle (complète ou partielle) fonctionne de bout en bout. |

### Version 3 — Assistant

| Élément | Détail |
|---|---|
| Fonctionnalités couvertes | Notifications (6.10) ; intégration agenda (6.9.5) ; score de variété (6.8.2) ; suggestions automatiques (6.8.1) ; règles de cohérence des espaces (6.4). |
| Objectif | ToyVerse commence à proposer activement des évolutions d'exposition plutôt que de simplement les enregistrer. |
| Critères de sortie | Une suggestion automatique cohérente peut être générée, présentée puis appliquée (avec ou sans modification) par l'utilisateur. |

### Version 4 — IA et vision

| Élément | Détail |
|---|---|
| Fonctionnalités couvertes | Analyse par photo (6.2), y compris détection des meubles et des zones ; reconnaissance indicative des jouets (6.2.3) ; premières briques du plan 2D (6.12). |
| Objectif | Réduire la charge de saisie manuelle en s'appuyant sur la reconnaissance visuelle, tout en conservant une validation utilisateur systématique. |
| Critères de sortie | Une structure d'espace peut être créée à partir d'une photo, avec un taux de correction manuelle jugé raisonnable par les utilisateurs testeurs. |

### Au-delà de la version 4

La vue 3D et l'assistant IA complet (section 6.12) constituent la vision à long terme du module et seront cadrés dans un cahier des charges dédié une fois les versions 1 à 4 stabilisées et adoptées.

---

## 13. Risques et mitigation

| Risque | Impact | Probabilité | Mitigation |
|---|---|---|---|
| Détection automatique par photo peu fiable dans des conditions de luminosité variées | Frustration utilisateur, perte de confiance dans la fonctionnalité | Moyenne | Validation systématique obligatoire (RG-06), conseils de prise de vue (RF-07), possibilité de retour à la saisie manuelle à tout moment (RF-11). |
| Sur-sollicitation de l'utilisateur par les notifications | Désactivation du module ou de l'application par lassitude | Moyenne | Paramétrage fin de la fréquence par pièce (RF-40), notifications informatives et non intrusives (RG-29). |
| Complexité perçue de la modélisation d'espace pour un nouvel utilisateur | Faible taux d'adoption initial | Moyenne | Parcours guidé de première configuration (10.1), possibilité de dupliquer des structures types (RF-05). |
| Sensibilité des photos d'intérieur du domicile | Risque d'image négative ou de perte de confiance sur la confidentialité | Faible à moyenne | Politique de confidentialité explicite avant capture (9.3), suppression des photos possible indépendamment des données extraites. |
| Incohérence entre l'inventaire général ToyVerse et les jouets exposés (ex. jouet vendu ou supprimé) | Configurations affichant des jouets qui n'existent plus dans l'inventaire | Faible | Synchronisation automatique lors de la suppression d'un jouet de l'inventaire, avec notification (voir section 8). |
| Sous-utilisation des fonctionnalités avancées (score de variété, statistiques) | Valeur perçue du module limitée à un simple inventaire d'espace | Moyenne | Mise en avant des statistiques et du score de variété directement dans le tableau de bord (6.11.1). |

---

## 14. Glossaire

| Terme | Définition |
|---|---|
| Configuration | Organisation complète d'une pièce à un instant donné : zones utilisées, thèmes appliqués, jouets exposés. |
| Zone d'exposition | Subdivision d'un support d'exposition (ex. un étage de bibliothèque, un compartiment de vitrine). |
| Support d'exposition | Meuble ou élément permettant d'exposer des jouets (bibliothèque, étagère, vitrine, meuble TV, présentoir, mur d'exposition). |
| Rotation | Changement de tout ou partie d'une configuration active, remplaçant certains jouets exposés par d'autres. |
| Score de variété | Indicateur chiffré de la diversité de l'exposition actuelle par rapport à l'ensemble de la collection. |
| Statut d'exposition | Catégorie attribuée à un jouet : peut être exposé, stockage uniquement, ou archive. |
| Priorité d'exposition | Niveau indiquant la fréquence souhaitée d'exposition d'un jouet (de « toujours exposé » à « ne jamais proposer »). |
| Rotation progressive | Rotation étalée dans le temps, zone par zone, plutôt qu'appliquée en une seule fois. |
| MoSCoW | Méthode de priorisation des exigences : Must have (indispensable), Should have (important), Could have (souhaitable), Won't have for now (non retenu pour l'instant). |

---

## 15. Annexes — exemples illustratifs

Les exemples ci-dessous, issus de la version initiale du cahier des charges, sont conservés à titre illustratif pour faciliter la compréhension des fonctionnalités par des lecteurs non techniques.

**Annexe A — Exemple de structure d'espace**

Maison → Salon, Bureau, Salle collection. Le Salon est une pièce de vie utilisée comme exposition principale.

**Annexe B — Exemple de support et de zones**

Grande bibliothèque : largeur 120 cm, hauteur 200 cm, profondeur 35 cm, capacité 50 jouets, découpée en 5 étages (Étage 1 à Étage 5). L'étage 2 porte le thème Disney, avec une capacité de 20 figurines pour 18 actuellement occupées.

**Annexe C — Exemple de détection automatique par photo**

Photo d'une bibliothèque → détection de 5 étages (Étage 1 à Étage 5) ; estimation de largeur à 120 cm proposée avec boutons « Confirmer » et « Modifier » ; détection indicative de 5 dinosaures, 8 Disney et 3 LEGO, soumise à confirmation de l'utilisateur.

**Annexe D — Exemple d'historique d'un jouet**

Un jouet donné a été exposé 7 fois, pour un total cumulé de 340 jours, sa dernière exposition remontant à avril 2026.

**Annexe E — Exemple de configurations**

Configuration « Classique » : vitrine 1 Disney, vitrine 2 Jurassic World, bibliothèque Pixar, meuble TV Marvel. Configuration « Été » : vitrine 1 Pokémon, vitrine 2 Dragons, bibliothèque LEGO, meuble TV Jeux vidéo.

**Annexe F — Exemple de suggestion de rotation**

« Votre configuration actuelle date de 120 jours. Suggestion : changer Buzz, Woody et Simba ; ajouter Stitch, Elsa et Mickey. »

**Annexe G — Exemple de score de variété**

Diversité d'exposition : 75 %. Analyse : le thème Disney a été utilisé cinq fois récemment ; 30 jouets n'ont jamais été exposés ; le thème Dragons est absent depuis un an.

**Annexe H — Exemple de tableau de bord**

Salon : 4 espaces, 35 jouets exposés, dernier changement il y a 85 jours. Suggestions : 12 jouets oubliés, 8 changements recommandés.

---

*Fin du cahier des charges.*
