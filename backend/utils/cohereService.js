const { CohereClient } = require('cohere-ai');
require('dotenv').config();

// Initialiser le client Cohere
const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY,
});

/**
 * Génère des embeddings pour une liste de textes
 * @param {Array<string>} texts - Tableau de textes pour lesquels générer des embeddings
 * @returns {Promise<Array<Array<number>>>} - Tableau de vecteurs d'embedding
 */
async function generateEmbeddings(texts) {
  try {
    const response = await cohere.embed({
      texts: texts,
      model: 'embed-multilingual-v3.0', // Modèle multilingue pour supporter le français
      inputType: 'search_document', // Pour les documents à indexer
    });

    return response.embeddings;
  } catch (error) {
    console.error('Erreur lors de la génération des embeddings:', error);
    throw error;
  }
}

/**
 * Génère un embedding pour une question utilisateur
 * @param {string} question - Question de l'utilisateur
 * @returns {Promise<Array<number>>} - Vecteur d'embedding pour la question
 */
async function generateQuestionEmbedding(question) {
  try {
    const response = await cohere.embed({
      texts: [question],
      model: 'embed-multilingual-v3.0',
      inputType: 'search_query', // Pour les requêtes de recherche
    });

    return response.embeddings[0];
  } catch (error) {
    console.error('Erreur lors de la génération de l\'embedding de la question:', error);
    throw error;
  }
}

/**
 * Génère une réponse à partir d'un contexte et d'une question
 * @param {string} question - Question de l'utilisateur
 * @param {string} context - Contexte extrait des documents pour la réponse
 * @returns {Promise<string>} - Réponse générée
 */
async function generateResponse(question, context) {
  try {
    const prompt = `
Tu es un assistant comptable virtuel spécialisé pour les PME tunisiennes.
Tu réponds aux questions relatives à la comptabilité et à la gestion financière en te basant UNIQUEMENT sur les informations fournies ci-dessous.
Si tu ne trouves pas la réponse dans les informations données, indique-le clairement et suggère de reformuler la question.
Fais preuve de professionnalisme mais reste accessible et concis.

INFORMATIONS DE RÉFÉRENCE:
${context}

QUESTION:
${question}

RÉPONSE:
`;

    const response = await cohere.generate({
      prompt: prompt,
      model: 'command-r-plus',
      maxTokens: 500,
      temperature: 0.2,
      stopSequences: [],
      k: 0,
      p: 0.75,
    });

    return response.generations[0].text.trim();
  } catch (error) {
    console.error('Erreur lors de la génération de la réponse:', error);
    throw error;
  }
}

module.exports = {
  generateEmbeddings,
  generateQuestionEmbedding,
  generateResponse
};