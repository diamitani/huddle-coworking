import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    return createFallbackClient()
  }

  try {
    return createBrowserClient(url, key)
  } catch {
    return createFallbackClient()
  }
}

function createFallbackClient() {
  return {
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      signInWithPassword: () => Promise.resolve({ data: null, error: new Error("Supabase not configured") }),
      signUp: () => Promise.resolve({ data: null, error: new Error("Supabase not configured") }),
      signInWithOAuth: () => {},
      signOut: () => {},
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: null, error: null }),
          order: () => ({ then: (cb: any) => Promise.resolve({ data: [], error: null }).then(cb) }),
          limit: () => ({ then: (cb: any) => Promise.resolve({ data: [], error: null }).then(cb) }),
        }),
        order: () => ({ then: (cb: any) => Promise.resolve({ data: [], error: null }).then(cb) }),
      }),
      insert: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }),
      delete: () => ({ eq: () => ({ then: (cb: any) => Promise.resolve({ data: null, error: null }).then(cb) }) }),
    }),
  }
}
