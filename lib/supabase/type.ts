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
        Row: {
          id: string
          name: string
          slug: string
          image_url: string | null
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          image_url?: string | null
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          image_url?: string | null
          user_id?: string
          created_at?: string
        }
        Relationships: []
      }
      toys: {
        Row: {
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
        }
        Insert: {
          id?: string
          theme_id: string
          user_id: string
          nom: string
          taille?: string | null
          nb_pieces?: number | null
          numero?: string | null
          is_exposed?: boolean
          is_soon?: boolean
          photo_url?: string | null
          categorie?: string | null
          studio: string
          release_date?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          theme_id?: string
          user_id?: string
          nom?: string
          taille?: string | null
          nb_pieces?: number | null
          numero?: string | null
          is_exposed?: boolean
          is_soon?: boolean
          photo_url?: string | null
          categorie?: string | null
          studio?: string
          release_date?: number | null
          created_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          name: string
        }
        Insert: {
          name: string
        }
        Update: {
          name?: string
        }
        Relationships: []
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