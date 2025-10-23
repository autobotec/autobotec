/*
  # Add Colombia Departments and Major Cities

  1. Departments
    - Main Colombian departments with bilingual names
    
  2. Major Cities
    - Top cities for each department
*/

DO $$
DECLARE
  co_id uuid;
BEGIN
  SELECT id INTO co_id FROM countries WHERE code = 'CO';
  
  -- Insert Colombian Departments
  INSERT INTO states (country_id, name_en, name_es, slug) VALUES
  (co_id, 'Bogotá D.C.', 'Bogotá D.C.', 'bogota'),
  (co_id, 'Antioquia', 'Antioquia', 'antioquia'),
  (co_id, 'Valle del Cauca', 'Valle del Cauca', 'valle-del-cauca'),
  (co_id, 'Atlántico', 'Atlántico', 'atlantico'),
  (co_id, 'Santander', 'Santander', 'santander'),
  (co_id, 'Bolívar', 'Bolívar', 'bolivar'),
  (co_id, 'Cundinamarca', 'Cundinamarca', 'cundinamarca'),
  (co_id, 'Norte de Santander', 'Norte de Santander', 'norte-santander'),
  (co_id, 'Tolima', 'Tolima', 'tolima'),
  (co_id, 'Huila', 'Huila', 'huila'),
  (co_id, 'Risaralda', 'Risaralda', 'risaralda'),
  (co_id, 'Caldas', 'Caldas', 'caldas'),
  (co_id, 'Magdalena', 'Magdalena', 'magdalena'),
  (co_id, 'Quindío', 'Quindío', 'quindio'),
  (co_id, 'Meta', 'Meta', 'meta'),
  (co_id, 'Cauca', 'Cauca', 'cauca'),
  (co_id, 'Cesar', 'Cesar', 'cesar'),
  (co_id, 'Córdoba', 'Córdoba', 'cordoba'),
  (co_id, 'Boyacá', 'Boyacá', 'boyaca'),
  (co_id, 'Nariño', 'Nariño', 'narino')
  ON CONFLICT (country_id, slug) DO NOTHING;
END $$;

-- Add Bogotá neighborhoods
DO $$
DECLARE
  bog_id uuid;
BEGIN
  SELECT id INTO bog_id FROM states WHERE slug = 'bogota';
  
  INSERT INTO cities (state_id, name_en, name_es, slug, is_featured) VALUES
  (bog_id, 'Chapinero', 'Chapinero', 'chapinero', true),
  (bog_id, 'Usaquén', 'Usaquén', 'usaquen', true),
  (bog_id, 'La Candelaria', 'La Candelaria', 'la-candelaria', true),
  (bog_id, 'Zona Rosa', 'Zona Rosa', 'zona-rosa', true),
  (bog_id, 'Suba', 'Suba', 'suba', false),
  (bog_id, 'Kennedy', 'Kennedy', 'kennedy', false),
  (bog_id, 'Engativá', 'Engativá', 'engativa', false)
  ON CONFLICT (state_id, slug) DO NOTHING;
END $$;

-- Add Antioquia Cities
DO $$
DECLARE
  ant_id uuid;
BEGIN
  SELECT id INTO ant_id FROM states WHERE slug = 'antioquia';
  
  INSERT INTO cities (state_id, name_en, name_es, slug, is_featured) VALUES
  (ant_id, 'Medellín', 'Medellín', 'medellin', true),
  (ant_id, 'El Poblado', 'El Poblado', 'el-poblado', true),
  (ant_id, 'Laureles', 'Laureles', 'laureles', true),
  (ant_id, 'Envigado', 'Envigado', 'envigado', false),
  (ant_id, 'Sabaneta', 'Sabaneta', 'sabaneta', false),
  (ant_id, 'Itagüí', 'Itagüí', 'itagui', false)
  ON CONFLICT (state_id, slug) DO NOTHING;
END $$;

-- Add Valle del Cauca Cities
DO $$
DECLARE
  vdc_id uuid;
BEGIN
  SELECT id INTO vdc_id FROM states WHERE slug = 'valle-del-cauca';
  
  INSERT INTO cities (state_id, name_en, name_es, slug, is_featured) VALUES
  (vdc_id, 'Cali', 'Cali', 'cali', true),
  (vdc_id, 'Buenaventura', 'Buenaventura', 'buenaventura', false),
  (vdc_id, 'Palmira', 'Palmira', 'palmira', false)
  ON CONFLICT (state_id, slug) DO NOTHING;
END $$;

-- Add Atlántico Cities
DO $$
DECLARE
  atl_id uuid;
BEGIN
  SELECT id INTO atl_id FROM states WHERE slug = 'atlantico';
  
  INSERT INTO cities (state_id, name_en, name_es, slug, is_featured) VALUES
  (atl_id, 'Barranquilla', 'Barranquilla', 'barranquilla', true),
  (atl_id, 'Soledad', 'Soledad', 'soledad', false)
  ON CONFLICT (state_id, slug) DO NOTHING;
END $$;

-- Add Bolívar Cities
DO $$
DECLARE
  bol_id uuid;
BEGIN
  SELECT id INTO bol_id FROM states WHERE slug = 'bolivar';
  
  INSERT INTO cities (state_id, name_en, name_es, slug, is_featured) VALUES
  (bol_id, 'Cartagena', 'Cartagena', 'cartagena', true),
  (bol_id, 'Cartagena Centro', 'Cartagena Centro', 'cartagena-centro', true),
  (bol_id, 'Bocagrande', 'Bocagrande', 'bocagrande', true)
  ON CONFLICT (state_id, slug) DO NOTHING;
END $$;

-- Add Santander Cities
DO $$
DECLARE
  san_id uuid;
BEGIN
  SELECT id INTO san_id FROM states WHERE slug = 'santander';
  
  INSERT INTO cities (state_id, name_en, name_es, slug, is_featured) VALUES
  (san_id, 'Bucaramanga', 'Bucaramanga', 'bucaramanga', true),
  (san_id, 'Floridablanca', 'Floridablanca', 'floridablanca', false)
  ON CONFLICT (state_id, slug) DO NOTHING;
END $$;