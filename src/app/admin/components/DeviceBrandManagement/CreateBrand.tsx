import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrand } from '../../services/api';
import { validateBrandName } from '../../utils/validations';

const CreateBrand = () => {
    const [brandName, setBrandName] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');

        if (!validateBrandName(brandName)) {
            setError('Brand name is required and must be unique.');
            return;
        }

        try {
            await createBrand({ name: brandName, active: isActive });
            router.push('/device-brands');
        } catch (err) {
            setError('Failed to create brand. Please try again.');
        }
    };

    return (
        <div>
            <h2>Create New Brand</h2>
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Brand Name</label>
                    <input
                        type="text"
                        value={brandName}
                        onChange={(e) => setBrandName(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>
                        <input
                            type="checkbox"
                            checked={isActive}
                            onChange={(e) => setIsActive(e.target.checked)}
                        />
                        Active
                    </label>
                </div>
                <button type="submit">Create Brand</button>
            </form>
        </div>
    );
};

export default CreateBrand;