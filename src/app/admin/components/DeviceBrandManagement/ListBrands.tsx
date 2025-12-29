import React, { useEffect, useState } from 'react';
import { fetchDeviceBrands } from '../../services/api';
import { Brand } from '@/src/app/types';

const ListBrands: React.FC = () => {
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
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

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div>
            <h1>Device Brands</h1>
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
                        <th>Brand Name</th>
                        <th>Status</th>
                        <th>Created Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredBrands.map(brand => (
                        <tr key={brand.id}>
                            <td>{brand.name}</td>
                            <td>{brand.active ? 'Active' : 'Inactive'}</td>
                            <td>{new Date(brand.createdDate).toLocaleDateString()}</td>
                            <td>
                                <button>Edit</button>
                                <button>{brand.active ? 'Deactivate' : 'Activate'}</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ListBrands;