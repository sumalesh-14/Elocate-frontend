// Type definitions for the elocate-admin application

export interface Category {
    code: string;
    name: string;
    description: string;
    status: 'Active' | 'Inactive';
    createdDate: string;
}

export interface Brand {
    id: string;
    name: string;
    active: boolean;
    createdDate: string;
}

export interface DeviceModel {
    id: string;
    name: string;
    modelName?: string; // Alias for name
    brandId: string;
    brand?: string; // Brand name (populated from brandId)
    categoryCode: string;
    category?: string; // Category name (populated from categoryCode)
    active: boolean;
    status?: 'Active' | 'Inactive'; // Alternative status format
    releaseYear?: number;
    averageWeight?: number;
    recyclabilityScore?: number;
    goldRecovery?: number;
    silverRecovery?: number;
    copperRecovery?: number;
    palladiumRecovery?: number;
    basePoints?: string;
    createdDate: string;
}
