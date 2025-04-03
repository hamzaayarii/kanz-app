import React, { useEffect, useState, Component } from 'react';
import axios from 'axios';

// Composant ErrorBoundary pour gérer les erreurs
class ErrorBoundary extends Component {
    state = { hasError: false, error: null };

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ textAlign: 'center', padding: '20px', color: 'red' }}>
                    <h2>Une erreur est survenue</h2>
                    <p>{this.state.error.message}</p>
                </div>
            );
        }
        return this.props.children;
    }
}

// Composant LoadingSpinner
const LoadingSpinner = () => (
    <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '200px'
    }}>
        <div style={{
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #4facfe',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            animation: 'spin 1s linear infinite'
        }} />
        <style>{`
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `}</style>
    </div>
);

const InvoiceList = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [sortBy, setSortBy] = useState('invoiceDate');
    const [sortOrder, setSortOrder] = useState('desc');

    useEffect(() => {
        fetchInvoices();
    }, [page, sortBy, sortOrder]);

    const fetchInvoices = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('Veuillez vous connecter pour voir vos factures');
            }
            const response = await axios.get('http://localhost:5000/api/invoices', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params: {
                    page,
                    limit: 10,
                    sort: `${sortOrder === 'desc' ? '-' : ''}${sortBy}`
                },
                timeout: 10000
            });

            const fetchedInvoices = response.data.invoices || [];
            setInvoices(fetchedInvoices);
            setTotalPages(response.data.pagination?.pages || 1);
        } catch (error) {
            setError(error.response?.data?.message || error.message || 'Erreur lors du chargement des factures');
            console.error('Erreur lors du chargement:', error);
        } finally {
            setLoading(false);
        }
    };

    const deleteInvoice = async (id) => {
        if (!window.confirm('Voulez-vous vraiment supprimer cette facture ?')) return;

        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('Veuillez vous connecter pour supprimer une facture');
            }
            await axios.delete(`http://localhost:5000/api/invoices/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setInvoices(invoices.filter(invoice => invoice._id !== id));
            alert('Facture supprimée avec succès');
        } catch (error) {
            setError(error.response?.data?.message || 'Erreur lors de la suppression');
            console.error('Erreur lors de la suppression:', error);
        } finally {
            setLoading(false);
        }
    };

    const downloadPDF = async (id, invoiceNumber) => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('Veuillez vous connecter pour télécharger le PDF');
            }

            const response = await axios.get(`http://localhost:5000/api/invoices/${id}/pdf`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                responseType: 'blob',
            });

            if (response.headers['content-type'] !== 'application/pdf') {
                throw new Error('La réponse reçue n\'est pas un PDF');
            }

            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `facture-${invoiceNumber || id}.pdf`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Erreur complète lors du téléchargement:', error);
            let message = error.message;
            if (error.response) {
                if (error.response.data instanceof Blob) {
                    message = await error.response.data.text();
                } else {
                    message = error.response.data?.message || `Erreur serveur: ${error.response.status}`;
                }
            } else if (error.request) {
                message = 'Le serveur est injoignable. Vérifiez votre connexion ou l’état du serveur.';
            }
            setError(message || 'Erreur lors du téléchargement du PDF');
        }
    };

    const filteredInvoices = invoices.filter(invoice =>
        (invoice.customerName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (invoice.invoiceNumber?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    return (
        <ErrorBoundary>
            <div style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                padding: '40px 20px',
                fontFamily: "'Arial', sans-serif"
            }}>
                <div style={{
                    maxWidth: '1200px',
                    margin: '0 auto',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '20px',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        background: 'linear-gradient(to right, #4facfe, #00f2fe)',
                        padding: '30px',
                        color: 'white',
                        borderRadius: '20px 20px 0 0',
                        textAlign: 'center'
                    }}>
                        <h2 style={{ fontSize: '36px', fontWeight: 'bold', margin: '0' }}>
                            Liste des Factures
                        </h2>
                        <p style={{ margin: '10px 0 0', fontSize: '18px', opacity: '0.9' }}>
                            Visualisez et gérez toutes vos factures
                        </p>
                    </div>

                    <div style={{ padding: '40px' }}>
                        <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <input
                                type="text"
                                placeholder="Rechercher par client ou numéro..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    flex: '1',
                                    padding: '10px',
                                    borderRadius: '5px',
                                    border: '1px solid #ddd',
                                    minWidth: '200px'
                                }}
                            />
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                style={{ padding: '10px', borderRadius: '5px' }}
                            >
                                <option value="invoiceDate">Date</option>
                                <option value="customerName">Client</option>
                                <option value="total">Montant</option>
                            </select>
                            <select
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value)}
                                style={{ padding: '10px', borderRadius: '5px' }}
                            >
                                <option value="desc">Décroissant</option>
                                <option value="asc">Croissant</option>
                            </select>
                        </div>

                        {loading ? (
                            <LoadingSpinner />
                        ) : error ? (
                            <p style={{ textAlign: 'center', fontSize: '18px', color: 'red' }}>
                                {error}
                                <button
                                    onClick={fetchInvoices}
                                    style={{
                                        marginLeft: '10px',
                                        background: 'none',
                                        border: 'none',
                                        color: '#4facfe',
                                        textDecoration: 'underline',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Réessayer
                                </button>
                            </p>
                        ) : filteredInvoices.length === 0 ? (
                            <p style={{ textAlign: 'center', fontSize: '18px', color: '#666' }}>
                                Aucune facture trouvée
                            </p>
                        ) : (
                            <>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                                    gap: '20px'
                                }}>
                                    {filteredInvoices.map((invoice) => (
                                        <div key={invoice._id} style={{
                                            backgroundColor: 'white',
                                            borderRadius: '15px',
                                            padding: '20px',
                                            boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
                                            transition: 'all 0.3s ease',
                                            borderLeft: '5px solid #4facfe'
                                        }}
                                             onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                                             onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                        >
                                            <div style={{ marginBottom: '15px' }}>
                                                <p style={{ fontSize: '18px', color: '#333', fontWeight: '600' }}>
                                                    <span style={{ color: '#4facfe' }}>Client: </span>
                                                    {invoice.customerName || 'Non spécifié'}
                                                </p>
                                                <p style={{ fontSize: '16px', color: '#666' }}>
                                                    <span style={{ color: '#4facfe' }}>Montant: </span>
                                                    {invoice.total ? invoice.total.toFixed(2) : '0.00'} TND
                                                </p>
                                                <p style={{ fontSize: '14px', color: '#888' }}>
                                                    <span style={{ color: '#4facfe' }}>Échéance: </span>
                                                    {invoice.dueDate
                                                        ? new Date(invoice.dueDate).toLocaleDateString('fr-FR')
                                                        : 'Non spécifiée'}
                                                </p>
                                            </div>
                                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                                <button
                                                    onClick={() => downloadPDF(invoice._id, invoice.invoiceNumber)}
                                                    disabled={loading}
                                                    style={{
                                                        background: 'linear-gradient(to right, #4facfe, #00f2fe)',
                                                        color: 'white',
                                                        padding: '10px 20px',
                                                        borderRadius: '20px',
                                                        border: 'none',
                                                        fontSize: '14px',
                                                        cursor: loading ? 'not-allowed' : 'pointer',
                                                        transition: 'all 0.3s ease',
                                                        boxShadow: '0 2px 10px rgba(79, 172, 254, 0.3)',
                                                        opacity: loading ? 0.6 : 1
                                                    }}
                                                    onMouseEnter={(e) => !loading && (e.target.style.transform = 'scale(1.05)')}
                                                    onMouseLeave={(e) => !loading && (e.target.style.transform = 'scale(1)')}
                                                >
                                                    Télécharger PDF
                                                </button>
                                                <button
                                                    onClick={() => deleteInvoice(invoice._id)}
                                                    disabled={loading}
                                                    style={{
                                                        background: 'linear-gradient(to right, #ff6b6b, #ff8787)',
                                                        color: 'white',
                                                        padding: '10px 20px',
                                                        borderRadius: '20px',
                                                        border: 'none',
                                                        fontSize: '14px',
                                                        cursor: loading ? 'not-allowed' : 'pointer',
                                                        transition: 'all 0.3s ease',
                                                        boxShadow: '0 2px 10px rgba(255, 107, 107, 0.3)',
                                                        opacity: loading ? 0.6 : 1
                                                    }}
                                                    onMouseEnter={(e) => !loading && (e.target.style.transform = 'scale(1.05)')}
                                                    onMouseLeave={(e) => !loading && (e.target.style.transform = 'scale(1)')}
                                                >
                                                    Supprimer
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {totalPages > 1 && (
                                    <div style={{ marginTop: '20px', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '10px' }}>
                                        <button
                                            onClick={() => setPage(p => Math.max(1, p - 1))}
                                            disabled={page === 1 || loading}
                                            style={{
                                                padding: '10px 20px',
                                                borderRadius: '5px',
                                                background: page === 1 ? '#ddd' : '#4facfe',
                                                color: 'white',
                                                border: 'none',
                                                cursor: page === 1 ? 'not-allowed' : 'pointer'
                                            }}
                                        >
                                            Précédent
                                        </button>
                                        <span style={{ padding: '10px' }}>
                                            Page {page} sur {totalPages}
                                        </span>
                                        <button
                                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                            disabled={page === totalPages || loading}
                                            style={{
                                                padding: '10px 20px',
                                                borderRadius: '5px',
                                                background: page === totalPages ? '#ddd' : '#4facfe',
                                                color: 'white',
                                                border: 'none',
                                                cursor: page === totalPages ? 'not-allowed' : 'pointer'
                                            }}
                                        >
                                            Suivant
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </ErrorBoundary>
    );
};

export default InvoiceList;
