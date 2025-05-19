import axios from 'axios';

// Business types in Tunisia
export const BUSINESS_TYPES = {
  SARL: 'SARL',
  SUARL: 'SUARL',
  SA: 'SA',
  SAS: 'SAS',
  INDIVIDUAL: 'Individual',
  FREELANCE: 'Freelance',
};

// Sample tax deadline data
// In a production environment, this would be fetched from a backend API
const TAX_DEADLINES = [
  {
    id: 1,
    title: 'Monthly VAT Declaration',
    description: 'Submit monthly Value Added Tax (TVA) declaration',
    dueDate: (year, month) => new Date(year, month, 28), // Due on the 28th of each month
    applicableBusinessTypes: [BUSINESS_TYPES.SARL, BUSINESS_TYPES.SUARL, BUSINESS_TYPES.SA, BUSINESS_TYPES.SAS],
    category: 'vat',
    priority: 'high',
    penalties: 'Late filing incurs a 1.25% penalty per month',
  },
  {
    id: 2,
    title: 'Quarterly Income Tax Advance',
    description: 'Pay quarterly advance on corporate income tax',
    dueDate: (year, month) => {
      // Due on the 28th of March, June, September, and December
      if (month === 2 || month === 5 || month === 8 || month === 11) {
        return new Date(year, month, 28);
      }
      return null;
    },
    applicableBusinessTypes: [BUSINESS_TYPES.SARL, BUSINESS_TYPES.SUARL, BUSINESS_TYPES.SA, BUSINESS_TYPES.SAS],
    category: 'income',
    priority: 'high',
    penalties: 'Late payment incurs a 0.75% penalty per month',
  },
  {
    id: 3,
    title: 'Annual Corporate Tax Declaration',
    description: 'Submit annual corporate tax declaration for the previous year',
    dueDate: (year) => new Date(year, 2, 25), // March 25th each year
    applicableBusinessTypes: [BUSINESS_TYPES.SARL, BUSINESS_TYPES.SUARL, BUSINESS_TYPES.SA, BUSINESS_TYPES.SAS],
    category: 'corporate',
    priority: 'critical',
    penalties: 'Late filing incurs a 1.25% penalty per month plus potential audit',
  },
  {
    id: 4,
    title: 'Personal Income Tax Declaration',
    description: 'Submit annual personal income tax declaration',
    dueDate: (year) => new Date(year, 4, 25), // May 25th each year
    applicableBusinessTypes: [BUSINESS_TYPES.INDIVIDUAL, BUSINESS_TYPES.FREELANCE],
    category: 'personal',
    priority: 'high',
    penalties: 'Late filing incurs a 0.5% penalty per month',
  },
  {
    id: 5,
    title: 'Social Security Contributions',
    description: 'Pay quarterly social security contributions',
    dueDate: (year, month) => {
      // Due on the 15th of Jan, Apr, Jul, Oct
      if (month === 0 || month === 3 || month === 6 || month === 9) {
        return new Date(year, month, 15);
      }
      return null;
    },
    applicableBusinessTypes: Object.values(BUSINESS_TYPES),
    category: 'social',
    priority: 'medium',
    penalties: 'Late payment incurs a 3% penalty',
  },
];

class TaxDeadlineService {
  // Get all tax deadlines
  getAllDeadlines() {
    return TAX_DEADLINES;
  }

  // Get deadlines for a specific business type
  getDeadlinesForBusinessType(businessType) {
    return TAX_DEADLINES.filter(deadline => 
      deadline.applicableBusinessTypes.includes(businessType)
    );
  }

  // Get upcoming deadlines for the next n days for a specific business type
  getUpcomingDeadlines(businessType, days = 30) {
    const applicableDeadlines = this.getDeadlinesForBusinessType(businessType);
    const today = new Date();
    const endDate = new Date();
    endDate.setDate(today.getDate() + days);
    
    const year = today.getFullYear();
    const currentMonth = today.getMonth();
    
    const upcomingDeadlines = [];
    
    // Check deadlines for the current month and next two months
    for (let monthOffset = 0; monthOffset < 3; monthOffset++) {
      const checkMonth = (currentMonth + monthOffset) % 12;
      const checkYear = year + Math.floor((currentMonth + monthOffset) / 12);
      
      applicableDeadlines.forEach(deadline => {
        let dueDate;
        
        if (deadline.dueDate.length === 1) {
          // Annual deadline
          dueDate = deadline.dueDate(checkYear);
        } else {
          // Monthly or quarterly deadline
          dueDate = deadline.dueDate(checkYear, checkMonth);
        }
        
        if (dueDate && dueDate >= today && dueDate <= endDate) {
          upcomingDeadlines.push({
            ...deadline,
            dueDate,
          });
        }
      });
    }
    
    // Sort by due date
    return upcomingDeadlines.sort((a, b) => a.dueDate - b.dueDate);
  }

  // Convert tax deadlines to calendar events
  convertToEvents(deadlines) {
    return deadlines.map(deadline => ({
      id: `tax-${deadline.id}`,
      title: deadline.title,
      start: deadline.dueDate,
      end: deadline.dueDate,
      allDay: true,
      resource: {
        type: 'tax',
        priority: deadline.priority,
        category: deadline.category,
        description: deadline.description,
        penalties: deadline.penalties
      }
    }));
  }

  // In a real implementation, this would make an API call
  async refreshDeadlinesFromServer() {
    try {
      // Simulating an API call
      return Promise.resolve(TAX_DEADLINES);
    } catch (error) {
      console.error('Error fetching tax deadlines:', error);
      return [];
    }
  }
}

export default new TaxDeadlineService();
