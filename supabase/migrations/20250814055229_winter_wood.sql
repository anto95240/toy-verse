-- Script SQL pour configurer Supabase
-- Exécutez ces commandes dans l'éditeur SQL de Supabase

-- 1. Créer la table themes
CREATE TABLE IF NOT EXISTS themes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  image_url TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Créer la table toys
CREATE TABLE IF NOT EXISTS toys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  theme_id UUID REFERENCES themes(id) ON DELETE CASCADE,
  nom TEXT NOT NULL,
  taille TEXT,
  nb_pieces INTEGER,
  numero TEXT,
  is_exposed BOOLEAN DEFAULT FALSE,
  is_soon BOOLEAN DEFAULT FALSE,
  photo_url TEXT,
  categorie TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Activer RLS (Row Level Security)
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE toys ENABLE ROW LEVEL SECURITY;

-- 4. Politiques RLS pour themes
CREATE POLICY "Users can view own themes" ON themes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own themes" ON themes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own themes" ON themes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own themes" ON themes
  FOR DELETE USING (auth.uid() = user_id);

-- 5. Politiques RLS pour toys
CREATE POLICY "Users can view own toys" ON toys
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM themes WHERE themes.id = toys.theme_id
    )
  );

CREATE POLICY "Users can insert own toys" ON toys
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM themes WHERE themes.id = toys.theme_id
    )
  );

CREATE POLICY "Users can update own toys" ON toys
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT user_id FROM themes WHERE themes.id = toys.theme_id
    )
  );

CREATE POLICY "Users can delete own toys" ON toys
  FOR DELETE USING (
    auth.uid() IN (
      SELECT user_id FROM themes WHERE themes.id = toys.theme_id
    )
  );

-- 6. Politiques pour Storage (à exécuter après création du bucket 'toys-images')
-- CREATE POLICY "Users can view own images" ON storage.objects
--   FOR SELECT USING (
--     bucket_id = 'toys-images' AND 
--     auth.uid()::text = (storage.foldername(name))[1]
--   );

-- CREATE POLICY "Users can upload own images" ON storage.objects
--   FOR INSERT WITH CHECK (
--     bucket_id = 'toys-images' AND 
--     auth.uid()::text = (storage.foldername(name))[1]
--   );

-- CREATE POLICY "Users can delete own images" ON storage.objects
--   FOR DELETE USING (
--     bucket_id = 'toys-images' AND 
--     auth.uid()::text = (storage.foldername(name))[1]
--   );

-- 7. Index pour optimiser les performances
CREATE INDEX IF NOT EXISTS themes_user_id_idx ON themes(user_id);
CREATE INDEX IF NOT EXISTS toys_theme_id_idx ON toys(theme_id);
CREATE INDEX IF NOT EXISTS toys_categorie_idx ON toys(categorie);
CREATE INDEX IF NOT EXISTS toys_nom_idx ON toys(nom);