import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const BUCKET = 'toys-images';
const folders = ['toys', 'themes']; // dossiers à traiter

// Liste les dossiers utilisateurs dans un dossier parent
async function listFolders(parentFolder) {
  const { data, error } = await supabase.storage.from(BUCKET).list(parentFolder, { onlyFolders: true });
  if (error) throw error;
  return data.map(f => `${parentFolder}/${f.name}`);
}

// Liste les fichiers dans un dossier
async function listFiles(folder) {
  const { data, error } = await supabase.storage.from(BUCKET).list(folder);
  if (error) throw error;
  return data.map(file => `${folder}/${file.name}`);
}

// Supprimer tous les fichiers non WebP dans les dossiers utilisateurs
async function cleanBucket() {
  for (const folder of folders) {
    const userFolders = await listFolders(folder);

    for (const userFolder of userFolders) {
      const files = await listFiles(userFolder);

      for (const filePath of files) {
        const ext = filePath.split('.').pop().toLowerCase();

        if (ext !== 'webp') {
          const { error } = await supabase.storage.from(BUCKET).remove([filePath]);
          if (error) console.log('Erreur suppression', filePath, error);
          else console.log('Supprimé :', filePath);
        }
      }
    }
  }
}

// Lancer le nettoyage
cleanBucket().catch(console.error);
