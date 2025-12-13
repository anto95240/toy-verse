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
        Relationships: [] // <-- AJOUT OBLIGATOIRE
      }
      toys: {
        Row: Toy
        Insert: Omit<Toy, 'id' | 'created_at'>
        Update: Partial<Omit<Toy, 'id' | 'created_at'>>
        Relationships: [] // <-- AJOUT OBLIGATOIRE
      }
      categories: {
        Row: Category
        Insert: Category
        Update: Partial<Category>
        Relationships: [] // <-- AJOUT OBLIGATOIRE
      }
    }
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