/**
 * @vitest-environment jsdom
 */
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AppContextProvider } from '../context/AppContext';
import { AuthPage } from './AuthPage';
import { MemoryRouter } from 'react-router';
import React from 'react';
import '@testing-library/jest-dom';

// Mock firebase/auth
vi.mock('firebase/auth', () => ({
    getAuth: vi.fn(),
    signInWithEmailAndPassword: vi.fn(),
    createUserWithEmailAndPassword: vi.fn(),
    signOut: vi.fn(),
    onAuthStateChanged: vi.fn((auth, cb) => {
        // Immediately trigger with null user by default
        cb(null);
        return () => { };
    }),
}));

// Mock the firebase module
vi.mock('../../firebase', () => ({
    db: { type: 'firestore' },
    auth: { type: 'auth' },
    storage: { type: 'storage' },
    default: {}
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router', async () => {
    const actual = await vi.importActual('react-router');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

// Mock firestoreService
vi.mock('../services/firestoreService', () => ({
    getEquipment: vi.fn().mockResolvedValue([]),
    getFacilities: vi.fn().mockResolvedValue([]),
    getBookings: vi.fn().mockResolvedValue([]),
    getUsers: vi.fn().mockResolvedValue([]),
    addUserDoc: vi.fn().mockResolvedValue({ id: 'new-user' }),
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
        form: ({ children, ...props }: any) => <form {...props}>{children}</form>,
        h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
        p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
}));

import { signInWithEmailAndPassword } from 'firebase/auth';

const renderAuthPage = () => {
    return render(
        <MemoryRouter initialEntries={['/login']}>
            <AppContextProvider>
                <AuthPage />
            </AppContextProvider>
        </MemoryRouter>
    );
};

describe('AuthPage component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should show login form by default', () => {
        renderAuthPage();
        // Check for "Sign In" heading
        expect(screen.getByRole('heading', { name: /Sign In/i })).toBeInTheDocument();
        expect(screen.queryByPlaceholderText('John')).not.toBeInTheDocument();
    });

    it('should switch to registration mode', async () => {
        renderAuthPage();
        const toggleButton = screen.getByText('Create an account');
        fireEvent.click(toggleButton);

        // Wait for the mode to switch
        const registerHeading = await screen.findByRole('heading', { name: /Register/i });
        expect(registerHeading).toBeInTheDocument();
        expect(screen.getByPlaceholderText('John')).toBeInTheDocument();
    });

    it('should show error when passwords do not match in registration', async () => {
        renderAuthPage();
        fireEvent.click(screen.getByText('Create an account'));

        // Wait for inputs to appear
        const firstName = await screen.findByPlaceholderText('John');
        const lastName = screen.getByPlaceholderText('Doe');
        const emailInput = screen.getByPlaceholderText('john.doe@edu');
        const passInput = screen.getByPlaceholderText('Min 8 chars');
        const confirmInput = screen.getByPlaceholderText('Repeat');
        const institutionInput = screen.getByPlaceholderText('e.g. MIT');
        const departmentInput = screen.getByPlaceholderText('e.g. CS');

        fireEvent.change(firstName, { target: { value: 'Test' } });
        fireEvent.change(lastName, { target: { value: 'User' } });
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passInput, { target: { value: 'password123' } });
        fireEvent.change(confirmInput, { target: { value: 'different' } });
        fireEvent.change(institutionInput, { target: { value: 'MIT' } });
        fireEvent.change(departmentInput, { target: { value: 'CS' } });

        fireEvent.click(screen.getByText('Complete Registration'));

        // Look for the "Passwords do not match" error message
        await waitFor(() => {
            expect(screen.getByText(/Passwords don't match/i)).toBeInTheDocument();
        });
    });

    it('should call navigate on successful admin login', async () => {
        (signInWithEmailAndPassword as any).mockResolvedValue({
            user: { uid: 'admin-uid', email: 'clginventorymanagement@gmail.com' }
        });

        renderAuthPage();

        const emailInput = screen.getByPlaceholderText('john.doe@edu');
        const passInput = screen.getByPlaceholderText('••••••••');

        fireEvent.change(emailInput, { target: { value: 'clginventorymanagement@gmail.com' } });
        fireEvent.change(passInput, { target: { value: 'password1234@mce' } });

        const submitBtn = screen.getByRole('button', { name: /Sign In/i });
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/admin');
        });
    });
});
