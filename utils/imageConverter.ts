export async function convertToWebP(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      // Définir les dimensions du canvas
      canvas.width = img.width
      canvas.height = img.height

      // Dessiner l'image sur le canvas
      ctx?.drawImage(img, 0, 0)

      // Convertir en WebP
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const webpFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.webp'), {
              type: 'image/webp'
            })
            resolve(webpFile)
          } else {
            reject(new Error('Erreur lors de la conversion WebP'))
          }
        },
        'image/webp',
        0.8 // Qualité de compression
      )
    }

    img.onerror = () => reject(new Error('Erreur lors du chargement de l\'image'))
    img.src = URL.createObjectURL(file)
  })
}

export function generateImagePath(userId: string, type: 'toys' | 'themes'): string {
  const timestamp = Date.now()
  return `${type}/${userId}/${timestamp}.webp`
}