import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useForm, useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import styles from '../../assets/css/FinancialStatements.module.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const ManualBalanceSheet = () => {
    const {
        register,
        handleSubmit,
        setValue,
        control,
        formState: { errors },
    } = useForm({
        defaultValues: {
            businessId: '',
            periodStart: '',
            periodEnd: '',
            fixedAssetsTangible: '',
            fixedAssetsIntangible: '',
            receivables: '',
            cash: '',
            capital: '',
            supplierDebts: '',
            bankDebts: '',
        },
    });
    const watchBusinessId = useWatch({ control, name: 'businessId', defaultValue: '' });
    const [businesses, setBusinesses] = useState([]);
    const [selectedBusiness, setSelectedBusiness] = useState(null);
    const [balanceSheets, setBalanceSheets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Fetch businesses
    useEffect(() => {
        const fetchBusinesses = async () => {
            try {
                const token = localStorage.getItem('authToken');
                if (!token) {
                    throw new Error('You must be logged in to fetch businesses');
                }

                console.log('Fetching businesses with token:', token);
                const response = await axios.get(`${API_URL}/business/user-businesses`, {
                    headers: { Authorization: `Bearer ${token}` },
                    timeout: 10000,
                });

                const businesses = response.data.businesses || [];
                console.log('Fetched businesses:', businesses.length);
                setBusinesses(businesses);
                if (businesses.length > 0) {
                    setValue('businessId', businesses[0]._id);
                } else {
                    setError('No businesses found.');
                }
            } catch (err) {
                console.error('FetchBusinesses Error:', {
                    message: err.message,
                    response: err.response?.data,
                    status: err.response?.status,
                });
                setError(err.response?.data?.message || 'Error fetching businesses');
            }
        };

        fetchBusinesses();
    }, [setValue]);

    // Update selected business
    useEffect(() => {
        const business = businesses.find((b) => b._id === watchBusinessId);
        console.log('Selected business:', business);
        setSelectedBusiness(business || null);
    }, [watchBusinessId, businesses]);

    // Fetch balance sheets when business changes
    useEffect(() => {
        if (watchBusinessId) {
            const fetchBalanceSheets = async () => {
                try {
                    const token = localStorage.getItem('authToken');
                    if (!token) {
                        throw new Error('Missing token to fetch balance sheets');
                    }

                    console.log('Fetching balance sheets for businessId:', watchBusinessId);
                    const res = await axios.get(`${API_URL}/financial-Statement/list?businessId=${watchBusinessId}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    console.log('Fetched balance sheets:', res.data.length);
                    setBalanceSheets(res.data || []);
                } catch (err) {
                    console.error('FetchBalanceSheets Error:', {
                        message: err.message,
                        response: err.response?.data,
                        status: err.response?.status,
                    });
                    setError(err.response?.data?.message || 'Failed to load balance sheets.');
                }
            };
            fetchBalanceSheets();
        }
    }, [watchBusinessId]);

    const onSubmit = async (data) => {
        if (!validateForm(data)) return;

        try {
            setLoading(true);
            const token = localStorage.getItem('authToken');
            if (!token) {
                setError('You must be logged in.');
                navigate('/auth/login');
                return;
            }

            console.log('Submitting balance sheet with data:', data);
            const payload = {
                businessId: data.businessId,
                periodStart: data.periodStart,
                periodEnd: data.periodEnd,
                fixedAssetsTangible: Number(data.fixedAssetsTangible) || 0,
                fixedAssetsIntangible: Number(data.fixedAssetsIntangible) || 0,
                receivables: Number(data.receivables) || 0,
                cash: Number(data.cash) || 0,
                capital: Number(data.capital) || 0,
                supplierDebts: Number(data.supplierDebts) || 0,
                bankDebts: Number(data.bankDebts) || 0,
            };
            console.log('Sending payload:', payload);
            const res = await axios.post(`${API_URL}/financial-Statement/create`, payload, {
                headers: { Authorization: `Bearer ${token}` },
            });

            console.log('Balance sheet created:', res.data);
            if (res.data.validationErrors?.length > 0) {
                setError(`Balance sheet created with errors: ${res.data.validationErrors.join(', ')}`);
            }

            console.log('Downloading PDF from:', res.data.downloadUrl);
            const downloadRes = await axios.get(res.data.downloadUrl, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(downloadRes.data);
            const a = document.createElement('a');
            a.href = url;
            a.download = `balance-sheet-${data.businessId}-${data.periodStart}.pdf`;
            a.click();
            window.URL.revokeObjectURL(url);

            // Refresh balance sheets
            const refreshRes = await axios.get(`${API_URL}/financial-Statement/list?businessId=${data.businessId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log('Refreshed balance sheets:', refreshRes.data.length);
            setBalanceSheets(refreshRes.data || []);
            setError(''); // Clear any previous errors
        } catch (err) {
            console.error('CreateBalanceSheet Error:', {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status,
            });
            setError(err.response?.data?.error || err.response?.data?.message || 'Failed to create balance sheet.');
        } finally {
            setLoading(false);
        }
    };

    const validateForm = (data) => {
        console.log('Validating form:', data);
        if (!data.businessId) {
            setError('Please select a business.');
            return false;
        }
        if (!data.periodStart || !data.periodEnd) {
            setError('Please select start and end dates.');
            return false;
        }
        if (new Date(data.periodStart) > new Date(data.periodEnd)) {
            setError('Start date cannot be later than end date.');
            return false;
        }
        setError('');
        return true;
    };

    const downloadBalanceSheet = async (balanceSheetId) => {
        try {
            const token = localStorage.getItem('authToken');
            console.log('Downloading balance sheet:', balanceSheetId);
            const res = await axios.get(`${API_URL}/financial-Statement/download/${balanceSheetId}`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(res.data);
            const a = document.createElement('a');
            a.href = url;
            a.download = `balance-sheet-${balanceSheetId}.pdf`;
            a.click();
            window.URL.revokeObjectURL(url);
            console.log('Downloaded balance sheet:', balanceSheetId);
        } catch (err) {
            console.error('DownloadBalanceSheet Error:', {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status,
            });
            setError(err.response?.data?.message || 'Failed to download balance sheet.');
        }
    };

    const deleteBalanceSheet = async (balanceSheetId) => {
        if (!window.confirm('Are you sure you want to delete this balance sheet?')) return;

        try {
            const token = localStorage.getItem('authToken');
            console.log('Deleting balance sheet:', balanceSheetId);
            await axios.delete(`${API_URL}/financial-Statement/${balanceSheetId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setBalanceSheets(balanceSheets.filter((bs) => bs._id !== balanceSheetId));
            console.log('Deleted balance sheet:', balanceSheetId);
        } catch (err) {
            console.error('DeleteBalanceSheet Error:', {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status,
            });
            setError(err.response?.data?.message || 'Failed to delete balance sheet.');
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <h1 className={styles.pageTitle}> Balance Sheet Creation</h1>

                {error && (
                    <div className={`bg-red-100 border border-red-400 text-red-700 p-4 ${styles.errorMessage} mb-6`}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className={styles.formContainer}>
                    <div className={styles.gridContainer}>
                        <div>
                            <label className={styles.inputLabel}>Business</label>
                            <select
                                {...register('businessId', { required: 'This field is required' })}
                                className={styles.inputField}
                            >
                                <option value="">Select a business</option>
                                {businesses.map((biz) => (
                                    <option key={biz._id} value={biz._id}>{biz.name}</option>
                                ))}
                            </select>
                            {errors.businessId && <span className={styles.validationError}>{errors.businessId.message}</span>}
                        </div>

                        <div>
                            <label className={styles.inputLabel}>Start Date</label>
                            <input
                                type="date"
                                {...register('periodStart', { required: 'This field is required' })}
                                className={styles.inputField}
                            />
                            {errors.periodStart && <span className={styles.validationError}>{errors.periodStart.message}</span>}
                        </div>

                        <div>
                            <label className={styles.inputLabel}>End Date</label>
                            <input
                                type="date"
                                {...register('periodEnd', { required: 'This field is required' })}
                                className={styles.inputField}
                            />
                            {errors.periodEnd && <span className={styles.validationError}>{errors.periodEnd.message}</span>}
                        </div>
                    </div>

                    <h2 className={styles.sectionHeading}>Assets</h2>
                    <div className={styles.gridContainer}>
                        <div>
                            <label className={styles.inputLabel}>Tangible Fixed Assets (TND)</label>
                            <input
                                type="number"
                                {...register('fixedAssetsTangible', {
                                    min: { value: 0, message: 'Value cannot be negative' },
                                    step: '0.001'
                                })}
                                className={styles.inputField}
                                min="0"
                                step="0.001"
                            />
                            {errors.fixedAssetsTangible && <span className={styles.validationError}>{errors.fixedAssetsTangible.message}</span>}
                        </div>
                        <div>
                            <label className={styles.inputLabel}>Intangible Fixed Assets (TND)</label>
                            <input
                                type="number"
                                {...register('fixedAssetsIntangible', {
                                    min: { value: 0, message: 'Value cannot be negative' },
                                    step: '0.001'
                                })}
                                className={styles.inputField}
                                min="0"
                                step="0.001"
                            />
                            {errors.fixedAssetsIntangible && <span className={styles.validationError}>{errors.fixedAssetsIntangible.message}</span>}
                        </div>
                        <div>
                            <label className={styles.inputLabel}>Accounts Receivable (TND)</label>
                            <input
                                type="number"
                                {...register('receivables', {
                                    min: { value: 0, message: 'Value cannot be negative' },
                                    step: '0.001'
                                })}
                                className={styles.inputField}
                                min="0"
                                step="0.001"
                            />
                            {errors.receivables && <span className={styles.validationError}>{errors.receivables.message}</span>}
                        </div>
                        <div>
                            <label className={styles.inputLabel}>Cash (TND)</label>
                            <input
                                type="number"
                                {...register('cash', {
                                    min: { value: 0, message: 'Value cannot be negative' },
                                    step: '0.001'
                                })}
                                className={styles.inputField}
                                min="0"
                                step="0.001"
                            />
                            {errors.cash && <span className={styles.validationError}>{errors.cash.message}</span>}
                        </div>
                    </div>

                    <h2 className={styles.sectionHeading}>Liabilities</h2>
                    <div className={`${styles.gridContainer} ${styles.passifGrid}`}>
                        <div>
                            <label className={styles.inputLabel}>Capital (TND)</label>
                            <input
                                type="number"
                                {...register('capital', {
                                    min: { value: 0, message: 'Value cannot be negative' },
                                    step: '0.001'
                                })}
                                className={styles.inputField}
                                min="0"
                                step="0.001"
                            />
                            {errors.capital && <span className={styles.validationError}>{errors.capital.message}</span>}
                        </div>
                        <div>
                            <label className={styles.inputLabel}>Supplier Debts (TND)</label>
                            <input
                                type="number"
                                {...register('supplierDebts', {
                                    min: { value: 0, message: 'Value cannot be negative' },
                                    step: '0.001'
                                })}
                                className={styles.inputField}
                                min="0"
                                step="0.001"
                            />
                            {errors.supplierDebts && <span className={styles.validationError}>{errors.supplierDebts.message}</span>}
                        </div>
                        <div>
                            <label className={styles.inputLabel}>Bank Debts (TND)</label>
                            <input
                                type="number"
                                {...register('bankDebts', {
                                    min: { value: 0, message: 'Value cannot be negative' },
                                    step: '0.001'
                                })}
                                className={styles.inputField}
                                min="0"
                                step="0.001"
                            />
                            {errors.bankDebts && <span className={styles.validationError}>{errors.bankDebts.message}</span>}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={styles.submitButton}
                    >
                        {loading ? 'Creating...' : 'Create Balance Sheet'}
                    </button>
                </form>

                <h2 className={styles.existingBalancesTitle}>Existing Balance Sheets</h2>
                <div className={styles.tableContainer}>
                    <table className={styles.dataTable}>
                        <thead className={styles.tableHeader}>
                        <tr>
                            <th className={styles.tableHeaderCell}>No.</th>
                            <th className={styles.tableHeaderCell}>Period Start</th>
                            <th className={styles.tableHeaderCell}>Period End</th>
                            <th className={styles.tableHeaderCell}>Total Assets (TND)</th>
                            <th className={styles.tableHeaderCell}>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {balanceSheets.length > 0 ? (
                            balanceSheets.map((sheet, idx) => (
                                <tr key={sheet._id} className={styles.tableRow}>
                                    <td className={styles.tableCell}>{idx + 1}</td>
                                    <td className={styles.tableCell}>{new Date(sheet.periodStart).toLocaleDateString('en-US')}</td>
                                    <td className={styles.tableCell}>{new Date(sheet.periodEnd).toLocaleDateString('en-US')}</td>
                                    <td className={styles.tableCell}>{sheet.assets.totalAssets.toFixed(3)}</td>
                                    <td className={styles.tableCell}>
                                        <div className={styles.actionButtonsContainer}>
                                            <button
                                                onClick={() => downloadBalanceSheet(sheet._id)}
                                                className={`${styles.actionButton} ${styles.downloadButton}`}
                                            >
                                                Download
                                            </button>
                                            <button
                                                onClick={() => deleteBalanceSheet(sheet._id)}
                                                className={`${styles.actionButton} ${styles.deleteButton}`}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className={styles.emptyMessage}>
                                    No balance sheets found.
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ManualBalanceSheet;