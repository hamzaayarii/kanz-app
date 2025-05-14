import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useForm, useFieldArray } from 'react-hook-form';
import { Alert, Modal, ModalHeader, ModalBody, Input, Table, Spinner } from 'reactstrap';
import { FaSearch } from 'react-icons/fa';
import debounce from 'lodash.debounce';
import styles from '../../assets/css/CreateInvoice.module.css';
import HoverSpeakText from '../../components/TTS/HoverSpeakText';
import TTSButton from '../../components/TTS/TTSButton';
import { useTTS } from '../../components/TTS/TTSContext';

const CreateInvoice = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [businesses, setBusinesses] = useState([]);
    const [selectedBusiness, setSelectedBusiness] = useState(null);
    const [itemModal, setItemModal] = useState(false);
    const [items, setItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loadingItems, setLoadingItems] = useState(false);
    const { isTTSEnabled, speak, stop } = useTTS();

    const { register, control, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({
        defaultValues: {
            businessId: '',
            customerName: '',
            invoiceNumber: '',
            orderNumber: '',
            invoiceDate: new Date().toISOString().split('T')[0],
            dueDate: '',
            items: [{ itemDetails: '', quantity: 1, rate: 0, taxPercentage: 0 }],
            discount: 0,
            shippingCharges: 0,
            customerNotes: ''
        },
        mode: 'onChange'
    });

    const { fields, append, remove, replace } = useFieldArray({
        control,
        name: 'items'
    });

    const watchItems = watch('items');
    const watchDiscount = watch('discount');
    const watchShippingCharges = watch('shippingCharges');
    const watchBusinessId = watch('businessId');

    useEffect(() => {
        const fetchBusinesses = async () => {
            try {
                const token = localStorage.getItem('authToken');
                if (!token) throw new Error('You must be logged in to fetch businesses');

                const response = await axios.get('http://localhost:5000/api/business/user-businesses', {
                    headers: { Authorization: `Bearer ${token}` },
                    timeout: 10000
                });

                setBusinesses(response.data.businesses || []);
                if (response.data.businesses.length > 0) {
                    setValue('businessId', response.data.businesses[0]._id);
                }
            } catch (err) {
                setError(err.response?.data?.message || 'Error fetching businesses');
                console.error('FetchBusinesses - Error:', err.response?.data || err);
            }
        };

        fetchBusinesses();
    }, [setValue]);

    useEffect(() => {
        const business = businesses.find(b => b._id === watchBusinessId);
        setSelectedBusiness(business || null);
    }, [watchBusinessId, businesses]);

    const debouncedFetchItems = useMemo(
        () => debounce(async (search) => {
            try {
                setLoadingItems(true);
                const response = await axios.get(`http://localhost:5000/api/products`, {
                    params: { search }
                });
                if (Array.isArray(response.data)) {
                    setItems(response.data);
                } else if (response.data.products) {
                    setItems(response.data.products);
                }
            } catch (error) {
                console.error('Error fetching items:', error);
                setError('Failed to load items');
            } finally {
                setLoadingItems(false);
            }
        }, 300),
        []
    );

    useEffect(() => {
        debouncedFetchItems(searchTerm);
        return () => debouncedFetchItems.cancel();
    }, [searchTerm, debouncedFetchItems]);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleItemSelect = (item) => {
        const newItem = {
            itemDetails: item.name,
            quantity: 1,
            rate: item.salesInfo.sellingPrice,
            taxPercentage: item.salesInfo.tax
        };
        append(newItem);
        setItemModal(false);
    };

    const calculateAmount = (item) => {
        const qty = Number(item.quantity) || 0;
        const rate = Number(item.rate) || 0;
        const taxPercentage = Number(item.taxPercentage) || 0;
        const baseAmount = qty * rate;
        const taxAmount = baseAmount * (taxPercentage / 100);
        return Number((baseAmount + taxAmount).toFixed(2));
    };

    const calculateTotals = useMemo(() => {
        const subTotal = watchItems.reduce((sum, item) => sum + calculateAmount(item), 0);
        const discountAmount = Number(watchDiscount) || 0;
        const shipping = Number(watchShippingCharges) || 0;
        const total = subTotal - discountAmount + shipping;
        return { subTotal: subTotal.toFixed(2), total: Math.max(0, total).toFixed(2) };
    }, [watchItems, watchDiscount, watchShippingCharges]);

    const { subTotal, total } = calculateTotals;

    const onSubmit = async (data) => {
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const token = localStorage.getItem('authToken');
            if (!token) throw new Error('You must be logged in to create an invoice');

            const invoiceData = {
                ...data,
                subTotal,
                total,
                items: data.items.map(item => ({
                    ...item,
                    amount: calculateAmount(item)
                }))
            };

            const response = await axios.post(
                'http://localhost:5000/api/invoices',
                invoiceData,
                { headers: { Authorization: `Bearer ${token}` }, timeout: 10000 }
            );

            setSuccess('Invoice created successfully');
            reset();
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Error creating invoice');
            console.error('Create error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleExtract = async (event) => {
        if (!event?.target?.files?.[0]) {
            setError('No file selected.');
            return;
        }

        const file = event.target.files[0];
        if (file.size === 0) {
            setError('The file is empty.');
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            setError('The file is too large (max 10 MB).');
            return;
        }
        if (!watchBusinessId) {
            setError('Please select a business before uploading a document');
            return;
        }

        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('You must be logged in to extract data');
            }

            const formData = new FormData();
            formData.append('file', file);
            formData.append('businessId', watchBusinessId);

            const response = await axios.post(
                'http://localhost:5000/api/invoices/extract',
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    },
                    timeout: 30000
                }
            );

            if (!response.data || !response.data.invoiceData) {
                throw new Error('Invalid server response');
            }

            const { invoiceData } = response.data;
            console.log('Extracted invoiceData:', invoiceData);

            if (!invoiceData.items || !Array.isArray(invoiceData.items)) {
                throw new Error('Invalid item data');
            }

            const calculatedSubTotal = invoiceData.items.reduce((sum, item) => {
                const amount = Number(item.amount) || 0;
                return sum + amount;
            }, 0);
            const calculatedTotal = Number(
                (calculatedSubTotal - (Number(invoiceData.discount) || 0) +
                    (Number(invoiceData.shippingCharges) || 0)).toFixed(2)
            );

            if (Math.abs(calculatedTotal - Number(invoiceData.total)) > 0.01) {
                setError(`Warning: Extracted total (${invoiceData.total}) does not match calculated total (${calculatedTotal}). Please verify the data.`);
            }

            const cleanedItems = invoiceData.items.map(item => ({
                itemDetails: item.itemDetails?.trim() || '',
                quantity: Number(item.quantity) || 1,
                rate: Number(item.rate) || 0,
                taxPercentage: Number(item.taxPercentage) || 0,
                amount: Number(item.amount) || 0
            }));

            reset({
                businessId: invoiceData.businessId || watchBusinessId,
                customerName: invoiceData.customerName?.trim() || '',
                invoiceNumber: invoiceData.invoiceNumber?.toString() || '',
                orderNumber: invoiceData.orderNumber?.toString() || '',
                invoiceDate: invoiceData.invoiceDate || new Date().toISOString().split('T')[0],
                dueDate: invoiceData.dueDate || '',
                discount: Number(invoiceData.discount) || 0,
                shippingCharges: Number(invoiceData.shippingCharges) || 0,
                customerNotes: invoiceData.customerNotes ? invoiceData.customerNotes.replace(/Page \d+ of \d+/i, '').trim() : '',
                items: cleanedItems.length > 0 ? cleanedItems : [{ itemDetails: '', quantity: 1, rate: 0, taxPercentage: 0 }]
            });

            setSuccess('Information extracted successfully');
        } catch (err) {
            let errorMessage = 'Error extracting data';
            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.message) {
                errorMessage = err.message;
            }
            if (errorMessage.includes('bad XRef entry')) {
                errorMessage = 'The PDF file is corrupted or malformed. Please try another file.';
            } else if (errorMessage.includes('No text detected')) {
                errorMessage = 'No text detected in the document. Ensure the image is clear, readable, and contains scannable text.';
            } else if (err.code === 'ECONNABORTED') {
                errorMessage = 'Request timed out. The document may be too complex or large. Try a simpler file.';
            } else {
                errorMessage = errorMessage + '. Please check the file and try again.';
            }
            setError(errorMessage);
            console.error('Extraction error:', err.response?.data || err);
        } finally {
            setLoading(false);
            event.target.value = '';
        }
    };

    const handleImport = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (file.size === 0) {
            setError('The JSON file is empty.');
            return;
        }

        try {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    if (!data || typeof data !== 'object') {
                        setError('Invalid JSON file');
                        return;
                    }

                    setValue('businessId', data.businessId || watchBusinessId);
                    setValue('customerName', data.customerName || '');
                    setValue('invoiceNumber', data.invoiceNumber || '');
                    setValue('orderNumber', data.orderNumber || '');
                    setValue('invoiceDate', data.invoiceDate || new Date().toISOString().split('T')[0]);
                    setValue('dueDate', data.dueDate || '');
                    setValue('discount', data.discount || 0);
                    setValue('shippingCharges', data.shippingCharges || 0);
                    setValue('customerNotes', data.customerNotes || '');

                    if (data.items && Array.isArray(data.items) && data.items.length > 0) {
                        replace(data.items.map(item => ({
                            itemDetails: item.itemDetails || '',
                            quantity: Number(item.quantity) || 1,
                            rate: Number(item.rate) || 0,
                            taxPercentage: Number(item.taxPercentage) || 0
                        })));
                    } else {
                        replace([{ itemDetails: '', quantity: 1, rate: 0, taxPercentage: 0 }]);
                    }

                    setSuccess('Data imported successfully');
                } catch (jsonErr) {
                    setError('JSON parsing error: ' + jsonErr.message);
                }
            };
            reader.onerror = () => setError('Error reading file');
            reader.readAsText(file);
        } catch (err) {
            setError('Error importing data');
            console.error('Import error:', err);
        } finally {
            event.target.value = '';
        }
    };

    return (
        <div className={styles.container} id="create-invoice-container">
            <div className={styles.formWrapper}>
                <div className={styles.header}>
                    <h2>
                        <HoverSpeakText>Create Invoice</HoverSpeakText>
                        {isTTSEnabled && (
                            <TTSButton 
                                elementId="create-invoice-container"
                                className="ml-2"
                                size="sm"
                                label="Read all invoice creation information"
                            />
                        )}
                    </h2>
                    <p><HoverSpeakText>Manage your invoices with style</HoverSpeakText></p>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
                    {error && (
                        <Alert color="danger">
                            <HoverSpeakText>{error}</HoverSpeakText>
                        </Alert>
                    )}
                    {success && (
                        <Alert color="success">
                            <HoverSpeakText>{success}</HoverSpeakText>
                        </Alert>
                    )}

                    <div className={styles.field}>
                        <HoverSpeakText textToSpeak="Extract from PDF or Image document">
                            <label className={styles.label}>Extract from document (PDF/Image)</label>
                        </HoverSpeakText>
                        <input
                            type="file"
                            accept="application/pdf,image/png,image/jpeg,image/jpg"
                            onChange={handleExtract}
                            disabled={loading || !watchBusinessId}
                            className={styles.input}
                            aria-label="Upload document for extraction"
                        />
                    </div>

                    <div className={styles.inputGrid}>
                        <div className={styles.field}>
                            <HoverSpeakText textToSpeak="Select a business">
                                <label className={styles.label}>Business</label>
                            </HoverSpeakText>
                            <select
                                {...register('businessId', { required: 'Please select a business' })}
                                disabled={loading || businesses.length === 0}
                                className={styles.input}
                                aria-label="Business list"
                            >
                                <option value="">Select a business</option>
                                {businesses.map(business => (
                                    <option key={business._id} value={business._id}>
                                        {business.name}
                                    </option>
                                ))}
                            </select>
                            {errors.businessId && (
                                <span className={styles.error}>
                                    <HoverSpeakText>{errors.businessId.message}</HoverSpeakText>
                                </span>
                            )}
                        </div>

                        {selectedBusiness && (
                            <div className={styles.field}>
                                <HoverSpeakText textToSpeak="Business details">
                                    <label className={styles.label}>Business Details</label>
                                </HoverSpeakText>
                                <div className={styles.businessDetails}>
                                    <p>
                                        <HoverSpeakText>
                                            <strong>Name:</strong> {selectedBusiness.name}
                                        </HoverSpeakText>
                                    </p>
                                    <p>
                                        <HoverSpeakText>
                                            <strong>Address:</strong> {selectedBusiness.address}
                                        </HoverSpeakText>
                                    </p>
                                    <p>
                                        <HoverSpeakText>
                                            <strong>Tax Number:</strong> {selectedBusiness.taxNumber}
                                        </HoverSpeakText>
                                    </p>
                                </div>
                            </div>
                        )}

                        {[
                            { name: 'customerName', label: 'Customer Name', required: 'This field is required', maxLength: { value: 100, message: 'Maximum 100 characters' } },
                            { name: 'invoiceNumber', label: 'Invoice Number', required: 'This field is required', pattern: { value: /^[A-Za-z0-9-]+$/, message: 'Alphanumeric with dashes only' } },
                            { name: 'orderNumber', label: 'Order Number' },
                            { name: 'invoiceDate', label: 'Invoice Date', type: 'date', required: 'This field is required' },
                            { name: 'dueDate', label: 'Due Date', type: 'date', required: 'This field is required', validate: value => new Date(value) >= new Date(watch('invoiceDate')) || 'Must be later than invoice date' }
                        ].map(field => (
                            <div key={field.name} className={styles.field}>
                                <HoverSpeakText textToSpeak={field.label}>
                                    <label className={styles.label}>{field.label}</label>
                                </HoverSpeakText>
                                <input
                                    type={field.type || 'text'}
                                    {...register(field.name, { required: field.required, maxLength: field.maxLength, pattern: field.pattern, validate: field.validate })}
                                    disabled={loading}
                                    className={styles.input}
                                    aria-label={field.label}
                                />
                                {errors[field.name] && (
                                    <span className={styles.error}>
                                        <HoverSpeakText>{errors[field.name].message}</HoverSpeakText>
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className={styles.itemsSection} id="invoice-items-section">
                        <h3>
                            <HoverSpeakText>Items</HoverSpeakText>
                            <TTSButton 
                                text="This section contains all invoice items" 
                                className="ml-2"
                                size="sm"
                            />
                        </h3>
                        {fields.map((item, index) => (
                            <div key={item.id} className={styles.itemRow}>
                                <div>
                                    <HoverSpeakText textToSpeak="Item details">
                                        <label className={styles.label}>Details</label>
                                    </HoverSpeakText>
                                    <input
                                        {...register(`items.${index}.itemDetails`, { required: 'Required', maxLength: { value: 200, message: 'Maximum 200 characters' } })}
                                        disabled={loading}
                                        className={styles.itemInput}
                                        aria-label={`Item ${index + 1} details`}
                                    />
                                    {errors.items?.[index]?.itemDetails && (
                                        <span className={styles.error}>
                                            <HoverSpeakText>{errors.items[index].itemDetails.message}</HoverSpeakText>
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <HoverSpeakText textToSpeak="Quantity">
                                        <label className={styles.label}>Quantity</label>
                                    </HoverSpeakText>
                                    <input
                                        type="number"
                                        step="1"
                                        {...register(`items.${index}.quantity`, { required: 'Required', min: { value: 1, message: 'Minimum 1' }, valueAsNumber: true })}
                                        disabled={loading}
                                        className={styles.itemInput}
                                        aria-label={`Item ${index + 1} quantity`}
                                    />
                                    {errors.items?.[index]?.quantity && (
                                        <span className={styles.error}>
                                            <HoverSpeakText>{errors.items[index].quantity.message}</HoverSpeakText>
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <HoverSpeakText textToSpeak="Unit price">
                                        <label className={styles.label}>Unit Price</label>
                                    </HoverSpeakText>
                                    <input
                                        type="number"
                                        step="0.01"
                                        {...register(`items.${index}.rate`, { required: 'Required', min: { value: 0, message: 'Minimum 0' }, valueAsNumber: true })}
                                        disabled={loading}
                                        className={styles.itemInput}
                                        aria-label={`Item ${index + 1} unit price`}
                                    />
                                    {errors.items?.[index]?.rate && (
                                        <span className={styles.error}>
                                            <HoverSpeakText>{errors.items[index].rate.message}</HoverSpeakText>
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <HoverSpeakText textToSpeak="Tax rate percentage">
                                        <label className={styles.label}>Tax (%)</label>
                                    </HoverSpeakText>
                                    <input
                                        type="number"
                                        step="0.01"
                                        {...register(`items.${index}.taxPercentage`, {
                                            min: { value: 0, message: 'Minimum 0' },
                                            max: { value: 100, message: 'Maximum 100%' },
                                            valueAsNumber: true
                                        })}
                                        disabled={loading}
                                        className={styles.itemInput}
                                        aria-label={`Item ${index + 1} tax rate`}
                                    />
                                    {errors.items?.[index]?.taxPercentage && (
                                        <span className={styles.error}>
                                            <HoverSpeakText>{errors.items[index].taxPercentage.message}</HoverSpeakText>
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <HoverSpeakText textToSpeak="Total amount with tax">
                                        <label className={styles.label}>Amount</label>
                                    </HoverSpeakText>
                                    <input
                                        type="number"
                                        value={calculateAmount(watchItems[index]).toFixed(2)}
                                        disabled
                                        className={`${styles.itemInput} ${styles.amountInput}`}
                                        aria-label={`Item ${index + 1} total amount: ${calculateAmount(watchItems[index]).toFixed(2)}`}
                                    />
                                </div>
                                <HoverSpeakText textToSpeak={`Remove item ${index + 1}`}>
                                    <button
                                        type="button"
                                        onClick={() => remove(index)}
                                        disabled={fields.length === 1 || loading}
                                        className={styles.removeButton}
                                        aria-label={`Remove item ${index + 1}`}
                                    >
                                        Remove
                                    </button>
                                </HoverSpeakText>
                            </div>
                        ))}
                        <div className={styles.itemButtons}>
                            <HoverSpeakText textToSpeak="Select existing item">
                                <button
                                    type="button"
                                    onClick={() => setItemModal(true)}
                                    disabled={loading}
                                    className={`${styles.addButton} ${styles.selectItem}`}
                                    aria-label="Select existing item"
                                >
                                    + Select Existing Item
                                </button>
                            </HoverSpeakText>
                            <HoverSpeakText textToSpeak="Add custom item">
                                <button
                                    type="button"
                                    onClick={() => append({ itemDetails: '', quantity: 1, rate: 0, taxPercentage: 0 })}
                                    disabled={loading}
                                    className={styles.addButton}
                                    aria-label="Add custom item"
                                >
                                    + Add Custom Item
                                </button>
                            </HoverSpeakText>
                        </div>

                        <Modal isOpen={itemModal} toggle={() => setItemModal(!itemModal)} size="lg">
                            <ModalHeader toggle={() => setItemModal(!itemModal)}>
                                <HoverSpeakText>Select Item</HoverSpeakText>
                            </ModalHeader>
                            <ModalBody>
                                <div className={styles.searchContainer}>
                                    <div className={styles.searchBox}>
                                        <FaSearch className={styles.searchIcon} />
                                        <HoverSpeakText textToSpeak="Search items">
                                            <Input
                                                type="text"
                                                placeholder="Search items..."
                                                value={searchTerm}
                                                onChange={handleSearchChange}
                                                className={styles.searchInput}
                                                aria-label="Search items"
                                            />
                                        </HoverSpeakText>
                                    </div>
                                </div>

                                {loadingItems ? (
                                    <div className={styles.spinnerContainer}>
                                        <Spinner />
                                        <HoverSpeakText>Loading items...</HoverSpeakText>
                                    </div>
                                ) : (
                                    <Table hover responsive className={styles.itemsTable}>
                                        <thead>
                                        <tr>
                                            {['Name', 'Unit', 'Price', 'Tax Rate', 'Action'].map((header) => (
                                                <th key={header}>
                                                    <HoverSpeakText>{header}</HoverSpeakText>
                                                </th>
                                            ))}
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {items.map((item) => (
                                            <tr key={item._id}>
                                                <td><HoverSpeakText>{item.name}</HoverSpeakText></td>
                                                <td><HoverSpeakText>{item.unit}</HoverSpeakText></td>
                                                <td><HoverSpeakText>{item.salesInfo.sellingPrice}</HoverSpeakText></td>
                                                <td><HoverSpeakText>{item.salesInfo.tax}%</HoverSpeakText></td>
                                                <td>
                                                    <HoverSpeakText textToSpeak={`Select item ${item.name}`}>
                                                        <button
                                                            onClick={() => handleItemSelect(item)}
                                                            className={styles.selectButton}
                                                            aria-label={`Select item ${item.name}`}
                                                        >
                                                            Select
                                                        </button>
                                                    </HoverSpeakText>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </Table>
                                )}
                            </ModalBody>
                        </Modal>

                        <div className={styles.totalsSection} id="invoice-totals-section">
                            <h4>
                                <HoverSpeakText>Totals</HoverSpeakText>
                                <TTSButton 
                                    text="This section displays the invoice totals" 
                                    className="ml-2"
                                    size="sm"
                                />
                            </h4>
                            <div className={styles.totalsGrid}>
                                <div className={styles.field}>
                                    <HoverSpeakText textToSpeak="Invoice subtotal">
                                        <label className={styles.label}>Subtotal</label>
                                    </HoverSpeakText>
                                    <HoverSpeakText textToSpeak={`Subtotal: ${subTotal}`}>
                                        <input value={subTotal} disabled className={`${styles.input} ${styles.totalInput}`} aria-label={`Subtotal: ${subTotal}`} />
                                    </HoverSpeakText>
                                </div>
                                <div className={styles.field}>
                                    <HoverSpeakText textToSpeak="Invoice discount">
                                        <label className={styles.label}>Discount</label>
                                    </HoverSpeakText>
                                    <input
                                        type="number"
                                        step="0.01"
                                        {...register('discount', {
                                            min: { value: 0, message: 'Minimum 0' },
                                            max: { value: subTotal, message: 'Cannot exceed subtotal' },
                                            valueAsNumber: true
                                        })}
                                        disabled={loading}
                                        className={styles.input}
                                        aria-label="Invoice discount"
                                    />
                                    {errors.discount && (
                                        <span className={styles.error}>
                                            <HoverSpeakText>{errors.discount.message}</HoverSpeakText>
                                        </span>
                                    )}
                                </div>
                                <div className={styles.field}>
                                    <HoverSpeakText textToSpeak="Shipping charges">
                                        <label className={styles.label}>Shipping Charges</label>
                                    </HoverSpeakText>
                                    <input
                                        type="number"
                                        step="0.01"
                                        {...register('shippingCharges', {
                                            min: { value: 0, message: 'Minimum 0' },
                                            valueAsNumber: true
                                        })}
                                        disabled={loading}
                                        className={styles.input}
                                        aria-label="Shipping charges"
                                    />
                                    {errors.shippingCharges && (
                                        <span className={styles.error}>
                                            <HoverSpeakText>{errors.shippingCharges.message}</HoverSpeakText>
                                        </span>
                                    )}
                                </div>
                                <div className={styles.field}>
                                    <HoverSpeakText textToSpeak="Invoice total">
                                        <label className={styles.label}>Total</label>
                                    </HoverSpeakText>
                                    <HoverSpeakText textToSpeak={`Total: ${total}`}>
                                        <input value={total} disabled className={`${styles.input} ${styles.totalInput}`} aria-label={`Total: ${total}`} />
                                    </HoverSpeakText>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.notesSection}>
                        <div style={{ flex: 1 }}>
                            <HoverSpeakText textToSpeak="Customer notes">
                                <label className={styles.label}>Customer Notes</label>
                            </HoverSpeakText>
                            <textarea
                                {...register('customerNotes', { maxLength: { value: 500, message: 'Maximum 500 characters' } })}
                                disabled={loading}
                                className={styles.textarea}
                                aria-label="Customer notes"
                            />
                            {errors.customerNotes && (
                                <span className={styles.error}>
                                    <HoverSpeakText>{errors.customerNotes.message}</HoverSpeakText>
                                </span>
                            )}
                        </div>
                        <HoverSpeakText textToSpeak="Create invoice">
                            <button
                                type="submit"
                                disabled={loading || Object.keys(errors).length > 0}
                                className={styles.submitButton}
                                aria-label="Create invoice"
                            >
                                {loading ? 'Creating...' : 'Create Invoice'}
                            </button>
                        </HoverSpeakText>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateInvoice;
