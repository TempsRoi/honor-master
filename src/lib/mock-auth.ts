// This file provides mock authentication data for development
import { UserProfile } from "@/types";
import { User } from "firebase/auth";

// A mock Firebase user object
const mockFbUser: User = {
    uid: 'mock-user-123',
    email: 'mock.user@example.com',
    displayName: 'Mock User',
    photoURL: 'https://i.pravatar.cc/150?u=mock-user-123',
    providerId: 'google.com',
    phoneNumber: null,
    emailVerified: true,
    isAnonymous: false,
    metadata: {},
    providerData: [],
    refreshToken: 'mock-refresh-token',
    tenantId: null,
    delete: async () => {},
    getIdToken: async () => 'mock-id-token',
    getIdTokenResult: async () => ({} as any),
    reload: async () => {},
    toJSON: () => ({}),
};

// A mock user profile object
const mockUserProfile: UserProfile = {
    uid: 'mock-user-123',
    email: 'mock.user@example.com',
    displayName: 'Mock User',
    photoURL: 'https://i.pravatar.cc/150?u=mock-user-123',
    balance: 1337,
    totalPaid: 9001,
};

// Simulate onAuthStateChanged
export const mockOnAuthStateChanged = (callback: (user: User | null) => void) => {
    // To simulate being logged in, we call the callback with the mock user.
    // To simulate being logged out, comment the line below and uncomment the next one.
    setTimeout(() => callback(mockFbUser), 500);
    // setTimeout(() => callback(null), 500);
};

// Simulate signing in
export const mockSignIn = async () => {
    return { user: mockFbUser };
};

// Simulate signing out
export const mockSignOut = async () => {
    return;
};

// Get a mock user profile
export const getMockUser = (uid: string): UserProfile => {
    return {
        ...mockUserProfile,
        uid,
    };
};
