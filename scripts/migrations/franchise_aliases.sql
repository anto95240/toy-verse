-- Alias de franchise : un nom affiché, plusieurs façons de le retrouver.
-- Exemple : nom « Jurassic Park / Jurassic World », alias Jurassic Park, Jurassic World, JP, JW.
ALTER TABLE franchises ADD COLUMN IF NOT EXISTS aliases TEXT[] NOT NULL DEFAULT '{}';
COMMENT ON COLUMN franchises.aliases IS 'Synonymes pour la recherche, la migration et les suggestions IA';
