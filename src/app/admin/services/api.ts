import { Category, Brand, DeviceModel } from '../types';

// Dummy data storage
let dummyCategories: Category[] = [
    {
        code: 'CAT001',
        name: 'Smartphones',
        description: 'Mobile phones with advanced features',
        status: 'Active',
        createdDate: '2024-01-15T10:00:00Z'
    },
    {
        code: 'CAT002',
        name: 'Laptops',
        description: 'Portable computers',
        status: 'Active',
        createdDate: '2024-01-16T10:00:00Z'
    },
    {
        code: 'CAT003',
        name: 'Tablets',
        description: 'Touchscreen portable devices',
        status: 'Inactive',
        createdDate: '2024-01-17T10:00:00Z'
    },
    {
        code: 'CAT004',
        name: 'Smartwatches',
        description: 'Wearable smart devices',
        status: 'Active',
        createdDate: '2024-01-18T10:00:00Z'
    }
];

let dummyBrands: Brand[] = [
    {
        id: 'BRD001',
        name: 'Apple',
        active: true,
        createdDate: '2024-01-15T10:00:00Z'
    },
    {
        id: 'BRD002',
        name: 'Samsung',
        active: true,
        createdDate: '2024-01-16T10:00:00Z'
    },
    {
        id: 'BRD003',
        name: 'Dell',
        active: true,
        createdDate: '2024-01-17T10:00:00Z'
    },
    {
        id: 'BRD004',
        name: 'HP',
        active: false,
        createdDate: '2024-01-18T10:00:00Z'
    },
    {
        id: 'BRD005',
        name: 'Lenovo',
        active: true,
        createdDate: '2024-01-19T10:00:00Z'
    }
];

let dummyModels: DeviceModel[] = [
    {
        id: 'MDL001',
        name: 'iPhone 15 Pro',
        brandId: 'BRD001',
        categoryCode: 'CAT001',
        active: true,
        createdDate: '2024-01-20T10:00:00Z'
    },
    {
        id: 'MDL002',
        name: 'Galaxy S24',
        brandId: 'BRD002',
        categoryCode: 'CAT001',
        active: true,
        createdDate: '2024-01-21T10:00:00Z'
    },
    {
        id: 'MDL003',
        name: 'MacBook Pro 16',
        brandId: 'BRD001',
        categoryCode: 'CAT002',
        active: true,
        createdDate: '2024-01-22T10:00:00Z'
    },
    {
        id: 'MDL004',
        name: 'XPS 15',
        brandId: 'BRD003',
        categoryCode: 'CAT002',
        active: true,
        createdDate: '2024-01-23T10:00:00Z'
    },
    {
        id: 'MDL005',
        name: 'iPad Pro',
        brandId: 'BRD001',
        categoryCode: 'CAT003',
        active: true,
        createdDate: '2024-01-24T10:00:00Z'
    },
    {
        id: 'MDL006',
        name: 'Apple Watch Series 9',
        brandId: 'BRD001',
        categoryCode: 'CAT004',
        active: true,
        createdDate: '2024-01-25T10:00:00Z'
    }
];

// Utility function to simulate API delay
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Device Category API calls
export const fetchDeviceCategories = async (): Promise<Category[]> => {
    await delay();
    return [...dummyCategories];
};

export const getCategoryById = async (categoryId: string): Promise<Category> => {
    await delay();
    const category = dummyCategories.find(cat => cat.code === categoryId);
    if (!category) {
        throw new Error('Category not found');
    }
    return category;
};

export const createDeviceCategory = async (categoryData: Omit<Category, 'createdDate'>): Promise<Category> => {
    await delay();
    const newCategory: Category = {
        ...categoryData,
        createdDate: new Date().toISOString()
    };
    dummyCategories.push(newCategory);
    return newCategory;
};

export const updateDeviceCategory = async (categoryId: string, categoryData: Partial<Category>): Promise<Category> => {
    await delay();
    const index = dummyCategories.findIndex(cat => cat.code === categoryId);
    if (index === -1) {
        throw new Error('Category not found');
    }
    dummyCategories[index] = { ...dummyCategories[index], ...categoryData };
    return dummyCategories[index];
};

export const toggleDeviceCategoryStatus = async (categoryId: string, status: 'Active' | 'Inactive'): Promise<Category> => {
    await delay();
    const index = dummyCategories.findIndex(cat => cat.code === categoryId);
    if (index === -1) {
        throw new Error('Category not found');
    }
    dummyCategories[index].status = status;
    return dummyCategories[index];
};

// Device Brand API calls
export const fetchDeviceBrands = async (): Promise<Brand[]> => {
    await delay();
    return [...dummyBrands];
};

export const createDeviceBrand = async (brandData: Omit<Brand, 'id' | 'createdDate'>): Promise<Brand> => {
    await delay();
    const newBrand: Brand = {
        ...brandData,
        id: `BRD${String(dummyBrands.length + 1).padStart(3, '0')}`,
        createdDate: new Date().toISOString()
    };
    dummyBrands.push(newBrand);
    return newBrand;
};

export const updateDeviceBrand = async (brandId: string, brandData: Partial<Brand>): Promise<Brand> => {
    await delay();
    const index = dummyBrands.findIndex(brand => brand.id === brandId);
    if (index === -1) {
        throw new Error('Brand not found');
    }
    dummyBrands[index] = { ...dummyBrands[index], ...brandData };
    return dummyBrands[index];
};

export const toggleDeviceBrandStatus = async (brandId: string, status: boolean): Promise<Brand> => {
    await delay();
    const index = dummyBrands.findIndex(brand => brand.id === brandId);
    if (index === -1) {
        throw new Error('Brand not found');
    }
    dummyBrands[index].active = status;
    return dummyBrands[index];
};

export const getBrandById = async (brandId: string | undefined): Promise<Brand> => {
    await delay();
    if (!brandId) {
        throw new Error('Brand ID is required');
    }
    const brand = dummyBrands.find(b => b.id === brandId);
    if (!brand) {
        throw new Error('Brand not found');
    }
    return brand;
};

// Aliases for compatibility
export const createBrand = createDeviceBrand;
export const updateBrand = updateDeviceBrand;

// Device Model API calls
export const fetchDeviceModels = async (): Promise<DeviceModel[]> => {
    await delay();
    return [...dummyModels];
};

export const createDeviceModel = async (modelData: Omit<DeviceModel, 'id' | 'createdDate'>): Promise<DeviceModel> => {
    await delay();
    const newModel: DeviceModel = {
        ...modelData,
        id: `MDL${String(dummyModels.length + 1).padStart(3, '0')}`,
        createdDate: new Date().toISOString()
    };
    dummyModels.push(newModel);
    return newModel;
};

export const updateDeviceModel = async (modelId: string, modelData: Partial<DeviceModel>): Promise<DeviceModel> => {
    await delay();
    const index = dummyModels.findIndex(model => model.id === modelId);
    if (index === -1) {
        throw new Error('Model not found');
    }
    dummyModels[index] = { ...dummyModels[index], ...modelData };
    return dummyModels[index];
};

export const toggleDeviceModelStatus = async (modelId: string, status: boolean): Promise<DeviceModel> => {
    await delay();
    const index = dummyModels.findIndex(model => model.id === modelId);
    if (index === -1) {
        throw new Error('Model not found');
    }
    dummyModels[index].active = status;
    return dummyModels[index];
};

export const getModelById = async (modelId: string | undefined): Promise<DeviceModel> => {
    await delay();
    if (!modelId) {
        throw new Error('Model ID is required');
    }
    const model = dummyModels.find(m => m.id === modelId);
    if (!model) {
        throw new Error('Model not found');
    }
    return model;
};

// Aliases for compatibility
export const createModel = createDeviceModel;
export const updateModel = updateDeviceModel;