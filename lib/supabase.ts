import { createBrowserClient } from '@supabase/ssr'
import { createServerClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const IS_DEMO = process.env.NEXT_PUBLIC_SKIP_AUTH === 'true' || !supabaseUrl || supabaseUrl.includes('placeholder')

// ─── MOCK CLIENT (for visual preview without real APIs) ───────
function makeMockChain(): any {
  const c: any = {
    then(resolve: any, reject?: any) {
      return Promise.resolve({ data: [], error: null }).then(resolve, reject)
    },
    catch(reject: any) {
      return Promise.resolve({ data: [], error: null }).catch(reject)
    },
  }
  for (const m of ['select', 'eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'not', 'or',
    'order', 'limit', 'range', 'match', 'filter', 'in', 'contains', 'update', 'delete']) {
    c[m] = (..._a: any[]) => makeMockChain()
  }
  c.single = () => Promise.resolve({ data: null, error: null })
  c.maybeSingle = () => Promise.resolve({ data: null, error: null })
  c.insert = (..._a: any[]) => Promise.resolve({ data: null, error: null })
  c.upsert = (..._a: any[]) => Promise.resolve({ data: null, error: null })
  return c
}

function createMockClient(): any {
  return {
    auth: {
      getUser: async () => ({
        data: {
          user: {
            id: 'preview-user-id',
            email: 'preview@recrutahost.com',
            user_metadata: { full_name: 'Preview Demo' },
          },
        },
        error: null,
      }),
      getSession: async () => ({
        data: { session: { user: { id: 'preview-user-id' } } },
        error: null,
      }),
    },
    from: (_table: string) => makeMockChain(),
    rpc: (_fn: string, _params?: any) => Promise.resolve({ data: null, error: null }),
    storage: {
      from: (_bucket: string) => ({
        upload: () => Promise.resolve({ data: null, error: null }),
        getPublicUrl: () => ({ data: { publicUrl: '' } }),
      }),
    },
  }
}

// ─── BROWSER CLIENT (use in Client Components) ────────────────
export function createClient() {
  if (IS_DEMO) return createMockClient()
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

// ─── SERVER CLIENT (use in Server Components & Route Handlers) ─
export async function createServerSupabaseClient() {
  if (IS_DEMO) return createMockClient()
  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // Ignore errors in Server Components
        }
      },
    },
  })
}

// ─── SERVICE ROLE CLIENT (server-only, bypasses RLS) ─────────
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export function createServiceClient() {
  if (IS_DEMO) return createMockClient()
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set')
  return createSupabaseClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  })
}
