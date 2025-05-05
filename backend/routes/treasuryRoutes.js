const { authenticate, authorizeBusinessOwner} = require('../middlewares/authMiddleware');
const express = require("express");
const {calculateTreasuryForDate, getTreasuriesByBusiness, deleteTreasuryById, downloadTreasury} = require("../controllers/treasuryController");

const router = express.Router();

router.post('/:businessId', authenticate, calculateTreasuryForDate);
router.get('/', authenticate, getTreasuriesByBusiness);
router.delete('/:id', authenticate, deleteTreasuryById);
router.get('/download/:id', downloadTreasury);


module.exports = router;
