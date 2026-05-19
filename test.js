const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
let supabaseUrl = '';
let supabaseKey = '';
env.split('\n').forEach(line => {
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) supabaseUrl = line.split('=')[1].trim();
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) supabaseKey = line.split('=')[1].trim();
});

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.from('players').insert({
      full_name: 'Test Player',
      age: 25,
      phone_number: '1234567890',
      wing_building: 'A Wing',
      jersey_name: 'Test',
      jersey_size: 'M',
      jersey_number: 10,
      volleyball_experience: 'Pro',
      photo_url: 'placeholder',
      status: 'pending'
  });
  console.log("Insert Error:", error);
  
  const { data: cols, error: err } = await supabase.from('players').select('*').limit(1);
  console.log("Sample row:", cols);
}
test();
