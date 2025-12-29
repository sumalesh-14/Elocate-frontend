"use client";
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { getCategoryById, updateDeviceCategory } from '../services/api';
import { validateCategoryCode, validateCategoryName } from '../utils/validations';

const EditCategory = () => {
    const params = useParams();
    const id = params?.id as string;
    const router = useRouter();
    const [category, setCategory] = useState({
        code: '',
        name: '',
        description: '',
        status: 'Active' as 'Active' | 'Inactive',
        createdDate: '',
    });
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchCategory = async () => {
            if (!id) {
                setError('Category ID is required');
                return;
            }
            const data = await getCategoryById(id);
            setCategory(data);
        };
        fetchCategory();
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setCategory({ ...category, [name]: value });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const { code, name } = category;

        if (!validateCategoryCode(code) || !validateCategoryName(name)) {
            setError('Invalid category code or name');
            return;
        }

        if (!id) {
            setError('Category ID is required');
            return;
        }

        await updateDeviceCategory(id, category);
        router.push('/device-categories');
    };

    return (
        <div>
            <h2>Edit Device Category</h2>
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Category Code</label>
                    <input
                        type="text"
                        name="code"
                        value={category.code}
                        onChange={handleChange}
                        readOnly
                    />
                </div>
                <div>
                    <label>Category Name</label>
                    <input
                        type="text"
                        name="name"
                        value={category.name}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>Description</label>
                    <textarea
                        name="description"
                        value={category.description}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>
                        <input
                            type="checkbox"
                            name="status"
                            checked={category.status === 'Active'}
                            onChange={() => setCategory({ ...category, status: category.status === 'Active' ? 'Inactive' : 'Active' })}
                        />
                        Active
                    </label>
                </div>
                <button type="submit">Update Category</button>
            </form>
        </div>
    );
};

export default EditCategory;