"use client";
import React, { useEffect, useState } from 'react';
import { fetchDeviceModels } from '../services/api';
import { DeviceModel } from '../types';
import Link from 'next/link';
import './ListModels.css';

const ListModels: React.FC = () => {
    const [models, setModels] = useState<DeviceModel[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [activeFilter, setActiveFilter] = useState<boolean | null>(null);

    useEffect(() => {
        const loadModels = async () => {
            try {
                const data = await fetchDeviceModels();
                setModels(data);
            } catch (err) {
                setError('Failed to load device models');
            } finally {
                setLoading(false);
            }
        };

        loadModels();
    }, []);

    const filteredModels = models.filter(model => {
        const matchesSearch = model.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesActiveFilter = activeFilter === null || model.active === activeFilter;
        return matchesSearch && matchesActiveFilter;
    });

    if (loading) return <div>Loading...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="list-models">
            <input
                type="text"
                placeholder="Search by name"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
            />
            <select onChange={e => setActiveFilter(e.target.value === '' ? null : e.target.value === 'true')}>
                <option value="">All Statuses</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
            </select>
            <table>
                <thead>
                    <tr>
                        <th>Model Name</th>
                        <th>Brand Id</th>
                        <th>Category</th>
                        <th>Release Year</th>
                        <th>Recyclability Score</th>
                        <th>Base Points</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredModels.map(model => (
                        <tr key={model.id}>
                            <td>{model.name}</td>
                            <td>{model.brand || model.brandId}</td>
                            <td>{model.category || model.categoryCode}</td>
                            <td>{model.releaseYear || '--'}</td>
                            <td>{model.recyclabilityScore || '--'}</td>
                            <td>{model.basePoints || '--'}</td>
                            <td style={{ color: model.active ? '#22c55e' : '#94a3b8' }}>
                                {model.active ? 'Active' : 'Inactive'}
                            </td>
                            <td>
                                <Link
                                    href={`/device-models/edit/${model.id}`}
                                    className="btn-edit"
                                >
                                    Edit
                                </Link>
                                <button className={model.active ? 'btn-deactivate' : 'btn-activate'}>
                                    {model.active ? 'Deactivate' : 'Activate'}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ListModels;