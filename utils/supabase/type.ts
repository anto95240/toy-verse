// /utils/supabase/type.ts
import { Theme, Toy } from '@/types/theme' // On importe les types existants pour éviter la duplication

// On définit Category ici si elle n'est pas dans un autre fichier
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
    // Ces sections sont obligatoires pour que Supabase v2 infère correctement les types
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