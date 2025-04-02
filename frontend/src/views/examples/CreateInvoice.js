import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useForm, useFieldArray } from 'react-hook-form';
import { Alert } from 'reactstrap';
import styles from '../../assets/css/CreateInvoice.module.css';

const CreateInvoice = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [businesses, setBusinesses] = useState([]);
    const [selectedBusiness, setSelectedBusiness] = useState(null);

    const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm({
        defaultValues: {
            businessId: '',
            customerName: '',
            invoiceNumber: '',
            orderNumber: '',
            invoiceDate: new Date().toISOString().split('T')[0],
            dueDate: '',
            items: [{ itemDetails: '', quantity: 1, rate: 0, tax: 0 }],
            discount: 0,
            shippingCharges: 0,
            customerNotes: ''
        },
        mode: 'onChange'
    });

    const { fields, append, remove } = useFieldArray({
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
                if (!token) throw new Error('Vous devez être connecté pour récupérer les sociétés');

                const response = await axios.get('http://localhost:5000/api/business/buisnessowner', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setBusinesses(response.data.businesses || []);
            } catch (err) {
                setError(err.response?.data?.message || 'Erreur lors de la récupération des sociétés');
            }
        };

        fetchBusinesses();
    }, []);

    useEffect(() => {
        const business = businesses.find(b => b._id === watchBusinessId);
        setSelectedBusiness(business || null);
    }, [watchBusinessId, businesses]);

    const calculateAmount = (item) => {
        const qty = parseFloat(item.quantity) || 0;
        const rate = parseFloat(item.rate) || 0;
        const taxPercentage = parseFloat(item.tax) || 0;
        const baseAmount = qty * rate;
        const taxAmount = (baseAmount * taxPercentage) / 100;
        return baseAmount + taxAmount;
    };

    const calculateTotals = () => {
        const subTotal = watchItems.reduce((sum, item) => sum + calculateAmount(item), 0);
        const discountAmount = (subTotal * (parseFloat(watchDiscount) || 0)) / 100;
        const total = subTotal - discountAmount + Math.max(0, parseFloat(watchShippingCharges) || 0);
        return { subTotal: subTotal.toFixed(2), total: Math.max(0, total).toFixed(2) };
    };

    const { subTotal, total } = calculateTotals();

    const onSubmit = async (data) => {
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const token = localStorage.getItem('authToken');
            if (!token) throw new Error('Vous devez être connecté pour créer une facture');

            const invoiceData = { ...data, subTotal, total };
            const response = await axios.post(
                'http://localhost:5000/api/invoices',
                invoiceData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setSuccess('Facture créée avec succès');
            setValue('businessId', '');
            setValue('customerName', '');
            setValue('invoiceNumber', '');
            setValue('orderNumber', '');
            setValue('invoiceDate', new Date().toISOString().split('T')[0]);
            setValue('dueDate', '');
            setValue('items', [{ itemDetails: '', quantity: 1, rate: 0, tax: 0 }]);
            setValue('discount', 0);
            setValue('shippingCharges', 0);
            setValue('customerNotes', '');
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Erreur lors de la création de la facture');
        } finally {
            setLoading(false);
        }
    };

    // Handle file import
    const handleImport = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const data = JSON.parse(e.target.result);
                if (!data || typeof data !== 'object') {
                    setError('Fichier JSON invalide');
                    return;
                }

                // Populate form with imported data
                setValue('businessId', data.businessId || '');
                setValue('customerName', data.customerName || '');
                setValue('invoiceNumber', data.invoiceNumber || '');
                setValue('orderNumber', data.orderNumber || '');
                setValue('invoiceDate', data.invoiceDate || new Date().toISOString().split('T')[0]);
                setValue('dueDate', data.dueDate || '');
                setValue('items', data.items || [{ itemDetails: '', quantity: 1, rate: 0, tax: 0 }]);
                setValue('discount', data.discount || 0);
                setValue('shippingCharges', data.shippingCharges || 0);
                setValue('customerNotes', data.customerNotes || '');

                setSuccess('Données importées avec succès');
            };
            reader.readAsText(file);
        } catch (err) {
            setError('Erreur lors de l\'importation des données');
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.formWrapper}>
                <div className={styles.header}>
                    <h2>Création de Facture</h2>
                    <p>Gérez vos factures avec style</p>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
                    {error && <Alert color="danger">{error}</Alert>}
                    {success && <Alert color="success">{success}</Alert>}

                    {/* Import Button */}
                    <div className={styles.field}>
                        <label className={styles.label}>Importer une facture (JSON)</label>
                        <input
                            type="file"
                            accept="application/json"
                            onChange={handleImport}
                            disabled={loading}
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.inputGrid}>
                        <div className={styles.field}>
                            <label className={styles.label}>Société</label>
                            <select
                                {...register('businessId', { required: 'Veuillez sélectionner une société' })}
                                disabled={loading || businesses.length === 0}
                                className={styles.input}
                            >
                                <option value="">Sélectionner une société</option>
                                {businesses.map(business => (
                                    <option key={business._id} value={business._id}>
                                        {business.name}
                                    </option>
                                ))}
                            </select>
                            {errors.businessId && <span className={styles.error}>{errors.businessId.message}</span>}
                        </div>

                        {selectedBusiness && (
                            <div className={styles.field}>
                                <label className={styles.label}>Détails de la société</label>
                                <div className={styles.businessDetails}>
                                    <p><strong>Nom:</strong> {selectedBusiness.name}</p>
                                    <p><strong>Adresse:</strong> {selectedBusiness.address}</p>
                                    <p><strong>N° Taxe:</strong> {selectedBusiness.taxNumber}</p>
                                </div>
                            </div>
                        )}

                        {[
                            {
                                name: 'customerName',
                                label: 'Nom du client',
                                required: 'Ce champ est requis',
                                validate: (value) => value.length <= 100 || 'Maximum 100 caractères'
                            },
                            {
                                name: 'invoiceNumber',
                                label: 'Numéro de facture',
                                required: 'Ce champ est requis',
                                validate: (value) => /^[A-Za-z0-9-]+$/.test(value) || 'Doit être alphanumérique avec des tirets uniquement'
                            },
                            { name: 'orderNumber', label: 'Numéro de commande' },
                            { name: 'invoiceDate', label: 'Date de facture', type: 'date', required: 'Ce champ est requis' },
                            {
                                name: 'dueDate',
                                label: 'Date d\'échéance',
                                type: 'date',
                                required: 'Ce champ est requis',
                                validate: (value) => new Date(value) >= new Date(watch('invoiceDate')) || 'Doit être postérieure à la date de facture'
                            }
                        ].map(field => (
                            <div key={field.name} className={styles.field}>
                                <label className={styles.label}>{field.label}</label>
                                <input
                                    type={field.type || 'text'}
                                    {...register(field.name, {
                                        required: field.required,
                                        validate: field.validate
                                    })}
                                    disabled={loading}
                                    className={styles.input}
                                />
                                {errors[field.name] && <span className={styles.error}>{errors[field.name].message}</span>}
                            </div>
                        ))}
                    </div>

                    <div className={styles.itemsSection}>
                        <h3>Articles</h3>
                        {fields.map((item, index) => (
                            <div key={item.id} className={styles.itemRow}>
                                <div>
                                    <label className={styles.label}>Détails</label>
                                    <input
                                        {...register(`items.${index}.itemDetails`, {
                                            required: 'Requis',
                                            maxLength: { value: 200, message: 'Maximum 200 caractères' }
                                        })}
                                        disabled={loading}
                                        className={styles.itemInput}
                                    />
                                    {errors.items?.[index]?.itemDetails && <span className={styles.error}>{errors.items[index].itemDetails.message}</span>}
                                </div>
                                <div>
                                    <label className={styles.label}>Quantité</label>
                                    <input
                                        type="number"
                                        {...register(`items.${index}.quantity`, { required: 'Requis', min: { value: 1, message: 'Minimum 1' } })}
                                        disabled={loading}
                                        className={styles.itemInput}
                                    />
                                    {errors.items?.[index]?.quantity && <span className={styles.error}>{errors.items[index].quantity.message}</span>}
                                </div>
                                <div>
                                    <label className={styles.label}>Prix unitaire</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        {...register(`items.${index}.rate`, { required: 'Requis', min: { value: 0, message: 'Minimum 0' } })}
                                        disabled={loading}
                                        className={styles.itemInput}
                                    />
                                    {errors.items?.[index]?.rate && <span className={styles.error}>{errors.items[index].rate.message}</span>}
                                </div>
                                <div>
                                    <label className={styles.label}>Taxe (%)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        {...register(`items.${index}.tax`, { min: { value: 0, message: 'Minimum 0' } })}
                                        disabled={loading}
                                        className={styles.itemInput}
                                    />
                                    {errors.items?.[index]?.tax && <span className={styles.error}>{errors.items[index].tax.message}</span>}
                                </div>
                                <div>
                                    <label className={styles.label}>Montant</label>
                                    <input
                                        type="number"
                                        value={calculateAmount(watchItems[index]).toFixed(2)}
                                        disabled
                                        className={`${styles.itemInput} ${styles.amountInput}`}
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => remove(index)}
                                    disabled={fields.length === 1 || loading}
                                    className={styles.removeButton}
                                >
                                    Supprimer
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => append({ itemDetails: '', quantity: 1, rate: 0, tax: 0 })}
                            disabled={loading}
                            className={styles.addButton}
                        >
                            + Ajouter un article
                        </button>

                        <div className={styles.totalsSection}>
                            <h4>Totaux</h4>
                            <div className={styles.totalsGrid}>
                                <div className={styles.field}>
                                    <label className={styles.label}>Sous-total</label>
                                    <input value={subTotal} disabled className={`${styles.input} ${styles.totalInput}`} />
                                </div>
                                <div className={styles.field}>
                                    <label className={styles.label}>Remise (%)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        {...register('discount', { min: { value: 0, message: 'Minimum 0' } })}
                                        disabled={loading}
                                        className={styles.input}
                                    />
                                    {errors.discount && <span className={styles.error}>{errors.discount.message}</span>}
                                </div>
                                <div className={styles.field}>
                                    <label className={styles.label}>Frais de livraison</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        {...register('shippingCharges', { min: { value: 0, message: 'Minimum 0' } })}
                                        disabled={loading}
                                        className={styles.input}
                                    />
                                    {errors.shippingCharges && <span className={styles.error}>{errors.shippingCharges.message}</span>}
                                </div>
                                <div className={styles.field}>
                                    <label className={styles.label}>Total</label>
                                    <input value={total} disabled className={`${styles.input} ${styles.totalInput}`} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.notesSection}>
                        <div style={{ flex: 1 }}>
                            <label className={styles.label}>Notes client</label>
                            <textarea
                                {...register('customerNotes')}
                                disabled={loading}
                                className={styles.textarea}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={styles.submitButton}
                        >
                            {loading ? 'Création...' : 'Créer la Facture'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateInvoice;