import { describe, it, expect, vi } from 'vitest';
import { mapFacility, mapEquipment } from './firestoreService';

// Mock dependencies to avoid side effects during mapping tests
vi.mock('firebase/firestore', () => ({
    collection: vi.fn(),
    doc: vi.fn(),
    getDocs: vi.fn(),
    getDoc: vi.fn(),
    addDoc: vi.fn(),
    updateDoc: vi.fn(),
    deleteDoc: vi.fn(),
    setDoc: vi.fn(),
    query: vi.fn(),
    orderBy: vi.fn(),
    collectionGroup: vi.fn(),
    writeBatch: vi.fn(),
}));

vi.mock('../../firebase', () => ({
    db: {},
    storage: {},
}));

describe('firestoreService mappers', () => {
    describe('mapFacility', () => {
        it('should map valid data correctly', () => {
            const data = {
                facilityName: 'Test Lab',
                facilityCategory: 'PHYSICS',
                availabilityStatus: 'Available',
                capacity: 10,
                roomLocation: 'Room 101',
                spaceDescription: 'A test lab',
                keyFacilityFeatures: ['Feature 1'],
                createdAt: '2024-01-01T00:00:00Z',
                image: 'test.jpg'
            };
            const result = mapFacility('id1', data);
            expect(result).toEqual({
                id: 'id1',
                facilityName: 'Test Lab',
                facilityCategory: 'PHYSICS',
                availabilityStatus: 'Available',
                capacity: 10,
                roomLocation: 'Room 101',
                spaceDescription: 'A test lab',
                keyFacilityFeatures: ['Feature 1'],
                createdAt: '2024-01-01T00:00:00Z',
                image: 'test.jpg'
            });
        });

        it('should handle string capacity with text', () => {
            const data = { capacity: '20 researchers' };
            const result = mapFacility('id1', data);
            expect(result.capacity).toBe(20);
        });

        it('should fallback to defaults for missing fields', () => {
            const result = mapFacility('id1', {});
            expect(result.facilityName).toBe('Unnamed Facility');
            expect(result.availabilityStatus).toBe('Available');
            expect(result.capacity).toBe(0);
            expect(result.keyFacilityFeatures).toEqual([]);
        });

        it('should handle alternative field names (name/category/location)', () => {
            const data = {
                name: 'Alt Name',
                category: 'Alt Category',
                location: 'Alt Location',
                features: ['Alt Feature']
            };
            const result = mapFacility('id1', data);
            expect(result.facilityName).toBe('Alt Name');
            expect(result.facilityCategory).toBe('Alt Category');
            expect(result.roomLocation).toBe('Alt Location');
            expect(result.keyFacilityFeatures).toEqual(['Alt Feature']);
        });
    });

    describe('mapEquipment', () => {
        it('should map valid equipment data correctly', () => {
            const data = {
                equipmentName: 'Spec',
                equipmentCategory: 'Analytical',
                initialStatus: 'Available',
                manufacturer: 'Shimadzu',
                modelNumber: 'UV-1',
                instrumentDescription: 'Desc',
                technicalSpecifications: ['Spec 1'],
                researchApplications: ['App 1'],
                facilityId: 'f1'
            };
            const result = mapEquipment('e1', data);
            expect(result).toEqual({
                id: 'e1',
                equipmentName: 'Spec',
                equipmentCategory: 'Analytical',
                initialStatus: 'Available',
                manufacturer: 'Shimadzu',
                modelNumber: 'UV-1',
                instrumentDescription: 'Desc',
                technicalSpecifications: ['Spec 1'],
                researchApplications: ['App 1'],
                facilityId: 'f1'
            });
        });

        it('should fallback to defaults for missing equipment fields', () => {
            const result = mapEquipment('e1', {});
            expect(result.equipmentName).toBe('Unnamed Equipment');
            expect(result.manufacturer).toBe('Unknown');
            expect(result.technicalSpecifications).toEqual([]);
        });
    });
});
