export const VALIDATION_MESSAGES = {
    REQUIRED: 'This field is required.',
    UNIQUE: 'This value must be unique.',
    ALPHANUMERIC: 'This value must be alphanumeric.',
    MAX_LENGTH: (length: number) => `Maximum length is ${length} characters.`,
    POSITIVE_NUMBER: 'Value must be a positive number.',
    RECYCLABILITY_SCORE: 'Recyclability score must be between 0 and 100.',
};

export const STATUS_CODES = {
    ACTIVE: 'Active',
    INACTIVE: 'Inactive',
};

export const DEFAULT_ACTIVE_STATUS = true;