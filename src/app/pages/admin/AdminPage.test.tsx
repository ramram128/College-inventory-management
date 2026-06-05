/**
 * @vitest-environment jsdom
 */
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AdminPage } from './AdminPage';
import { MemoryRouter } from 'react-router';
import React from 'react';
import '@testing-library/jest-dom';

// MOCKS AT TOP
const mockNavigate = vi.fn();
vi.mock('react-router', async () => {
    const actual = await vi.importActual('react-router');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
        useLocation: () => ({ state: { activeTab: 'dashboard' } }),
    };
});

// Mock firestoreService
vi.mock('../../services/firestoreService', () => ({
    getEquipment: vi.fn().mockResolvedValue([]),
    getFacilities: vi.fn().mockResolvedValue([]),
    getBookings: vi.fn().mockResolvedValue([]),
    getUsers: vi.fn().mockResolvedValue([]),
    getEquipmentCategories: vi.fn().mockResolvedValue([]),
    updateUserStatusDoc: vi.fn().mockResolvedValue({}),
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
        button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Setup a mockable AppContext
const mockCtxValue = {
    currentUser: null as any,
    bookings: [] as any[],
    equipment: [] as any[],
    facilities: [] as any[],
    users: [] as any[],
    logout: vi.fn(),
};

vi.mock('../../context/AppContext', () => ({
    useAppContext: () => mockCtxValue,
    AppContextProvider: ({ children }: any) => <div>{children}</div>,
}));

describe('AdminPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Reset default mock context
        mockCtxValue.currentUser = null;
        mockCtxValue.bookings = [];
        mockCtxValue.equipment = [];
        mockCtxValue.facilities = [];
        mockCtxValue.users = [];
    });

    it('should show access denied for non-admin users', () => {
        mockCtxValue.currentUser = { id: 'user-id', name: 'Researcher', role: 'researcher' };

        render(
            <MemoryRouter>
                <AdminPage />
            </MemoryRouter>
        );

        expect(screen.getByText(/Admin Access Required/i)).toBeInTheDocument();
    });

    it('should show dashboard for admin users', async () => {
        mockCtxValue.currentUser = { id: 'admin-id', name: 'Admin User', role: 'admin', email: 'clginventorymanagement@gmail.com' };
        mockCtxValue.bookings = [
            { id: '1', status: 'Pending', name: 'Test', email: 't@t.com', submittedAt: new Date().toISOString() }
        ];

        render(
            <MemoryRouter>
                <AdminPage />
            </MemoryRouter>
        );

        expect(screen.getByText(/Recent Booking Requests/i)).toBeInTheDocument();
        // Check stats: 1 booking
        // The StatCard for "Total Bookings" should show '1'
        const stats = screen.getAllByText('1');
        expect(stats.length).toBeGreaterThan(0);
    });

    it('should navigate to facilities section', async () => {
        mockCtxValue.currentUser = { id: 'admin-id', name: 'Admin User', role: 'admin', email: 'clginventorymanagement@gmail.com' };

        render(
            <MemoryRouter>
                <AdminPage />
            </MemoryRouter>
        );

        // Sidebar uses "Resources" for facilities
        const resourcesBtn = screen.getByText('Resources');
        fireEvent.click(resourcesBtn);

        // Verify facilities section content
        await waitFor(() => {
            expect(screen.getByText(/Research Facilities/i)).toBeInTheDocument();
        });
    });
});
