import { isClerkConfigured } from '../lib/auth';
import { isDatabaseConfigured } from '../lib/db';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  const clerk = isClerkConfigured();
  const database = isDatabaseConfigured();
  const ready = clerk && database;

  return (
    <main style={{ maxWidth: 640, margin: '0 auto', padding: '64px 24px' }}>
      <p style={{ fontWeight: 700, letterSpacing: 0.4, color: '#6B7280', margin: 0 }}>CODE RED</p>
      <h1 style={{ fontSize: 40, letterSpacing: -1, margin: '8px 0 12px' }}>Notes sync API</h1>
      <p style={{ color: '#6B7280', lineHeight: 1.6, marginBottom: 28 }}>
        The Expo app keeps notes on the device first. When you are signed in with Clerk, it syncs
        folders, notes, and profile to Neon through this Next.js server.
      </p>
      <div
        style={{
          background: '#fff',
          border: '1px solid #E8EAED',
          borderRadius: 18,
          padding: 20,
          marginBottom: 16,
        }}>
        <p style={{ margin: '0 0 8px', fontWeight: 700 }}>{ready ? 'Ready' : 'Needs env'}</p>
        <p style={{ margin: 0, color: '#6B7280', fontSize: 14 }}>
          Clerk: {clerk ? 'configured' : 'missing CLERK_SECRET_KEY'} · Neon:{' '}
          {database ? 'configured' : 'missing DATABASE_URL'}
        </p>
      </div>
      <p style={{ color: '#6B7280', fontSize: 14 }}>
        <code>GET /api/health</code> · <code>POST /api/sync</code> (Clerk Bearer token)
      </p>
    </main>
  );
}
