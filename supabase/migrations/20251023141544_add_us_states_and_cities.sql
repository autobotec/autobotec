/*
  # Add United States States and Major Cities

  1. States
    - All 50 US states with bilingual names
    
  2. Major Cities
    - Top cities for each state
    
  3. Data Structure
    - Linked to United States country
    - States linked to cities
*/

-- Get United States ID
DO $$
DECLARE
  us_id uuid;
BEGIN
  SELECT id INTO us_id FROM countries WHERE code = 'US';
  
  -- Insert US States
  INSERT INTO states (country_id, name_en, name_es, slug) VALUES
  (us_id, 'California', 'California', 'california'),
  (us_id, 'Texas', 'Texas', 'texas'),
  (us_id, 'Florida', 'Florida', 'florida'),
  (us_id, 'New York', 'Nueva York', 'new-york'),
  (us_id, 'Pennsylvania', 'Pensilvania', 'pennsylvania'),
  (us_id, 'Illinois', 'Illinois', 'illinois'),
  (us_id, 'Ohio', 'Ohio', 'ohio'),
  (us_id, 'Georgia', 'Georgia', 'georgia'),
  (us_id, 'North Carolina', 'Carolina del Norte', 'north-carolina'),
  (us_id, 'Michigan', 'Michigan', 'michigan'),
  (us_id, 'New Jersey', 'Nueva Jersey', 'new-jersey'),
  (us_id, 'Virginia', 'Virginia', 'virginia'),
  (us_id, 'Washington', 'Washington', 'washington'),
  (us_id, 'Arizona', 'Arizona', 'arizona'),
  (us_id, 'Massachusetts', 'Massachusetts', 'massachusetts'),
  (us_id, 'Tennessee', 'Tennessee', 'tennessee'),
  (us_id, 'Indiana', 'Indiana', 'indiana'),
  (us_id, 'Missouri', 'Misuri', 'missouri'),
  (us_id, 'Maryland', 'Maryland', 'maryland'),
  (us_id, 'Wisconsin', 'Wisconsin', 'wisconsin'),
  (us_id, 'Colorado', 'Colorado', 'colorado'),
  (us_id, 'Minnesota', 'Minnesota', 'minnesota'),
  (us_id, 'South Carolina', 'Carolina del Sur', 'south-carolina'),
  (us_id, 'Alabama', 'Alabama', 'alabama'),
  (us_id, 'Louisiana', 'Luisiana', 'louisiana'),
  (us_id, 'Kentucky', 'Kentucky', 'kentucky'),
  (us_id, 'Oregon', 'Oregón', 'oregon'),
  (us_id, 'Oklahoma', 'Oklahoma', 'oklahoma'),
  (us_id, 'Connecticut', 'Connecticut', 'connecticut'),
  (us_id, 'Nevada', 'Nevada', 'nevada')
  ON CONFLICT (country_id, slug) DO NOTHING;
END $$;

-- Add California Cities
DO $$
DECLARE
  ca_id uuid;
BEGIN
  SELECT id INTO ca_id FROM states WHERE slug = 'california';
  
  INSERT INTO cities (state_id, name_en, name_es, slug, is_featured) VALUES
  (ca_id, 'Los Angeles', 'Los Ángeles', 'los-angeles', true),
  (ca_id, 'San Francisco', 'San Francisco', 'san-francisco', true),
  (ca_id, 'San Diego', 'San Diego', 'san-diego', true),
  (ca_id, 'San Jose', 'San José', 'san-jose', false),
  (ca_id, 'Sacramento', 'Sacramento', 'sacramento', false),
  (ca_id, 'Oakland', 'Oakland', 'oakland', false),
  (ca_id, 'Fresno', 'Fresno', 'fresno', false),
  (ca_id, 'Long Beach', 'Long Beach', 'long-beach', false)
  ON CONFLICT (state_id, slug) DO NOTHING;
END $$;

-- Add Texas Cities
DO $$
DECLARE
  tx_id uuid;
BEGIN
  SELECT id INTO tx_id FROM states WHERE slug = 'texas';
  
  INSERT INTO cities (state_id, name_en, name_es, slug, is_featured) VALUES
  (tx_id, 'Houston', 'Houston', 'houston', true),
  (tx_id, 'Dallas', 'Dallas', 'dallas', true),
  (tx_id, 'Austin', 'Austin', 'austin', true),
  (tx_id, 'San Antonio', 'San Antonio', 'san-antonio', true),
  (tx_id, 'Fort Worth', 'Fort Worth', 'fort-worth', false),
  (tx_id, 'El Paso', 'El Paso', 'el-paso', false)
  ON CONFLICT (state_id, slug) DO NOTHING;
END $$;

-- Add Florida Cities
DO $$
DECLARE
  fl_id uuid;
BEGIN
  SELECT id INTO fl_id FROM states WHERE slug = 'florida';
  
  INSERT INTO cities (state_id, name_en, name_es, slug, is_featured) VALUES
  (fl_id, 'Miami', 'Miami', 'miami', true),
  (fl_id, 'Orlando', 'Orlando', 'orlando', true),
  (fl_id, 'Tampa', 'Tampa', 'tampa', true),
  (fl_id, 'Jacksonville', 'Jacksonville', 'jacksonville', false),
  (fl_id, 'Fort Lauderdale', 'Fort Lauderdale', 'fort-lauderdale', false)
  ON CONFLICT (state_id, slug) DO NOTHING;
END $$;

-- Add New York Cities
DO $$
DECLARE
  ny_id uuid;
BEGIN
  SELECT id INTO ny_id FROM states WHERE slug = 'new-york';
  
  INSERT INTO cities (state_id, name_en, name_es, slug, is_featured) VALUES
  (ny_id, 'New York City', 'Ciudad de Nueva York', 'new-york-city', true),
  (ny_id, 'Buffalo', 'Buffalo', 'buffalo', false),
  (ny_id, 'Rochester', 'Rochester', 'rochester', false)
  ON CONFLICT (state_id, slug) DO NOTHING;
END $$;

-- Add Nevada Cities
DO $$
DECLARE
  nv_id uuid;
BEGIN
  SELECT id INTO nv_id FROM states WHERE slug = 'nevada';
  
  INSERT INTO cities (state_id, name_en, name_es, slug, is_featured) VALUES
  (nv_id, 'Las Vegas', 'Las Vegas', 'las-vegas', true),
  (nv_id, 'Reno', 'Reno', 'reno', false)
  ON CONFLICT (state_id, slug) DO NOTHING;
END $$;