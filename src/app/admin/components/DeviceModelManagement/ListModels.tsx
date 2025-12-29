import React, { useEffect, useState } from 'react';
import { fetchDeviceModels } from '../../services/api';
import { DeviceModel } from '../../types';
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

    return (
        <div className="list-models">
            <h1>Device Models</h1>
            {loading && <p>Loading...</p>}
            {error && <p className="error">{error}</p>}
            <input
                type="text"
                placeholder="Search by model name"
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
                        <th>Brand</th>
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
                            <td>{model.active ? 'Active' : 'Inactive'}</td>
                            <td>
                                <button>Edit</button>
                                <button>{model.active ? 'Deactivate' : 'Activate'}</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ListModels;