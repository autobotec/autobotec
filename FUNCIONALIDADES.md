# Plataforma de Clasificados para Adultos - Documentación Completa

## ✅ Estado Actual del Proyecto

### Base de Datos Completada (Supabase)

#### Tablas Creadas:
1. **profiles** - Perfiles de usuario con roles (user/admin)
2. **categories** - Categorías bilingües (EN/ES)
3. **locations** - Ubicaciones jerárquicas (países, ciudades)
4. **listings** - Publicaciones/anuncios con:
   - Contenido bilingüe (título y descripción en EN/ES)
   - Sistema de precios con múltiples monedas
   - Contador de vistas, likes, shares
   - Estado (active, pending, inactive, expired)
   - Featured flag
5. **listing_images** - Imágenes para publicaciones
6. **favorites** - Favoritos de usuarios
7. **listing_likes** - Sistema de likes
8. **listing_shares** - Rastreo de compartidos

#### Seguridad RLS:
- Políticas restrictivas implementadas
- Los usuarios solo pueden editar su propio contenido
- Los administradores tienen acceso completo
- Sistema de roles funcional

### Archivos Creados:

#### Core Files (src/)
- ✅ `i18n.js` - Sistema de traducción EN/ES completo
- ✅ `supabase.js` - Cliente de Supabase configurado
- ✅ `router.js` - Router SPA funcional
- ❌ `styles.css` - Estilos globales (FALTA CREAR)

#### Components (src/components/)
- ❌ `Header.js` - Navegación con cambio de idioma (FALTA CREAR)
- ❌ `Footer.js` - Pie de página (FALTA CREAR)

#### Pages Regulares (src/pages/)
- ❌ `HomePage.js` - Página principal (FALTA CREAR)
- ❌ `ListingsPage.js` - Listado con filtros (FALTA CREAR)
- ❌ `ListingDetailPage.js` - Detalle con likes/shares (FALTA CREAR)
- ❌ `AuthPage.js` - Login/Registro (FALTA CREAR)
- ❌ `PostAdPage.js` - Crear anuncio (FALTA CREAR)
- ❌ `MyAdsPage.js` - Mis anuncios (versión antigua, NECESITA ACTUALIZACIÓN)

#### Dashboard de Usuario (src/pages/)
- ✅ `UserDashboardPage.js` - Panel principal del usuario con:
  - Estadísticas (total ads, vistas, likes, shares)
  - Lista de anuncios propios con métricas
  - Botones para ver, editar, eliminar
- ✅ `EditAdPage.js` - Editar publicaciones propias

#### Dashboard Administrativo (src/pages/)
- ✅ `AdminDashboardPage.js` - Panel principal admin con:
  - Estadísticas generales
  - Listado de anuncios recientes
  - Acceso a secciones de gestión
- ✅ `AdminListingsPage.js` - Gestión de anuncios:
  - Cambiar estado (active/pending/inactive/expired)
  - Marcar como destacado
  - Eliminar anuncios
  - Filtrar por estado
- ❌ `AdminCategoriesPage.js` - Gestión categorías (FALTA CREAR)
- ❌ `AdminLocationsPage.js` - Gestión ubicaciones (FALTA CREAR)
- ❌ `AdminUsersPage.js` - Gestión usuarios (FALTA CREAR)

### Funcionalidades Implementadas:

#### ✅ Sistema de Roles
- Tabla profiles con campo `role` (user/admin)
- Políticas RLS diferenciadas por rol
- Admins pueden gestionar todo el contenido

#### ✅ Sistema de Likes
- Tabla listing_likes con unique constraint
- Contador automático con triggers
- Usuarios pueden dar/quitar like

#### ✅ Sistema de Shares
- Tabla listing_shares para tracking
- Contador automático
- Registro por plataforma (whatsapp, facebook, etc)

#### ✅ Dashboards
- **Usuario**: Ver estadísticas propias, editar/eliminar anuncios
- **Admin**: Estadísticas globales, moderar contenido, cambiar estados

## 🔄 Lo que Falta Por Implementar:

### 1. Componentes Base (PRIORIDAD ALTA)
- Header.js con navegación y banderas
- Footer.js
- styles.css con estilos globales

### 2. Páginas Principales (PRIORIDAD ALTA)
- HomePage.js - Landing con categorías y ubicaciones
- ListingsPage.js - Grid con filtros
- ListingDetailPage.js - Vista completa con botones like/share
- AuthPage.js - Login/Registro
- PostAdPage.js - Formulario crear anuncio

### 3. Páginas Admin (PRIORIDAD MEDIA)
- AdminCategoriesPage.js - CRUD categorías
- AdminLocationsPage.js - CRUD ubicaciones
- AdminUsersPage.js - Gestión usuarios y roles

### 4. Main.js (PRIORIDAD ALTA)
Actualizar el archivo principal para:
- Importar todos los componentes y páginas
- Configurar rutas:
  - `/` - HomePage
  - `/listings` - ListingsPage
  - `/listing/:id` - ListingDetailPage
  - `/auth` - AuthPage
  - `/post-ad` - PostAdPage
  - `/dashboard` - UserDashboardPage
  - `/edit-ad/:id` - EditAdPage
  - `/admin` - AdminDashboardPage
  - `/admin/listings` - AdminListingsPage
  - `/admin/categories` - AdminCategoriesPage
  - `/admin/locations` - AdminLocationsPage
  - `/admin/users` - AdminUsersPage
- Inicializar app con router

## 📋 Rutas de la Aplicación:

### Públicas:
- `/` - Home
- `/listings` - Ver anuncios
- `/listings?category=X` - Filtrar por categoría
- `/listings?location=Y` - Filtrar por ubicación
- `/listing/:id` - Detalle anuncio
- `/auth` - Login/Registro

### Usuarios Autenticados:
- `/post-ad` - Crear anuncio
- `/dashboard` - Panel usuario
- `/edit-ad/:id` - Editar anuncio propio

### Administradores:
- `/admin` - Dashboard admin
- `/admin/listings` - Gestionar anuncios
- `/admin/categories` - Gestionar categorías
- `/admin/locations` - Gestionar ubicaciones
- `/admin/users` - Gestionar usuarios

## 🎯 Próximos Pasos Recomendados:

1. Completar archivos faltantes en orden:
   - styles.css
   - Header.js y Footer.js
   - HomePage.js
   - ListingsPage.js
   - ListingDetailPage.js (con likes/shares)
   - AuthPage.js
   - PostAdPage.js
   - Páginas admin restantes
   - Actualizar main.js con todo

2. Implementar funcionalidad de likes en ListingDetailPage:
   ```javascript
   // Dar like
   const { error } = await supabase
     .from('listing_likes')
     .insert([{ user_id, listing_id }]);

   // Quitar like
   const { error } = await supabase
     .from('listing_likes')
     .delete()
     .eq('user_id', user_id)
     .eq('listing_id', listing_id);
   ```

3. Implementar funcionalidad de compartir:
   ```javascript
   // Registrar share
   const { error } = await supabase
     .from('listing_shares')
     .insert([{
       listing_id,
       user_id,
       platform: 'whatsapp' // o 'facebook', 'twitter', etc
     }]);

   // Abrir WhatsApp
   window.open(\`https://wa.me/?text=\${encodeURIComponent(url)}\`, '_blank');
   ```

## 🔐 Crear Usuario Admin:

Para crear un administrador, después de registrar un usuario normal:

```sql
UPDATE profiles
SET role = 'admin'
WHERE email = 'admin@ejemplo.com';
```

## 🚀 Comandos:

```bash
npm install        # Instalar dependencias
npm run dev        # Iniciar desarrollo
npm run build      # Compilar para producción
```

## 📊 Cambio de Idioma:

El sistema está completamente bilingüe:
- Banderas en header: 🇺🇸 inglés, 🇪🇸 español
- Almacena preferencia en localStorage
- Recarga página al cambiar idioma
- Todo el contenido de UI está traducido

## 🎨 Diseño:

- Color primario: Rosa/Fucsia (#e91e63)
- Diseño moderno y limpio
- Responsive (móvil y escritorio)
- Uso de íconos emoji
- Cards con sombras y hover effects
