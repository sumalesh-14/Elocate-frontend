import React, { useState } from 'react';

interface CategoryFormErrors {
    categoryCode?: string;
    categoryName?: string;
}

const CreateCategory = () => {
    const [categoryCode, setCategoryCode] = useState('');
    const [categoryName, setCategoryName] = useState('');
    const [description, setDescription] = useState('');
    const [activeStatus, setActiveStatus] = useState(true);
    const [errors, setErrors] = useState<CategoryFormErrors>({});

    const validateForm = () => {
        const newErrors: CategoryFormErrors = {};

        if (!categoryCode) {
            newErrors.categoryCode = "Category code is required";
        } else if (!/^[A-Z0-9]+$/.test(categoryCode)) {
            newErrors.categoryCode =
                "Category code must be alphanumeric and uppercase";
        }

        if (!categoryName) {
            newErrors.categoryName = "Category name is required";
        }

        return newErrors;
    };


    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        // Submit the form data to the API
        console.log({ categoryCode, categoryName, description, activeStatus });
    };

    return (
        <div>
            <h2>Create Device Category</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Category Code:</label>
                    <input
                        type="text"
                        value={categoryCode}
                        onChange={(e) => setCategoryCode(e.target.value)}
                    />
                    {errors.categoryCode && <span>{errors.categoryCode}</span>}
                </div>
                <div>
                    <label>Category Name:</label>
                    <input
                        type="text"
                        value={categoryName}
                        onChange={(e) => setCategoryName(e.target.value)}
                    />
                    {errors.categoryName && <span>{errors.categoryName}</span>}
                </div>
                <div>
                    <label>Description:</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>
                <div>
                    <label>
                        <input
                            type="checkbox"
                            checked={activeStatus}
                            onChange={(e) => setActiveStatus(e.target.checked)}
                        />
                        Active
                    </label>
                </div>
                <button type="submit">Create Category</button>
            </form>
        </div>
    );
};

export default CreateCategory;