/**
 * Facility API utility functions
 */

import { facility as staticFacilityData } from '@/app/citizen/data/facility';

interface Facility {
    id: string;
    address: string;
    name: string;
    capacity: number;
    lon: number;
    lat: number;
    contact: string;
    time: string;
    verified: boolean;
}

/**
 * Fetches facilities from the elocate server API
 * Falls back to static data if API is unavailable
 */
export async function fetchFacilities(
    lat?: number,
    lon?: number,
    distance: number = 500,
    page: number = 0,
    size: number = 4,
    verified?: boolean
): Promise<{ content: Facility[], totalPages: number, totalElements: number }> {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
        let apiUrl = `${baseUrl}/api/v1/facility?page=${page}&size=${size}`;

        if (lat !== undefined && lon !== undefined) {
            apiUrl += `&userLatitude=${lat}&userLongitude=${lon}&distance=${distance}`;
        }
        
        if (verified !== undefined) {
            apiUrl += `&verified=${verified}`;
        }

        console.log('Attempting to fetch facilities from:', apiUrl);

        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: headers,
        });

        if (!response.ok) {
            console.warn(`API returned ${response.status}. Falling back to static data.`);
            return {
                content: staticFacilityData.slice(page * size, (page + 1) * size) as Facility[],
                totalPages: Math.ceil(staticFacilityData.length / size),
                totalElements: staticFacilityData.length
            };
        }

        const data = await response.json();

        // Handle both direct array (old) and Page object (new)
        if (Array.isArray(data)) {
            return {
                content: data,
                totalPages: 1,
                totalElements: data.length
            };
        }

        return {
            content: data.content || [],
            totalPages: data.totalPages || 1,
            totalElements: data.totalElements || 0
        };
    } catch (error) {
        console.error('Error fetching facilities:', error);
        return {
            content: staticFacilityData.slice(page * size, (page + 1) * size) as Facility[],
            totalPages: Math.ceil(staticFacilityData.length / size),
            totalElements: staticFacilityData.length
        };
    }
}
