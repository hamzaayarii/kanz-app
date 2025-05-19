import React, { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';
import { Camera, X, Check, RotateCcw, FileText, Loader } from 'lucide-react';

const ReceiptScanner = ({ onDataExtracted, onClose }) => {
  const [captureMode, setCaptureMode] = useState(true);
  const [imgSrc, setImgSrc] = useState(null);
  const [extractedData, setExtractedData] = useState({
    date: '',
    amount: '',
    tax: '',
    vendor: '',
    reference: '',
    description: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const webcamRef = useRef(null);

  const videoConstraints = {
    width: 720,
    height: 720,
    facingMode: "environment"
  };

  // Capture image from webcam
  const captureImage = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      setImgSrc(imageSrc);
      setCaptureMode(false);
      processImage(imageSrc);
    }
  }, [webcamRef]);

  // Process the captured image with OCR
  const processImage = async (imageSrc) => {
    setIsProcessing(true);
    setError(null);
    
    try {
      // Convert base64 image to blob for upload
      const base64Data = imageSrc.replace(/^data:image\/\w+;base64,/, '');
      const blob = await fetch(`data:image/jpeg;base64,${base64Data}`).then(res => res.blob());
      
      // Create form data for API request
      const formData = new FormData();
      formData.append('receipt', blob, 'receipt.jpg');
      
      // Send to backend for OCR processing
      const response = await axios.post('http://localhost:5000/api/receipts/scan', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data && response.data.success) {
        setExtractedData(response.data.extractedFields);
      } else {
        setError('Failed to extract data from the image. Please try again or enter data manually.');
      }
    } catch (err) {
      console.error('Error processing receipt:', err);
      setError('Error processing image. Please try again or enter data manually.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Return to capture mode
  const retakeImage = () => {
    setImgSrc(null);
    setCaptureMode(true);
    setExtractedData({
      date: '',
      amount: '',
      tax: '',
      vendor: '',
      reference: '',
      description: ''
    });
    setError(null);
  };

  // Submit the extracted data to parent component
  const confirmData = () => {
    onDataExtracted(extractedData);
  };

  // Handle manual edits to extracted data
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setExtractedData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Receipt Scanner</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        {captureMode ? (
          <div className="flex flex-col items-center">
            <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden mb-4">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Position the receipt or invoice clearly in the frame and ensure good lighting
            </p>
            <button
              onClick={captureImage}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center"
            >
              <Camera size={18} className="mr-2" />
              Capture Image
            </button>
          </div>
        ) : (
          <div className="flex flex-col">
            {isProcessing ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader size={48} className="text-blue-600 animate-spin mb-4" />
                <p className="text-gray-600">Processing receipt...</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <img 
                      src={imgSrc} 
                      alt="Captured receipt" 
                      className="w-full h-48 object-cover border rounded-lg"
                    />
                  </div>
                  <div className="flex flex-col justify-center">
                    {error ? (
                      <div className="text-red-500 text-sm mb-2">{error}</div>
                    ) : (
                      <div className="flex items-center mb-2 text-green-600">
                        <FileText size={20} className="mr-2" />
                        <span>Data extracted successfully</span>
                      </div>
                    )}
                    <p className="text-sm text-gray-600">
                      Review and correct the extracted information before confirming
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Date</label>
                      <input
                        type="date"
                        name="date"
                        value={extractedData.date}
                        onChange={handleInputChange}
                        className="w-full border rounded-md px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Amount</label>
                      <input
                        type="text"
                        name="amount"
                        value={extractedData.amount}
                        onChange={handleInputChange}
                        className="w-full border rounded-md px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Tax</label>
                      <input
                        type="text"
                        name="tax"
                        value={extractedData.tax}
                        onChange={handleInputChange}
                        className="w-full border rounded-md px-3 py-2"
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Vendor</label>
                      <input
                        type="text"
                        name="vendor"
                        value={extractedData.vendor}
                        onChange={handleInputChange}
                        className="w-full border rounded-md px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Reference/Invoice #</label>
                      <input
                        type="text"
                        name="reference"
                        value={extractedData.reference}
                        onChange={handleInputChange}
                        className="w-full border rounded-md px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <input
                        type="text"
                        name="description"
                        value={extractedData.description}
                        onChange={handleInputChange}
                        className="w-full border rounded-md px-3 py-2"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={retakeImage}
                    className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700"
                  >
                    <RotateCcw size={18} className="mr-2" />
                    Retake
                  </button>
                  <button
                    onClick={confirmData}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg"
                  >
                    <Check size={18} className="mr-2" />
                    Use This Data
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceiptScanner;