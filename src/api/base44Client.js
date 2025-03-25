import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
export const base44 = createClient({
  appId: "67db18c28bc6a601794df99a", 
  requiresAuth: true // Ensure authentication is required for all operations
});
