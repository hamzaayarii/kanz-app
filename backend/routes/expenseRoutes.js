const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');

const router = express.Router();

// MongoDB Connection
const conn = mongoose.createConnection('mongodb://localhost:27017/invoiceDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

let gfs;
let bucket;

// Ensure connection is open before accessing GridFS
conn.once('open', () => {
    console.log('MongoDB connection established');
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('invoices');  // Collection name in MongoDB
    bucket = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: 'invoices'
    });
});

// Custom multer storage for GridFS
const storage = new GridFsStorage({
    url: 'mongodb://localhost:27017/invoiceDB',
    file: (req, file) => {
        console.log('Processing file:', file); // Log to ensure the file object is correct

        return {
            filename: Date.now() + '-' + file.originalname,
            bucketName: 'invoices',
        };
    },
});

// Multer setup
const upload = multer({ storage });

// Upload Invoice
router.post('/', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'File is required' });
    }

    console.log('File uploaded:', req.file); // Log the uploaded file to confirm details

    try {
        const file = await gfs.files.findOne({ _id: req.file.id });
        if (!file) {
            return res.status(404).json({ message: 'File not found in the database' });
        }

        res.status(201).json({ fileId: file._id, filename: file.filename });
    } catch (err) {
        console.error('Error retrieving file metadata:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get All Invoices
router.get('/', async (req, res) => {
    try {
        const files = await gfs.files.find().toArray();
        if (!files || files.length === 0) {
            return res.status(404).json({ message: 'No files found' });
        }
        res.json(files);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get Single Invoice File
router.get('/:id', async (req, res) => {
    try {
        const file = await gfs.files.findOne({ _id: new mongoose.Types.ObjectId(req.params.id) });
        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }
        const readStream = gfs.createReadStream(file.filename);
        readStream.pipe(res);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;




