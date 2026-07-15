const { createClient } = require('@supabase/supabase-js')

// Supabase client abstraction.
// Tests should mock this module by mocking/overriding getSupabase().

let cachedClient = null

function getSupabase() {
  if (cachedClient) return cachedClient

  const url = process.env.SUPABASE_URL
  const anonKey = process.env.SUPABASE_ANON_KEY

  // Keep runtime safe for local/test runs that don't configure Supabase.
  if (!url || !anonKey) {
    return {
      from() {
        throw new Error(
          'Supabase client not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.'
        )
      },
    }
  }

  cachedClient = createClient(url, anonKey)
  return cachedClient
}

module.exports = { getSupabase }





