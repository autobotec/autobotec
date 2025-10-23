# Setup de Medios (Imágenes y Videos)

## 1. Ejecutar la migración de base de datos

Aplica la migración en: `supabase/migrations/20251023150000_add_listing_media_table.sql`

Esta migración crea la tabla `listing_media` con:
- Soporte para imágenes y videos
- Relación con listings
- Políticas de seguridad RLS

## 2. Configurar el almacenamiento en Supabase

### Paso 1: Crear un bucket de almacenamiento

1. Ve a tu proyecto de Supabase Dashboard
2. Ve a "Storage" en el menú lateral
3. Crea un nuevo bucket llamado `listing-media`
4. Marca el bucket como **público** para que las imágenes sean accesibles

### Paso 2: Configurar políticas del bucket

Ejecuta estos comandos SQL en el SQL Editor de Supabase:

```sql
-- Permitir que usuarios autenticados suban archivos
CREATE POLICY "Users can upload their listing media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'listing-media');

-- Permitir que cualquiera vea los archivos
CREATE POLICY "Anyone can view listing media"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'listing-media');

-- Permitir que usuarios autenticados actualicen sus archivos
CREATE POLICY "Users can update their listing media"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'listing-media');

-- Permitir que usuarios autenticados eliminen sus archivos
CREATE POLICY "Users can delete their listing media"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'listing-media');
```

## 3. Cómo funciona la subida de medios

### En el formulario de publicar anuncio:

```html
<div class="form-group">
  <label>Fotos y Videos</label>
  <input
    type="file"
    id="media-upload"
    accept="image/*,video/*"
    multiple
    class="form-control"
  >
  <small>Puedes subir hasta 10 archivos (imágenes o videos)</small>
  <div id="media-preview" class="media-preview-grid"></div>
</div>
```

### Código JavaScript para subir:

```javascript
async function uploadMedia(listingId, files) {
  const uploads = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const fileExt = file.name.split('.').pop();
    const fileName = `${listingId}/${Date.now()}-${i}.${fileExt}`;
    const mediaType = file.type.startsWith('video/') ? 'video' : 'image';

    // Subir archivo a Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('listing-media')
      .upload(fileName, file);

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      continue;
    }

    // Obtener URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('listing-media')
      .getPublicUrl(fileName);

    // Guardar referencia en la base de datos
    const { error: dbError } = await supabase
      .from('listing_media')
      .insert({
        listing_id: listingId,
        media_type: mediaType,
        media_url: publicUrl,
        order_index: i
      });

    if (dbError) {
      console.error('Error saving media reference:', dbError);
    } else {
      uploads.push(publicUrl);
    }
  }

  return uploads;
}
```

## 4. Alternativa simple: Usar URLs externas

Si no quieres configurar el almacenamiento de Supabase inmediatamente, puedes:

1. Subir las imágenes a servicios como:
   - Imgur
   - Cloudinary
   - imgbb
   - Google Drive (con enlaces públicos)

2. Copiar las URLs públicas

3. Guardarlas directamente en la tabla `listing_media`:

```javascript
const mediaUrls = [
  'https://i.imgur.com/abc123.jpg',
  'https://i.imgur.com/def456.jpg',
  'https://i.imgur.com/ghi789.mp4'
];

for (let i = 0; i < mediaUrls.length; i++) {
  const url = mediaUrls[i];
  const isVideo = url.endsWith('.mp4') || url.endsWith('.webm');

  await supabase
    .from('listing_media')
    .insert({
      listing_id: 'tu-listing-id',
      media_type: isVideo ? 'video' : 'image',
      media_url: url,
      order_index: i
    });
}
```

## 5. Visualización de medios

Los anuncios mostrarán:
- **En listados**: Primera imagen/video como miniatura
- **En detalle**: Galería completa con navegación
- **Videos**: Se reproducen con controles nativos
- **Contador**: Muestra "X fotos" en la esquina

## 6. Funcionalidades implementadas

✅ Tabla `listing_media` con RLS
✅ Página de detalle de anuncio (estilo Mileroticos)
✅ Galería de medios con navegación
✅ Miniaturas clickeables
✅ Soporte para videos
✅ Botón de favoritos funcional
✅ Contador de vistas automático
✅ Diseño responsive

## 7. Próximos pasos

1. Ejecuta la migración SQL
2. Configura el bucket en Supabase o usa URLs externas
3. Agrega el campo de upload al formulario PostAdPage.js
4. Prueba subiendo imágenes
5. Verifica que aparezcan en los listados
