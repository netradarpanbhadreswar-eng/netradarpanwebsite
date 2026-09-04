const { createClient } = require('@supabase/supabase-js');
const env = require('./env');

let supabase = null;

const isConfigured = env.SUPABASE_URL && 
                     env.SUPABASE_URL !== 'https://your-supabase-project.supabase.co' && 
                     env.SUPABASE_ANON_KEY && 
                     env.SUPABASE_ANON_KEY !== 'your-supabase-anon-key';

if (isConfigured) {
    try {
        const key = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY;
        supabase = createClient(env.SUPABASE_URL, key);
        console.log('[Supabase Config] Successfully initialized Supabase client.');
    } catch (err) {
        console.error('[Supabase Config] Error initializing Supabase client:', err.message);
    }
} else {
    console.warn('[Supabase Config] Supabase credentials not set or using placeholders. Using in-memory database fallback mode.');
}

module.exports = {
    supabase,
    isConfigured
};
