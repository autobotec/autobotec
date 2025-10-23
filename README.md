# ENCUENTRAME / FIND ME

A professional bilingual adult classifieds platform built with Vanilla JavaScript, Vite, and Supabase.

## Features

### Bilingual Support (ES/EN)
- Complete Spanish and English interface
- Language switcher with flag icons in header
- All content translated dynamically with i18n system
- Persistent language preference in localStorage

### Advanced Geographic System
- **11 Countries**: USA, Mexico, Colombia, Argentina, Spain, Venezuela, Chile, Peru, Ecuador, Brazil, Canada
- **Hierarchical Navigation**: Country > State/Department > City > Neighborhood
- **Populated Data**:
  - USA: 30 states with major cities
  - Mexico: 31 states with cities and tourist destinations
  - Colombia: 20 departments with major cities and neighborhoods
  - Argentina: 10 provinces with cities
  - Spain: 9 autonomous communities with cities
  - Chile: 6 regions with major cities
  - Peru: 6 departments with cities
- **Dynamic Cascading Selectors**: Select country to load states, select state to load cities
- **Neighborhood Support**: Free text field for specific location details

### User Features
- ✅ Age verification modal (18+)
- ✅ Email/password authentication with Supabase Auth
- ✅ Complete user dashboard with statistics
- ✅ Create and manage listings
- ✅ Edit existing listings
- ✅ Toggle listing active/inactive status
- ✅ Delete listings
- ✅ View count tracking
- ✅ Favorites system with heart icon
- ✅ View published listings

### Listing Features
- **Detailed Posting Form**:
  - Title and description
  - Contact info (phone, WhatsApp, email)
  - Physical characteristics (age, ethnicity, body type, height, weight)
  - Service details (type, schedule, languages, payment methods)
  - Location (country, state, city, neighborhood, address)
  - Social media links
  - Travel availability

- **Media Support**:
  - Upload multiple photos
  - Upload videos
  - Image gallery with navigation
  - First image/video shown in listings
  - Thumbnail viewer

- **Analytics**:
  - View counter (auto-increments on click)
  - Favorites counter
  - Statistics in dashboard

### Listing Display
- **List View**:
  - Grid layout with cards
  - First media preview
  - Quick info display
  - Favorite and view counts
  - Click to view details

- **Detail View** (Mileroticos-style):
  - Full media gallery with prev/next navigation
  - Thumbnail strip for quick access
  - Video player with controls
  - Complete listing information
  - Contact sidebar with phone/WhatsApp/email buttons
  - Location details
  - Breadcrumb navigation
  - Favorite button with counter
  - View counter

### Categories
1. Female Escorts (Escorts Femeninos)
2. Male Escorts (Escorts Masculinos)
3. Trans
4. Massages (Masajes)
5. BDSM
6. Couples (Parejas)
7. Other (Otros)

## Tech Stack

- **Frontend**: Vanilla JavaScript (ES6+)
- **Build Tool**: Vite 5
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (email/password)
- **Storage**: Supabase Storage (for media files)
- **Styling**: Custom CSS with CSS Variables
- **Routing**: Custom SPA router with history API

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd project
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables in `.env`:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Apply database migrations:
   - Run all SQL files in `supabase/migrations/` in order
   - See `MEDIA_SETUP.md` for media configuration

5. Run development server:
   ```bash
   npm run dev
   ```

6. Build for production:
   ```bash
   npm run build
   ```

## Project Structure

```
project/
├── src/
│   ├── lib/
│   │   ├── supabase.js           # Supabase client configuration
│   │   ├── auth.js               # Authentication helpers
│   │   ├── i18n.js               # Internationalization system
│   │   ├── router.js             # Custom SPA router
│   │   └── routeResolver.js      # Route resolution logic
│   ├── components/
│   │   ├── Header.js             # Navigation header with language switcher
│   │   └── Footer.js             # Site footer
│   ├── pages/
│   │   ├── HomePage.js           # Landing page with country selector
│   │   ├── CountryPage.js        # Country-specific listings
│   │   ├── StatePage.js          # State/department listings
│   │   ├── CityPage.js           # City-specific listings
│   │   ├── CategoryCountryPage.js
│   │   ├── CategoryStatePage.js
│   │   ├── CategoryCityPage.js
│   │   ├── ListingDetailPage.js  # Listing grid view
│   │   ├── ListingSinglePage.js  # Individual listing detail
│   │   ├── AuthPage.js           # Login/Register
│   │   ├── DashboardPage.js      # User dashboard
│   │   ├── PostAdPage.js         # Create listing
│   │   └── EditAdPage.js         # Edit listing
│   ├── styles/
│   │   └── app.css               # Complete application styles
│   └── main.js                   # Application entry point
├── supabase/
│   └── migrations/               # Database migration files
├── index.html
├── package.json
├── MEDIA_SETUP.md               # Media upload instructions
├── FUNCIONALIDADES.md           # Features documentation (Spanish)
└── README.md
```

## Database Schema

### Core Tables
- **countries** - 11 supported countries with bilingual names
- **states** - States/departments/provinces (100+ entries)
- **cities** - Major cities (80+ entries populated)
- **categories** - 7 service categories

### Listing Tables
- **listings** - Main advertisement table with all details
- **listing_media** - Photos and videos with ordering
- **favorites** - User-saved listings

### User Tables
- **auth.users** - Supabase authentication (managed)
- **profiles** - Extended user information (planned)

### Analytics Tables
- **views_count** - Auto-increments in listings table
- **favorites_count** - Auto-increments in listings table

## URL Structure

### Main Navigation
- `/` - Home page with country selector

### Geographic Routes
- `/:countryCode/` - Country microsite (e.g., `/us/`, `/co/`)
- `/:countryCode/:stateSlug/` - State/department listings
- `/:countryCode/:stateSlug/:citySlug/` - City listings

### Category Routes
- `/:countryCode/:categorySlug/` - Category in country
- `/:countryCode/:categorySlug/:stateSlug/` - Category in state
- `/:countryCode/:categorySlug/:stateSlug/:citySlug/` - Category in city

### Listing Routes
- `/listing/:id` - Individual listing detail page

### User Routes
- `/auth` - Login/Register page
- `/dashboard` - User dashboard
- `/post-ad` - Create new listing
- `/edit-ad/:id` - Edit existing listing

## Security Features

- **Age Verification**: 18+ modal on first visit
- **Row Level Security (RLS)**: Enabled on all tables
- **Authentication Required**: For posting, editing, favorites
- **Ownership Validation**: Users can only edit their own listings
- **Public Access**: Anonymous users can browse listings
- **Secure Storage**: Media files with proper access policies

## Key Features Implemented

### ✅ Authentication System
- Email/password registration
- Login with session management
- Logout functionality
- Protected routes

### ✅ Listing Management
- Create listings with full form
- Edit existing listings
- Toggle active/inactive status
- Delete listings
- View statistics per listing

### ✅ Media System
- Database table for media references
- Support for images and videos
- Ordering system for galleries
- First media shown in cards
- Full gallery in detail view

### ✅ Interaction Features
- Favorites system (requires login)
- View counter (auto-increments)
- Click-through tracking
- Breadcrumb navigation

### ✅ Responsive Design
- Mobile-first approach
- Tablet optimization
- Desktop enhancements
- Touch-friendly controls

## Setup Instructions

### 1. Database Setup
Run migrations in order:
```sql
-- 1. Initialize core tables
supabase/migrations/20251023135857_initialize_database.sql

-- 2. Add supporting tables
supabase/migrations/20251023135934_create_supporting_tables.sql

-- 3. Add premium features
supabase/migrations/20251023140006_create_premium_and_seed_data.sql

-- 4-7. Populate geographic data
supabase/migrations/20251023141544_add_us_states_and_cities.sql
supabase/migrations/20251023141614_add_mexico_states_and_cities.sql
supabase/migrations/20251023141649_add_colombia_departments_and_cities.sql
supabase/migrations/20251023141730_add_other_countries_states_cities.sql

-- 8-9. Add media and favorites
supabase/migrations/20251023150000_add_listing_media_table.sql
supabase/migrations/20251023150100_add_favorites_table.sql
```

### 2. Media Storage Setup
See `MEDIA_SETUP.md` for detailed instructions on:
- Configuring Supabase Storage bucket
- Setting up storage policies
- Implementing file uploads
- Alternative: Using external URLs

### 3. Environment Variables
Copy `.env.example` to `.env` and fill in your Supabase credentials.

## Development Workflow

1. **Start dev server**: `npm run dev`
2. **Make changes**: Edit files in `src/`
3. **Test locally**: Open `http://localhost:5173`
4. **Build**: `npm run build`
5. **Preview build**: `npm run preview`

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- Lazy loading for images
- Optimized CSS with minimal dependencies
- Fast SPA routing without page reloads
- Efficient database queries with indexes
- CDN-ready static assets

## Future Enhancements

- [ ] Premium listing features
- [ ] Payment integration (Stripe)
- [ ] Advanced search filters
- [ ] User messaging system
- [ ] Review/rating system
- [ ] Admin panel
- [ ] Analytics dashboard
- [ ] Email notifications
- [ ] Social media sharing
- [ ] SEO optimization

## License

Proprietary - All rights reserved

## Support

For support or questions about setup, refer to:
- `FUNCIONALIDADES.md` - Feature documentation (Spanish)
- `MEDIA_SETUP.md` - Media upload guide
- `GITHUB_SETUP.md` - Git workflow (if available)

## Credits

Built with modern web technologies for a fast, secure, and scalable classifieds platform.
