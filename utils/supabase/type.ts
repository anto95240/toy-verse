// /utils/supabase/type.ts
export type Theme = {
  id: string
  name: string
  image_url: string | null
  user_id: string
}

export type Database = {
  public: {
    Tables: {
      themes: {
        Row: Theme
        Insert: Omit<Theme, 'id'>
        Update: Partial<Omit<Theme, 'id'>>
      }
    }
  }
}

