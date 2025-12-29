// import { useEffect } from 'react';

// const auditLogService = {
//     logChange: (action: string, entity: string, details: object) => {
//         const logEntry = {
//             action,
//             entity,
//             details,
//             timestamp: new Date().toISOString(),
//         };
//         // Here you would typically send the logEntry to your backend API
//         console.log('Audit Log Entry:', logEntry);
//     },

//     logCategoryChange: (action: string, categoryDetails: object) => {
//         this.logChange(action, 'Device Category', categoryDetails);
//     },

//     logBrandChange: (action: string, brandDetails: object) => {
//         this.logChange(action, 'Device Brand', brandDetails);
//     },

//     logModelChange: (action: string, modelDetails: object) => {
//         this.logChange(action, 'Device Model', modelDetails);
//     },
// };

// export default auditLogService;