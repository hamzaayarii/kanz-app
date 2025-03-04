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
        <Container>
            <h2>Users List</h2>
            {error && <Alert color="danger">{error}</Alert>}

            {loading ? (
                <div className="text-center">
                    <Spinner color="primary" />
                </div>
            ) : (
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
                                        onClick={() => toggleBan(user._id, user.isBanned)}
                                    >
                                        {user.isBanned ? 'Unban' : 'Ban'}
                                    </Button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4" className="text-center">No users found.</td>
                        </tr>
                    )}
                    </tbody>
                </Table>
            )}
        </Container>
    );
};

export default UsersList;
