import {
  createServerClient,
  parseCookieHeader,
  serializeCookieHeader,
} from '@supabase/ssr';
import invariant from 'tiny-invariant';

const { SUPABASE_URL, SUPABASE_ANON_KEY } = process.env;

invariant(SUPABASE_URL, 'SUPABASE_URL is not set');
invariant(SUPABASE_ANON_KEY, 'SUPABASE_ANON_KEY is not set');

export function createSupabaseServerClient({ request }: { request: Request }) {
  const headers = new Headers();

  const supabase = createServerClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    auth: { flowType: 'pkce' },
    cookies: {
      getAll() {
        return parseCookieHeader(request.headers.get('Cookie') ?? '');
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet)
          headers.append(
            'Set-Cookie',
            serializeCookieHeader(name, value, options),
          );
      },
    },
  });

  return { supabase, headers };
}
