/**
 * @vitest-environment jsdom
 */
import { vi, describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

let authStateCallback: ((user: any) => void) | null = null;

// Mock firebase/auth
vi.mock('firebase/auth', () => ({
    getAuth: vi.fn(),
    signInWithEmailAndPassword: vi.fn(async (auth, email, password) => {
        // In a real scenario, this would trigger onAuthStateChanged
        // We'll simulate this by calling the stored callback if it exists
        if (authStateCallback) {
            if (email === 'clginventorymanagement@gmail.com' && password === 'password1234@mce') {
                authStateCallback({ uid: 'admin-uid', email: 'clginventorymanagement@gmail.com' });
                return { user: { uid: 'admin-uid', email: 'clginventorymanagement@gmail.com' } };
            }
            // For other successes
            authStateCallback({ uid: 'user-uid', email });
            return { user: { uid: 'user-uid', email } };
        }
        return { user: { uid: 'some-uid', email } };
    }),
    createUserWithEmailAndPassword: vi.fn(),
    signOut: vi.fn(async () => {
        if (authStateCallback) authStateCallback(null);
    }),
    onAuthStateChanged: vi.fn((auth, cb) => {
        authStateCallback = cb;
        // Initial call
        cb(null);
        return () => { authStateCallback = null; };
    }),
}));

// Mock the firebase module
vi.mock('../../firebase', () => ({
    db: { type: 'firestore' },
    auth: { type: 'auth' },
    storage: { type: 'storage' },
    default: {}
}));

// Mock firestoreService
vi.mock('../services/firestoreService', () => ({
    getEquipment: vi.fn().mockResolvedValue([]),
    getFacilities: vi.fn().mockResolvedValue([]),
    getBookings: vi.fn().mockResolvedValue([]),
    getUsers: vi.fn().mockResolvedValue([]),
    addEquipmentDoc: vi.fn().mockResolvedValue({}),
    updateEquipmentDoc: vi.fn().mockResolvedValue({}),
    deleteEquipmentDoc: vi.fn().mockResolvedValue({}),
    addFacilityDoc: vi.fn().mockResolvedValue({}),
    updateFacilityDoc: vi.fn().mockResolvedValue({}),
    deleteFacilityDoc: vi.fn().mockResolvedValue({}),
    addBookingDoc: vi.fn().mockResolvedValue({}),
    updateBookingDoc: vi.fn().mockResolvedValue({}),
    addUserDoc: vi.fn().mockResolvedValue({}),
    updateUserDoc: vi.fn().mockResolvedValue({}),
    updateUserStatusDoc: vi.fn().mockResolvedValue({}),
    batchUpdateEquipment: vi.fn().mockResolvedValue({}),
}));

import { AppContextProvider, useAppContext } from './AppContext';
import { signInWithEmailAndPassword } from 'firebase/auth';

const TestComponent = () => {
    const { currentUser, login, addBooking, bookings } = useAppContext();
    return (
        <div>
            <div data-testid="user-role">{currentUser?.role || 'none'}</div>
            <div data-testid="booking-count">{bookings.length}</div>
            <div data-testid="latest-booking-id">{bookings[bookings.length - 1]?.id}</div>

            <button onClick={() => login('clginventorymanagement@gmail.com', 'password1234@mce')}>Login Admin</button>
            <button onClick={() => login('wrong@test.com', 'wrong')}>Login Fail</button>
            <button onClick={() => addBooking({
                name: 'Test', email: 't@t.com', department: 'D', type: 'equipment',
                facility: '', equipment: 'E', date: '2024', timeSlot: '10-12', purpose: 'P'
            })}>Add Booking</button>
        </div>
    );
};

describe('AppContext Integration', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should handle admin login correctly', async () => {
        // Mock getUsers to return the admin user from Firestore
        const { getUsers } = await import('../services/firestoreService');
        (getUsers as any).mockResolvedValue([{
            id: 'admin-uid',
            email: 'clginventorymanagement@gmail.com',
            role: 'admin',
            firstName: 'Admin',
            lastName: 'User'
        }]);

        render(
            <AppContextProvider>
                <TestComponent />
            </AppContextProvider>
        );

        const loginButton = screen.getByText('Login Admin');
        fireEvent.click(loginButton);

        await waitFor(() => {
            expect(screen.getByTestId('user-role').textContent).toBe('admin');
        }, { timeout: 2000 });
    });

    it('should reject invalid credentials', async () => {
        (signInWithEmailAndPassword as any).mockRejectedValue(new Error('Invalid credentials'));

        render(
            <AppContextProvider>
                <TestComponent />
            </AppContextProvider>
        );

        const loginButton = screen.getByText('Login Fail');
        fireEvent.click(loginButton);

        await waitFor(() => {
            expect(screen.getByTestId('user-role').textContent).toBe('none');
        });
    });

    it('should generate correct booking IDs sequentially', async () => {
        render(
            <AppContextProvider>
                <TestComponent />
            </AppContextProvider>
        );

        const addBookingButton = screen.getByText('Add Booking');

        // Initial bookings count is 6
        await waitFor(() => {
            expect(screen.getByTestId('booking-count').textContent).toBe('6');
        });

        fireEvent.click(addBookingButton);

        await waitFor(() => {
            expect(screen.getByTestId('booking-count').textContent).toBe('7');
        });

        expect(screen.getByTestId('latest-booking-id').textContent).toContain('RD - 1007');
    });
});
