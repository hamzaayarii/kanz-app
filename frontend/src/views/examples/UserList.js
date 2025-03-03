import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Button, Container, Alert } from 'reactstrap';
import { Navigate } from 'react-router-dom';

const UsersList = () => {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState(null);
    const [redirect, setRedirect] = useState(false);

    // Récupérer les données de l'utilisateur depuis localStorage
    const user = JSON.parse(localStorage.getItem('user'));

    // Vérifier si l'utilisateur est un administrateur et non banni
    useEffect(() => {
        if (!user || user.role !== 'admin' || user.isBanned) {
            console.log('User is not an admin or is banned:', user);
            setRedirect(true);
        } else {
            console.log('User is an admin:', user);
        }
    }, [user]);

    // Récupérer la liste des utilisateurs depuis le backend
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = localStorage.getItem('authToken'); // Récupérer le token JWT
                const response = await axios.get('http://localhost:5000/api/users', {
                    headers: { Authorization: `Bearer ${token}` }, // Fixed string interpolation
                });
                setUsers(response.data.users);
            } catch (err) {
                console.error('Error fetching users:', err);
                setError('Failed to load users. Please try again.');
            }
        };
        if (user && user.role === 'admin' && !user.isBanned) {
            fetchUsers();
        }
    }, [user]);

    // Fonction pour bannir un utilisateur
    const handleBan = async (id) => {
        try {
            const token = localStorage.getItem('authToken');
            await axios.post(`http://localhost:5000/api/users/${id}/ban`, {}, {
                headers: { Authorization: `Bearer ${token}` }, // Fixed string interpolation
            });
            setUsers(users.map(user => user._id === id ? { ...user, isBanned: true } : user));
        } catch (err) {
            console.error('Error banning user:', err);
            setError('Failed to ban user. Please try again.');
        }
    };

    // Fonction pour débannir un utilisateur
    const handleUnban = async (id) => {
        try {
            const token = localStorage.getItem('authToken');
            await axios.post(`http://localhost:5000/api/users/${id}/unban`, {}, {
                headers: { Authorization: `Bearer ${token}` }, // Fixed string interpolation
            });
            setUsers(users.map(user => user._id === id ? { ...user, isBanned: false } : user));
        } catch (err) {
            console.error('Error unbanning user:', err);
            setError('Failed to unban user. Please try again.');
        }
    };

    if (redirect) {
        return <Navigate to="/" replace />;
    }

    return (
        <Container>
            <h2>Users List</h2>
            {error && <Alert color="danger">{error}</Alert>}
            <Table bordered hover>
                <thead>
                <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {users.length > 0 ? (
                    users.map(user => (
                        <tr key={user._id}>
                            <td>{user.fullName}</td>
                            <td>{user.email}</td>
                            <td>{user.isBanned ? 'Banned' : 'Active'}</td>
                            <td>
                                <Button
                                    color={user.isBanned ? 'success' : 'danger'}
                                    size="sm"
                                    onClick={() => (user.isBanned ? handleUnban(user._id) : handleBan(user._id))}
                                >
                                    {user.isBanned ? 'Unban' : 'Ban'}
                                </Button>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="4" className="text-center">
                            No users found.
                        </td>
                    </tr>
                )}
                </tbody>
            </Table>
        </Container>
    );
};

export default UsersList;
