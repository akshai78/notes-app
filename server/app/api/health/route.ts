import { emptyOptions, json } from '../../../lib/cors';
import { isClerkConfigured } from '../../../lib/auth';
import { isDatabaseConfigured } from '../../../lib/db';

export const dynamic = 'force-dynamic';

export async function OPTIONS() {
  return emptyOptions();
}

export async function GET() {
  return json({
    ok: true,
    service: 'code-red',
    clerk: isClerkConfigured(),
    database: isDatabaseConfigured(),
  });
}
