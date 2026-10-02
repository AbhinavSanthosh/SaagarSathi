// Vercel serverless entrypoint for the SaagarSathi API.
// Re-exports the Express app defined in server/index.js so all /api/* routes
// are handled by a single serverless function.
import app from '../server/index.js';

export default app;
