/*
  # Add Mexico States and Major Cities

  1. States
    - All 32 Mexican states with bilingual names
    
  2. Major Cities
    - Top cities for each major state
*/

DO $$
DECLARE
  mx_id uuid;
BEGIN
  SELECT id INTO mx_id FROM countries WHERE code = 'MX';
  
  -- Insert Mexican States
  INSERT INTO states (country_id, name_en, name_es, slug) VALUES
  (mx_id, 'Mexico City', 'Ciudad de México', 'ciudad-de-mexico'),
  (mx_id, 'Jalisco', 'Jalisco', 'jalisco'),
  (mx_id, 'Nuevo León', 'Nuevo León', 'nuevo-leon'),
  (mx_id, 'Puebla', 'Puebla', 'puebla'),
  (mx_id, 'Guanajuato', 'Guanajuato', 'guanajuato'),
  (mx_id, 'Chiapas', 'Chiapas', 'chiapas'),
  (mx_id, 'Veracruz', 'Veracruz', 'veracruz'),
  (mx_id, 'Baja California', 'Baja California', 'baja-california'),
  (mx_id, 'Michoacán', 'Michoacán', 'michoacan'),
  (mx_id, 'Oaxaca', 'Oaxaca', 'oaxaca'),
  (mx_id, 'Chihuahua', 'Chihuahua', 'chihuahua'),
  (mx_id, 'Guerrero', 'Guerrero', 'guerrero'),
  (mx_id, 'Tamaulipas', 'Tamaulipas', 'tamaulipas'),
  (mx_id, 'Sinaloa', 'Sinaloa', 'sinaloa'),
  (mx_id, 'Coahuila', 'Coahuila', 'coahuila'),
  (mx_id, 'Hidalgo', 'Hidalgo', 'hidalgo'),
  (mx_id, 'Sonora', 'Sonora', 'sonora'),
  (mx_id, 'San Luis Potosí', 'San Luis Potosí', 'san-luis-potosi'),
  (mx_id, 'Tabasco', 'Tabasco', 'tabasco'),
  (mx_id, 'Yucatán', 'Yucatán', 'yucatan'),
  (mx_id, 'Querétaro', 'Querétaro', 'queretaro'),
  (mx_id, 'Morelos', 'Morelos', 'morelos'),
  (mx_id, 'Durango', 'Durango', 'durango'),
  (mx_id, 'Zacatecas', 'Zacatecas', 'zacatecas'),
  (mx_id, 'Quintana Roo', 'Quintana Roo', 'quintana-roo'),
  (mx_id, 'Aguascalientes', 'Aguascalientes', 'aguascalientes'),
  (mx_id, 'Tlaxcala', 'Tlaxcala', 'tlaxcala'),
  (mx_id, 'Nayarit', 'Nayarit', 'nayarit'),
  (mx_id, 'Campeche', 'Campeche', 'campeche'),
  (mx_id, 'Colima', 'Colima', 'colima'),
  (mx_id, 'Baja California Sur', 'Baja California Sur', 'baja-california-sur')
  ON CONFLICT (country_id, slug) DO NOTHING;
END $$;

-- Add Mexico City neighborhoods/areas
DO $$
DECLARE
  cdmx_id uuid;
BEGIN
  SELECT id INTO cdmx_id FROM states WHERE slug = 'ciudad-de-mexico';
  
  INSERT INTO cities (state_id, name_en, name_es, slug, is_featured) VALUES
  (cdmx_id, 'Polanco', 'Polanco', 'polanco', true),
  (cdmx_id, 'Roma', 'Roma', 'roma', true),
  (cdmx_id, 'Condesa', 'Condesa', 'condesa', true),
  (cdmx_id, 'Centro Histórico', 'Centro Histórico', 'centro-historico', true),
  (cdmx_id, 'Santa Fe', 'Santa Fe', 'santa-fe', false),
  (cdmx_id, 'Coyoacán', 'Coyoacán', 'coyoacan', false),
  (cdmx_id, 'Chapultepec', 'Chapultepec', 'chapultepec', false)
  ON CONFLICT (state_id, slug) DO NOTHING;
END $$;

-- Add Jalisco Cities
DO $$
DECLARE
  jal_id uuid;
BEGIN
  SELECT id INTO jal_id FROM states WHERE slug = 'jalisco';
  
  INSERT INTO cities (state_id, name_en, name_es, slug, is_featured) VALUES
  (jal_id, 'Guadalajara', 'Guadalajara', 'guadalajara', true),
  (jal_id, 'Zapopan', 'Zapopan', 'zapopan', true),
  (jal_id, 'Puerto Vallarta', 'Puerto Vallarta', 'puerto-vallarta', true),
  (jal_id, 'Tlaquepaque', 'Tlaquepaque', 'tlaquepaque', false)
  ON CONFLICT (state_id, slug) DO NOTHING;
END $$;

-- Add Nuevo León Cities
DO $$
DECLARE
  nl_id uuid;
BEGIN
  SELECT id INTO nl_id FROM states WHERE slug = 'nuevo-leon';
  
  INSERT INTO cities (state_id, name_en, name_es, slug, is_featured) VALUES
  (nl_id, 'Monterrey', 'Monterrey', 'monterrey', true),
  (nl_id, 'San Pedro Garza García', 'San Pedro Garza García', 'san-pedro', true),
  (nl_id, 'Guadalupe', 'Guadalupe', 'guadalupe', false)
  ON CONFLICT (state_id, slug) DO NOTHING;
END $$;

-- Add Quintana Roo Cities (tourist destinations)
DO $$
DECLARE
  qr_id uuid;
BEGIN
  SELECT id INTO qr_id FROM states WHERE slug = 'quintana-roo';
  
  INSERT INTO cities (state_id, name_en, name_es, slug, is_featured) VALUES
  (qr_id, 'Cancún', 'Cancún', 'cancun', true),
  (qr_id, 'Playa del Carmen', 'Playa del Carmen', 'playa-del-carmen', true),
  (qr_id, 'Tulum', 'Tulum', 'tulum', true),
  (qr_id, 'Cozumel', 'Cozumel', 'cozumel', false)
  ON CONFLICT (state_id, slug) DO NOTHING;
END $$;

-- Add Baja California Cities
DO $$
DECLARE
  bc_id uuid;
BEGIN
  SELECT id INTO bc_id FROM states WHERE slug = 'baja-california';
  
  INSERT INTO cities (state_id, name_en, name_es, slug, is_featured) VALUES
  (bc_id, 'Tijuana', 'Tijuana', 'tijuana', true),
  (bc_id, 'Mexicali', 'Mexicali', 'mexicali', false),
  (bc_id, 'Ensenada', 'Ensenada', 'ensenada', false)
  ON CONFLICT (state_id, slug) DO NOTHING;
END $$;