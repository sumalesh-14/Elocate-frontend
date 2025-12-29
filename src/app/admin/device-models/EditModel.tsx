"use client";
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { getModelById, updateDeviceModel } from '../services/api';
import { validateModelName } from '../utils/validations';

const EditModel = () => {
    const params = useParams();
    const id = params?.id as string;
    const router = useRouter();
    const [Model, setModel] = useState({
        id: '',
        name: '',
        brandId: '',
        categoryCode: '',
        active: true,
        createdDate: '',
    });
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchModel = async () => {
            if (!id) {
                setError('Model ID is required');
                return;
            }
            const data = await getModelById(id);
            setModel(data);
        };
        fetchModel();
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setModel({ ...Model, [name]: value });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const { id, name } = Model;

        if (!validateModelName(name)) {
            setError('Invalid Model name');
            return;
        }

        if (!id) {
            setError('Model ID is required');
            return;
        }

        await updateDeviceModel(id, Model);
        router.push('/device-models');
    };

    return (
        <div>
            <h2>Edit Device Model</h2>
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Model Name</label>
                    <input
                        type="text"
                        name="name"
                        value={Model.name}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>Brand Id</label>
                    <input
                        type="text"
                        name="brandId"
                        value={Model.brandId}
                        onChange={handleChange}
                        readOnly
                    />
                </div>
                <div>
                    <label>Category</label>
                    <input
                        type="text"
                        name="categoryCode"
                        value={Model.categoryCode}
                        onChange={handleChange}
                        readOnly
                    />
                </div>
                <div>
                    <label>
                        <input
                            type="checkbox"
                            name="status"
                            checked={Model.active === true}
                            onChange={() => setModel({ ...Model, active: Model.active === true ? false : true })}
                        />
                        Active
                    </label>
                </div>
                <button type="submit">Update Model</button>
            </form>
        </div>
    );
};

export default EditModel;