const { createClient } = require('@supabase/supabase-js');

let _client = null;

const getClient = () => {
  if (_client) return _client;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;

  if (!url || url.includes('your-project')) {
    throw new Error(
      '❌ SUPABASE_URL is not configured. Open backend/.env and set your real Supabase project URL.'
    );
  }
  if (!key || key.includes('your-supabase')) {
    throw new Error(
      '❌ SUPABASE_SERVICE_KEY is not configured. Open backend/.env and set your Supabase service-role key.'
    );
  }

  _client = createClient(url, key);
  return _client;
};

// Proxy so existing code using `supabase.from(...)` works unchanged
const supabase = new Proxy({}, {
  get(_, prop) {
    return (...args) => getClient()[prop](...args);
  }
});

module.exports = supabase;
