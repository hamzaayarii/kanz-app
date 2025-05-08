const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

/**
 * Lit et extrait le texte d'un fichier PDF
 * @param {string} filePath - Chemin vers le fichier PDF
 * @returns {Promise<string>} - Texte extrait du PDF
 */
async function extractTextFromPdf(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdfParse(dataBuffer);
  return data.text;
}

/**
 * Lit et extrait le texte d'un fichier texte
 * @param {string} filePath - Chemin vers le fichier texte
 * @returns {Promise<string>} - Contenu du fichier texte
 */
async function extractTextFromTxt(filePath) {
  return fs.promises.readFile(filePath, 'utf8');
}

/**
 * Extrait le texte d'un fichier selon son extension
 * @param {string} filePath - Chemin vers le fichier
 * @returns {Promise<string>} - Texte extrait du fichier
 */
async function extractTextFromFile(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  
  switch (extension) {
    case '.pdf':
      return extractTextFromPdf(filePath);
    case '.txt':
      return extractTextFromTxt(filePath);
    default:
      throw new Error(`Format de fichier non supporté: ${extension}`);
  }
}

/**
 * Divise le texte en chunks de taille similaire
 * @param {string} text - Texte à diviser
 * @param {number} chunkSize - Taille approximative de chaque chunk en caractères
 * @param {number} overlap - Nombre de caractères de chevauchement entre les chunks
 * @returns {Array<{text: string, metadata: Object}>} - Array de chunks avec métadonnées
 */
function splitTextIntoChunks(text, chunkSize = 1000, overlap = 200) {
  const chunks = [];
  
  // Nettoyage basique du texte
  const cleanedText = text
    .replace(/\r\n/g, '\n')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Si le texte est plus petit que la taille de chunk, retourner tel quel
  if (cleanedText.length <= chunkSize) {
    return [{ text: cleanedText, metadata: { index: 0, isLastChunk: true } }];
  }
  
  let startIndex = 0;
  let chunkIndex = 0;
  
  while (startIndex < cleanedText.length) {
    // Calculer l'index de fin pour ce chunk
    let endIndex = startIndex + chunkSize;
    
    // Si nous ne sommes pas à la fin du texte, essayer de finir le chunk à une ponctuation ou un espace
    if (endIndex < cleanedText.length) {
      // Chercher le prochain point, retour à la ligne, ou autre séparateur logique après startIndex + chunkSize
      const nextPeriod = cleanedText.indexOf('.', endIndex);
      const nextNewline = cleanedText.indexOf('\n', endIndex);
      
      if (nextPeriod !== -1 && (nextPeriod - endIndex < 100)) {
        endIndex = nextPeriod + 1; // Inclure le point
      } else if (nextNewline !== -1 && (nextNewline - endIndex < 100)) {
        endIndex = nextNewline + 1; // Inclure le retour à la ligne
      } else {
        // Si pas de séparateur logique trouvé, chercher le prochain espace
        const nextSpace = cleanedText.indexOf(' ', endIndex);
        if (nextSpace !== -1 && (nextSpace - endIndex < 50)) {
          endIndex = nextSpace;
        }
      }
    }
    
    // Extraire le chunk
    const chunkText = cleanedText.substring(startIndex, endIndex);
    
    chunks.push({
      text: chunkText,
      metadata: {
        index: chunkIndex,
        isLastChunk: endIndex >= cleanedText.length
      }
    });
    
    // Avancer pour le prochain chunk, en tenant compte du chevauchement
    startIndex = endIndex - overlap;
    
    // S'assurer que startIndex ne recule pas (peut arriver avec un grand overlap)
    if (startIndex <= 0) {
      startIndex = endIndex;
    }
    
    chunkIndex++;
  }
  
  return chunks;
}

/**
 * Traite un document et le divise en chunks
 * @param {string} filePath - Chemin vers le fichier
 * @param {Object} metadata - Métadonnées supplémentaires pour le document
 * @returns {Promise<Array>} - Array de chunks avec métadonnées
 */
async function processDocument(filePath, metadata = {}) {
  try {
    // Extraire le texte du document
    const text = await extractTextFromFile(filePath);
    
    // Diviser le texte en chunks
    const fileName = path.basename(filePath);
    const chunks = splitTextIntoChunks(text);
    
    // Ajouter des métadonnées à chaque chunk
    return chunks.map(chunk => ({
      ...chunk,
      metadata: {
        ...chunk.metadata,
        fileName,
        filePath,
        ...metadata,
        processingDate: new Date().toISOString()
      }
    }));
  } catch (error) {
    console.error(`Erreur lors du traitement du document ${filePath}:`, error);
    throw error;
  }
}

/**
 * Traite tous les documents d'un dossier
 * @param {string} dirPath - Chemin vers le dossier contenant les documents
 * @param {Array} fileExtensions - Extensions de fichiers à traiter
 * @returns {Promise<Array>} - Array de chunks avec métadonnées pour tous les documents
 */
async function processDirectory(dirPath, fileExtensions = ['.pdf', '.txt']) {
  try {
    const files = fs.readdirSync(dirPath);
    let allChunks = [];
    
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        // Traiter récursivement les sous-dossiers
        const subDirChunks = await processDirectory(filePath, fileExtensions);
        allChunks = [...allChunks, ...subDirChunks];
      } else if (fileExtensions.includes(path.extname(filePath).toLowerCase())) {
        // Traiter les fichiers avec les extensions spécifiées
        const fileChunks = await processDocument(filePath, {
          category: path.basename(path.dirname(filePath)) // Utiliser le nom du dossier parent comme catégorie
        });
        allChunks = [...allChunks, ...fileChunks];
      }
    }
    
    return allChunks;
  } catch (error) {
    console.error(`Erreur lors du traitement du dossier ${dirPath}:`, error);
    throw error;
  }
}

module.exports = {
  extractTextFromFile,
  splitTextIntoChunks,
  processDocument,
  processDirectory
};