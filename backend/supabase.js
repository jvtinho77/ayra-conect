const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gauwylaohajdsidndtdg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhdXd5bGFvaGFqZHNpZG5kdGRnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTYyMTg5NCwiZXhwIjoyMDYxMTk3ODk0fQ.-uewcFcNQegLOgNoIbBzoDQwRL0Xb79dqmxx_vXurlg'; // Usando service_role para privilégios totais internamente

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
