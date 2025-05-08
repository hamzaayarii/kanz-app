const Expense = require('../models/Expense');
const DailyRevenue = require('../models/DailyRevenue');

// Get calendar data for a specific month/year
exports.getCalendarData = async (req, res) => {
    try {
        const { businessId, month, year } = req.query;
        
        if (!businessId) {
            return res.status(400).json({ message: 'Business ID is required' });
        }

        // Convert month/year to Date objects for query
        // Note: month is 0-indexed in JavaScript Date (0 = January, 11 = December)
        const parsedMonth = parseInt(month, 10);
        const parsedYear = parseInt(year, 10);
        
        if (isNaN(parsedMonth) || isNaN(parsedYear)) {
            return res.status(400).json({ message: 'Invalid month or year' });
        }

        const startDate = new Date(parsedYear, parsedMonth, 1);
        const endDate = new Date(parsedYear, parsedMonth + 1, 0);

        // Fetch expenses for the month
        const expenses = await Expense.find({
            business: businessId,
            date: { $gte: startDate, $lte: endDate }
        });

        // Fetch daily revenues for the month
        const revenues = await DailyRevenue.find({
            business: businessId,
            date: { $gte: startDate, $lte: endDate }
        });

        // Process data for calendar format
        const calendarData = {};
        
        // Process expenses
        expenses.forEach(expense => {
            const dateStr = expense.date.toISOString().split('T')[0]; // Format: YYYY-MM-DD
            
            if (!calendarData[dateStr]) {
                calendarData[dateStr] = {
                    expenses: 0,
                    revenue: 0
                };
            }
            
            calendarData[dateStr].expenses += expense.amount;
        });
        
        // Process revenues
        revenues.forEach(revenue => {
            const dateStr = revenue.date.toISOString().split('T')[0]; // Format: YYYY-MM-DD
            
            if (!calendarData[dateStr]) {
                calendarData[dateStr] = {
                    expenses: 0,
                    revenue: 0
                };
            }
            
            // Add totalRevenue from the summary
            calendarData[dateStr].revenue += revenue.summary.totalRevenue;
        });

        res.json(calendarData);
    } catch (error) {
        console.error('Error fetching calendar data:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get detailed data for a specific date
exports.getDayDetails = async (req, res) => {
  try {
    const { businessId, date } = req.query;
    
    if (!businessId || !date) {
      return res.status(400).json({
        message: 'Business ID and date are required'
      });
    }
    
    // Parse the date string and create start/end dates for the full day
    const parsedDate = new Date(date);
    const startOfDay = new Date(parsedDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(parsedDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    // Fetch expenses for the day
    const expenses = await Expense.find({
      business: businessId,
      date: { $gte: startOfDay, $lte: endOfDay }
    }).populate('category');
    
    // Fetch daily revenue for the day
    const revenue = await DailyRevenue.findOne({
      business: businessId,
      date: { $gte: startOfDay, $lte: endOfDay }
    });
    
    res.json({
      date: parsedDate,
      expenses,
      revenue
    });
  } catch (error) {
    console.error('Error fetching day details:', error);
    res.status(500).json({ message: 'Server error' });
  }
};