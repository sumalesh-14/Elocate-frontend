export const validateCategoryCode = (code: string): boolean => {
    const codeRegex = /^[A-Z0-9]+$/;
    return codeRegex.test(code);
};

export const validateCategoryName = (name: string): boolean => {
    return name.trim().length > 0;
};

export const validateBrandName = (name: string): boolean => {
    return name.trim().length > 0;
};

export const validateModelName = (name: string): boolean => {
    return name.trim().length > 0;
};

export const validateReleaseYear = (year: number): boolean => {
    return year > 0;
};

export const validateWeight = (weight: number): boolean => {
    return weight > 0;
};

export const validateRecyclabilityScore = (score: number): boolean => {
    return score >= 0 && score <= 100;
};

export const validateMetalRecovery = (value: number): boolean => {
    return value >= 0;
};

export const validateBasePoints = (points?: number): boolean => {
    return points === undefined || points >= 0;
};

export const validateModel = (modelData: any): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (!modelData.category || modelData.category.trim().length === 0) {
        errors.category = 'Category is required';
    }

    if (!modelData.brand || modelData.brand.trim().length === 0) {
        errors.brand = 'Brand is required';
    }

    if (!modelData.name || modelData.name.trim().length === 0) {
        errors.name = 'Model name is required';
    }

    return errors;
};