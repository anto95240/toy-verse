// /utils/supabase/type.ts
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
  photo_url: string | null
  categorie: string | null
  created_at: string
}

export type Category = {
  name: string
}

export type Database = {
  public: {
    Tables: {
      themes: {
        Row: Theme
        Insert: Omit<Theme, 'id' | 'created_at'>
        Update: Partial<Omit<Theme, 'id' | 'created_at'>>
      }
      toys: {
        Row: Toy
        Insert: Omit<Toy, 'id' | 'created_at'>
        Update: Partial<Omit<Toy, 'id' | 'created_at'>>
      }
      categories: {
        Row: Category
        Insert: Category
        Update: Partial<Category>
      }
    }
  }
}