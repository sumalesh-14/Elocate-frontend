import React, { useEffect, useState } from 'react';
import { fetchDeviceCategories } from '../../services/api';
import { Category } from '../../types';
import './ListCategories.css';

const ListCategories: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [activeFilter, setActiveFilter] = useState<boolean | null>(null);

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const data = await fetchDeviceCategories();
                setCategories(data);
            } catch (err) {
                setError('Failed to load categories');
            } finally {
                setLoading(false);
            }
        };

        loadCategories();
    }, []);

    const filteredCategories = categories.filter(category => {
        const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesActiveFilter = activeFilter === null || category.status === (activeFilter ? 'Active' : 'Inactive');
        return matchesSearch && matchesActiveFilter;
    });

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    const handleActiveFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setActiveFilter(event.target.value === 'all' ? null : event.target.value === 'active');
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="list-categories">
            <h2>Device Categories</h2>
            <input
                type="text"
                placeholder="Search by name"
                value={searchTerm}
                onChange={handleSearchChange}
            />
            <select onChange={handleActiveFilterChange}>
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
            </select>
            <table>
                <thead>
                    <tr>
                        <th>Code</th>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Status</th>
                        <th>Created Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredCategories.map(category => (
                        <tr key={category.code}>
                            <td>{category.code}</td>
                            <td>{category.name}</td>
                            <td>{category.description}</td>
                            <td>{category.status}</td>
                            <td>{new Date(category.createdDate).toLocaleDateString()}</td>
                            <td>
                                <button>Edit</button>
                                <button>{category.status === 'Active' ? 'Deactivate' : 'Activate'}</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ListCategories;