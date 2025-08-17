// /types/theme.ts
export type Theme = {
  id: string
  name: string
  image_url: string | null
  user_id: string
  created_at: string
}

export type Toy = {
  id: string
  theme_id: string
  nom: string
  taille: string | null
  nb_pieces: number | null
  numero: string | null
  is_exposed: boolean
  is_soon: boolean
  photo_url: string | null
  categorie: string | null
  created_at: string
  // 👇 ajouté pour gérer les recherches multi-thèmes
  theme_name?: string
}