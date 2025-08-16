import { getSupabaseClient } from './supabase/client'

export async function migrateUserImages(userId: string) {
  const supabase = getSupabaseClient()
  
  try {
    // 1. Lister tous les fichiers dans le bucket
    const { data: files, error: listError } = await supabase.storage
      .from('toys-images')
      .list()
    
    if (listError) throw listError
    
    // 2. Filtrer les fichiers de l'utilisateur (qui commencent par userId)
    const userFiles = files?.filter(file => 
      file.name.startsWith(`${userId}-`) || 
      file.name.startsWith(`themes/${userId}-`) ||
      file.name.startsWith(`toys/${userId}-`)
    ) || []
    
    console.log(`Trouvé ${userFiles.length} fichiers à migrer pour l'utilisateur ${userId}`)
    
    // 3. Migrer chaque fichier vers la nouvelle structure
    for (const file of userFiles) {
      let newPath = ''
      
      if (file.name.startsWith(`${userId}-`)) {
        // Fichier à la racine, probablement un thème
        newPath = `themes/${userId}/${file.name}`
      } else if (file.name.startsWith('themes/') && !file.name.includes(`/${userId}/`)) {
        // Fichier thème pas encore dans le bon dossier
        const fileName = file.name.replace('themes/', '')
        newPath = `themes/${userId}/${fileName}`
      } else if (file.name.startsWith('toys/') && !file.name.includes(`/${userId}/`)) {
        // Fichier jouet pas encore dans le bon dossier
        const fileName = file.name.replace('toys/', '')
        newPath = `toys/${userId}/${fileName}`
      }
      
      if (newPath && newPath !== file.name) {
        // Copier le fichier vers le nouveau chemin
        const { error: copyError } = await supabase.storage
          .from('toys-images')
          .copy(file.name, newPath)
        
        if (copyError) {
          console.error(`Erreur copie ${file.name} -> ${newPath}:`, copyError)
          continue
        }
        
        // Supprimer l'ancien fichier
        const { error: deleteError } = await supabase.storage
          .from('toys-images')
          .remove([file.name])
        
        if (deleteError) {
          console.error(`Erreur suppression ${file.name}:`, deleteError)
        }
        
        console.log(`Migré: ${file.name} -> ${newPath}`)
      }
    }
    
    console.log('Migration terminée avec succès')
    return { success: true, migratedCount: userFiles.length }
    
  } catch (error) {
    console.error('Erreur lors de la migration:', error)
    return { success: false, error }
  }
}

export function getImagePath(userId: string, type: 'themes' | 'toys', fileName: string): string {
  const timestamp = Date.now()
  const fileExt = fileName.split('.').pop()
  return `${type}/${userId}/${timestamp}.${fileExt}`
}

export async function uploadImage(
  userId: string, 
  type: 'themes' | 'toys', 
  file: File
): Promise<{ path: string | null, error: string | null }> {
  const supabase = getSupabaseClient()
  
  try {
    const imagePath = getImagePath(userId, type, file.name)
    
    const { error } = await supabase.storage
      .from('toys-images')
      .upload(imagePath, file, { upsert: true })
    
    if (error) {
      return { path: null, error: error.message }
    }
    
    return { path: imagePath, error: null }
  } catch (err) {
    return { path: null, error: 'Erreur lors de l\'upload' }
  }
}