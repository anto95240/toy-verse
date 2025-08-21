
import { getSupabaseClient } from './supabase/client'
import { convertToWebP } from './imageConverter'

export async function migrateUserImages(userId: string) {
  const supabase = getSupabaseClient()
  
  try {
    // 1. Lister tous les fichiers dans le bucket
    const { data: files, error: listError } = await supabase.storage
      .from('toys-images')
      .list('', { limit: 1000 })
    
    if (listError) throw listError
    
    // 2. Récupérer aussi les fichiers dans les sous-dossiers
    const allFiles = []
    if (files) {
      allFiles.push(...files)
      
      // Lister les fichiers dans toy/
      const { data: toyFiles } = await supabase.storage
        .from('toys-images')
        .list('toys', { limit: 1000 })
      if (toyFiles) {
        toyFiles.forEach(file => allFiles.push({ ...file, name: `toys/${file.name}` }))
      }
      
      // Lister les fichiers dans theme/
      const { data: themeFiles } = await supabase.storage
        .from('toys-images')
        .list('themes', { limit: 1000 })
      if (themeFiles) {
        themeFiles.forEach(file => allFiles.push({ ...file, name: `themes/${file.name}` }))
      }
    }
    
    // 3. Filtrer les fichiers de l'utilisateur
    const userFiles = allFiles.filter(file => 
      file.name.startsWith(`${userId}-`) || 
      file.name.includes(`/${userId}-`) ||
      file.name.startsWith(`toys/${userId}-`) ||
      file.name.startsWith(`themes/${userId}-`)
    )
    
    console.log(`Trouvé ${userFiles.length} fichiers à migrer pour l'utilisateur ${userId}`)
    
    // 4. Migrer chaque fichier vers la nouvelle structure
    for (const file of userFiles) {
      let newPath = ''
      
      if (file.name.includes('themes') || file.name.startsWith(`${userId}-themes`)) {
        const fileName = file.name.split('/').pop() || file.name
        newPath = `themes/${userId}/${fileName}`
      } else {
        const fileName = file.name.split('/').pop() || file.name
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

export async function uploadImage(
  userId: string, 
  type: 'toys' | 'themes', 
  file: File
): Promise<{ path: string | null, error: string | null }> {
  const supabase = getSupabaseClient()
  
  try {
    // Convertir l'image en WebP
    const webpFile = await convertToWebP(file)
    
    // Générer le chemin avec la nouvelle structure
    const imagePath = generateImagePath(userId, type)
    
    const { error } = await supabase.storage
      .from('toys-images')
      .upload(imagePath, webpFile, { upsert: true })
    
    if (error) {
      return { path: null, error: error.message }
    }
    
    return { path: imagePath, error: null }
  } catch (err) {
    console.error('Erreur lors de l\'upload:', err)
    return { path: null, error: 'Erreur lors de l\'upload ou de la conversion' }
  }
}

export function getImagePath(userId: string, type: 'toys' | 'themes', fileName: string): string {
  const timestamp = Date.now()
  return `${type}/${userId}/${timestamp}.webp`
}

export function generateImagePath(userId: string, type: 'toys' | 'themes'): string {
  const timestamp = Date.now()
  return `${type}/${userId}/${timestamp}.webp`
}
