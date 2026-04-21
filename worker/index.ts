import { Router } from 'itty-router';
import type { Env } from './env';
import { servicesRoute } from './routes/services';
import { availabilityRoute } from './routes/availability';
import { slotsRoute } from './routes/slots';
import { bookingsRoute } from './routes/bookings';
import { trackRoute } from './routes/track';
import { contactRoute } from './routes/contact';

const router = Router();

router.get('/api/services', (req: Request, env: Env) => servicesRoute(req, env));
router.get('/api/availability', (req: Request, env: Env) => availabilityRoute(req, env));
router.get('/api/slots', (req: Request, env: Env) => slotsRoute(req, env));
router.post('/api/bookings', (req: Request, env: Env) => bookingsRoute(req, env));
router.post('/api/track', (req: Request, env: Env) => trackRoute(req, env));
router.post('/api/contact', (req: Request, env: Env) => contactRoute(req, env));

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname.startsWith('/api/')) {
      const response = await router.fetch(request, env, ctx);
      if (response) return response;
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return env.ASSETS.fetch(request);
  },
};
