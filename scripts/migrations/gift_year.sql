-- Année de Noël / anniversaire / calendrier de l'Avent
-- Distincte de release_date (année de sortie du produit).
ALTER TABLE toys ADD COLUMN IF NOT EXISTS gift_year INTEGER;
ALTER TABLE toys ADD COLUMN IF NOT EXISTS gift_occasion TEXT;
COMMENT ON COLUMN toys.gift_year IS 'Année de l''occasion (Noël, anniversaire ou calendrier de l''Avent)';
COMMENT ON COLUMN toys.gift_occasion IS 'noel | anniversaire | avent';
