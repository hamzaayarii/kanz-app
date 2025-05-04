const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');
const pdfParse = require('pdf-parse');
const { cleanText } = require('./textProcessing');

/**
 * Extract text from a PDF file
 * @param {string} filePath - Path to the PDF file
 * @returns {Promise<string>} - Extracted text content
 */
async function extractTextFromPDF(filePath) {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return cleanText(data.text);
  } catch (error) {
    console.error(`Error extracting text from PDF: ${error.message}`);
    throw error;
  }
}

/**
 * Save extracted text to file for future use
 * @param {string} text - Extracted text
 * @param {string} originalFilePath - Path to original file
 * @param {string} outputDir - Directory to save text files
 * @returns {string} - Path to saved text file
 */
function saveExtractedText(text, originalFilePath, outputDir = 'uploads/text') {
  try {
    // Create directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const fileName = path.basename(originalFilePath, path.extname(originalFilePath)) + '.txt';
    const outputPath = path.join(outputDir, fileName);
    
    fs.writeFileSync(outputPath, text);
    return outputPath;
  } catch (error) {
    console.error(`Error saving extracted text: ${error.message}`);
    throw error;
  }
}

module.exports = {
  extractTextFromPDF,
  saveExtractedText
};