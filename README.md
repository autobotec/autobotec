# ENCUENTRAME / FIND ME

A professional bilingual adult classifieds platform built with Vanilla JavaScript, Vite, and Supabase.

## Features

### Bilingual Support (ES/EN)
- Complete Spanish and English interface
- Language switcher with flag icons
- All content translated dynamically

### Geographic System
- 11 Latin American countries + USA
- Hierarchical location system: Country > State/Department > City
- Dynamic cascading selectors

### For Users
- Age verification modal (18+)
- Complete registration and authentication
- Create detailed listings with photos/videos
- User dashboard with statistics
- Favorites system
- Advanced search and filters

### For Advertisers
- Detailed ad posting form with:
  - Contact information (phone, WhatsApp, email)
  - Location details with travel options
  - 5 service characteristic selectors
  - Social media links
  - Photo and video uploads
- Analytics per listing
- Premium services marketplace

### Categories
- Female Escorts
- Male Escorts
- Trans
- Massages
- BDSM
- Couples
- Other

## Tech Stack

- **Frontend**: Vanilla JavaScript (ES6+)
- **Build Tool**: Vite 5
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage (for media)
- **Styling**: Custom CSS with CSS Variables

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables in `.env`:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Run development server:
   ```bash
   npm run dev
   ```

5. Build for production:
   ```bash
   npm run build
   ```

## Project Structure

```
project/
├── src/
│   ├── lib/
│   │   ├── supabase.js         # Supabase client
│   │   ├── i18n.js             # Internationalization system
│   │   ├── router.js           # Client-side routing
│   │   └── utils.js            # Utility functions
│   ├── components/
│   │   ├── Header.js           # Navigation header
│   │   ├── Footer.js           # Site footer
│   │   ├── AgeVerificationModal.js
│   │   ├── CountrySelector.js
│   │   └── ListingCard.js
│   ├── pages/
│   │   ├── HomePage.js
│   │   ├── CountryPage.js
│   │   ├── CategoryPage.js
│   │   ├── CityPage.js
│   │   ├── ListingDetailPage.js
│   │   ├── AuthPage.js
│   │   ├── PostAdPage.js
│   │   ├── EditAdPage.js
│   │   ├── UserDashboardPage.js
│   │   └── SearchPage.js
│   ├── styles.css              # Global styles
│   └── main.js                 # Application entry point
├── index.html
├── package.json
└── README.md
```

## Database Schema

### Main Tables
- `profiles` - User profiles with roles
- `countries` - 11 countries
- `states` - States/Departments/Provinces
- `cities` - Cities
- `categories` - Service categories
- `listings` - User advertisements
- `listing_media` - Photos and videos
- `listing_views` - Analytics
- `favorites` - Saved listings
- `reports` - Content moderation
- `reviews` - Optional ratings
- `messages` - User-admin communication
- `support_tickets` - Support system
- `premium_services` - Monetization services
- `transactions` - Payment records
- `user_subscriptions` - Active subscriptions
- `platform_analytics` - Platform statistics

## URL Structure

### Main Site
- `/` - Home page with age verification and country selector

### Country Microsites
- `/us/` - United States site
- `/co/` - Colombia site
- `/br/` - Brazil site
- etc.

### Category & City Pages
- `/:country/:category/` - Category in country
- `/:country/:category/:city/` - Category in specific city

### Listing Pages
- `/:country/:category/:slug/:id/` - Individual listing detail

### User Pages
- `/auth` - Login/Register
- `/dashboard` - User dashboard
- `/post-ad` - Create new listing
- `/edit-ad/:id` - Edit listing

## Security Features

- Age verification (18+)
- Row Level Security (RLS) on all tables
- Role-based access control
- Content moderation system
- Report system for inappropriate content
- Secure authentication with Supabase Auth

## Legal Pages

- Privacy Policy
- Terms of Service
- Cookie Policy
- Parental Control Help

## SEO Features

- Dynamic meta tags
- Open Graph tags
- Sitemap generation
- Structured data (Schema.org)
- Canonical URLs
- Hreflang tags for bilingual content

## License

Proprietary - All rights reserved

## Support

For support, contact: support@encuentrame.com
