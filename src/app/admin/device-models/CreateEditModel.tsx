"use client";
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { createModel, updateModel, getModelById } from '../services/api';
import { validateModel } from '../utils/validations';

interface ModelFormData {
    category: string;
    brand: string;
    name: string;
    releaseYear: string;
    active: boolean;
    averageWeight: string;
    recyclabilityScore: string;
    goldRecovery: string;
    silverRecovery: string;
    copperRecovery: string;
    palladiumRecovery: string;
    basePoints: string;
}

const CreateEditModel = () => {
    const params = useParams();
    const id = params?.id as string | undefined;
    const router = useRouter();
    const [modelData, setModelData] = useState<ModelFormData>({
        category: '',
        brand: '',
        name: '',
        releaseYear: '',
        active: true,
        averageWeight: '',
        recyclabilityScore: '',
        goldRecovery: '',
        silverRecovery: '',
        copperRecovery: '',
        palladiumRecovery: '',
        basePoints: ''
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (id) {
            getModelById(id).then(data => {
                setModelData({
                    category: data.category || data.categoryCode,
                    brand: data.brand || data.brandId,
                    name: data.name,
                    releaseYear: data.releaseYear?.toString() || '',
                    active: data.active,
                    averageWeight: data.averageWeight?.toString() || '',
                    recyclabilityScore: data.recyclabilityScore?.toString() || '',
                    goldRecovery: data.goldRecovery?.toString() || '',
                    silverRecovery: data.silverRecovery?.toString() || '',
                    copperRecovery: data.copperRecovery?.toString() || '',
                    palladiumRecovery: data.palladiumRecovery?.toString() || '',
                    basePoints: data.basePoints?.toString() || ''
                });
            });
        }
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setModelData({ ...modelData, [name]: value });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const validationErrors = validateModel(modelData);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        // Convert form data to DeviceModel format
        const modelPayload: any = {
            name: modelData.name,
            brandId: modelData.brand, // Assuming brand input is brandId
            categoryCode: modelData.category, // Assuming category input is categoryCode
            active: modelData.active,
            releaseYear: modelData.releaseYear ? parseInt(modelData.releaseYear) : undefined,
            averageWeight: modelData.averageWeight ? parseFloat(modelData.averageWeight) : undefined,
            recyclabilityScore: modelData.recyclabilityScore ? parseFloat(modelData.recyclabilityScore) : undefined,
            goldRecovery: modelData.goldRecovery ? parseFloat(modelData.goldRecovery) : undefined,
            silverRecovery: modelData.silverRecovery ? parseFloat(modelData.silverRecovery) : undefined,
            copperRecovery: modelData.copperRecovery ? parseFloat(modelData.copperRecovery) : undefined,
            palladiumRecovery: modelData.palladiumRecovery ? parseFloat(modelData.palladiumRecovery) : undefined,
            basePoints: modelData.basePoints ? parseFloat(modelData.basePoints) : undefined
        };

        if (id) {
            await updateModel(id, modelPayload);
        } else {
            await createModel(modelPayload);
        }
        router.push('/device-models');
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>{id ? 'Edit Device Model' : 'Create Device Model'}</h2>
            <div>
                <label>Device Category</label>
                <input type="text" name="category" value={modelData.category} onChange={handleChange} required />
                {errors.category && <span>{errors.category}</span>}
            </div>
            <div>
                <label>Device Brand</label>
                <input type="text" name="brand" value={modelData.brand} onChange={handleChange} required />
                {errors.brand && <span>{errors.brand}</span>}
            </div>
            <div>
                <label>Model Name</label>
                <input type="text" name="name" value={modelData.name} onChange={handleChange} required />
                {errors.name && <span>{errors.name}</span>}
            </div>
            <div>
                <label>Release Year</label>
                <input type="number" name="releaseYear" value={modelData.releaseYear} onChange={handleChange} />
            </div>
            <div>
                <label>Active Status</label>
                <input type="checkbox" name="active" checked={modelData.active} onChange={() => setModelData({ ...modelData, active: !modelData.active })} />
            </div>
            <div>
                <label>Average Weight (grams)</label>
                <input type="number" name="averageWeight" value={modelData.averageWeight} onChange={handleChange} />
            </div>
            <div>
                <label>Recyclability Score (0-100)</label>
                <input type="number" name="recyclabilityScore" value={modelData.recyclabilityScore} onChange={handleChange} />
            </div>
            <div>
                <label>Gold Recovery (mg)</label>
                <input type="number" name="goldRecovery" value={modelData.goldRecovery} onChange={handleChange} />
            </div>
            <div>
                <label>Silver Recovery (mg)</label>
                <input type="number" name="silverRecovery" value={modelData.silverRecovery} onChange={handleChange} />
            </div>
            <div>
                <label>Copper Recovery (g)</label>
                <input type="number" name="copperRecovery" value={modelData.copperRecovery} onChange={handleChange} />
            </div>
            <div>
                <label>Palladium Recovery (mg)</label>
                <input type="number" name="palladiumRecovery" value={modelData.palladiumRecovery} onChange={handleChange} />
            </div>
            <div>
                <label>Base Points</label>
                <input type="number" name="basePoints" value={modelData.basePoints} onChange={handleChange} />
            </div>
            <button type="submit">{id ? 'Update Model' : 'Create Model'}</button>
        </form>
    );
};

export default CreateEditModel;