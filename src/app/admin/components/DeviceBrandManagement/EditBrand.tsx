import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { getBrandById, updateBrand } from '../../services/api';
import { validateBrandName } from '../../utils/validations';

const EditBrand = () => {
    const params = useParams();
    const id = params?.id as string;
    const router = useRouter();
    const [brandName, setBrandName] = useState('');
    const [activeStatus, setActiveStatus] = useState(true);
    const [error, setError] = useState('');


    useEffect(() => {
        const fetchBrand = async () => {
            const brand = await getBrandById(id);
            setBrandName(brand.name);
            setActiveStatus(brand.active);
        };
        fetchBrand();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!validateBrandName(brandName)) {
            setError('Brand name cannot be empty and must be unique.');
            return;
        }
        if (!id) return;
        await updateBrand(id, { name: brandName, active: activeStatus });
        router.push('/device-brands');
    };

    return (
        <div>
            <h2>Edit Brand</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Brand Name:</label>
                    <input
                        type="text"
                        value={brandName}
                        onChange={(e) => setBrandName(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Active Status:</label>
                    <input
                        type="checkbox"
                        checked={activeStatus}
                        onChange={(e) => setActiveStatus(e.target.checked)}
                    />
                </div>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <button type="submit">Save</button>
            </form>
        </div>
    );
};

export default EditBrand;