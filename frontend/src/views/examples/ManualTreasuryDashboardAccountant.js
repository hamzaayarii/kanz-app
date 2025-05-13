import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useForm, useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import styles from '../../assets/css/FinancialStatements.module.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const ManualTreasuryDashboardAccountant = () => {
    const { register, handleSubmit, setValue, control, formState: { errors } } = useForm({
        defaultValues: {
            businessId: '',
            periodStart: '',
            periodEnd: ''
        }
    });

    const watchBusinessId = useWatch({ control, name: 'businessId' });
    const [owners, setOwners] = useState([]);
    const [selectedOwner, setSelectedOwner] = useState('');
    const [businesses, setBusinesses] = useState([]);
    const [treasuryReports, setTreasuryReports] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Fetch business owners
    useEffect(() => {
        const fetchOwners = async () => {
            try {
                const token = localStorage.getItem('authToken');
                const res = await axios.get(`${API_URL}/users/assigned-business-owners`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setOwners(res.data || []);
                if (res.data?.length > 0) {
                    setSelectedOwner(res.data[0]._id);
                }
            } catch (err) {
                setError('Failed to load owners.');
            }
        };
        fetchOwners();
    }, []);

    // Fetch businesses by owner
    useEffect(() => {
        const fetchBusinesses = async () => {
            if (!selectedOwner) return;
            try {
                const token = localStorage.getItem('authToken');
                const res = await axios.get(`${API_URL}/business/getUserBusinessesByAccountant?ownerId=${selectedOwner}`, {
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
    }, [selectedOwner, setValue]);

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
                            <label className={styles.inputLabel}>Business Owner</label>
                            <select
                                value={selectedOwner}
                                onChange={(e) => setSelectedOwner(e.target.value)}
                                className={styles.inputField}
                            >
                                <option value="">Select owner</option>
                                {owners.map((owner) => (
                                    <option key={owner._id} value={owner._id}>
                                        {owner.fullName}
                                    </option>
                                ))}
                            </select>
                        </div>
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
                            <input type="date" {...register('periodStart', { required: true })}
                                   className={styles.inputField} />
                            {errors.periodStart && <span className={styles.validationError}>Required</span>}
                        </div>
                        <div>
                            <label className={styles.inputLabel}>End Date</label>
                            <input type="date" {...register('periodEnd', { required: true })}
                                   className={styles.inputField} />
                            {errors.periodEnd && <span className={styles.validationError}>Required</span>}
                        </div>
                    </div>
                    <button type="submit" className={styles.submitButton} disabled={loading}>
                        {loading ? 'Submitting...' : 'Generate Report'}
                    </button>
                </form>

                <h2 className={styles.existingBalancesTitle}>Existing Treasury Reports</h2>
                <div className={styles.tableContainer}>
                    <table className={styles.dataTable}>
                        <thead className={styles.tableHeader}>
                        <tr>
                            <th className={styles.tableHeaderCell}>Period</th>
                            <th className={styles.tableHeaderCell}>Opening Balance</th>
                            <th className={styles.tableHeaderCell}>Total Inflows</th>
                            <th className={styles.tableHeaderCell}>Total Outflows</th>
                            <th className={styles.tableHeaderCell}>Closing Balance</th>
                            <th className={styles.tableHeaderCell}>Revenue from Daily Sales</th>
                            <th className={styles.tableHeaderCell}>Variable Costs</th>
                            <th className={styles.tableHeaderCell}>Fixed Charges</th>
                            <th className={styles.tableHeaderCell}>Payroll Payments</th>
                            <th className={styles.tableHeaderCell}>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {treasuryReports.length > 0 ? (
                            treasuryReports.map((report) => (
                                <tr key={report._id} className={styles.tableRow}>
                                    <td className={styles.tableCell}>
                                        {new Date(report.dateRange.start).toLocaleDateString()} -<br/>
                                        {new Date(report.dateRange.end).toLocaleDateString()}
                                    </td>
                                    <td className={styles.tableCell}>{report.openingBalance} DT</td>
                                    <td className={styles.tableCell}>{report.totalInflows} DT</td>
                                    <td className={styles.tableCell}>{report.totalOutflows} DT</td>
                                    <td className={styles.tableCell}>{report.closingBalance} DT</td>
                                    <td className={styles.tableCell}>{report.details?.revenueFromDaily} DT</td>
                                    <td className={styles.tableCell}>{report.details?.expensesFromDaily} DT</td>
                                    <td className={styles.tableCell}>{report.details?.expensesFromExpenses} DT</td>
                                    <td className={styles.tableCell}>{report.details?.payrollOutflows} DT</td>
                                    <td className={styles.tableCell}>
                                        <div className={styles.actionButtonsContainer}>
                                            <button
                                                onClick={() => downloadReport(report._id)}
                                                className={`${styles.actionButton} ${styles.downloadButton}`}
                                            >
                                                Download
                                            </button>
                                            <button
                                                onClick={() => deleteReport(report._id)}
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
                                <td colSpan="10" className={styles.emptyMessage}>
                                    No treasury reports found.
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

export default ManualTreasuryDashboardAccountant;
