import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import { format, isSameDay } from 'date-fns';
import moment from 'moment';
import { useCalendar } from '../../context/CalendarContext';
import DayDetailsModal from '../../components/calendar/DayDetailsModal';
import BusinessTypeSelector from '../../components/calendar/BusinessTypeSelector';
import TaxDeadlinesPanel from '../../components/calendar/TaxDeadlinesPanel';
import TaxAlertModal from '../../components/calendar/TaxAlertModal';
import TaxDeadlineService, { BUSINESS_TYPES } from '../../services/TaxDeadlineService';
import {
    Container,
    Row,
    Col,
    Card,
    CardHeader,
    CardBody,
    Button,
    ButtonGroup,
    Nav,
    NavItem,
    NavLink,
    Alert
} from 'reactstrap';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './FinancialCalendarPage.css';

// Date validation utility
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

  // State for tax deadlines
  const [businessType, setBusinessType] = useState(BUSINESS_TYPES.SARL);
  const [taxDeadlines, setTaxDeadlines] = useState([]);
  const [taxEvents, setTaxEvents] = useState([]);
  const [activeTab, setActiveTab] = useState('financial');
  const [showTaxDeadlineAlert, setShowTaxDeadlineAlert] = useState(false);
  const [criticalDeadlines, setCriticalDeadlines] = useState([]);
  const [selectedTaxDeadline, setSelectedTaxDeadline] = useState(null);
  const [taxAlertModalOpen, setTaxAlertModalOpen] = useState(false);

  // State for modals
  const [dayModalOpen, setDayModalOpen] = useState(false);
  
  // Handle business type change
  const handleBusinessTypeChange = (newType) => {
    setBusinessType(newType);
  };

  // Load tax deadlines based on business type
  useEffect(() => {
    const loadTaxDeadlines = async () => {
      await TaxDeadlineService.refreshDeadlinesFromServer();
      
      // Get upcoming deadlines for the next 90 days
      const deadlines = TaxDeadlineService.getUpcomingDeadlines(businessType, 90);
      setTaxDeadlines(deadlines);
      
      // Convert to calendar events
      const events = TaxDeadlineService.convertToEvents(deadlines);
      setTaxEvents(events);
      
      // Check for critical deadlines
      const critical = deadlines.filter(d => 
        d.priority === 'critical' || 
        (d.priority === 'high' && getDaysRemaining(d.dueDate) <= 7)
      );
      
      setCriticalDeadlines(critical);
      
      // Show alert if there are critical deadlines
      if (critical.length > 0) {
        setShowTaxDeadlineAlert(true);
        setSelectedTaxDeadline(critical[0]);
      }
    };
    
    loadTaxDeadlines();
  }, [businessType]);

  // Get days remaining until a date
  const getDaysRemaining = (date) => {
    const today = new Date();
    const diffTime = date - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Custom day cell renderer
  const dayPropGetter = (date) => {
    if (!isValidDate(date)) return {};
    
    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayData = calendarData[dateStr];
      
      // Check if there's a tax deadline on this day
      const hasTaxDeadline = taxEvents.some(event => 
        isValidDate(event.start) && isSameDay(event.start, date)
      );
      
      let className = '';
      
      // Financial data styling
      if (dayData) {
        const net = dayData.revenue - dayData.expenses;
        if (net > 0) className += ' financial-day-profit';
        else if (net < 0) className += ' financial-day-loss';
        else if (dayData.revenue > 0 || dayData.expenses > 0) className += ' financial-day-neutral';
      }
      
      // Tax deadline styling
      if (hasTaxDeadline) {
        const deadline = taxEvents.find(event => 
          isValidDate(event.start) && isSameDay(event.start, date)
        );
        
        if (deadline && deadline.resource) {
          if (deadline.resource.priority === 'critical') {
            className += ' tax-deadline-critical';
          } else if (deadline.resource.priority === 'high') {
            className += ' tax-deadline-high';
          } else {
            className += ' tax-deadline-normal';
          }
        }
      }
      
      return { className };
    } catch (e) {
      console.error('Date formatting error:', e);
      return {};
    }
  };

  // Custom day cell content renderer
  const dayContentRenderer = ({ date }) => {
    if (!isValidDate(date)) {
      return <div className="day-number">-</div>;
    }

    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayData = calendarData[dateStr];
      
      // Check for tax deadlines
      const taxDeadlinesForDay = taxEvents.filter(event => 
        isValidDate(event.start) && isSameDay(event.start, date)
      );
      
      const hasTaxDeadline = taxDeadlinesForDay.length > 0;

      return (
        <div className="financial-day-content">
          <div className="day-number">{date.getDate()}</div>
          
          {hasTaxDeadline && (
            <div className="tax-indicator">
              {taxDeadlinesForDay.map((event, idx) => (
                <div 
                  key={idx}
                  className={`tax-deadline-dot priority-${event.resource.priority}`}
                  title={event.title}
                ></div>
              ))}
            </div>
          )}
          
          {dayData?.revenue > 0 && (
            <div className="revenue-indicator">+${dayData.revenue.toFixed(0)}</div>
          )}
          {dayData?.expenses > 0 && (
            <div className="expense-indicator">-${dayData.expenses.toFixed(0)}</div>
          )}
          {dayData && dayData.revenue - dayData.expenses !== 0 && (
            <div className={`net-amount ${dayData.revenue - dayData.expenses >= 0 ? 'positive' : 'negative'}`}>
              Net: ${Math.abs(dayData.revenue - dayData.expenses).toFixed(0)}
            </div>
          )}
        </div>
      );
    } catch (e) {
      console.error('Date rendering error:', e);
      return <div className="day-number">{date.getDate()}</div>;
    }
  };

  // Handle calendar cell selection
  const handleSelectSlot = ({ start }) => {
    if (isValidDate(start)) {
      handleDateSelect(start);
      
      // Find tax deadlines for the selected day
      const taxDeadlinesForDay = taxDeadlines.filter(deadline => 
        isValidDate(deadline.dueDate) && isSameDay(deadline.dueDate, start)
      );
      
      // Open the day details modal
      setDayModalOpen(true);
    }
  };

  // Handle calendar event selection
  const handleSelectEvent = (event) => {
    if (event.resource && event.resource.type === 'tax') {
      // Find the corresponding tax deadline
      const deadline = taxDeadlines.find(d => `tax-${d.id}` === event.id);
      if (deadline) {
        setSelectedTaxDeadline(deadline);
        setTaxAlertModalOpen(true);
      }
    }
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Get tax deadlines for a specific day
  const getTaxDeadlinesForDay = (date) => {
    if (!isValidDate(date)) return [];
    
    return taxDeadlines.filter(deadline => 
      isValidDate(deadline.dueDate) && isSameDay(deadline.dueDate, date)
    );
  };

  // Combine financial events and tax events
  const allEvents = [...taxEvents]; // Add financial events if needed

  return (
    <Container className="mt-4 mb-5" fluid>
      {showTaxDeadlineAlert && criticalDeadlines.length > 0 && (
        <Alert 
          color="danger" 
          className="tax-alert"
          toggle={() => setShowTaxDeadlineAlert(false)}
        >
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <strong>Important Tax Deadline Alert!</strong> You have {criticalDeadlines.length} critical tax deadline(s) coming up.
            </div>
            <Button 
              color="danger" 
              outline 
              size="sm"
              onClick={() => {
                setSelectedTaxDeadline(criticalDeadlines[0]);
                setTaxAlertModalOpen(true);
              }}
            >
              View Details
            </Button>
          </div>
        </Alert>
      )}

      <Row>
        <Col md="9">
          <Card className="shadow main-calendar-card">
            <CardHeader className="border-0">
              <Row className="align-items-center justify-content-between">
                <Col xs="auto">
                  <h3 className="mb-0">Financial & Tax Calendar</h3>
                </Col>
                <Col xs="auto">
                  <Nav tabs className="calendar-nav-tabs">
                    <NavItem>
                      <NavLink
                        className={activeTab === 'financial' ? 'active' : ''}
                        onClick={() => handleTabChange('financial')}
                      >
                        Financial View
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        className={activeTab === 'tax' ? 'active' : ''}
                        onClick={() => handleTabChange('tax')}
                      >
                        Tax Deadlines
                      </NavLink>
                    </NavItem>
                  </Nav>
                </Col>
              </Row>
            </CardHeader>
            <CardBody>
              <Row className="mb-4 align-items-center justify-content-between">
                <Col xs="auto">
                  <ButtonGroup>
                    <Button 
                      outline
                      color="primary"
                      size="sm"
                      onClick={() => navigateMonth(-1)}
                      disabled={isLoading}
                    >
                      <i className="fas fa-chevron-left mr-1"></i> Previous
                    </Button>
                    <Button 
                      outline
                      color="primary"
                      size="sm"
                      onClick={() => navigateMonth(1)}
                      disabled={isLoading}
                    >
                      Next <i className="fas fa-chevron-right ml-1"></i>
                    </Button>
                  </ButtonGroup>
                </Col>
                <Col xs="auto" className="text-center">
                  <h4 className="mb-0 current-month">
                    {isValidDate(currentDate) ? format(currentDate, 'MMMM yyyy') : 'Loading...'}
                  </h4>
                </Col>
                <Col xs="auto">
                  <Button 
                    color="primary" 
                    size="sm"
                    onClick={() => {
                      const today = new Date();
                      handleDateSelect(today);
                      navigateMonth(0, today); // Reset to current month
                    }}
                  >
                    Today
                  </Button>
                </Col>
              </Row>

              {isLoading && !error && (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="sr-only">Loading...</span>
                  </div>
                  <p className="mt-2">Loading calendar data...</p>
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
                    <div className="legend-item">
                      <div className="legend-color tax-critical"></div>
                      <span>Critical Tax Deadline</span>
                    </div>
                    <div className="legend-item">
                      <div className="legend-color tax-high"></div>
                      <span>High Priority Tax</span>
                    </div>
                  </div>

                  <Calendar
                    localizer={localizer}
                    events={allEvents}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: 700 }}
                    dayPropGetter={dayPropGetter}
                    onSelectSlot={handleSelectSlot}
                    onSelectEvent={handleSelectEvent}
                    selectable={true}
                    components={{
                      month: {
                        dateHeader: ({ date }) => dayContentRenderer({ date })
                      }
                    }}
                    date={currentDate}
                    onNavigate={(date) => {
                      if (isValidDate(date)) {
                        navigateMonth(0, date);
                      }
                    }}
                    defaultDate={currentDate}
                    defaultView="month"
                    popup={true}
                    eventPropGetter={(event) => {
                      if (event.resource && event.resource.type === 'tax') {
                        const priorityColors = {
                          critical: '#dc3545',
                          high: '#fd7e14',
                          medium: '#007bff',
                          low: '#28a745'
                        };
                        
                        return {
                          style: {
                            backgroundColor: priorityColors[event.resource.priority] || '#6c757d',
                            borderRadius: '3px',
                            opacity: 0.8,
                            color: 'white',
                            border: '0px',
                            display: 'block'
                          }
                        };
                      }
                      return {};
                    }}
                  />
                </>
              )}
            </CardBody>
          </Card>
        </Col>
        
        <Col md="3">
          <BusinessTypeSelector
            selectedType={businessType}
            onChange={handleBusinessTypeChange}
          />
          
          <TaxDeadlinesPanel deadlines={taxDeadlines} />
        </Col>
      </Row>

      {/* Day Details Modal */}
      {selectedDate && isValidDate(selectedDate) && (
        <DayDetailsModal
          isOpen={dayModalOpen}
          onClose={() => setDayModalOpen(false)}
          date={selectedDate}
          details={dayDetails}
          isLoading={isLoading}
          taxDeadlines={getTaxDeadlinesForDay(selectedDate)}
        />
      )}
      
      {/* Tax Alert Modal */}
      {selectedTaxDeadline && (
        <TaxAlertModal
          isOpen={taxAlertModalOpen}
          toggle={() => setTaxAlertModalOpen(!taxAlertModalOpen)}
          deadline={selectedTaxDeadline}
        />
      )}
    </Container>
  );
};

export default FinancialCalendarPage;