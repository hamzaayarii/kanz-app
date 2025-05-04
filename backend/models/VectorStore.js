const { ChromaClient } = require('chromadb');
const config = require('../config/cohere');

class VectorStore {
  constructor() {
    this.client = new ChromaClient();
    this.collection = null;
    this.initialized = false;
  }

  async initialize() {
    try {
      // Create or get collection for document embeddings
      this.collection = await this.client.getOrCreateCollection({
        name: "document_embeddings",
        metadata: { "hnsw:space": "cosine" } // Use cosine similarity
      });
      this.initialized = true;
      console.log("ChromaDB collection initialized successfully");
    } catch (error) {
      console.error("Failed to initialize ChromaDB collection:", error);
      throw error;
    }
  }

  async addEmbeddings(documents) {
    if (!this.initialized) await this.initialize();
    
    try {
      // Format for ChromaDB: each document needs id, embedding, metadata
      const ids = documents.map(doc => doc.id);
      const embeddings = documents.map(doc => doc.embedding);
      const metadatas = documents.map(doc => doc.metadata);
      
      await this.collection.add({
        ids,
        embeddings,
        metadatas
      });
      
      return ids;
    } catch (error) {
      console.error("Error adding embeddings to vector store:", error);
      throw error;
    }
  }

  async queryEmbeddings(queryEmbedding, topK = 5, filter = {}) {
    if (!this.initialized) await this.initialize();
    
    try {
      const results = await this.collection.query({
        queryEmbeddings: [queryEmbedding],
        nResults: topK,
        where: filter // Optional filter based on metadata
      });
      
      return results;
    } catch (error) {
      console.error("Error querying vector store:", error);
      throw error;
    }
  }

  async deleteEmbeddings(ids) {
    if (!this.initialized) await this.initialize();
    
    try {
      await this.collection.delete({
        ids
      });
    } catch (error) {
      console.error("Error deleting embeddings:", error);
      throw error;
    }
  }

  async updateEmbedding(id, newEmbedding, newMetadata) {
    // Delete and re-add with same ID to update
    await this.deleteEmbeddings([id]);
    await this.addEmbeddings([{
      id,
      embedding: newEmbedding,
      metadata: newMetadata
    }]);
  }
}

// Export singleton instance
const vectorStore = new VectorStore();
module.exports = vectorStore;