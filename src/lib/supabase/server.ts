import { createServerClient } from '@supabase/ssr'
import { cookies, headers } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  const headersList = await headers()
  const host = headersList.get('host') || ''

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            const isLocal = process.env.NODE_ENV === 'development';
            let cookieDomain: string | undefined = undefined;
            if (isLocal) {
              cookieDomain = 'localhost';
            } else if (host.includes('geo-dev.online')) {
              cookieDomain = '.geo-dev.online';
            }

            cookiesToSet.forEach(({ name, value, options }) => {
              if (cookieDomain) {
                cookieStore.set(name, value, { ...options, domain: cookieDomain })
              } else {
                const { domain, ...safeOptions } = options;
                cookieStore.set(name, value, { ...safeOptions })
              }
            })
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
