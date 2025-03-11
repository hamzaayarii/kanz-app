import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Button, Container, Alert, Spinner } from 'reactstrap';
import { Navigate } from 'react-router-dom';

const UsersList = () => {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [redirect, setRedirect] = useState(false);

    // Vérifier si l'utilisateur est un admin et non banni
    const storedUser = localStorage.getItem('user');
    const user = storedUser ? JSON.parse(storedUser) : null;

    useEffect(() => {
        if (!user || user.role !== 'admin' || user.isBanned) {
            console.log('User is not an admin or is banned:', user);
            setRedirect(true);
        }
    }, [user]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = localStorage.getItem('authToken');
                if (!token) {
                    throw new Error('Authentication token missing. Please log in again.');
                }

                console.log("Using Token:", token); // Debugging

                const response = await axios.get('http://localhost:5000/api/users', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                console.log("Users fetched:", response.data);
                setUsers(response.data.users);
            } catch (err) {
                console.error("Error fetching users:", err);
                setError(err.response?.data?.message || "Failed to load users. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        if (user && user.role === 'admin' && !user.isBanned) {
            fetchUsers();
        }
    }, [user]);

    // Fonction pour bannir/débannir un utilisateur
    const toggleBan = async (id, isBanned) => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) throw new Error('No authentication token found.');

            const url = `http://localhost:5000/api/users/${id}/${isBanned ? 'unban' : 'ban'}`;
            await axios.post(url, {}, { headers: { Authorization: `Bearer ${token}` } });

            setUsers(users.map(user => user._id === id ? { ...user, isBanned: !isBanned } : user));
        } catch (err) {
            console.error(`Error ${isBanned ? 'unbanning' : 'banning'} user:`, err);
            setError(`Failed to ${isBanned ? 'unban' : 'ban'} user. Please try again.`);
        }
    };

    if (redirect) {
        return <Navigate to="/" replace />;
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            padding: '40px 20px',
            fontFamily: "'Arial', sans-serif"
        }}>
            <Container style={{
                maxWidth: '1200px',
                margin: '0 auto',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '20px',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                overflow: 'hidden',
                position: 'relative'
            }}>
                <div style={{
                    background: 'linear-gradient(to right, #4facfe, #00f2fe)',
                    padding: '30px',
                    color: 'white',
                    borderRadius: '20px 20px 0 0'
                }}>
                    <h2 style={{
                        fontSize: '36px',
                        fontWeight: 'bold',
                        margin: '0',
                        textShadow: '2px 2px 4px rgba(0,0,0,0.2)'
                    }}>Liste des Utilisateurs</h2>
                    <p style={{ margin: '10px 0 0', fontSize: '18px' }}>Gérez vos utilisateurs avec style</p>
                </div>

                <div style={{ padding: '40px' }}>
                    {error && (
                        <Alert color="danger" style={{
                            borderRadius: '10px',
                            marginBottom: '20px',
                            fontWeight: '500',
                            background: 'linear-gradient(to right, #ff6b6b, #ff8787)',
                            color: 'white',
                            border: 'none'
                        }}>
                            {error}
                        </Alert>
                    )}

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '50px 0' }}>
                            <Spinner style={{
                                width: '3rem',
                                height: '3rem',
                                borderWidth: '0.4em',
                                color: '#4facfe'
                            }} />
                            <p style={{
                                marginTop: '15px',
                                fontSize: '1.2rem',
                                color: '#4facfe',
                                fontWeight: '500'
                            }}>Chargement des utilisateurs...</p>
                        </div>
                    ) : (
                        <Table bordered hover style={{
                            background: 'white',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            boxShadow: '0 5px 15px rgba(0,0,0,0.05)'
                        }}>
                            <thead>
                            <tr style={{
                                background: 'linear-gradient(to right, #4facfe, #00f2fe)',
                                color: 'white',
                                fontWeight: '600'
                            }}>
                                <th style={{ padding: '15px' }}>Nom</th>
                                <th style={{ padding: '15px' }}>Email</th>
                                <th style={{ padding: '15px' }}>Statut</th>
                                <th style={{ padding: '15px' }}>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {users.length > 0 ? (
                                users.map(user => (
                                    <tr key={user._id} style={{
                                        transition: 'transform 0.2s ease, background-color 0.3s ease'
                                    }}
                                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
                                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                                        <td style={{ padding: '15px' }}>{user.fullName}</td>
                                        <td style={{ padding: '15px' }}>{user.email}</td>
                                        <td style={{ padding: '15px' }}>
                                                <span style={{
                                                    padding: '5px 10px',
                                                    borderRadius: '20px',
                                                    fontSize: '0.9rem',
                                                    fontWeight: '500',
                                                    backgroundColor: user.isBanned ? '#ff8787' : '#b8e994',
                                                    color: user.isBanned ? '#721c24' : '#2d572c'
                                                }}>
                                                    {user.isBanned ? 'Banni' : 'Actif'}
                                                </span>
                                        </td>
                                        <td style={{ padding: '15px' }}>
                                            <Button
                                                color={user.isBanned ? 'success' : 'danger'}
                                                size="sm"
                                                onClick={() => toggleBan(user._id, user.isBanned)}
                                                style={{
                                                    background: user.isBanned
                                                        ? 'linear-gradient(to right, #2ecc71, #27ae60)'
                                                        : 'linear-gradient(to right, #ff6b6b, #ff8787)',
                                                    border: 'none',
                                                    borderRadius: '25px',
                                                    padding: '8px 16px',
                                                    fontWeight: '500',
                                                    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                                                }}
                                                onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                                                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                                            >
                                                {user.isBanned ? 'Débannir' : 'Bannir'}
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" style={{
                                        textAlign: 'center',
                                        padding: '20px',
                                        fontStyle: 'italic',
                                        color: '#666'
                                    }}>
                                        Aucun utilisateur trouvé.
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </Table>
                    )}
                </div>
            </Container>
        </div>
    );
};

export default UsersList;
