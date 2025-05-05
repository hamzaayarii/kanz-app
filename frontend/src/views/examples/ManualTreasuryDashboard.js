import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useForm, useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import styles from '../../assets/css/FinancialStatements.module.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const ManualTreasuryDashboard = () => {
    const { register, handleSubmit, setValue, control, formState: { errors } } = useForm({
        defaultValues: {
            businessId: '',
            periodStart: '',
            periodEnd: ''
        }
    });

    const watchBusinessId = useWatch({ control, name: 'businessId' });
    const [businesses, setBusinesses] = useState([]);
    const [treasuryReports, setTreasuryReports] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBusinesses = async () => {
            try {
                const token = localStorage.getItem('authToken');
                const res = await axios.get(`${API_URL}/business/user-businesses`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setBusinesses(res.data.businesses || []);
                if (res.data.businesses?.length > 0) {
                    setValue('businessId', res.data.businesses[0]._id);
                }
            } catch (err) {
                setError('Failed to load businesses.');
            }
        };

        fetchBusinesses();
    }, [setValue]);

    useEffect(() => {
        if (watchBusinessId) {
            const fetchReports = async () => {
                try {
                    const token = localStorage.getItem('authToken');
                    const res = await axios.get(`${API_URL}/treasury?businessId=${watchBusinessId}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setTreasuryReports(res.data || []);
                } catch (err) {
                    setError('Failed to load treasury reports.');
                }
            };
            fetchReports();
        }
    }, [watchBusinessId]);

    const onSubmit = async (data) => {
        if (!data.businessId || !data.periodStart || !data.periodEnd) {
            setError('Please complete all required fields.');
            return;
        }

        if (new Date(data.periodStart) > new Date(data.periodEnd)) {
            setError('Start date cannot be later than end date.');
            return;
        }

        try {
            setLoading(true);
            const token = localStorage.getItem('authToken');
            if (!token) {
                navigate('/auth/login');
                return;
            }
            await axios.post(`${API_URL}/treasury/${data.businessId}?start=${data.periodStart}&end=${data.periodEnd}`, {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const updated = await axios.get(`${API_URL}/treasury?businessId=${data.businessId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setTreasuryReports(updated.data || []);
            setError('');
        } catch (err) {
            setError('Failed to create treasury report.');
        } finally {
            setLoading(false);
        }
    };

    const downloadReport = async (reportId) => {
        try {
            const token = localStorage.getItem('authToken');
            const res = await axios.get(`${API_URL}/treasury/download/${reportId}`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(res.data);
            const a = document.createElement('a');
            a.href = url;
            a.download = `treasury-report-${reportId}.pdf`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            setError('Failed to download treasury report.');
        }
    };

    const deleteReport = async (reportId) => {
        if (!window.confirm('Delete this report?')) return;
        try {
            const token = localStorage.getItem('authToken');
            await axios.delete(`${API_URL}/treasury/${reportId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTreasuryReports((prev) => prev.filter((r) => r._id !== reportId));
        } catch (err) {
            setError('Failed to delete treasury report.');
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <h1 className={styles.pageTitle}>Treasury Dashboard</h1>
                {error && <div className="bg-red-100 border border-red-400 text-red-700 p-4 mb-4">{error}</div>}
                <form onSubmit={handleSubmit(onSubmit)} className={styles.formContainer}>
                    <div className={styles.gridContainer}>
                        <div>
                            <label className={styles.inputLabel}>Business</label>
                            <select {...register('businessId', { required: true })} className={styles.inputField}>
                                <option value="">Select business</option>
                                {businesses.map((biz) => (
                                    <option key={biz._id} value={biz._id}>{biz.name}</option>
                                ))}
                            </select>
                            {errors.businessId && <span className={styles.validationError}>Required</span>}
                        </div>
                        <div>
                            <label className={styles.inputLabel}>Start Date</label>
                            <input type="date" {...register('periodStart', { required: true })} className={styles.inputField} />
                            {errors.periodStart && <span className={styles.validationError}>Required</span>}
                        </div>
                        <div>
                            <label className={styles.inputLabel}>End Date</label>
                            <input type="date" {...register('periodEnd', { required: true })} className={styles.inputField} />
                            {errors.periodEnd && <span className={styles.validationError}>Required</span>}
                        </div>
                    </div>
                    <button type="submit" className={styles.submitButton} disabled={loading}>
                        {loading ? 'Submitting...' : 'Generate Report'}
                    </button>
                </form>

                <h2 className={styles.sectionHeading}>Previous Treasury Reports</h2>
                <table className="min-w-full table-auto border mt-4">
                    <thead className="bg-gray-100">
                    <tr>
                        <th className="border px-4 py-2 text-left">Period</th>
                        <th className="border px-4 py-2 text-left">Opening Balance</th>
                        <th className="border px-4 py-2 text-left">Total Inflows (Revenue)</th>
                        <th className="border px-4 py-2 text-left">Total Outflows (Expenses + Payroll)</th>
                        <th className="border px-4 py-2 text-left">Closing Balance</th>
                        <th className="border px-4 py-2 text-left">Revenue from Daily Sales</th>
                        <th className="border px-4 py-2 text-left">Variable Costs (from Daily Revenue)</th>
                        <th className="border px-4 py-2 text-left">Fixed Charges (from Expense Records)</th>
                        <th className="border px-4 py-2 text-left">Payroll Payments</th>
                        <th className="border px-4 py-2 text-left">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {treasuryReports.map((report) => (
                        <tr key={report._id} className="hover:bg-gray-50">
                            <td className="border px-4 py-2">
                                {new Date(report.dateRange.start).toLocaleDateString()} -<br/>
                                {new Date(report.dateRange.end).toLocaleDateString()}
                            </td>
                            <td className="border px-4 py-2">{report.openingBalance} DT</td>
                            <td className="border px-4 py-2">{report.totalInflows} DT</td>
                            <td className="border px-4 py-2">{report.totalOutflows} DT</td>
                            <td className="border px-4 py-2">{report.closingBalance} DT</td>
                            <td className="border px-4 py-2">{report.details?.revenueFromDaily} DT</td>
                            <td className="border px-4 py-2">{report.details?.expensesFromDaily} DT</td>
                            <td className="border px-4 py-2">{report.details?.expensesFromExpenses} DT</td>
                            <td className="border px-4 py-2">{report.details?.payrollOutflows} DT</td>
                            <td className="border px-4 py-2 space-x-2">
                                <button onClick={() => downloadReport(report._id)}
                                        className="text-blue-600 hover:underline">Download
                                </button>
                                <button onClick={() => deleteReport(report._id)}
                                        className="text-red-600 hover:underline">Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>

            </div>
        </div>
    );
};

export default ManualTreasuryDashboard;
