-- =============================================================================
-- ToyVerse V2 — Migration : Référentiels & liaison jouets
-- Version : 1.0
-- Date    : 2026-08-27
--
-- Principe : migration ADDITIVE — aucune table ni colonne existante n'est
-- supprimée ou modifiée. Les champs `categorie` et `studio` sur la table
-- `toys` sont conservés intacts (règle n°1 du cahier des charges).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. CATÉGORIES HIÉRARCHIQUES
--    Remplace progressivement la table `categories` plate (conservée en l'état)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories_v2 (
  id          TEXT        PRIMARY KEY,           -- ex: "cat_001"
  name        TEXT        NOT NULL,
  slug        TEXT        NOT NULL UNIQUE,
  parent_id   TEXT        REFERENCES categories_v2(id) ON DELETE SET NULL,
  level       INT         NOT NULL DEFAULT 0,    -- 0 = racine, 1 = sous-catégorie, 2 = type
  description TEXT,
  icon        TEXT,
  active      BOOLEAN     NOT NULL DEFAULT TRUE,
  sort_order  INT         NOT NULL DEFAULT 0,
  aliases     TEXT[]      NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  categories_v2           IS 'Catégories hiérarchiques V2 (remplace progressivement la table categories plate)';
COMMENT ON COLUMN categories_v2.parent_id IS 'NULL = catégorie racine ; sinon référence au parent direct';
COMMENT ON COLUMN categories_v2.level     IS '0 = racine, 1 = sous-catégorie, 2 = type';
COMMENT ON COLUMN categories_v2.aliases   IS 'Synonymes pour la recherche et la déduplication (ex: ["Figurines", "Figure"])';

CREATE INDEX IF NOT EXISTS idx_categories_v2_parent ON categories_v2(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_v2_slug   ON categories_v2(slug);
CREATE INDEX IF NOT EXISTS idx_categories_v2_active ON categories_v2(active);

-- -----------------------------------------------------------------------------
-- 2. STUDIOS
--    Hiérarchie : Pixar est rattaché à Disney via parent_studio_id
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS studios (
  id               TEXT        PRIMARY KEY,           -- ex: "studio_pixar"
  name             TEXT        NOT NULL,
  slug             TEXT        NOT NULL UNIQUE,
  description      TEXT,
  parent_studio_id TEXT        REFERENCES studios(id) ON DELETE SET NULL,
  country          TEXT,
  active           BOOLEAN     NOT NULL DEFAULT TRUE,
  aliases          TEXT[]      NOT NULL DEFAULT '{}',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  studios                  IS 'Studios de production/distribution (ex: Pixar, Disney, Marvel)';
COMMENT ON COLUMN studios.parent_studio_id IS 'NULL = studio racine ; sinon référence au studio parent (ex: Pixar → Disney)';
COMMENT ON COLUMN studios.aliases          IS 'Synonymes pour la recherche (ex: ["Pixar", "Pixar Studios"])';

CREATE INDEX IF NOT EXISTS idx_studios_parent ON studios(parent_studio_id);
CREATE INDEX IF NOT EXISTS idx_studios_slug   ON studios(slug);
CREATE INDEX IF NOT EXISTS idx_studios_active ON studios(active);

-- -----------------------------------------------------------------------------
-- 3. LICENCES
--    Exemples : Toy Story, Star Wars, Harry Potter, Marvel
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS licenses (
  id                TEXT        PRIMARY KEY,           -- ex: "license_toy_story"
  name              TEXT        NOT NULL,
  slug              TEXT        NOT NULL UNIQUE,
  description       TEXT,
  parent_license_id TEXT        REFERENCES licenses(id) ON DELETE SET NULL,
  active            BOOLEAN     NOT NULL DEFAULT TRUE,
  aliases           TEXT[]      NOT NULL DEFAULT '{}',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE licenses IS 'Licences (ex: Toy Story, Star Wars, Harry Potter)';

CREATE INDEX IF NOT EXISTS idx_licenses_parent ON licenses(parent_license_id);
CREATE INDEX IF NOT EXISTS idx_licenses_slug   ON licenses(slug);
CREATE INDEX IF NOT EXISTS idx_licenses_active ON licenses(active);

-- -----------------------------------------------------------------------------
-- 4. FRANCHISES
--    Distinction : Pixar (studio) ≠ Toy Story (franchise sous Pixar)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS franchises (
  id                  TEXT        PRIMARY KEY,           -- ex: "franchise_toy_story"
  name                TEXT        NOT NULL,
  slug                TEXT        NOT NULL UNIQUE,
  description         TEXT,
  parent_franchise_id TEXT        REFERENCES franchises(id) ON DELETE SET NULL,
  active              BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE franchises IS 'Franchises (ex: Toy Story, Cars, Marvel Avengers) — distinct du Studio';

CREATE INDEX IF NOT EXISTS idx_franchises_parent ON franchises(parent_franchise_id);
CREATE INDEX IF NOT EXISTS idx_franchises_slug   ON franchises(slug);
CREATE INDEX IF NOT EXISTS idx_franchises_active ON franchises(active);

-- -----------------------------------------------------------------------------
-- 5. PERSONNAGES
--    Relation N:N avec les franchises
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS characters (
  id            TEXT        PRIMARY KEY,           -- ex: "char_woody"
  name          TEXT        NOT NULL,
  slug          TEXT        NOT NULL UNIQUE,
  description   TEXT,
  image_url     TEXT,
  franchise_ids TEXT[]      NOT NULL DEFAULT '{}', -- franchises associées au personnage
  active        BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  characters              IS 'Personnages (ex: Woody, Buzz, Jessie)';
COMMENT ON COLUMN characters.franchise_ids IS 'IDs des franchises auxquelles appartient ce personnage';

CREATE INDEX IF NOT EXISTS idx_characters_slug            ON characters(slug);
CREATE INDEX IF NOT EXISTS idx_characters_franchise_ids   ON characters USING GIN(franchise_ids);
CREATE INDEX IF NOT EXISTS idx_characters_active          ON characters(active);

-- -----------------------------------------------------------------------------
-- 6. LIEUX D'ACHAT (valeur souvenir personnel)
--    IMPORTANT : ne représente PAS un lieu fictif de l'univers du jouet,
--    mais le lieu RÉEL où le jouet a été acheté/reçu.
--    N'est JAMAIS inclus dans les suggestions d'auto-complétion croisée.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS locations (
  id                 TEXT        PRIMARY KEY,           -- ex: "location_disneyland_paris"
  name               TEXT        NOT NULL,
  slug               TEXT        NOT NULL UNIQUE,
  description        TEXT,
  parent_location_id TEXT        REFERENCES locations(id) ON DELETE SET NULL,
  active             BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  locations                   IS 'Lieux d achat réels (souvenir personnel) — ex: Disneyland Paris, Bretagne, Convention Manga';
COMMENT ON COLUMN locations.parent_location_id IS 'Hiérarchie optionnelle : France → Paris → Disneyland Paris';

CREATE INDEX IF NOT EXISTS idx_locations_parent ON locations(parent_location_id);
CREATE INDEX IF NOT EXISTS idx_locations_slug   ON locations(slug);
CREATE INDEX IF NOT EXISTS idx_locations_active ON locations(active);

-- -----------------------------------------------------------------------------
-- 7. TABLES DE LIAISON N:N  toys ↔ entités
--    Permettent des jointures riches et des index efficaces
--    toy_id est UUID (type réel de toys.id dans Supabase)
--    *_id des référentiels restent TEXT (slugs lisibles ex: "cat_001")
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS toy_categories (
  toy_id      UUID NOT NULL REFERENCES toys(id) ON DELETE CASCADE,
  category_id TEXT NOT NULL REFERENCES categories_v2(id) ON DELETE CASCADE,
  PRIMARY KEY (toy_id, category_id)
);
CREATE INDEX IF NOT EXISTS idx_toy_categories_toy      ON toy_categories(toy_id);
CREATE INDEX IF NOT EXISTS idx_toy_categories_category ON toy_categories(category_id);

CREATE TABLE IF NOT EXISTS toy_studios (
  toy_id    UUID NOT NULL REFERENCES toys(id) ON DELETE CASCADE,
  studio_id TEXT NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  PRIMARY KEY (toy_id, studio_id)
);
CREATE INDEX IF NOT EXISTS idx_toy_studios_toy    ON toy_studios(toy_id);
CREATE INDEX IF NOT EXISTS idx_toy_studios_studio ON toy_studios(studio_id);

CREATE TABLE IF NOT EXISTS toy_licenses (
  toy_id     UUID NOT NULL REFERENCES toys(id) ON DELETE CASCADE,
  license_id TEXT NOT NULL REFERENCES licenses(id) ON DELETE CASCADE,
  PRIMARY KEY (toy_id, license_id)
);
CREATE INDEX IF NOT EXISTS idx_toy_licenses_toy     ON toy_licenses(toy_id);
CREATE INDEX IF NOT EXISTS idx_toy_licenses_license ON toy_licenses(license_id);

CREATE TABLE IF NOT EXISTS toy_franchises (
  toy_id       UUID NOT NULL REFERENCES toys(id) ON DELETE CASCADE,
  franchise_id TEXT NOT NULL REFERENCES franchises(id) ON DELETE CASCADE,
  PRIMARY KEY (toy_id, franchise_id)
);
CREATE INDEX IF NOT EXISTS idx_toy_franchises_toy       ON toy_franchises(toy_id);
CREATE INDEX IF NOT EXISTS idx_toy_franchises_franchise ON toy_franchises(franchise_id);

CREATE TABLE IF NOT EXISTS toy_characters (
  toy_id       UUID NOT NULL REFERENCES toys(id) ON DELETE CASCADE,
  character_id TEXT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  PRIMARY KEY (toy_id, character_id)
);
CREATE INDEX IF NOT EXISTS idx_toy_characters_toy       ON toy_characters(toy_id);
CREATE INDEX IF NOT EXISTS idx_toy_characters_character ON toy_characters(character_id);

CREATE TABLE IF NOT EXISTS toy_locations (
  toy_id      UUID NOT NULL REFERENCES toys(id) ON DELETE CASCADE,
  location_id TEXT NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  PRIMARY KEY (toy_id, location_id)
);
CREATE INDEX IF NOT EXISTS idx_toy_locations_toy      ON toy_locations(toy_id);
CREATE INDEX IF NOT EXISTS idx_toy_locations_location ON toy_locations(location_id);

-- -----------------------------------------------------------------------------
-- 8. COLONNES *_ids SUR LA TABLE toys (Phase 2)
--    Arrays pour accès rapide sans jointure — complément des tables de liaison
--    Les colonnes `categorie` et `studio` RESTENT INTACTES (non touchées)
--    Note : ces colonnes stockent des IDs de référentiels (TEXT slugs),
--    PAS des IDs de jouets. Elles restent donc TEXT[].
-- -----------------------------------------------------------------------------
ALTER TABLE toys
  ADD COLUMN IF NOT EXISTS category_ids  TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS studio_ids    TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS license_ids   TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS franchise_ids TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS character_ids TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS location_ids  TEXT[] NOT NULL DEFAULT '{}';

COMMENT ON COLUMN toys.category_ids  IS 'IDs V2 des catégories (TEXT slugs) — vide = non encore migré (utiliser categorie en fallback)';
COMMENT ON COLUMN toys.studio_ids    IS 'IDs V2 des studios (TEXT slugs) — vide = non encore migré (utiliser studio en fallback)';
COMMENT ON COLUMN toys.license_ids   IS 'IDs V2 des licences (TEXT slugs)';
COMMENT ON COLUMN toys.franchise_ids IS 'IDs V2 des franchises (TEXT slugs)';
COMMENT ON COLUMN toys.character_ids IS 'IDs V2 des personnages (TEXT slugs)';
COMMENT ON COLUMN toys.location_ids  IS 'IDs V2 des lieux d achat (TEXT slugs)';

-- Index GIN pour les recherches dans les arrays
CREATE INDEX IF NOT EXISTS idx_toys_category_ids  ON toys USING GIN(category_ids);
CREATE INDEX IF NOT EXISTS idx_toys_studio_ids    ON toys USING GIN(studio_ids);
CREATE INDEX IF NOT EXISTS idx_toys_license_ids   ON toys USING GIN(license_ids);
CREATE INDEX IF NOT EXISTS idx_toys_franchise_ids ON toys USING GIN(franchise_ids);
CREATE INDEX IF NOT EXISTS idx_toys_character_ids ON toys USING GIN(character_ids);
CREATE INDEX IF NOT EXISTS idx_toys_location_ids  ON toys USING GIN(location_ids);

-- =============================================================================
-- FIN DE LA MIGRATION
-- Vérification : les tables existantes `categories`, `toys.categorie` et
-- `toys.studio` sont intactes — aucune rupture de l'existant.
-- =============================================================================
