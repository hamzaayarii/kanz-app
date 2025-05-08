import React from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import { format } from 'date-fns';
import moment from 'moment';
import { useCalendar } from '../../context/CalendarContext';
import DayDetailsModal from '../../components/calendar/DayDetailsModal';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './FinancialCalendarPage.css';

// Date validation utility (defined outside component)
const isValidDate = (date) => {
  return date instanceof Date && !isNaN(date.getTime());
};

// Set up the localizer for react-big-calendar
const localizer = momentLocalizer(moment);

const FinancialCalendarPage = () => {
  const {
    calendarData = {},
    currentDate: contextDate,
    selectedDate,
    dayDetails,
    isLoading,
    error,
    handleDateSelect,
    navigateMonth
  } = useCalendar();

  // Ensure we always have a valid date
  const currentDate = isValidDate(contextDate) ? contextDate : new Date();

  // State for modal visibility
  const [modalOpen, setModalOpen] = React.useState(false);

  // Custom day cell renderer with date validation
  const dayPropGetter = (date) => {
    if (!isValidDate(date)) return {};
    
    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayData = calendarData[dateStr];

      if (!dayData) return {};

      const net = dayData.revenue - dayData.expenses;
      let className = '';
      
      if (net > 0) className = 'financial-day-profit';
      else if (net < 0) className = 'financial-day-loss';
      else if (dayData.revenue > 0 || dayData.expenses > 0) className = 'financial-day-neutral';

      return { className };
    } catch (e) {
      console.error('Date formatting error:', e);
      return {};
    }
  };

  // Custom day cell content renderer with date validation
  const dayContentRenderer = ({ date }) => {
    if (!isValidDate(date)) {
      return <div className="day-number">-</div>;
    }

    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayData = calendarData[dateStr];

      return (
        <div className="financial-day-content">
          <div className="day-number">{date.getDate()}</div>
          {dayData?.revenue > 0 && (
            <div className="revenue-indicator">+${dayData.revenue.toFixed(2)}</div>
          )}
          {dayData?.expenses > 0 && (
            <div className="expense-indicator">-${dayData.expenses.toFixed(2)}</div>
          )}
          {dayData && (
            <div className={`net-amount ${dayData.revenue - dayData.expenses >= 0 ? 'positive' : 'negative'}`}>
              Net: ${(dayData.revenue - dayData.expenses).toFixed(2)}
            </div>
          )}
        </div>
      );
    } catch (e) {
      console.error('Date rendering error:', e);
      return <div className="day-number">{date.getDate()}</div>;
    }
  };

  // Handle cell selection
  const handleSelectSlot = ({ start }) => {
    if (isValidDate(start)) {
      handleDateSelect(start);
      setModalOpen(true);
    }
  };

  return (
    <div className="financial-calendar-container">
      <h1>Financial Calendar</h1>
      
      <div className="calendar-navigation">
        <button 
          onClick={() => navigateMonth(-1)}
          className="nav-button"
          disabled={isLoading}
        >
          Previous Month
        </button>
        <h2>{isValidDate(currentDate) ? format(currentDate, 'MMMM yyyy') : 'Loading...'}</h2>
        <button 
          onClick={() => navigateMonth(1)}
          className="nav-button"
          disabled={isLoading}
        >
          Next Month
        </button>
      </div>

      {isLoading && <div className="loading-spinner">Loading calendar data...</div>}
      
      {error && <div className="error-message">{error}</div>}

      <div className="calendar-legend">
        <div className="legend-item">
          <div className="legend-color profit"></div>
          <span>Profit</span>
        </div>
        <div className="legend-item">
          <div className="legend-color loss"></div>
          <span>Loss</span>
        </div>
        <div className="legend-item">
          <div className="legend-color neutral"></div>
          <span>Break-even</span>
        </div>
      </div>

      <Calendar
        localizer={localizer}
        events={[]}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 700 }}
        dayPropGetter={dayPropGetter}
        onSelectSlot={handleSelectSlot}
        selectable={true}
        components={{
          month: {
            dateHeader: ({ date }) => dayContentRenderer({ date })
          }
        }}
        date={currentDate}
        defaultDate={currentDate}
        defaultView="month"
      />

      {selectedDate && isValidDate(selectedDate) && (
        <DayDetailsModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          date={selectedDate}
          details={dayDetails}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

export default FinancialCalendarPage;