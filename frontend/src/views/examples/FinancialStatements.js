import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useForm, useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styles from '../../assets/css/FinancialStatements.module.css';
import { useTTS } from '../../components/TTS/TTSContext';
import HoverSpeakText from '../../components/TTS/HoverSpeakText';
import TTSButton from '../../components/TTS/TTSButton';

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
    const { isTTSEnabled } = useTTS();

    // Fetch businesses
    useEffect(() => {
        const fetchBusinesses = async () => {
            try {
                const token = localStorage.getItem('authToken');
                if (!token) {
                    throw new Error('You must be logged in to fetch businesses.');
                }

                const response = await axios.get(`${API_URL}/business/user-businesses`, {
                    headers: { Authorization: `Bearer ${token}` },
                    timeout: 10000,
                });

                const businesses = response.data.businesses || [];
                setBusinesses(businesses);
                if (businesses.length > 0) {
                    setValue('businessId', businesses[0]._id);
                } else {
                    toast.error(<HoverSpeakText>No businesses found.</HoverSpeakText>);
                }
            } catch (err) {
                console.error('FetchBusinesses Error:', {
                    message: err.message,
                    response: err.response?.data,
                    status: err.response?.status,
                });
                toast.error(<HoverSpeakText>{err.response?.data?.message || 'Error fetching businesses.'}</HoverSpeakText>);
            }
        };

        fetchBusinesses();
    }, [setValue]);

    // Update selected business
    useEffect(() => {
        const business = businesses.find((b) => b._id === watchBusinessId);
        setSelectedBusiness(business || null);
    }, [watchBusinessId, businesses]);

    // Fetch balance sheets when business changes
    useEffect(() => {
        if (watchBusinessId) {
            const fetchBalanceSheets = async () => {
                try {
                    const token = localStorage.getItem('authToken');
                    if (!token) {
                        throw new Error('Missing token to fetch balance sheets.');
                    }

                    const res = await axios.get(`${API_URL}/financial-Statement/list?businessId=${watchBusinessId}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    setBalanceSheets(res.data || []);
                } catch (err) {
                    console.error('FetchBalanceSheets Error:', {
                        message: err.message,
                        response: err.response?.data,
                        status: err.response?.status,
                    });
                    toast.error(<HoverSpeakText>{err.response?.data?.message || 'Failed to load balance sheets.'}</HoverSpeakText>);
                }
            };
            fetchBalanceSheets();
        }
    }, [watchBusinessId]);

    // Enhanced AI analysis function with improved math parity
    const analyzeBalanceSheet = (data) => {
        const recommendations = [];

        // Validate numeric inputs
        const fields = [
            'fixedAssetsTangible',
            'fixedAssetsIntangible',
            'receivables',
            'cash',
            'capital',
            'supplierDebts',
            'bankDebts',
        ];
        for (const field of fields) {
            if (isNaN(Number(data[field])) || data[field] === '') {
                recommendations.push(`Error: The value of ${field} must be a valid number.`);
                return { recommendations, result: { status: 'Lose', message: 'Error: Invalid numeric data.' } };
            }
        }

        // Calculate totals
        const totalAssets =
            Number(data.fixedAssetsTangible || 0) +
            Number(data.fixedAssetsIntangible || 0) +
            Number(data.receivables || 0) +
            Number(data.cash || 0);
        const totalLiabilities = Number(data.supplierDebts || 0) + Number(data.bankDebts || 0);
        const totalEquity = Number(data.capital || 0);
        const balanceCheck = totalAssets - (totalLiabilities + totalEquity);

        // Initialize analysis result
        let result = { status: '', message: '' };

        // Check if balance sheet is balanced (more lenient tolerance)
        const isBalanced = Math.abs(balanceCheck) <= 0.1;
        if (!isBalanced) {
            recommendations.push(
                `Warning: The balance sheet is not balanced. Assets (${totalAssets.toFixed(2)}) ≠ Liabilities (${totalLiabilities.toFixed(2)}) + Equity (${totalEquity.toFixed(2)}).`
            );
        }

        // Check debt levels
        const debtToEquityRatio = totalEquity === 0 ? Infinity : totalLiabilities / totalEquity;
        if (debtToEquityRatio > 1.5) {
            recommendations.push('High debt-to-equity ratio. Reduce supplier or bank debts.');
        } else if (totalEquity === 0 && totalLiabilities > 0) {
            recommendations.push('No equity detected. This may indicate financial risk.');
        }

        // Check liquidity
        const liquidityRatio = totalLiabilities === 0 ? Infinity : Number(data.cash || 0) / totalLiabilities;
        if (liquidityRatio < 0.5 && totalLiabilities > 0) {
            recommendations.push('Low liquidity ratio. Increase cash reserves.');
        } else if (liquidityRatio === Infinity && totalLiabilities === 0) {
            recommendations.push('No liabilities detected. Verify if this is correct.');
        }

        // Determine Win/Lose/Egality
        if (
            isBalanced &&
            (debtToEquityRatio <= 1.5 || totalLiabilities === 0) &&
            (liquidityRatio >= 0.8 || totalLiabilities === 0)
        ) {
            result = {
                status: 'Win',
                message: 'Success: Your balance sheet is healthy and balanced!',
            };
        } else if (!isBalanced || debtToEquityRatio > 2 || (liquidityRatio < 0.5 && totalLiabilities > 0)) {
            result = {
                status: 'Lose',
                message: 'Failed: Your balance sheet presents financial risks. Review recommendations.',
            };
        } else {
            result = {
                status: 'Egality',
                message: 'Stable: Your balance sheet is stable but can be improved.',
            };
        }

        // Display recommendations as a single toast if any
        if (recommendations.length > 0) {
            toast.warn(
                <div>
                    <strong><HoverSpeakText>Recommendations:</HoverSpeakText></strong>
                    <ul>
                        {recommendations.map((rec, idx) => (
                            <li key={idx}><HoverSpeakText>{rec}</HoverSpeakText></li>
                        ))}
                    </ul>
                </div>,
                { autoClose: 7000 }
            );
        }

        return { recommendations, result };
    };

    // Optional: Integration with xAI Grok 3 API for advanced analysis
    const analyzeWithGrokAPI = async (data) => {
        try {
            const token = localStorage.getItem('authToken');
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

            // Simulated response
            return ['AI Analysis: Ensure compliance with accounting standards. Consult a financial advisor for high debt levels.'];
        } catch (err) {
            console.error('Grok API Error:', err);
            return ['AI analysis failed.'];
        }
    };

    const onSubmit = async (data) => {
        if (!validateForm(data)) return;

        try {
            setLoading(true);
            const token = localStorage.getItem('authToken');
            if (!token) {
                toast.error(<HoverSpeakText>You must be logged in.</HoverSpeakText>);
                navigate('/auth/login');
                return;
            }

            // Run simple AI analysis
            const { recommendations, result } = analyzeBalanceSheet(data);
            if (result.status === 'Win') {
                toast.success(<HoverSpeakText>{result.message}</HoverSpeakText>, { autoClose: 7000 });
            } else if (result.status === 'Lose') {
                toast.error(<HoverSpeakText>{result.message}</HoverSpeakText>, { autoClose: 7000 });
            } else {
                toast.info(<HoverSpeakText>{result.message}</HoverSpeakText>, { autoClose: 7000 });
            }

            // Optional: Run Grok API analysis
            const grokRecommendations = await analyzeWithGrokAPI(data);
            if (grokRecommendations.length > 0) {
                toast.info(
                    <div>
                        <strong><HoverSpeakText>AI Analysis:</HoverSpeakText></strong>
                        <ul>
                            {grokRecommendations.map((rec, idx) => (
                                <li key={idx}><HoverSpeakText>{rec}</HoverSpeakText></li>
                            ))}
                        </ul>
                    </div>,
                    { autoClose: 7000 }
                );
            }

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

            const res = await axios.post(`${API_URL}/financial-Statement/create`, payload, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.data.validationErrors?.length > 0) {
                toast.error(<HoverSpeakText>{`Balance sheet created with errors: ${res.data.validationErrors.join(', ')}`}</HoverSpeakText>, { autoClose: 7000 });
            } else {
                toast.success(<HoverSpeakText>Balance sheet created successfully!</HoverSpeakText>, { autoClose: 7000 });
            }

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
            setBalanceSheets(refreshRes.data || []);
        } catch (err) {
            console.error('CreateBalanceSheet Error:', {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status,
            });
            toast.error(<HoverSpeakText>{err.response?.data?.message || 'Failed to create balance sheet.'}</HoverSpeakText>, { autoClose: 7000 });
        } finally {
            setLoading(false);
        }
    };

    const validateForm = (data) => {
        if (!data.businessId) {
            toast.error(<HoverSpeakText>Please select a business.</HoverSpeakText>);
            return false;
        }
        if (!data.periodStart || !data.periodEnd) {
            toast.error(<HoverSpeakText>Please select start and end dates.</HoverSpeakText>);
            return false;
        }
        if (new Date(data.periodStart) > new Date(data.periodEnd)) {
            toast.error(<HoverSpeakText>Start date cannot be later than end date.</HoverSpeakText>);
            return false;
        }
        return true;
    };

    const downloadBalanceSheet = async (balanceSheetId) => {
        try {
            const token = localStorage.getItem('authToken');
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
            toast.success(<HoverSpeakText>Balance sheet downloaded successfully!</HoverSpeakText>, { autoClose: 7000 });
        } catch (err) {
            console.error('DownloadBalanceSheet Error:', {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status,
            });
            toast.error(<HoverSpeakText>{err.response?.data?.message || 'Failed to download balance sheet.'}</HoverSpeakText>, { autoClose: 7000 });
        }
    };

    const deleteBalanceSheet = async (balanceSheetId) => {
        if (!window.confirm(<HoverSpeakText>Are you sure you want to delete this balance sheet?</HoverSpeakText>)) return;

        try {
            const token = localStorage.getItem('authToken');
            await axios.delete(`${API_URL}/financial-Statement/${balanceSheetId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setBalanceSheets(balanceSheets.filter((bs) => bs._id !== balanceSheetId));
            toast.success(<HoverSpeakText>Balance sheet deleted successfully!</HoverSpeakText>, { autoClose: 7000 });
        } catch (err) {
            console.error('DeleteBalanceSheet Error:', {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status,
            });
            toast.error(<HoverSpeakText>{err.response?.data?.message || 'Failed to delete balance sheet.'}</HoverSpeakText>, { autoClose: 7000 });
        }
    };

    return (
        <div className={styles.container} id="balance-sheet-container">
            <ToastContainer position="top-right" autoClose={7000} hideProgressBar={false} />
            <div className={styles.content}>
                <h1 className={styles.pageTitle}>
                    <HoverSpeakText>Balance Sheet Creation</HoverSpeakText>
                    {isTTSEnabled && (
                        <TTSButton
                            elementId="balance-sheet-container"
                            className="ml-2"
                            size="sm"
                            label="Read all balance sheet creation information"
                        />
                    )}
                </h1>

                <form onSubmit={handleSubmit(onSubmit)} className={styles.formContainer}>
                    <div className={styles.gridContainer}>
                        <div>
                            <HoverSpeakText textToSpeak="Select a business">
                                <label className={styles.inputLabel}>Business</label>
                            </HoverSpeakText>
                            <select
                                {...register('businessId', { required: 'This field is required' })}
                                className={styles.inputField}
                                aria-label="Select a business"
                            >
                                <option value="">Select a business</option>
                                {businesses.map((biz) => (
                                    <option key={biz._id} value={biz._id}>{biz.name}</option>
                                ))}
                            </select>
                            {errors.businessId && (
                                <span className={styles.validationError}>
                                    <HoverSpeakText>{errors.businessId.message}</HoverSpeakText>
                                </span>
                            )}
                        </div>

                        <div>
                            <HoverSpeakText textToSpeak="Start Date">
                                <label className={styles.inputLabel}>Start Date</label>
                            </HoverSpeakText>
                            <input
                                type="date"
                                {...register('periodStart', { required: 'This field is required' })}
                                className={styles.inputField}
                                aria-label="Start Date"
                            />
                            {errors.periodStart && (
                                <span className={styles.validationError}>
                                    <HoverSpeakText>{errors.periodStart.message}</HoverSpeakText>
                                </span>
                            )}
                        </div>

                        <div>
                            <HoverSpeakText textToSpeak="End Date">
                                <label className={styles.inputLabel}>End Date</label>
                            </HoverSpeakText>
                            <input
                                type="date"
                                {...register('periodEnd', { required: 'This field is required' })}
                                className={styles.inputField}
                                aria-label="End Date"
                            />
                            {errors.periodEnd && (
                                <span className={styles.validationError}>
                                    <HoverSpeakText>{errors.periodEnd.message}</HoverSpeakText>
                                </span>
                            )}
                        </div>
                    </div>

                    <h2 className={styles.sectionHeading}>
                        <HoverSpeakText>Assets</HoverSpeakText>
                        <TTSButton
                            text="This section contains all asset fields for the balance sheet"
                            className="ml-2"
                            size="sm"
                        />
                    </h2>
                    <div className={styles.gridContainer}>
                        <div>
                            <HoverSpeakText textToSpeak="Tangible Fixed Assets in TND">
                                <label className={styles.inputLabel}>Tangible Fixed Assets (TND)</label>
                            </HoverSpeakText>
                            <input
                                type="number"
                                {...register('fixedAssetsTangible', {
                                    min: { value: 0, message: 'Value cannot be negative' },
                                    step: '0.001',
                                    required: 'This field is required',
                                })}
                                className={styles.inputField}
                                min="0"
                                step="0.001"
                                aria-label="Tangible Fixed Assets in TND"
                            />
                            {errors.fixedAssetsTangible && (
                                <span className={styles.validationError}>
                                    <HoverSpeakText>{errors.fixedAssetsTangible.message}</HoverSpeakText>
                                </span>
                            )}
                        </div>
                        <div>
                            <HoverSpeakText textToSpeak="Intangible Fixed Assets in TND">
                                <label className={styles.inputLabel}>Intangible Fixed Assets (TND)</label>
                            </HoverSpeakText>
                            <input
                                type="number"
                                {...register('fixedAssetsIntangible', {
                                    min: { value: 0, message: 'Value cannot be negative' },
                                    step: '0.001',
                                    required: 'This field is required',
                                })}
                                className={styles.inputField}
                                min="0"
                                step="0.001"
                                aria-label="Intangible Fixed Assets in TND"
                            />
                            {errors.fixedAssetsIntangible && (
                                <span className={styles.validationError}>
                                    <HoverSpeakText>{errors.fixedAssetsIntangible.message}</HoverSpeakText>
                                </span>
                            )}
                        </div>
                        <div>
                            <HoverSpeakText textToSpeak="Receivables in TND">
                                <label className={styles.inputLabel}>Receivables (TND)</label>
                            </HoverSpeakText>
                            <input
                                type="number"
                                {...register('receivables', {
                                    min: { value: 0, message: 'Value cannot be negative' },
                                    step: '0.001',
                                    required: 'This field is required',
                                })}
                                className={styles.inputField}
                                min="0"
                                step="0.001"
                                aria-label="Receivables in TND"
                            />
                            {errors.receivables && (
                                <span className={styles.validationError}>
                                    <HoverSpeakText>{errors.receivables.message}</HoverSpeakText>
                                </span>
                            )}
                        </div>
                        <div>
                            <HoverSpeakText textToSpeak="Cash in TND">
                                <label className={styles.inputLabel}>Cash (TND)</label>
                            </HoverSpeakText>
                            <input
                                type="number"
                                {...register('cash', {
                                    min: { value: 0, message: 'Value cannot be negative' },
                                    step: '0.001',
                                    required: 'This field is required',
                                })}
                                className={styles.inputField}
                                min="0"
                                step="0.001"
                                aria-label="Cash in TND"
                            />
                            {errors.cash && (
                                <span className={styles.validationError}>
                                    <HoverSpeakText>{errors.cash.message}</HoverSpeakText>
                                </span>
                            )}
                        </div>
                    </div>

                    <h2 className={styles.sectionHeading}>
                        <HoverSpeakText>Liabilities</HoverSpeakText>
                        <TTSButton
                            text="This section contains all liability fields for the balance sheet"
                            className="ml-2"
                            size="sm"
                        />
                    </h2>
                    <div className={`${styles.gridContainer} ${styles.passifGrid}`}>
                        <div>
                            <HoverSpeakText textToSpeak="Capital in TND">
                                <label className={styles.inputLabel}>Capital (TND)</label>
                            </HoverSpeakText>
                            <input
                                type="number"
                                {...register('capital', {
                                    min: { value: 0, message: 'Value cannot be negative' },
                                    step: '0.001',
                                    required: 'This field is required',
                                })}
                                className={styles.inputField}
                                min="0"
                                step="0.001"
                                aria-label="Capital in TND"
                            />
                            {errors.capital && (
                                <span className={styles.validationError}>
                                    <HoverSpeakText>{errors.capital.message}</HoverSpeakText>
                                </span>
                            )}
                        </div>
                        <div>
                            <HoverSpeakText textToSpeak="Supplier Debts in TND">
                                <label className={styles.inputLabel}>Supplier Debts (TND)</label>
                            </HoverSpeakText>
                            <input
                                type="number"
                                {...register('supplierDebts', {
                                    min: { value: 0, message: 'Value cannot be negative' },
                                    step: '0.001',
                                    required: 'This field is required',
                                })}
                                className={styles.inputField}
                                min="0"
                                step="0.001"
                                aria-label="Supplier Debts in TND"
                            />
                            {errors.supplierDebts && (
                                <span className={styles.validationError}>
                                    <HoverSpeakText>{errors.supplierDebts.message}</HoverSpeakText>
                                </span>
                            )}
                        </div>
                        <div>
                            <HoverSpeakText textToSpeak="Bank Debts in TND">
                                <label className={styles.inputLabel}>Bank Debts (TND)</label>
                            </HoverSpeakText>
                            <input
                                type="number"
                                {...register('bankDebts', {
                                    min: { value: 0, message: 'Value cannot be negative' },
                                    step: '0.001',
                                    required: 'This field is required',
                                })}
                                className={styles.inputField}
                                min="0"
                                step="0.001"
                                aria-label="Bank Debts in TND"
                            />
                            {errors.bankDebts && (
                                <span className={styles.validationError}>
                                    <HoverSpeakText>{errors.bankDebts.message}</HoverSpeakText>
                                </span>
                            )}
                        </div>
                    </div>

                    <HoverSpeakText textToSpeak="Create Balance Sheet">
                        <button
                            type="submit"
                            disabled={loading}
                            className={styles.submitButton}
                            aria-label="Create Balance Sheet"
                        >
                            {loading ? 'Creating...' : 'Create Balance Sheet'}
                        </button>
                    </HoverSpeakText>
                </form>

                <h2 className={styles.existingBalancesTitle}>
                    <HoverSpeakText>Existing Balance Sheets</HoverSpeakText>
                    <TTSButton
                        text="This section lists all existing balance sheets"
                        className="ml-2"
                        size="sm"
                    />
                </h2>
                <div className={styles.tableContainer} id="balance-sheets-table">
                    <table className={styles.dataTable}>
                        <thead className={styles.tableHeader}>
                        <tr>
                            <th className={styles.tableHeaderCell}>
                                <HoverSpeakText>No.</HoverSpeakText>
                            </th>
                            <th className={styles.tableHeaderCell}>
                                <HoverSpeakText>Period Start</HoverSpeakText>
                            </th>
                            <th className={styles.tableHeaderCell}>
                                <HoverSpeakText>Period End</HoverSpeakText>
                            </th>
                            <th className={styles.tableHeaderCell}>
                                <HoverSpeakText>Total Assets in TND</HoverSpeakText>
                            </th>
                            <th className={styles.tableHeaderCell}>
                                <HoverSpeakText>Actions</HoverSpeakText>
                            </th>
                        </tr>
                        </thead>
                        <tbody>
                        {balanceSheets.length > 0 ? (
                            balanceSheets.map((sheet, idx) => (
                                <tr key={sheet._id} className={styles.tableRow}>
                                    <td className={styles.tableCell}>
                                        <HoverSpeakText>{idx + 1}</HoverSpeakText>
                                    </td>
                                    <td className={styles.tableCell}>
                                        <HoverSpeakText>{new Date(sheet.periodStart).toLocaleDateString('en-US')}</HoverSpeakText>
                                    </td>
                                    <td className={styles.tableCell}>
                                        <HoverSpeakText>{new Date(sheet.periodEnd).toLocaleDateString('en-US')}</HoverSpeakText>
                                    </td>
                                    <td className={styles.tableCell}>
                                        <HoverSpeakText>{sheet.assets.totalAssets.toFixed(3)}</HoverSpeakText>
                                    </td>
                                    <td className={styles.tableCell}>
                                        <div className={styles.actionButtonsContainer}>
                                            <HoverSpeakText textToSpeak={`Download balance sheet ${idx + 1}`}>
                                                <button
                                                    onClick={() => downloadBalanceSheet(sheet._id)}
                                                    className={`${styles.actionButton} ${styles.downloadButton}`}
                                                    aria-label={`Download balance sheet ${idx + 1}`}
                                                >
                                                    Download
                                                </button>
                                            </HoverSpeakText>
                                            <HoverSpeakText textToSpeak={`Delete balance sheet ${idx + 1}`}>
                                                <button
                                                    onClick={() => deleteBalanceSheet(sheet._id)}
                                                    className={`${styles.actionButton} ${styles.deleteButton}`}
                                                    aria-label={`Delete balance sheet ${idx + 1}`}
                                                >
                                                    Delete
                                                </button>
                                            </HoverSpeakText>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className={styles.emptyMessage}>
                                    <HoverSpeakText>No balance sheets found.</HoverSpeakText>
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