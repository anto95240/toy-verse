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
      // -----------------------------------------------------------------------
      // TABLES EXISTANTES (conservées intactes — règle n°1)
      // -----------------------------------------------------------------------
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
          // Champs legacy conservés (règle n°1 — ne jamais supprimer)
          categorie: string | null
          studio: string
          release_date: number | null
          gift_occasion: string | null
          gift_year: number | null
          created_at: string
          // Champs V2 ajoutés (vides tant que le jouet n'est pas migré)
          category_ids: string[]
          studio_ids: string[]
          franchise_ids: string[]
          character_ids: string[]
          location_ids: string[]
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
          // Champs legacy
          categorie?: string | null
          studio: string
          release_date?: number | null
          gift_occasion?: string | null
          gift_year?: number | null
          created_at?: string
          // Champs V2 optionnels à l'insertion
          category_ids?: string[]
          studio_ids?: string[]
          franchise_ids?: string[]
          character_ids?: string[]
          location_ids?: string[]
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
          // Champs legacy
          categorie?: string | null
          studio?: string
          release_date?: number | null
          gift_occasion?: string | null
          gift_year?: number | null
          created_at?: string
          // Champs V2
          category_ids?: string[]
          studio_ids?: string[]
          franchise_ids?: string[]
          character_ids?: string[]
          location_ids?: string[]
        }
        Relationships: []
      }
      // Table legacy conservée telle quelle
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
      // -----------------------------------------------------------------------
      // NOUVELLES TABLES V2
      // -----------------------------------------------------------------------
      categories_v2: {
        Row: {
          id: string
          name: string
          slug: string
          parent_id: string | null
          level: number
          description: string | null
          icon: string | null
          active: boolean
          sort_order: number
          aliases: string[]
          created_at: string
        }
        Insert: {
          id: string
          name: string
          slug: string
          parent_id?: string | null
          level?: number
          description?: string | null
          icon?: string | null
          active?: boolean
          sort_order?: number
          aliases?: string[]
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          parent_id?: string | null
          level?: number
          description?: string | null
          icon?: string | null
          active?: boolean
          sort_order?: number
          aliases?: string[]
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_v2_parent_id_fkey"
            columns: ["parent_id"]
            referencedRelation: "categories_v2"
            referencedColumns: ["id"]
          }
        ]
      }
      studios: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          parent_studio_id: string | null
          country: string | null
          active: boolean
          aliases: string[]
          created_at: string
        }
        Insert: {
          id: string
          name: string
          slug: string
          description?: string | null
          parent_studio_id?: string | null
          country?: string | null
          active?: boolean
          aliases?: string[]
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          parent_studio_id?: string | null
          country?: string | null
          active?: boolean
          aliases?: string[]
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "studios_parent_studio_id_fkey"
            columns: ["parent_studio_id"]
            referencedRelation: "studios"
            referencedColumns: ["id"]
          }
        ]
      }
      licenses: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          parent_license_id: string | null
          active: boolean
          aliases: string[]
          created_at: string
        }
        Insert: {
          id: string
          name: string
          slug: string
          description?: string | null
          parent_license_id?: string | null
          active?: boolean
          aliases?: string[]
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          parent_license_id?: string | null
          active?: boolean
          aliases?: string[]
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "licenses_parent_license_id_fkey"
            columns: ["parent_license_id"]
            referencedRelation: "licenses"
            referencedColumns: ["id"]
          }
        ]
      }
      franchises: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          parent_franchise_id: string | null
          active: boolean
          aliases: string[]
          created_at: string
        }
        Insert: {
          id: string
          name: string
          slug: string
          description?: string | null
          parent_franchise_id?: string | null
          active?: boolean
          aliases?: string[]
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          parent_franchise_id?: string | null
          active?: boolean
          aliases?: string[]
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "franchises_parent_franchise_id_fkey"
            columns: ["parent_franchise_id"]
            referencedRelation: "franchises"
            referencedColumns: ["id"]
          }
        ]
      }
      characters: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          image_url: string | null
          franchise_ids: string[]
          active: boolean
          created_at: string
        }
        Insert: {
          id: string
          name: string
          slug: string
          description?: string | null
          image_url?: string | null
          franchise_ids?: string[]
          active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          image_url?: string | null
          franchise_ids?: string[]
          active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      locations: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          parent_location_id: string | null
          active: boolean
          created_at: string
        }
        Insert: {
          id: string
          name: string
          slug: string
          description?: string | null
          parent_location_id?: string | null
          active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          parent_location_id?: string | null
          active?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "locations_parent_location_id_fkey"
            columns: ["parent_location_id"]
            referencedRelation: "locations"
            referencedColumns: ["id"]
          }
        ]
      }
      // -----------------------------------------------------------------------
      // TABLES DE LIAISON N:N
      // -----------------------------------------------------------------------
      toy_categories: {
        Row: { toy_id: string; category_id: string }
        Insert: { toy_id: string; category_id: string }
        Update: { toy_id?: string; category_id?: string }
        Relationships: [
          { foreignKeyName: "toy_categories_toy_id_fkey"; columns: ["toy_id"]; referencedRelation: "toys"; referencedColumns: ["id"] },
          { foreignKeyName: "toy_categories_category_id_fkey"; columns: ["category_id"]; referencedRelation: "categories_v2"; referencedColumns: ["id"] }
        ]
      }
      toy_studios: {
        Row: { toy_id: string; studio_id: string }
        Insert: { toy_id: string; studio_id: string }
        Update: { toy_id?: string; studio_id?: string }
        Relationships: [
          { foreignKeyName: "toy_studios_toy_id_fkey"; columns: ["toy_id"]; referencedRelation: "toys"; referencedColumns: ["id"] },
          { foreignKeyName: "toy_studios_studio_id_fkey"; columns: ["studio_id"]; referencedRelation: "studios"; referencedColumns: ["id"] }
        ]
      }
      toy_licenses: {
        Row: { toy_id: string; license_id: string }
        Insert: { toy_id: string; license_id: string }
        Update: { toy_id?: string; license_id?: string }
        Relationships: [
          { foreignKeyName: "toy_licenses_toy_id_fkey"; columns: ["toy_id"]; referencedRelation: "toys"; referencedColumns: ["id"] },
          { foreignKeyName: "toy_licenses_license_id_fkey"; columns: ["license_id"]; referencedRelation: "licenses"; referencedColumns: ["id"] }
        ]
      }
      toy_franchises: {
        Row: { toy_id: string; franchise_id: string }
        Insert: { toy_id: string; franchise_id: string }
        Update: { toy_id?: string; franchise_id?: string }
        Relationships: [
          { foreignKeyName: "toy_franchises_toy_id_fkey"; columns: ["toy_id"]; referencedRelation: "toys"; referencedColumns: ["id"] },
          { foreignKeyName: "toy_franchises_franchise_id_fkey"; columns: ["franchise_id"]; referencedRelation: "franchises"; referencedColumns: ["id"] }
        ]
      }
      toy_characters: {
        Row: { toy_id: string; character_id: string }
        Insert: { toy_id: string; character_id: string }
        Update: { toy_id?: string; character_id?: string }
        Relationships: [
          { foreignKeyName: "toy_characters_toy_id_fkey"; columns: ["toy_id"]; referencedRelation: "toys"; referencedColumns: ["id"] },
          { foreignKeyName: "toy_characters_character_id_fkey"; columns: ["character_id"]; referencedRelation: "characters"; referencedColumns: ["id"] }
        ]
      }
      toy_locations: {
        Row: { toy_id: string; location_id: string }
        Insert: { toy_id: string; location_id: string }
        Update: { toy_id?: string; location_id?: string }
        Relationships: [
          { foreignKeyName: "toy_locations_toy_id_fkey"; columns: ["toy_id"]; referencedRelation: "toys"; referencedColumns: ["id"] },
          { foreignKeyName: "toy_locations_location_id_fkey"; columns: ["location_id"]; referencedRelation: "locations"; referencedColumns: ["id"] }
        ]
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