export type Theme = {
  id: string
  name: string
  slug: string
  image_url: string | null
  user_id: string
  created_at: string
}

export type Toy = {
  id: string
  theme_id: string
  user_id: string
  nom: string
  taille: string | null
  nb_pieces: number | null
  numero: string | null
  is_exposed: boolean
  is_soon: boolean
  photo_url: string | null
  categorie: string | null
  studio: string
  release_date: number | null
  created_at: string
  theme_name?: string
}