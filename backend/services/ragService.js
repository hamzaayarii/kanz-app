// // services/ragService.js
// const cohere = require('../middlewares/cohereClient');
// const { ChromaClient } = require('chromadb');
// const chroma = new ChromaClient({ path: process.env.CHROMA_DB_PATH || './chromadb' });

// // Collection name for document embeddings
// const COLLECTION_NAME = 'document_embeddings';

// let collection;

// // Initialize the collection
// const initCollection = async () => {
//   try {
//     collection = await chroma.getCollection(COLLECTION_NAME);
//     return collection;
//   } catch (error) {
//     console.error('Error getting ChromaDB collection:', error);
//     throw error;
//   }
// };

// // Function to embed a query
// const embedQuery = async (query) => {
//   try {
//     const response = await cohere.embed({
//       texts: [query],
//       model: 'embed-english-v3.0',
//       inputType: 'search_query'
//     });
//     return response.embeddings[0];
//   } catch (error) {
//     console.error('Error embedding query:', error);
//     throw error;
//   }
// };

// // Function to search for relevant document chunks
// const searchDocuments = async (queryEmbedding, businessId, topK = 5) => {
//   try {
//     if (!collection) await initCollection();

//     // Search the collection by vector similarity, filtered by businessId
//     const result = await collection.query({
//       queryEmbeddings: [queryEmbedding],
//       where: { businessId: businessId },
//       nResults: topK
//     });

//     const documents = result.documents[0] || [];
//     const metadatas = result.metadatas[0] || [];
//     const distances = result.distances[0] || [];

//     // Format and return results
//     return documents.map((doc, i) => ({
//       content: doc,
//       metadata: metadatas[i],
//       relevanceScore: 1 - distances[i] // Convert distance to similarity score (0-1)
//     }));
//   } catch (error) {
//     console.error('Error searching documents:', error);
//     throw error;
//   }
// };

// // Function to build a prompt with context
// const buildPromptWithContext = (query, relevantDocs, userContext) => {
//   // Extract unique document titles for citation
//   const uniqueDocs = [...new Set(relevantDocs.map(doc => doc.metadata.documentTitle))];
//   const documentReferences = uniqueDocs.map(title => `- ${title}`).join('\n');

//   // Format context from relevant documents
//   const context = relevantDocs
//     .map((doc, index) => {
//       return `
// [DOCUMENT ${index + 1}]: ${doc.metadata.documentTitle}
// ${doc.content}
// `;
//     })
//     .join('\n\n');

//   // Build the prompt
//   return `
// You are an AI assistant specialized in accounting, taxation, and business advice. 
// You have access to specific documents related to ${userContext.businessName}.

// USER CONTEXT:
// - User Role: ${userContext.role}
// - Business: ${userContext.businessName}

// QUESTION:
// ${query}

// RELEVANT DOCUMENT EXCERPTS:
// ${context}

// INSTRUCTIONS:
// 1. Answer the question based on the information provided in the relevant document excerpts.
// 2. If the document excerpts don't contain sufficient information to answer the question, say so clearly.
// 3. If you use information from the documents, cite the document titles.
// 4. Be accurate, helpful, and provide legally correct information.
// 5. Format your answer in a clear, professional manner.

// Available documents for reference:
// ${documentReferences}

// Answer:
// `;
// };

// // Function to generate a response using Cohere's generate API
// const generateResponse = async (prompt) => {
//   try {
//     const response = await cohere.generate({
//       model: 'command-r-plus', // Use the appropriate model (command-r-plus has longer context)
//       prompt: prompt,
//       maxTokens: 800,
//       temperature: 0.7,
//       k: 0,
//       stopSequences: [],
//       returnLikelihoods: 'NONE'
//     });

//     return response.generations[0].text.trim();
//   } catch (error) {
//     console.error('Error generating response:', error);
//     throw error;
//   }
// };

// // Main function to process a query and generate a RAG response
// const processQuery = async (query, userContext) => {
//   try {
//     // 1. Embed the query
//     const queryEmbedding = await embedQuery(query);

//     // 2. Retrieve relevant document chunks
//     const relevantDocs = await searchDocuments(queryEmbedding, userContext.businessId);

//     // 3. Build prompt with context
//     const prompt = buildPromptWithContext(query, relevantDocs, userContext);

//     // 4. Generate response
//     const response = await generateResponse(prompt);

//     return {
//       reply: response,
//       sources: relevantDocs.map(doc => ({
//         title: doc.metadata.documentTitle,
//         relevanceScore: doc.relevanceScore
//       }))
//     };
//   } catch (error) {
//     console.error('Error processing query:', error);
//     throw error;
//   }
// };

// module.exports = {
//   processQuery,
//   embedQuery,
//   searchDocuments,
//   buildPromptWithContext,
//   generateResponse
// };