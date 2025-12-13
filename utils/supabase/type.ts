import { Theme, Toy } from '@/types/theme'

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
    // Ces 4 sections sont OBLIGATOIRES pour Supabase v2
    // Sans elles, les fonctions .update() et .delete() renvoient une erreur "never"
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}