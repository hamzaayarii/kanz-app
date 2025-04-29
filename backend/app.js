const anomalyDetectionRoutes = require('./routes/anomalyDetectionRoutes');

// ... existing code ...

// Add this line where other routes are registered
app.use('/api/anomalies', anomalyDetectionRoutes);

// ... existing code ... 