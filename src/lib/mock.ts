// MOCK MODE CONFIGURATION
// Set this to true to enable mock mode, which uses dummy data instead of live Firebase/Stripe services.
// In a real application, this would be controlled by an environment variable.

export const MOCK_MODE = process.env.NEXT_PUBLIC_MOCK_MODE === 'false';

console.log("Mock mode:", MOCK_MODE ? "ENABLED" : "DISABLED");
