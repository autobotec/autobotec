/*
  # Add States and Cities for Other Major Countries

  1. Argentina Provinces and Cities
  2. Spain Regions and Cities
  3. Chile Regions and Cities
  4. Peru Departments and Cities
*/

-- ARGENTINA
DO $$
DECLARE
  ar_id uuid;
BEGIN
  SELECT id INTO ar_id FROM countries WHERE code = 'AR';
  
  INSERT INTO states (country_id, name_en, name_es, slug) VALUES
  (ar_id, 'Buenos Aires', 'Buenos Aires', 'buenos-aires'),
  (ar_id, 'Córdoba', 'Córdoba', 'cordoba'),
  (ar_id, 'Santa Fe', 'Santa Fe', 'santa-fe'),
  (ar_id, 'Mendoza', 'Mendoza', 'mendoza'),
  (ar_id, 'Tucumán', 'Tucumán', 'tucuman'),
  (ar_id, 'Entre Ríos', 'Entre Ríos', 'entre-rios'),
  (ar_id, 'Salta', 'Salta', 'salta'),
  (ar_id, 'Chaco', 'Chaco', 'chaco'),
  (ar_id, 'Corrientes', 'Corrientes', 'corrientes'),
  (ar_id, 'Misiones', 'Misiones', 'misiones')
  ON CONFLICT (country_id, slug) DO NOTHING;
END $$;

DO $$
DECLARE
  ba_id uuid;
BEGIN
  SELECT id INTO ba_id FROM states WHERE country_id = (SELECT id FROM countries WHERE code = 'AR') AND slug = 'buenos-aires';
  
  INSERT INTO cities (state_id, name_en, name_es, slug, is_featured) VALUES
  (ba_id, 'Buenos Aires', 'Buenos Aires', 'buenos-aires-city', true),
  (ba_id, 'Palermo', 'Palermo', 'palermo', true),
  (ba_id, 'Recoleta', 'Recoleta', 'recoleta', true),
  (ba_id, 'Belgrano', 'Belgrano', 'belgrano', false),
  (ba_id, 'San Telmo', 'San Telmo', 'san-telmo', false),
  (ba_id, 'La Plata', 'La Plata', 'la-plata', false),
  (ba_id, 'Mar del Plata', 'Mar del Plata', 'mar-del-plata', false)
  ON CONFLICT (state_id, slug) DO NOTHING;
END $$;

DO $$
DECLARE
  cor_id uuid;
BEGIN
  SELECT id INTO cor_id FROM states WHERE country_id = (SELECT id FROM countries WHERE code = 'AR') AND slug = 'cordoba';
  
  INSERT INTO cities (state_id, name_en, name_es, slug, is_featured) VALUES
  (cor_id, 'Córdoba', 'Córdoba', 'cordoba-city', true),
  (cor_id, 'Villa Carlos Paz', 'Villa Carlos Paz', 'villa-carlos-paz', false)
  ON CONFLICT (state_id, slug) DO NOTHING;
END $$;

-- SPAIN
DO $$
DECLARE
  es_id uuid;
BEGIN
  SELECT id INTO es_id FROM countries WHERE code = 'ES';
  
  INSERT INTO states (country_id, name_en, name_es, slug) VALUES
  (es_id, 'Madrid', 'Madrid', 'madrid'),
  (es_id, 'Catalonia', 'Cataluña', 'cataluna'),
  (es_id, 'Andalusia', 'Andalucía', 'andalucia'),
  (es_id, 'Valencia', 'Valencia', 'valencia'),
  (es_id, 'Galicia', 'Galicia', 'galicia'),
  (es_id, 'Basque Country', 'País Vasco', 'pais-vasco'),
  (es_id, 'Castile and León', 'Castilla y León', 'castilla-leon'),
  (es_id, 'Canary Islands', 'Islas Canarias', 'islas-canarias'),
  (es_id, 'Balearic Islands', 'Islas Baleares', 'islas-baleares')
  ON CONFLICT (country_id, slug) DO NOTHING;
END $$;

DO $$
DECLARE
  mad_id uuid;
BEGIN
  SELECT id INTO mad_id FROM states WHERE country_id = (SELECT id FROM countries WHERE code = 'ES') AND slug = 'madrid';
  
  INSERT INTO cities (state_id, name_en, name_es, slug, is_featured) VALUES
  (mad_id, 'Madrid', 'Madrid', 'madrid-city', true),
  (mad_id, 'Salamanca', 'Salamanca', 'salamanca', true),
  (mad_id, 'Chamberí', 'Chamberí', 'chamberi', false)
  ON CONFLICT (state_id, slug) DO NOTHING;
END $$;

DO $$
DECLARE
  cat_id uuid;
BEGIN
  SELECT id INTO cat_id FROM states WHERE country_id = (SELECT id FROM countries WHERE code = 'ES') AND slug = 'cataluna';
  
  INSERT INTO cities (state_id, name_en, name_es, slug, is_featured) VALUES
  (cat_id, 'Barcelona', 'Barcelona', 'barcelona', true),
  (cat_id, 'Eixample', 'Eixample', 'eixample', true),
  (cat_id, 'Gràcia', 'Gràcia', 'gracia', false),
  (cat_id, 'Tarragona', 'Tarragona', 'tarragona', false)
  ON CONFLICT (state_id, slug) DO NOTHING;
END $$;

DO $$
DECLARE
  bal_id uuid;
BEGIN
  SELECT id INTO bal_id FROM states WHERE country_id = (SELECT id FROM countries WHERE code = 'ES') AND slug = 'islas-baleares';
  
  INSERT INTO cities (state_id, name_en, name_es, slug, is_featured) VALUES
  (bal_id, 'Palma de Mallorca', 'Palma de Mallorca', 'palma', true),
  (bal_id, 'Ibiza', 'Ibiza', 'ibiza', true)
  ON CONFLICT (state_id, slug) DO NOTHING;
END $$;

-- CHILE
DO $$
DECLARE
  cl_id uuid;
BEGIN
  SELECT id INTO cl_id FROM countries WHERE code = 'CL';
  
  INSERT INTO states (country_id, name_en, name_es, slug) VALUES
  (cl_id, 'Santiago Metropolitan', 'Región Metropolitana', 'santiago'),
  (cl_id, 'Valparaíso', 'Valparaíso', 'valparaiso'),
  (cl_id, 'Biobío', 'Biobío', 'biobio'),
  (cl_id, 'Maule', 'Maule', 'maule'),
  (cl_id, 'La Araucanía', 'La Araucanía', 'araucania'),
  (cl_id, 'Antofagasta', 'Antofagasta', 'antofagasta')
  ON CONFLICT (country_id, slug) DO NOTHING;
END $$;

DO $$
DECLARE
  stgo_id uuid;
BEGIN
  SELECT id INTO stgo_id FROM states WHERE country_id = (SELECT id FROM countries WHERE code = 'CL') AND slug = 'santiago';
  
  INSERT INTO cities (state_id, name_en, name_es, slug, is_featured) VALUES
  (stgo_id, 'Santiago', 'Santiago', 'santiago-city', true),
  (stgo_id, 'Providencia', 'Providencia', 'providencia', true),
  (stgo_id, 'Las Condes', 'Las Condes', 'las-condes', true),
  (stgo_id, 'Vitacura', 'Vitacura', 'vitacura', false)
  ON CONFLICT (state_id, slug) DO NOTHING;
END $$;

DO $$
DECLARE
  val_id uuid;
BEGIN
  SELECT id INTO val_id FROM states WHERE country_id = (SELECT id FROM countries WHERE code = 'CL') AND slug = 'valparaiso';
  
  INSERT INTO cities (state_id, name_en, name_es, slug, is_featured) VALUES
  (val_id, 'Valparaíso', 'Valparaíso', 'valparaiso-city', true),
  (val_id, 'Viña del Mar', 'Viña del Mar', 'vina-del-mar', true)
  ON CONFLICT (state_id, slug) DO NOTHING;
END $$;

-- PERU
DO $$
DECLARE
  pe_id uuid;
BEGIN
  SELECT id INTO pe_id FROM countries WHERE code = 'PE';
  
  INSERT INTO states (country_id, name_en, name_es, slug) VALUES
  (pe_id, 'Lima', 'Lima', 'lima'),
  (pe_id, 'Arequipa', 'Arequipa', 'arequipa'),
  (pe_id, 'Cusco', 'Cusco', 'cusco'),
  (pe_id, 'La Libertad', 'La Libertad', 'la-libertad'),
  (pe_id, 'Piura', 'Piura', 'piura'),
  (pe_id, 'Lambayeque', 'Lambayeque', 'lambayeque')
  ON CONFLICT (country_id, slug) DO NOTHING;
END $$;

DO $$
DECLARE
  lim_id uuid;
BEGIN
  SELECT id INTO lim_id FROM states WHERE country_id = (SELECT id FROM countries WHERE code = 'PE') AND slug = 'lima';
  
  INSERT INTO cities (state_id, name_en, name_es, slug, is_featured) VALUES
  (lim_id, 'Lima', 'Lima', 'lima-city', true),
  (lim_id, 'Miraflores', 'Miraflores', 'miraflores', true),
  (lim_id, 'San Isidro', 'San Isidro', 'san-isidro', true),
  (lim_id, 'Barranco', 'Barranco', 'barranco', false),
  (lim_id, 'Surco', 'Surco', 'surco', false)
  ON CONFLICT (state_id, slug) DO NOTHING;
END $$;