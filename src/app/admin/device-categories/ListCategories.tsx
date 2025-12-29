"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchDeviceCategories } from '../services/api';
import { Category } from '@/src/app/types';
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
            <input
                type="text"
                placeholder="Search by name"
                value={searchTerm}
                onChange={handleSearchChange}
            />
            <select onChange={handleActiveFilterChange}>
                <option value="all">All Statuses</option>
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
                            <td style={{ color: category.status === 'Active' ? '#22c55e' : '#94a3b8' }}>
                                {category.status}
                            </td>
                            <td>{new Date(category.createdDate).toLocaleDateString()}</td>
                            <td>
                                <Link
                                    href={`/device-categories/edit/${category.code}`}
                                    className="btn-edit"
                                >
                                    Edit
                                </Link>
                                <button className={category.status === 'Active' ? 'btn-deactivate' : 'btn-activate'}>
                                    {category.status === 'Active' ? 'Deactivate' : 'Activate'}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ListCategories;