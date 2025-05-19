const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { createWorker } = require('tesseract.js');
const moment = require('moment');
const sharp = require('sharp');

// Configure storage for uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, `receipt-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max file size
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Extract date from text using various formats
function extractDate(text) {
  // Common date formats
  const datePatterns = [
    /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/g, // DD/MM/YYYY or MM/DD/YYYY
    /(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})/g,   // YYYY/MM/DD
    /(\w{3,9})\s+(\d{1,2})(st|nd|rd|th)?,?\s+(\d{4})/gi, // Month DD, YYYY
    /(\d{1,2})(st|nd|rd|th)?\s+(\w{3,9})\s+(\d{4})/gi,   // DD Month YYYY
  ];

  for (const pattern of datePatterns) {
    const matches = text.match(pattern);
    if (matches && matches.length > 0) {
      const dateString = matches[0];
      // Try to parse with moment
      const date = moment(dateString, [
        'DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY/MM/DD', 
        'DD-MM-YYYY', 'MM-DD-YYYY', 'YYYY-MM-DD',
        'DD.MM.YYYY', 'MM.DD.YYYY', 'YYYY.MM.DD',
        'MMMM DD YYYY', 'DD MMMM YYYY',
        'MMM DD YYYY', 'DD MMM YYYY'
      ]);
      
      if (date.isValid()) {
        return date.format('YYYY-MM-DD');
      }
    }
  }
  return '';
}

// Extract amount from text
function extractAmount(text) {
  // Look for currency symbols followed by numbers
  const amountPatterns = [
    /\$\s*(\d+[,\d]*\.\d+)/g,      // $XX.XX
    /\$\s*(\d+[,\d]*)/g,           // $XX
    /(\d+[,\d]*\.\d+)\s*\$/g,      // XX.XX$
    /(\d+[,\d]*)\s*\$/g,           // XX$
    /total:?\s*\$?\s*(\d+[,\d]*\.\d+)/gi,  // Total: $XX.XX
    /total:?\s*\$?\s*(\d+[,\d]*)/gi,       // Total: $XX
    /amount:?\s*\$?\s*(\d+[,\d]*\.\d+)/gi, // Amount: $XX.XX
    /amount:?\s*\$?\s*(\d+[,\d]*)/gi,      // Amount: $XX
    /(\d+[,\d]*\.\d+)/g            // XX.XX (if no currency symbol)
  ];

  for (const pattern of amountPatterns) {
    const matches = text.match(pattern);
    if (matches && matches.length > 0) {
      // Extract actual number from the match
      let amount = matches[0].replace(/[^\d.,]/g, '');
      amount = amount.replace(/,/g, '');
      return amount;
    }
  }
  return '';
}

// Extract tax from text
function extractTax(text) {
  const taxPatterns = [
    /tax:?\s*\$?\s*(\d+[,\d]*\.\d+)/gi,  // Tax: $XX.XX
    /tax:?\s*\$?\s*(\d+[,\d]*)/gi,       // Tax: $XX
    /vat:?\s*\$?\s*(\d+[,\d]*\.\d+)/gi,  // VAT: $XX.XX
    /vat:?\s*\$?\s*(\d+[,\d]*)/gi,       // VAT: $XX
    /gst:?\s*\$?\s*(\d+[,\d]*\.\d+)/gi,  // GST: $XX.XX
    /gst:?\s*\$?\s*(\d+[,\d]*)/gi,       // GST: $XX
    /hst:?\s*\$?\s*(\d+[,\d]*\.\d+)/gi,  // HST: $XX.XX
    /hst:?\s*\$?\s*(\d+[,\d]*)/gi,       // HST: $XX
  ];

  for (const pattern of taxPatterns) {
    const matches = text.match(pattern);
    if (matches && matches.length > 0) {
      // Extract actual number from the match
      let tax = matches[0].replace(/[^\d.,]/g, '');
      tax = tax.replace(/,/g, '');
      return tax;
    }
  }
  return '';
}

// Extract vendor name from text
function extractVendor(text) {
  // Common vendor indicators
  const lines = text.split('\n');
  
  // Check first 3 lines for potential vendor names (often at the top of receipts)
  for (let i = 0; i < Math.min(3, lines.length); i++) {
    const line = lines[i].trim();
    // Skip empty lines and lines that are just numbers or symbols
    if (line && line.length > 2 && !/^[\d\W]+$/.test(line)) {
      return line;
    }
  }
  
  // Look for lines with specific vendor indicators
  const vendorIndicators = ['merchant:', 'vendor:', 'store:', 'business:'];
  for (const line of lines) {
    const lowercaseLine = line.toLowerCase();
    for (const indicator of vendorIndicators) {
      if (lowercaseLine.includes(indicator)) {
        return line.replace(new RegExp(`.*${indicator}`, 'i'), '').trim();
      }
    }
  }
  
  return '';
}

// Extract reference/invoice number from text
function extractReference(text) {
  const refPatterns = [
    /inv[oice]*\s*#?\s*:?\s*(\w+[-\w]*)/i,        // Invoice #: XXX
    /ref[erence]*\s*#?\s*:?\s*(\w+[-\w]*)/i,      // Reference #: XXX
    /receipt\s*#?\s*:?\s*(\w+[-\w]*)/i,           // Receipt #: XXX
    /order\s*#?\s*:?\s*(\w+[-\w]*)/i,             // Order #: XXX
    /transaction\s*#?\s*:?\s*(\w+[-\w]*)/i,       // Transaction #: XXX
    /#\s*:?\s*(\w+[-\w]*)/i                       // #: XXX
  ];

  for (const pattern of refPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  return '';
}

// Extract description from text
function extractDescription(text) {
  const descPatterns = [
    /description:?\s*(.*)/i,                  // Description: XXX
    /item:?\s*(.*)/i,                         // Item: XXX
    /product:?\s*(.*)/i,                      // Product: XXX
    /service:?\s*(.*)/i                       // Service: XXX
  ];

  for (const pattern of descPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  return '';
}

// Route for processing receipt images
router.post('/scan', upload.single('receipt'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const imagePath = req.file.path;
    const processedImagePath = imagePath + '-processed.jpg';
    
    // Preprocess the image to improve OCR accuracy
    await sharp(imagePath)
      .grayscale()
      .normalize()
      .sharpen({ sigma: 1.5 })
      .resize({ width: 1800, height: 2400, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 95 })
      .toFile(processedImagePath);
    
    // Initialize Tesseract worker with proper language settings
    const worker = await createWorker({
      logger: m => console.log(m),
      langPath: path.join(__dirname, '../tessdata') // Path to tessdata directory
    });
    
    // Load and initialize with the English language
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    
    // Set parameters
    await worker.setParameters({
      tessedit_pageseg_mode: '6',
      tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,$-:;/\\()&%#@ ',
    });
    
    // Perform OCR
    const { data } = await worker.recognize(processedImagePath);
    await worker.terminate();
    
    // Extract data from the OCR text
    const extractedText = data.text;
    
    // Clean up text
    const cleanText = extractedText
      .replace(/\r\n/g, '\n')
      .replace(/\s+/g, ' ')
      .trim();
    
    // Extract fields
    const extractedData = {
      date: extractDate(cleanText),
      amount: extractAmount(cleanText),
      tax: extractTax(cleanText),
      vendor: extractVendor(extractedText),
      reference: extractReference(cleanText),
      description: extractDescription(cleanText)
    };
    
    // Clean up files
    fs.unlink(imagePath, (err) => {
      if (err) console.error('Error deleting original file:', err);
    });
    
    fs.unlink(processedImagePath, (err) => {
      if (err) console.error('Error deleting processed file:', err);
    });

    res.json({ 
      success: true, 
      extractedFields: extractedData,
      debug: {
        rawText: extractedText
      }
    });
    
  } catch (error) {
    console.error('Error processing receipt:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error processing receipt', 
      error: error.message 
    });
  }
});

module.exports = router;