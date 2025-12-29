"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchDeviceBrands } from '../services/api';
import './ListBrands.css';

interface Brand {
    id: string;
    name: string;
    active: boolean;
    createdDate: string;
}

const ListBrands: React.FC = () => {
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [activeFilter, setActiveFilter] = useState<boolean | null>(null);

    useEffect(() => {
        const loadBrands = async () => {
            try {
                const data = await fetchDeviceBrands();
                setBrands(data);
            } catch (err) {
                setError('Failed to load brands');
            } finally {
                setLoading(false);
            }
        };

        loadBrands();
    }, []);

    const filteredBrands = brands.filter(brand => {
        const matchesSearch = brand.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesActiveFilter = activeFilter === null || brand.active === activeFilter;
        return matchesSearch && matchesActiveFilter;
    });

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    const handleActiveFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setActiveFilter(event.target.value === 'all' ? null : event.target.value === 'active');
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this brand?')) {
            try {
                setBrands(brands.filter(brand => brand.id !== id));
            } catch (err) {
                setError('Failed to delete brand');
            }
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="list-brands">
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
                        <th>ID</th>
                        <th>Brand Name</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredBrands.length === 0 ? (
                        <tr>
                            <td colSpan={4} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                                No brands found. Create your first brand to get started.
                            </td>
                        </tr>
                    ) : (
                        filteredBrands.map((brand) => (
                            <tr key={brand.id}>
                                <td>{brand.id}</td>
                                <td>{brand.name}</td>
                                <td style={{ color: brand.active ? '#22c55e' : '#94a3b8' }}>
                                    {brand.active ? 'Active' : 'Inactive'}
                                </td>
                                <td>
                                    <Link
                                        href={`/device-brands/edit/${brand.id}`}
                                        className="btn-edit"
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(brand.id)}
                                        className={brand.active ? 'status-inactive' : 'status-active'}>
                                        {brand.active ? 'Deactivate' : 'Activate'}
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default ListBrands;
