/**
 * Facility API utility functions
 */

import { facility as staticFacilityData } from '@/app/citizen/data/facility';

interface Facility {
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
 * @returns Promise with array of facilities
 */
export async function fetchFacilities(): Promise<Facility[]> {
    try {
        // Use environment variable or fallback to localhost for development
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
        const apiUrl = `${baseUrl}/elocate/api/v1/facility`;

        console.log('Attempting to fetch facilities from:', apiUrl);

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            console.warn(`API returned ${response.status}: ${response.statusText}. Falling back to static data.`);
            return staticFacilityData as Facility[];
        }

        const data = await response.json();
        console.log('Successfully fetched facilities from API:', data.length, 'facilities');
        return data;
    } catch (error) {
        console.error('Error fetching facilities from API:', error);
        console.log('Using static facility data as fallback');
        // Return static data as fallback
        return staticFacilityData as Facility[];
    }
}
