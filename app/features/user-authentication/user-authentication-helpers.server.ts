import { redirect } from 'react-router';

import { createSupabaseServerClient } from './supabase.server';

export async function requireUserIsAuthenticated(
  request: Request,
  redirectTo: string = new URL(request.url).pathname,
) {
  const { supabase, headers } = createSupabaseServerClient({ request });
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    const searchParameters = new URLSearchParams([['redirectTo', redirectTo]]);
    // eslint-disable-next-line @typescript-eslint/only-throw-error
    throw redirect(`/login?${searchParameters.toString()}`, { headers });
  }

  return { user, headers };
}

export async function requireUserIsAnonymous(request: Request) {
  const { supabase, headers } = createSupabaseServerClient({ request });

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (!error && user) {
    // eslint-disable-next-line @typescript-eslint/only-throw-error
    throw redirect('/organizations', { headers });
  }

  return { supabase, headers };
}
