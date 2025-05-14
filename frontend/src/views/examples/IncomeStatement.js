import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useForm, useWatch, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardBody,
  FormGroup,
  Form,
  Input,
  Container,
  Row,
  Col,
  Button,
  Label,
  Alert,
  Table,
  Badge,
  FormFeedback
} from 'reactstrap';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const IncomeStatement = () => {
  // Direct state for numeric values
  const [salesRevenue, setSalesRevenue] = useState(0);
  const [otherRevenue, setOtherRevenue] = useState(0);
  const [costOfGoodsSold, setCostOfGoodsSold] = useState(0);
  const [salaries, setSalaries] = useState(0);
  const [rent, setRent] = useState(0);
  const [utilities, setUtilities] = useState(0);
  const [marketing, setMarketing] = useState(0);
  const [otherExpenses, setOtherExpenses] = useState(0);
  const [taxes, setTaxes] = useState(0);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      businessId: '',
      periodStart: '',
      periodEnd: '',
    },
  });
  
  const watchBusinessId = useWatch({ control, name: 'businessId', defaultValue: '' });
  const [businesses, setBusinesses] = useState([]);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [incomeStatements, setIncomeStatements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();
  const [owners, setOwners] = useState([]);
  const [selectedOwner, setSelectedOwner] = useState('');
  const [isAccountant, setIsAccountant] = useState(false);

  // Detect user role from localStorage
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setIsAccountant(user.role === 'accountant');
    }
  }, []);

  // Fetch business owners for accountants
  useEffect(() => {
    if (!isAccountant) return;
    const fetchOwners = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const res = await axios.get('http://localhost:5000/api/users/assigned-business-owners', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOwners(res.data || []);
      } catch (err) {
        setError('Failed to load business owners.');
      }
    };
    fetchOwners();
  }, [isAccountant]);

  // Fetch businesses (for business owner or for selected owner if accountant)
  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) throw new Error('You must be logged in to fetch businesses');
        let url = '';
        if (isAccountant && selectedOwner) {
          url = `http://localhost:5000/api/business/getUserBusinessesByAccountant?ownerId=${selectedOwner}`;
        } else if (!isAccountant) {
          url = 'http://localhost:5000/api/business/user-businesses';
        } else {
          setBusinesses([]);
          return;
        }
        const response = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
        const businessesResponse = Array.isArray(response.data) ? response.data : (response.data.businesses || []);
        setBusinesses(businessesResponse);
        if (businessesResponse.length > 0) {
          setValue('businessId', businessesResponse[0]._id);
          setError(''); // Clear error if businesses are found
        } else {
          setError(''); // Ensure error is cleared if it was previously set for other reasons
        }
      } catch (err) {
        setError(''); // For now, clearing all errors if fetch fails or returns no businesses
        setBusinesses([]); // Clear businesses on error or if none found
      }
    };

    if (isAccountant && !selectedOwner) {
      setBusinesses([]);
      setValue('businessId', ''); // Clear businessId in form
      setSelectedBusiness(null); // Clear detailed selected business object
      setError(''); // Explicitly clear error when no owner is selected by accountant
      return;
    }

    if ((isAccountant && selectedOwner) || !isAccountant) {
      fetchBusinesses();
    }
  }, [isAccountant, selectedOwner, setValue]);

  // Update selected business
  useEffect(() => {
    const business = businesses.find((b) => b._id === watchBusinessId);
    setSelectedBusiness(business || null);
  }, [watchBusinessId, businesses]);

  // Fetch income statements when business changes
  useEffect(() => {
    if (watchBusinessId) {
      const fetchIncomeStatements = async () => {
        try {
          const token = localStorage.getItem('authToken');
          if (!token) {
            throw new Error('Missing token to fetch income statements');
          }

          const res = await axios.get(`${API_URL}/income-statement/list?businessId=${watchBusinessId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setIncomeStatements(res.data || []);
        } catch (err) {
          setError(err.response?.data?.message || 'Failed to load income statements.');
        }
      };
      fetchIncomeStatements();
    }
  }, [watchBusinessId]);

  const onSubmit = async (data) => {
    console.log('Form submission started with:', data);
    setError('');
    setSuccessMessage('');
    
    if (!validateForm(data)) {
      console.log('Form validation failed');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('You must be logged in.');
        navigate('/auth/login');
        return;
      }

      // Format dates to ISO string format for proper API processing
      const formattedStartDate = data.periodStart ? new Date(data.periodStart + 'T00:00:00').toISOString() : null;
      const formattedEndDate = data.periodEnd ? new Date(data.periodEnd + 'T23:59:59').toISOString() : null;
      
      if (!formattedStartDate || !formattedEndDate) {
        setError('Invalid date format. Please select valid dates.');
        setLoading(false);
        return;
      }

      // Use the state variables directly for the numeric values
      const payload = {
        businessId: data.businessId,
        periodStart: formattedStartDate,
        periodEnd: formattedEndDate,
        revenue: {
          sales: Number(salesRevenue),
          otherRevenue: Number(otherRevenue),
        },
        expenses: {
          costOfGoodsSold: Number(costOfGoodsSold),
          salaries: Number(salaries),
          rent: Number(rent),
          utilities: Number(utilities),
          marketing: Number(marketing),
          otherExpenses: Number(otherExpenses),
        },
        taxes: Number(taxes),
      };

      console.log('State values:', {
        salesRevenue,
        otherRevenue,
        costOfGoodsSold,
        salaries,
        rent,
        utilities,
        marketing,
        otherExpenses,
        taxes
      });
      console.log('Sending payload:', payload);

      try {
        const res = await axios.post(`${API_URL}/income-statement/create`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        console.log('API response:', res.data);

        if (res.data.validationErrors?.length > 0) {
          setError(`Income statement created with errors: ${res.data.validationErrors.join(', ')}`);
        } else {
          setSuccessMessage('Income statement created successfully!');
          setError('');
        }

        // Download PDF
        try {
          const downloadRes = await axios.get(res.data.downloadUrl, {
            headers: { Authorization: `Bearer ${token}` },
            responseType: 'blob',
          });
          const url = window.URL.createObjectURL(downloadRes.data);
          const a = document.createElement('a');
          a.href = url;
          a.download = `income-statement-${data.businessId}-${new Date().toISOString()}.pdf`;
          a.click();
          window.URL.revokeObjectURL(url);
        } catch (downloadErr) {
          console.error('Error downloading PDF:', downloadErr);
          setError('Income statement was created but could not be downloaded.');
        }

        // Refresh income statements list
        try {
          const refreshRes = await axios.get(`${API_URL}/income-statement/list?businessId=${data.businessId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setIncomeStatements(refreshRes.data || []);
        } catch (refreshErr) {
          console.error('Error refreshing income statements list:', refreshErr);
        }

        // Reset form values
        setValue('revenue.sales', '');
        setValue('revenue.otherRevenue', '');
        setValue('expenses.costOfGoodsSold', '');
        setValue('expenses.salaries', '');
        setValue('expenses.rent', '');
        setValue('expenses.utilities', '');
        setValue('expenses.marketing', '');
        setValue('expenses.otherExpenses', '');
        setValue('taxes', '');
      } catch (apiErr) {
        console.error('API Error:', apiErr);
        const errorMsg = apiErr.response?.data?.error || 
                         apiErr.response?.data?.message ||
                         apiErr.response?.data?.errors?.[0]?.msg ||
                         'Failed to create income statement.';
        setError(errorMsg);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (data) => {
    console.log('Validating form data:', data);
    
    if (!data.businessId) {
      setError('Please select a business.');
      return false;
    }
    if (!data.periodStart) {
      setError('Please select a start date.');
      return false;
    }
    if (!data.periodEnd) {
      setError('Please select an end date.');
      return false;
    }
    
    try {
      const startDate = new Date(data.periodStart);
      const endDate = new Date(data.periodEnd);
      
      // Check if dates are valid
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        setError('Invalid date format. Please select dates from the calendar.');
        return false;
      }
      
      if (startDate > endDate) {
        setError('Start date cannot be later than end date.');
        return false;
      }
    } catch (err) {
      console.error('Date validation error:', err);
      setError('There was an error validating the dates. Please try again.');
      return false;
    }
    
    setError('');
    return true;
  };

  const downloadIncomeStatement = async (id) => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await axios.get(`${API_URL}/income-statement/download/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `income-statement-${id}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to download income statement.');
    }
  };

  const deleteIncomeStatement = async (id) => {
    if (!window.confirm('Are you sure you want to delete this income statement?')) return;

    try {
      const token = localStorage.getItem('authToken');
      await axios.delete(`${API_URL}/income-statement/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIncomeStatements(incomeStatements.filter((is) => is._id !== id));
      setSuccessMessage('Income statement deleted successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete income statement.');
    }
  };

  // Format date string
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Format currency
  const formatCurrency = (value) => {
    return parseFloat(value).toFixed(3) + ' TND';
  };

  return (
    <>
      <Container className="mt-4" fluid>
        <Row>
          <Col className="order-xl-1 mb-5 mb-xl-0" xl="12">
            <Card className="bg-secondary shadow">
              <CardHeader className="bg-white border-0">
                <Row className="align-items-center">
                  <Col xs="8">
                    <h3 className="mb-0">Income Statement Generator</h3>
                  </Col>
                </Row>
              </CardHeader>
              <CardBody>
                {error && (
                  <Alert color="danger" toggle={() => setError('')}>
                    {error}
                  </Alert>
                )}
                {successMessage && (
                  <Alert color="success" toggle={() => setSuccessMessage('')}>
                    {successMessage}
                  </Alert>
                )}
                <Form onSubmit={handleSubmit(onSubmit)}>
                  <h6 className="heading-small text-muted mb-4">Business Information</h6>
                  <div className="pl-lg-4">
                    {isAccountant && (
                      <Row>
                        <Col lg="6">
                          <FormGroup>
                            <Label for="ownerId">Select Business Owner</Label>
                            <Input
                              type="select"
                              id="ownerId"
                              value={selectedOwner}
                              onChange={e => setSelectedOwner(e.target.value)}
                            >
                              <option value="">-- Select Owner --</option>
                              {owners.map(owner => (
                                <option key={owner._id} value={owner._id}>
                                  {owner.fullName || owner.email}
                                </option>
                              ))}
                            </Input>
                          </FormGroup>
                        </Col>
                      </Row>
                    )}
                    <Row>
                      <Col lg="6">
                        <FormGroup>
                          <Label for="businessId">Select Business</Label>
                          <Input
                            type="select"
                            id="businessId"
                            {...register('businessId', { required: true })}
                            invalid={!!errors.businessId}
                          >
                            {businesses.map((business) => (
                              <option key={business._id} value={business._id}>
                                {business.name}
                              </option>
                            ))}
                          </Input>
                          {errors.businessId && <FormFeedback>Please select a business</FormFeedback>}
                        </FormGroup>
                      </Col>
                    </Row>
                    <Row>
                      <Col lg="6">
                        <FormGroup>
                          <Label for="periodStart">Period Start</Label>
                          <Controller
                            name="periodStart"
                            control={control}
                            rules={{ required: "Start date is required" }}
                            render={({ field, fieldState: { error } }) => (
                              <>
                                <Input
                                  type="date"
                                  id="periodStart"
                                  {...field}
                                  invalid={!!error}
                                  onChange={(e) => {
                                    field.onChange(e.target.value);
                                    console.log('Period start changed:', e.target.value);
                                  }}
                                />
                                {error && <FormFeedback>{error.message}</FormFeedback>}
                              </>
                            )}
                          />
                        </FormGroup>
                      </Col>
                      <Col lg="6">
                        <FormGroup>
                          <Label for="periodEnd">Period End</Label>
                          <Controller
                            name="periodEnd"
                            control={control}
                            rules={{ required: "End date is required" }}
                            render={({ field, fieldState: { error } }) => (
                              <>
                                <Input
                                  type="date"
                                  id="periodEnd"
                                  {...field}
                                  invalid={!!error}
                                  onChange={(e) => {
                                    field.onChange(e.target.value);
                                    console.log('Period end changed:', e.target.value);
                                  }}
                                />
                                {error && <FormFeedback>{error.message}</FormFeedback>}
                              </>
                            )}
                          />
                        </FormGroup>
                      </Col>
                    </Row>
                  </div>
                  <hr className="my-4" />
                  <h6 className="heading-small text-muted mb-4">Revenue</h6>
                  <div className="pl-lg-4">
                    <Row>
                      <Col lg="6">
                        <FormGroup>
                          <Label for="sales">Sales Revenue (TND)</Label>
                          <Input
                            type="number"
                            id="sales"
                            placeholder="0.00"
                            step="0.001"
                            min="0"
                            value={salesRevenue}
                            onChange={(e) => setSalesRevenue(e.target.value)}
                          />
                        </FormGroup>
                      </Col>
                      <Col lg="6">
                        <FormGroup>
                          <Label for="otherRevenue">Other Revenue (TND)</Label>
                          <Input
                            type="number"
                            id="otherRevenue"
                            placeholder="0.00"
                            step="0.001"
                            min="0"
                            value={otherRevenue}
                            onChange={(e) => setOtherRevenue(e.target.value)}
                          />
                        </FormGroup>
                      </Col>
                    </Row>
                  </div>
                  <hr className="my-4" />
                  <h6 className="heading-small text-muted mb-4">Expenses</h6>
                  <div className="pl-lg-4">
                    <Row>
                      <Col lg="6">
                        <FormGroup>
                          <Label for="costOfGoodsSold">Cost of Goods Sold (TND)</Label>
                          <Input
                            type="number"
                            id="costOfGoodsSold"
                            placeholder="0.00"
                            step="0.001"
                            min="0"
                            value={costOfGoodsSold}
                            onChange={(e) => setCostOfGoodsSold(e.target.value)}
                          />
                        </FormGroup>
                      </Col>
                      <Col lg="6">
                        <FormGroup>
                          <Label for="salaries">Salaries (TND)</Label>
                          <Input
                            type="number"
                            id="salaries"
                            placeholder="0.00"
                            step="0.001"
                            min="0"
                            value={salaries}
                            onChange={(e) => setSalaries(e.target.value)}
                          />
                        </FormGroup>
                      </Col>
                    </Row>
                    <Row>
                      <Col lg="6">
                        <FormGroup>
                          <Label for="rent">Rent (TND)</Label>
                          <Input
                            type="number"
                            id="rent"
                            placeholder="0.00"
                            step="0.001"
                            min="0"
                            value={rent}
                            onChange={(e) => setRent(e.target.value)}
                          />
                        </FormGroup>
                      </Col>
                      <Col lg="6">
                        <FormGroup>
                          <Label for="utilities">Utilities (TND)</Label>
                          <Input
                            type="number"
                            id="utilities"
                            placeholder="0.00"
                            step="0.001"
                            min="0"
                            value={utilities}
                            onChange={(e) => setUtilities(e.target.value)}
                          />
                        </FormGroup>
                      </Col>
                    </Row>
                    <Row>
                      <Col lg="6">
                        <FormGroup>
                          <Label for="marketing">Marketing (TND)</Label>
                          <Input
                            type="number"
                            id="marketing"
                            placeholder="0.00"
                            step="0.001"
                            min="0"
                            value={marketing}
                            onChange={(e) => setMarketing(e.target.value)}
                          />
                        </FormGroup>
                      </Col>
                      <Col lg="6">
                        <FormGroup>
                          <Label for="otherExpenses">Other Expenses (TND)</Label>
                          <Input
                            type="number"
                            id="otherExpenses"
                            placeholder="0.00"
                            step="0.001"
                            min="0"
                            value={otherExpenses}
                            onChange={(e) => setOtherExpenses(e.target.value)}
                          />
                        </FormGroup>
                      </Col>
                    </Row>
                  </div>
                  <hr className="my-4" />
                  <h6 className="heading-small text-muted mb-4">Taxes</h6>
                  <div className="pl-lg-4">
                    <Row>
                      <Col lg="6">
                        <FormGroup>
                          <Label for="taxes">Taxes (TND)</Label>
                          <Input
                            type="number"
                            id="taxes"
                            placeholder="0.00"
                            step="0.001"
                            min="0"
                            value={taxes}
                            onChange={(e) => setTaxes(e.target.value)}
                          />
                        </FormGroup>
                      </Col>
                    </Row>
                  </div>
                  <div className="pl-lg-4">
                    <Row>
                      <Col>
                        <Button
                          className="my-4"
                          color="primary"
                          type="submit"
                          disabled={loading || isSubmitting}
                        >
                          {loading ? 'Creating...' : 'Generate Income Statement'}
                        </Button>
                      </Col>
                    </Row>
                  </div>
                </Form>
              </CardBody>
            </Card>
          </Col>
        </Row>

        <Row className="mt-4">
          <Col xl="12">
            <Card className="shadow">
              <CardHeader className="border-0">
                <Row className="align-items-center">
                  <div className="col">
                    <h3 className="mb-0">Income Statement Records</h3>
                  </div>
                </Row>
              </CardHeader>
              <Table className="align-items-center table-flush" responsive>
                <thead className="thead-light">
                  <tr>
                    <th scope="col">Period</th>
                    <th scope="col">Total Revenue</th>
                    <th scope="col">Net Income</th>
                    <th scope="col">Created Date</th>
                    <th scope="col">Status</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {incomeStatements.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center">
                        No income statements found
                      </td>
                    </tr>
                  ) : (
                    incomeStatements.map((statement) => (
                      <tr key={statement._id}>
                        <td>
                          {formatDate(statement.periodStart)} - {formatDate(statement.periodEnd)}
                        </td>
                        <td>{formatCurrency(statement.revenue.totalRevenue)}</td>
                        <td>{formatCurrency(statement.netIncome)}</td>
                        <td>{formatDate(statement.createdAt)}</td>
                        <td>
                          {statement.validationErrors?.length > 0 ? (
                            <Badge color="warning">With Warnings</Badge>
                          ) : (
                            <Badge color="success">Valid</Badge>
                          )}
                        </td>
                        <td>
                          <Button
                            color="info"
                            size="sm"
                            onClick={() => downloadIncomeStatement(statement._id)}
                          >
                            Download
                          </Button>
                          <Button
                            color="danger"
                            size="sm"
                            className="ml-2"
                            onClick={() => deleteIncomeStatement(statement._id)}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default IncomeStatement; 