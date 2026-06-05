/**
 * @vitest-environment jsdom
 */
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AppContextProvider } from '../../context/AppContext';
import { CombinedAddPage } from './CombinedAddPage';
import { MemoryRouter, Route, Routes, useParams } from 'react-router';
import React from 'react';
import '@testing-library/jest-dom';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router', async () => {
    const actual = await vi.importActual('react-router');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
        useParams: vi.fn(),
    };
});

// Mock firestoreService
vi.mock('../../services/firestoreService', () => ({
    getEquipment: vi.fn().mockResolvedValue([]),
    getFacilities: vi.fn().mockResolvedValue([]),
    getBookings: vi.fn().mockResolvedValue([]),
    getUsers: vi.fn().mockResolvedValue([]),
    getEquipmentCategories: vi.fn().mockResolvedValue(['Cat 1', 'Cat 2']),
    addFacilityWithEquipment: vi.fn().mockResolvedValue({ id: 'new-fac' }),
    updateFacility: vi.fn().mockResolvedValue({}),
    updateEquipmentBatch: vi.fn().mockResolvedValue({}),
}));

const renderPage = (initialRoute: string) => {
    return render(
        <MemoryRouter initialEntries={[initialRoute]}>
            <AppContextProvider>
                <Routes>
                    <Route path="/admin/add-facility" element={<CombinedAddPage />} />
                    <Route path="/admin/edit-facility/:id" element={<CombinedAddPage />} />
                </Routes>
            </AppContextProvider>
        </MemoryRouter>
    );
};

describe('CombinedAddPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should show "Add New Facility" title in add mode', () => {
        vi.mocked(useParams).mockReturnValue({ id: undefined });
        renderPage('/admin/add-facility');
        expect(screen.getByText(/Add New Facility & Equipment/i)).toBeInTheDocument();
    });

    it('should validate required facility fields', async () => {
        vi.mocked(useParams).mockReturnValue({ id: undefined });
        renderPage('/admin/add-facility');

        const saveButton = screen.getByText(/Save All/i);
        fireEvent.click(saveButton);

        // Multiple "Required" messages should appear for different fields
        await waitFor(() => {
            const requireds = screen.getAllByText(/Required/i);
            expect(requireds.length).toBeGreaterThan(0);
        });
    });

    it('should add equipment items to the list', async () => {
        vi.mocked(useParams).mockReturnValue({ id: undefined });
        renderPage('/admin/add-facility');

        const addEqButton = screen.getByText(/Add New Equipment Item/i);
        fireEvent.click(addEqButton);

        expect(screen.getByText(/Facility Equipment/i)).toBeInTheDocument();
        // Since we added one, card "1" should be visible
        expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('should show "Edit Facility" when ID is provided', async () => {
        vi.mocked(useParams).mockReturnValue({ id: 'fac-123' });
        renderPage('/admin/edit-facility/fac-123');

        await waitFor(() => {
            expect(screen.getByText(/Edit Facility & Equipment/i)).toBeInTheDocument();
        });
    });
});
