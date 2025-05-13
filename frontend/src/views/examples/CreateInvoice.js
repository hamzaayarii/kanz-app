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
                if (!token) throw new Error('Vous devez être connecté pour récupérer les entreprises');

                const response = await axios.get('http://localhost:5000/api/business/user-businesses', {
                    headers: { Authorization: `Bearer ${token}` },
                    timeout: 10000
                });

                setBusinesses(response.data.businesses || []);
                if (response.data.businesses.length > 0) {
                    setValue('businessId', response.data.businesses[0]._id);
                }
            } catch (err) {
                setError(err.response?.data?.message || 'Erreur lors de la récupération des entreprises');
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
                setError('Échec du chargement des articles');
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
            if (!token) throw new Error('Vous devez être connecté pour créer une facture');

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

            setSuccess('Facture créée avec succès');
            reset();
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Erreur lors de la création de la facture');
            console.error('Erreur lors de la création:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleExtract = async (event) => {
        if (!event?.target?.files?.[0]) {
            setError('Aucun fichier sélectionné.');
            return;
        }

        const file = event.target.files[0];
        if (file.size === 0) {
            setError('Le fichier est vide.');
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            setError('Le fichier est trop volumineux (max 10 Mo).');
            return;
        }
        if (!watchBusinessId) {
            setError('Veuillez sélectionner une entreprise avant de télécharger un document');
            return;
        }

        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('Vous devez être connecté pour extraire des données');
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
                    timeout: 30000 // Increased timeout for Tesseract.js processing
                }
            );

            if (!response.data || !response.data.invoiceData) {
                throw new Error('Réponse invalide du serveur');
            }

            const { invoiceData } = response.data;
            console.log('Extracted invoiceData:', invoiceData);

            if (!invoiceData.items || !Array.isArray(invoiceData.items)) {
                throw new Error('Les données des articles sont invalides');
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
                setError(`Attention : Le total extrait (${invoiceData.total}) ne correspond pas au total calculé (${calculatedTotal}). Veuillez vérifier les données.`);
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
                customerNotes: invoiceData.customerNotes ? invoiceData.customerNotes.replace(/Page \d+ de \d+/i, '').trim() : '',
                items: cleanedItems.length > 0 ? cleanedItems : [{ itemDetails: '', quantity: 1, rate: 0, taxPercentage: 0 }]
            });

            setSuccess('Informations extraites avec succès');
        } catch (err) {
            let errorMessage = 'Erreur lors de l\'extraction des données';
            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.message) {
                errorMessage = err.message;
            }
            if (errorMessage.includes('bad XRef entry')) {
                errorMessage = 'Le fichier PDF est corrompu ou mal formé. Veuillez essayer un autre fichier.';
            } else if (errorMessage.includes('Aucun texte détecté')) {
                errorMessage = 'Aucun texte détecté dans le document. Assurez-vous que l\'image est claire, lisible et contient du texte scannable.';
            } else if (err.code === 'ECONNABORTED') {
                errorMessage = 'Délai d\'attente dépassé. Le document peut être trop complexe ou volumineux. Essayez un fichier plus simple.';
            } else {
                errorMessage = errorMessage + '. Veuillez vérifier le fichier et réessayer.';
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
            setError('Le fichier JSON est vide.');
            return;
        }

        try {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    if (!data || typeof data !== 'object') {
                        setError('Fichier JSON invalide');
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

                    setSuccess('Données importées avec succès');
                } catch (jsonErr) {
                    setError('Erreur de parsing JSON : ' + jsonErr.message);
                }
            };
            reader.onerror = () => setError('Erreur lors de la lecture du fichier');
            reader.readAsText(file);
        } catch (err) {
            setError('Erreur lors de l\'importation des données');
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
                        <HoverSpeakText>Création de Facture</HoverSpeakText>
                        {isTTSEnabled && (
                            <TTSButton 
                                elementId="create-invoice-container"
                                className="ml-2"
                                size="sm"
                                label="Lire toutes les informations de création de facture"
                            />
                        )}
                    </h2>
                    <p><HoverSpeakText>Gérez vos factures avec style</HoverSpeakText></p>
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
                        <HoverSpeakText textToSpeak="Extraire depuis un document PDF ou Image">
                            <label className={styles.label}>Extraire depuis un document (PDF/Image)</label>
                        </HoverSpeakText>
                        <input
                            type="file"
                            accept="application/pdf,image/png,image/jpeg,image/jpg"
                            onChange={handleExtract}
                            disabled={loading || !watchBusinessId}
                            className={styles.input}
                            aria-label="Télécharger un document pour extraction"
                        />
                    </div>

                    <div className={styles.inputGrid}>
                        <div className={styles.field}>
                            <HoverSpeakText textToSpeak="Sélectionner une entreprise">
                                <label className={styles.label}>Entreprise</label>
                            </HoverSpeakText>
                            <select
                                {...register('businessId', { required: 'Veuillez sélectionner une entreprise' })}
                                disabled={loading || businesses.length === 0}
                                className={styles.input}
                                aria-label="Liste des entreprises"
                            >
                                <option value="">Sélectionner une entreprise</option>
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
                                <HoverSpeakText textToSpeak="Détails de l'entreprise">
                                    <label className={styles.label}>Détails de l'entreprise</label>
                                </HoverSpeakText>
                                <div className={styles.businessDetails}>
                                    <p>
                                        <HoverSpeakText>
                                            <strong>Nom :</strong> {selectedBusiness.name}
                                        </HoverSpeakText>
                                    </p>
                                    <p>
                                        <HoverSpeakText>
                                            <strong>Adresse :</strong> {selectedBusiness.address}
                                        </HoverSpeakText>
                                    </p>
                                    <p>
                                        <HoverSpeakText>
                                            <strong>N° Taxe :</strong> {selectedBusiness.taxNumber}
                                        </HoverSpeakText>
                                    </p>
                                </div>
                            </div>
                        )}

                        {[
                            { name: 'customerName', label: 'Nom du client', required: 'Ce champ est requis', maxLength: { value: 100, message: 'Maximum 100 caractères' } },
                            { name: 'invoiceNumber', label: 'Numéro de facture', required: 'Ce champ est requis', pattern: { value: /^[A-Za-z0-9-]+$/, message: 'Alphanumérique avec tirets uniquement' } },
                            { name: 'orderNumber', label: 'Numéro de commande' },
                            { name: 'invoiceDate', label: 'Date de facture', type: 'date', required: 'Ce champ est requis' },
                            { name: 'dueDate', label: 'Date d\'échéance', type: 'date', required: 'Ce champ est requis', validate: value => new Date(value) >= new Date(watch('invoiceDate')) || 'Doit être postérieure à la date de facture' }
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
                            <HoverSpeakText>Articles</HoverSpeakText>
                            <TTSButton 
                                text="Cette section contient tous les articles de la facture" 
                                className="ml-2"
                                size="sm"
                            />
                        </h3>
                        {fields.map((item, index) => (
                            <div key={item.id} className={styles.itemRow}>
                                <div>
                                    <HoverSpeakText textToSpeak="Détails de l'article">
                                        <label className={styles.label}>Détails</label>
                                    </HoverSpeakText>
                                    <input
                                        {...register(`items.${index}.itemDetails`, { required: 'Requis', maxLength: { value: 200, message: 'Maximum 200 caractères' } })}
                                        disabled={loading}
                                        className={styles.itemInput}
                                        aria-label={`Détails de l'article ${index + 1}`}
                                    />
                                    {errors.items?.[index]?.itemDetails && (
                                        <span className={styles.error}>
                                            <HoverSpeakText>{errors.items[index].itemDetails.message}</HoverSpeakText>
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <HoverSpeakText textToSpeak="Quantité">
                                        <label className={styles.label}>Quantité</label>
                                    </HoverSpeakText>
                                    <input
                                        type="number"
                                        step="1"
                                        {...register(`items.${index}.quantity`, { required: 'Requis', min: { value: 1, message: 'Minimum 1' }, valueAsNumber: true })}
                                        disabled={loading}
                                        className={styles.itemInput}
                                        aria-label={`Quantité de l'article ${index + 1}`}
                                    />
                                    {errors.items?.[index]?.quantity && (
                                        <span className={styles.error}>
                                            <HoverSpeakText>{errors.items[index].quantity.message}</HoverSpeakText>
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <HoverSpeakText textToSpeak="Prix unitaire">
                                        <label className={styles.label}>Prix unitaire</label>
                                    </HoverSpeakText>
                                    <input
                                        type="number"
                                        step="0.01"
                                        {...register(`items.${index}.rate`, { required: 'Requis', min: { value: 0, message: 'Minimum 0' }, valueAsNumber: true })}
                                        disabled={loading}
                                        className={styles.itemInput}
                                        aria-label={`Prix unitaire de l'article ${index + 1}`}
                                    />
                                    {errors.items?.[index]?.rate && (
                                        <span className={styles.error}>
                                            <HoverSpeakText>{errors.items[index].rate.message}</HoverSpeakText>
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <HoverSpeakText textToSpeak="Taux de taxe en pourcentage">
                                        <label className={styles.label}>Taxe (%)</label>
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
                                        aria-label={`Taux de taxe de l'article ${index + 1}`}
                                    />
                                    {errors.items?.[index]?.taxPercentage && (
                                        <span className={styles.error}>
                                            <HoverSpeakText>{errors.items[index].taxPercentage.message}</HoverSpeakText>
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <HoverSpeakText textToSpeak="Montant total avec taxe">
                                        <label className={styles.label}>Montant</label>
                                    </HoverSpeakText>
                                    <input
                                        type="number"
                                        value={calculateAmount(watchItems[index]).toFixed(2)}
                                        disabled
                                        className={`${styles.itemInput} ${styles.amountInput}`}
                                        aria-label={`Montant total de l'article ${index + 1}: ${calculateAmount(watchItems[index]).toFixed(2)}`}
                                    />
                                </div>
                                <HoverSpeakText textToSpeak={`Supprimer l'article ${index + 1}`}>
                                    <button
                                        type="button"
                                        onClick={() => remove(index)}
                                        disabled={fields.length === 1 || loading}
                                        className={styles.removeButton}
                                        aria-label={`Supprimer l'article ${index + 1}`}
                                    >
                                        Supprimer
                                    </button>
                                </HoverSpeakText>
                            </div>
                        ))}
                        <div className={styles.itemButtons}>
                            <HoverSpeakText textToSpeak="Sélectionner un article existant">
                                <button
                                    type="button"
                                    onClick={() => setItemModal(true)}
                                    disabled={loading}
                                    className={`${styles.addButton} ${styles.selectItem}`}
                                    aria-label="Sélectionner un article existant"
                                >
                                    + Sélectionner un article existant
                                </button>
                            </HoverSpeakText>
                            <HoverSpeakText textToSpeak="Ajouter un article personnalisé">
                                <button
                                    type="button"
                                    onClick={() => append({ itemDetails: '', quantity: 1, rate: 0, taxPercentage: 0 })}
                                    disabled={loading}
                                    className={styles.addButton}
                                    aria-label="Ajouter un article personnalisé"
                                >
                                    + Ajouter un article personnalisé
                                </button>
                            </HoverSpeakText>
                        </div>

                        <Modal isOpen={itemModal} toggle={() => setItemModal(!itemModal)} size="lg">
                            <ModalHeader toggle={() => setItemModal(!itemModal)}>
                                <HoverSpeakText>Sélectionner un article</HoverSpeakText>
                            </ModalHeader>
                            <ModalBody>
                                <div className={styles.searchContainer}>
                                    <div className={styles.searchBox}>
                                        <FaSearch className={styles.searchIcon} />
                                        <HoverSpeakText textToSpeak="Rechercher des articles">
                                            <Input
                                                type="text"
                                                placeholder="Rechercher des articles..."
                                                value={searchTerm}
                                                onChange={handleSearchChange}
                                                className={styles.searchInput}
                                                aria-label="Rechercher des articles"
                                            />
                                        </HoverSpeakText>
                                    </div>
                                </div>

                                {loadingItems ? (
                                    <div className={styles.spinnerContainer}>
                                        <Spinner />
                                        <HoverSpeakText>Chargement des articles...</HoverSpeakText>
                                    </div>
                                ) : (
                                    <Table hover responsive className={styles.itemsTable}>
                                        <thead>
                                        <tr>
                                            {['Nom', 'Unité', 'Prix', 'Taux de taxe', 'Action'].map((header) => (
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
                                                    <HoverSpeakText textToSpeak={`Sélectionner l'article ${item.name}`}>
                                                        <button
                                                            onClick={() => handleItemSelect(item)}
                                                            className={styles.selectButton}
                                                            aria-label={`Sélectionner l'article ${item.name}`}
                                                        >
                                                            Sélectionner
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
                                <HoverSpeakText>Totaux</HoverSpeakText>
                                <TTSButton 
                                    text="Cette section affiche les totaux de la facture" 
                                    className="ml-2"
                                    size="sm"
                                />
                            </h4>
                            <div className={styles.totalsGrid}>
                                <div className={styles.field}>
                                    <HoverSpeakText textToSpeak="Sous-total de la facture">
                                        <label className={styles.label}>Sous-total</label>
                                    </HoverSpeakText>
                                    <HoverSpeakText textToSpeak={`Sous-total: ${subTotal}`}>
                                        <input value={subTotal} disabled className={`${styles.input} ${styles.totalInput}`} aria-label={`Sous-total: ${subTotal}`} />
                                    </HoverSpeakText>
                                </div>
                                <div className={styles.field}>
                                    <HoverSpeakText textToSpeak="Remise sur la facture">
                                        <label className={styles.label}>Remise</label>
                                    </HoverSpeakText>
                                    <input
                                        type="number"
                                        step="0.01"
                                        {...register('discount', {
                                            min: { value: 0, message: 'Minimum 0' },
                                            max: { value: subTotal, message: 'Ne peut pas dépasser le sous-total' },
                                            valueAsNumber: true
                                        })}
                                        disabled={loading}
                                        className={styles.input}
                                        aria-label="Remise sur la facture"
                                    />
                                    {errors.discount && (
                                        <span className={styles.error}>
                                            <HoverSpeakText>{errors.discount.message}</HoverSpeakText>
                                        </span>
                                    )}
                                </div>
                                <div className={styles.field}>
                                    <HoverSpeakText textToSpeak="Frais de livraison">
                                        <label className={styles.label}>Frais de livraison</label>
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
                                        aria-label="Frais de livraison"
                                    />
                                    {errors.shippingCharges && (
                                        <span className={styles.error}>
                                            <HoverSpeakText>{errors.shippingCharges.message}</HoverSpeakText>
                                        </span>
                                    )}
                                </div>
                                <div className={styles.field}>
                                    <HoverSpeakText textToSpeak="Total de la facture">
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
                            <HoverSpeakText textToSpeak="Notes pour le client">
                                <label className={styles.label}>Notes client</label>
                            </HoverSpeakText>
                            <textarea
                                {...register('customerNotes', { maxLength: { value: 500, message: 'Maximum 500 caractères' } })}
                                disabled={loading}
                                className={styles.textarea}
                                aria-label="Notes pour le client"
                            />
                            {errors.customerNotes && (
                                <span className={styles.error}>
                                    <HoverSpeakText>{errors.customerNotes.message}</HoverSpeakText>
                                </span>
                            )}
                        </div>
                        <HoverSpeakText textToSpeak="Créer la facture">
                            <button
                                type="submit"
                                disabled={loading || Object.keys(errors).length > 0}
                                className={styles.submitButton}
                                aria-label="Créer la facture"
                            >
                                {loading ? 'Création...' : 'Créer la facture'}
                            </button>
                        </HoverSpeakText>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateInvoice;