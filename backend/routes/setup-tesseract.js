// Steps to install Tesseract language data
const fs = require('fs');
const path = require('path');
const https = require('https');
const { createWorker } = require('tesseract.js');
const zlib = require('zlib');

// Create a script to download and setup tessdata
async function setupTesseract() {
  const tessdataDir = path.join(__dirname, '../tessdata');
  
  // Create tessdata directory if it doesn't exist
  if (!fs.existsSync(tessdataDir)) {
    console.log('Creating tessdata directory...');
    fs.mkdirSync(tessdataDir, { recursive: true });
  }
  
  // Check if eng.traineddata.gz already exists
  const engTrainedDataPath = path.join(tessdataDir, 'eng.traineddata');
  const engTrainedDataGzPath = path.join(tessdataDir, 'eng.traineddata.gz');
  
  if (!fs.existsSync(engTrainedDataGzPath)) {
    console.log('Downloading English language data...');
    
    // URL for the English language training data from tesseract-ocr GitHub
    const url = 'https://github.com/tesseract-ocr/tessdata/raw/main/eng.traineddata';
    
    // Download the file
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download eng.traineddata: ${response.statusText}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Compress the data using gzip
    console.log('Compressing data...');
    const gzippedBuffer = zlib.gzipSync(buffer);
    
    // Write the gzipped file
    fs.writeFileSync(engTrainedDataGzPath, gzippedBuffer);
    
    // Also write the uncompressed file for backup
    fs.writeFileSync(engTrainedDataPath, buffer);
    
    console.log('Download and compression completed successfully!');
  } else {
    console.log('English language data already exists.');
  }
  
  console.log('Tesseract language data setup complete!');
}

// Test Tesseract configuration
async function testTesseract() {
  try {
    console.log('Testing Tesseract configuration...');
    
    const worker = await createWorker({
      logger: m => console.log(m),
      langPath: path.join(__dirname, '../tessdata')
    });
    
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    
    console.log('Tesseract initialized successfully!');
    
    await worker.terminate();
    console.log('Test completed successfully!');
  } catch (error) {
    console.error('Tesseract test failed:', error);
  }
}

// Run the setup
(async () => {
  try {
    await setupTesseract();
    await testTesseract();
  } catch (error) {
    console.error('Setup failed:', error);
  }
})();

module.exports = { setupTesseract };