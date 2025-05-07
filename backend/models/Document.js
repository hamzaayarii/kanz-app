// const mongoose = require('mongoose');

// const chunkSchema = new mongoose.Schema({
//   content: { type: String, required: true },
//   embeddingId: { type: String, required: true }, // ID reference to vector store
//   metadata: {
//     startIndex: Number,
//     endIndex: Number
//   }
// });

// const documentSchema = new mongoose.Schema({
//   title: { type: String, required: true },
//   fileName: { type: String, required: true },
//   fileType: { type: String, required: true }, // pdf, txt, etc.
//   uploadDate: { type: Date, default: Date.now },
//   lastUpdated: { type: Date, default: Date.now },
//   businessId: { type: String, required: true },
//   chunks: [chunkSchema],
//   rawTextPath: { type: String }, // Path to stored raw text file
//   originalFilePath: { type: String }, // Path to original uploaded file
//   status: { 
//     type: String, 
//     enum: ['processing', 'indexed', 'error'],
//     default: 'processing'
//   },
//   processingError: { type: String }
// });

// // Index for faster queries by businessId
// documentSchema.index({ businessId: 1 });

// module.exports = mongoose.model('Document', documentSchema);