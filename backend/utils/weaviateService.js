import weaviate from 'weaviate-ts-client';
import { generateEmbeddings } from './cohereService.js';
import dotenv from 'dotenv';

dotenv.config();
// Initialize the Weaviate client properly
const client = weaviate.client({
    scheme: 'http',
    host: process.env.WEAVIATE_URL.replace(/^https?:\/\//, ''),
    // Add apiKey if needed:
    // headers: { 'X-OpenAI-Api-Key': process.env.WEAVIATE_API_KEY }
  });
const CLASS_NAME = 'ComptabiliteDocument';

/**
 * Initialise le schéma Weaviate pour stocker les documents comptables
 * @returns {Promise<void>}
 */
async function initializeSchema() {
  try {
    // Vérifier si la classe existe déjà
    const schemaRes = await client.schema.getter().do();
    const classExists = schemaRes.classes && schemaRes.classes.some(c => c.class === CLASS_NAME);

    if (classExists) {
      console.log(`La classe ${CLASS_NAME} existe déjà.`);
      return;
    }

    // Créer la classe si elle n'existe pas
    const classObj = {
      class: CLASS_NAME,
      vectorizer: 'none', // Nous utilisons des embeddings externes (Cohere)
      properties: [
        {
          name: 'text',
          dataType: ['text'],
          description: 'Le contenu textuel du chunk du document',
        },
        {
          name: 'fileName',
          dataType: ['string'],
          description: 'Nom du fichier source',
        },
        {
          name: 'filePath',
          dataType: ['string'],
          description: 'Chemin du fichier source',
        },
        {
          name: 'category',
          dataType: ['string'],
          description: 'Catégorie du document',
        },
        {
          name: 'index',
          dataType: ['number'],
          description: 'Index du chunk dans le document original',
        },
        {
          name: 'isLastChunk',
          dataType: ['boolean'],
          description: 'Indique si c\'est le dernier chunk du document',
        },
        {
          name: 'processingDate',
          dataType: ['date'],
          description: 'Date de traitement du document',
        },
      ],
    };

    await client.schema.classCreator().withClass(classObj).do();
    console.log(`Classe ${CLASS_NAME} créée avec succès.`);
  } catch (error) {
    console.error('Erreur lors de l\'initialisation du schéma Weaviate:', error);
    throw error;
  }
}

/**
 * Indexe des chunks de documents dans Weaviate
 * @param {Array<{text: string, metadata: Object}>} chunks - Chunks de documents à indexer
 * @returns {Promise<Array>} - IDs des documents indexés
 */
async function indexDocuments(chunks) {
  try {
    const batchSize = 10; // Traiter par lots pour éviter de surcharger l'API
    const results = [];

    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      const texts = batch.map(chunk => chunk.text);
      
      // Générer des embeddings pour ce lot
      const embeddings = await generateEmbeddings(texts);
      
      // Indexer chaque chunk avec son embedding
      const batchResults = await Promise.all(batch.map((chunk, index) => {
        const { text, metadata } = chunk;
        
        return client.data.creator()
          .withClassName(CLASS_NAME)
          .withProperties({
            text,
            fileName: metadata.fileName,
            filePath: metadata.filePath,
            category: metadata.category || 'default',
            index: metadata.index,
            isLastChunk: metadata.isLastChunk,
            processingDate: metadata.processingDate,
          })
          .withVector(embeddings[index])
          .do();
      }));
      
      results.push(...batchResults);
      console.log(`Indexé ${batch.length} chunks (${i + batch.length}/${chunks.length})`);
    }

    return results;
  } catch (error) {
    console.error('Erreur lors de l\'indexation des documents:', error);
    throw error;
  }
}

/**
 * Recherche des documents similaires à un vecteur de requête
 * @param {Array<number>} queryVector - Vecteur d'embedding de la question
 * @param {number} limit - Nombre maximum de résultats à retourner
 * @returns {Promise<Array>} - Résultats de la recherche
 */
async function searchSimilarDocuments(queryVector, limit = 5) {
  try {
    const result = await client.graphql
      .get()
      .withClassName(CLASS_NAME)
      .withFields('text fileName category _additional { distance }')
      .withNearVector({ vector: queryVector })
      .withLimit(limit)
      .do();

    return result.data.Get[CLASS_NAME];
  } catch (error) {
    console.error('Erreur lors de la recherche de documents similaires:', error);
    throw error;
  }
}

/**
 * Supprime tous les documents de la classe
 * @returns {Promise<void>}
 */
async function deleteAllDocuments() {
  try {
    await client.schema.classDeleter().withClassName(CLASS_NAME).do();
    console.log(`Classe ${CLASS_NAME} supprimée avec succès.`);
    
    // Recréer la classe
    await initializeSchema();
  } catch (error) {
    console.error('Erreur lors de la suppression des documents:', error);
    throw error;
  }
}

/**
 * Compte le nombre total de documents indexés
 * @returns {Promise<number>} - Nombre de documents
 */
async function countDocuments() {
  try {
    const result = await client.graphql
      .aggregate()
      .withClassName(CLASS_NAME)
      .withFields('meta { count }')
      .do();

    return result.data.Aggregate[CLASS_NAME][0].meta.count;
  } catch (error) {
    console.error('Erreur lors du comptage des documents:', error);
    return 0;
  }
}

// Export using ES Module syntax
export {
  initializeSchema,
  indexDocuments,
  searchSimilarDocuments,
  deleteAllDocuments,
  countDocuments
};