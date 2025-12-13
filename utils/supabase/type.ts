import { Theme, Toy } from '@/types/theme'

export type Category = {
  name: string
}

// On définit Json pour la compatibilité standard Supabase
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      themes: {
        Row: Theme
        Insert: Omit<Theme, 'id' | 'created_at'>
        Update: Partial<Omit<Theme, 'id' | 'created_at'>>
        // Utiliser 'any' ici empêche TypeScript de bloquer sur la structure exacte des relations
        Relationships: any 
      }
      toys: {
        Row: Toy
        Insert: Omit<Toy, 'id' | 'created_at'>
        Update: Partial<Omit<Toy, 'id' | 'created_at'>>
        Relationships: any
      }
      categories: {
        Row: Category
        Insert: Category
        Update: Partial<Category>
        Relationships: any
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