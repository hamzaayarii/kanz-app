import React from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import { format } from 'date-fns';
import moment from 'moment';
import { useCalendar } from '../../context/CalendarContext';
import DayDetailsModal from '../../components/calendar/DayDetailsModal';
import {
    Container,
    Row,
    Col,
    Card,
    CardHeader,
    CardBody,
    Button
} from 'reactstrap';
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
            <div className="revenue-indicator">+{dayData.revenue.toFixed(2)}</div>
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
    <Container className="mt-4" fluid>
      <Row>
        <Col>
          <Card className="shadow">
            <CardHeader className="border-0">
              <Row className="align-items-center justify-content-between">
                <Col xs="auto">
                  <h3 className="mb-0">Financial Calendar</h3>
                </Col>
                <Col xs="auto">
                  <Row className="align-items-center">
                    <Col xs="auto">
                      <Button 
                        outline
                        color="primary"
                        size="sm"
                        onClick={() => navigateMonth(-1)}
                        disabled={isLoading}
                      >
                        Previous Month
                      </Button>
                    </Col>
                    <Col xs="auto" className="text-center">
                      <h4 className="mb-0">{isValidDate(currentDate) ? format(currentDate, 'MMMM yyyy') : 'Loading...'}</h4>
                    </Col>
                    <Col xs="auto">
                      <Button 
                        outline
                        color="primary"
                        size="sm"
                        onClick={() => navigateMonth(1)}
                        disabled={isLoading}
                      >
                        Next Month
                      </Button>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </CardHeader>
            <CardBody>
              {isLoading && !error && (
                <div className="text-center py-5">
                  <p>Loading calendar data...</p>
                </div>
              )}
              
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              {!isLoading && !error && (
                <>
                  <div className="calendar-legend mb-3">
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
                </>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>

      {selectedDate && isValidDate(selectedDate) && (
        <DayDetailsModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          date={selectedDate}
          details={dayDetails}
          isLoading={isLoading}
        />
      )}
    </Container>
  );
};

export default FinancialCalendarPage;