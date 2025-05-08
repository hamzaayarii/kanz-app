import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

// Register the components needed for the chart
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const RevenuePrediction = () => {
  const [expenses, setExpenses] = useState(1000);
  const [month, setMonth] = useState(1);
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [predictedRevenue, setPredictedRevenue] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [historicalData, setHistoricalData] = useState([2000, 2500, 3000, 2800, 3200, 3500, 3800, 4000, 4200]); // Example historical data
  const [predictionData, setPredictionData] = useState([]); // Predicted data to be added when you click "Predict"

  const fetchPrediction = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Sending request to Flask API');
      const response = await axios.post('http://127.0.0.1:5005/predict', {
        expenses: Number(expenses),
        month: Number(month),
        day_of_week: Number(dayOfWeek)
      });

      console.log('Response received:', response.data);
      setPredictedRevenue(response.data.predicted_revenue);
      setPredictionData([...predictionData, response.data.predicted_revenue]); // Add prediction to data
    } catch (error) {
      console.error('Error fetching prediction:', error);
      setError('Failed to get prediction. Please make sure the Flask server is running.');
      if (error.response) {
        console.error('Error status:', error.response.status);
        console.error('Error data:', error.response.data);
      }
    } finally {
      setLoading(false);
    }
  };

  // Add input handlers
  const handleExpensesChange = (e) => {
    setExpenses(e.target.value);
  };

  const handleMonthChange = (e) => {
    setMonth(e.target.value);
  };

  const handleDayOfWeekChange = (e) => {
    setDayOfWeek(e.target.value);
  };

  // Button handler instead of automatic prediction
  const handleSubmit = (e) => {
    e.preventDefault();
    fetchPrediction();
  };

  // Chart data
  const chartData = {
    labels: Array.from({ length: historicalData.length + predictionData.length }, (_, i) => `Year ${i + 1}`), // Dynamic labels
    datasets: [
      {
        label: 'Historical Revenue',
        data: historicalData,
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
      {
        label: 'Predicted Revenue',
        data: predictionData,
        fill: false,
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1,
      },
    ],
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Revenue Prediction</h1>
      
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block mb-2">Expenses ($)</label>
            <input
              type="number"
              value={expenses}
              onChange={handleExpensesChange}
              className="w-full p-2 border rounded"
              min="0"
            />
          </div>
          
          <div>
            <label className="block mb-2">Month (1-12)</label>
            <select
              value={month}
              onChange={handleMonthChange}
              className="w-full p-2 border rounded"
            >
              {[...Array(12)].map((_, i) => (
                <option key={i+1} value={i+1}>{i+1}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block mb-2">Day of Week (0-6)</label>
            <select
              value={dayOfWeek}
              onChange={handleDayOfWeekChange}
              className="w-full p-2 border rounded"
            >
              <option value="0">Sunday (0)</option>
              <option value="1">Monday (1)</option>
              <option value="2">Tuesday (2)</option>
              <option value="3">Wednesday (3)</option>
              <option value="4">Thursday (4)</option>
              <option value="5">Friday (5)</option>
              <option value="6">Saturday (6)</option>
            </select>
          </div>
        </div>
        
        <button 
          type="submit" 
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? 'Predicting...' : 'Predict Revenue'}
        </button>
      </form>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {predictedRevenue !== null && !error && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Predicted Revenue: ${parseFloat(predictedRevenue).toFixed(2)}</p>
        </div>
      )}
      
      <div className="overflow-x-auto mb-6">
        <Line data={chartData} />
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border">Expenses ($)</th>
              <th className="py-2 px-4 border">Month</th>
              <th className="py-2 px-4 border">Day of Week</th>
              <th className="py-2 px-4 border">Predicted Revenue ($)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="py-2 px-4 border">{expenses}</td>
              <td className="py-2 px-4 border">{month}</td>
              <td className="py-2 px-4 border">{dayOfWeek}</td>
              <td className="py-2 px-4 border">
                {predictedRevenue !== null 
                  ? `$${parseFloat(predictedRevenue).toFixed(2)}` 
                  : 'Not yet predicted'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RevenuePrediction;
