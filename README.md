# FIND ME - Adult Classifieds Platform

A modern, bilingual (English/Spanish) adult entertainment classifieds platform built with Vanilla JavaScript, Vite, and Supabase.

## Features

### For Users
- 🌐 **Bilingual Interface** - Full support for English and Spanish
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile
- 🔐 **User Authentication** - Secure login and registration
- 📝 **Post Ads** - Create and manage your own listings
- ❤️ **Likes System** - Like your favorite listings
- 📊 **User Dashboard** - Track your ads, views, likes, and shares
- ✏️ **Edit & Delete** - Full control over your listings

### For Administrators
- 🎛️ **Admin Dashboard** - Comprehensive overview of platform statistics
- 📊 **Top Statistics** - View most viewed and most liked listings
- 🔧 **Manage All Listings** - Block, unblock, feature, or delete any listing
- 👥 **User Management** - Full control over user accounts
- 📈 **Analytics** - Track total views, likes, shares, and user engagement

## Tech Stack

- **Frontend**: Vanilla JavaScript (ES6+)
- **Build Tool**: Vite
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Custom CSS with CSS Variables
- **Routing**: Custom lightweight router

## Project Structure

```
project/
├── src/
│   ├── pages/
│   │   ├── AdminDashboardPage.js    # Admin statistics dashboard
│   │   ├── AdminListingsPage.js     # Manage all listings
│   │   ├── UserDashboardPage.js     # User personal dashboard
│   │   └── EditAdPage.js            # Edit listing page
│   ├── i18n.js                      # Internationalization
│   ├── main.js                      # Application entry point
│   ├── router.js                    # Client-side routing
│   ├── styles.css                   # Global styles
│   └── supabase.js                  # Supabase client
├── supabase/
│   └── migrations/                  # Database migrations
├── index.html
├── package.json
└── README.md
```

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## Database Setup

The project uses Supabase as the backend. The database schema includes:

### Tables
- `profiles` - User profiles with role-based access
- `categories` - Ad categories (bilingual)
- `locations` - Geographic locations (bilingual)
- `listings` - User advertisements with full metadata
- `listing_likes` - Like tracking system
- `listing_shares` - Share tracking system

### Security
- Row Level Security (RLS) enabled on all tables
- Admin role-based access control
- Secure authentication policies

### Migrations
All database migrations are located in `supabase/migrations/`. To apply them to your Supabase project, use the Supabase CLI or run them manually in the SQL Editor.

## Creating an Admin User

After registering a regular account, promote it to admin using the Supabase SQL Editor:

```sql
UPDATE profiles
SET role = 'admin'
WHERE email = 'your-email@example.com';
```

## Available Routes

### Public Routes
- `/` - Home page with categories and featured listings

### User Routes (Authentication Required)
- `/dashboard` - User personal dashboard
- `/edit-ad/:id` - Edit user's own listing

### Admin Routes (Admin Role Required)
- `/admin` - Admin dashboard with statistics
- `/admin/listings` - Manage all platform listings

## Key Features Explained

### Bilingual Support
- Automatic language detection from localStorage
- Seamless language switching without page reload
- All content stored in both English and Spanish

### Admin Dashboard
The admin dashboard provides:
- Total listings, active listings, pending reviews
- Total users, views, likes, and shares
- Top 10 most viewed listings
- Top 10 most liked listings
- Recent listings with quick actions

### Listing Management
Admins can:
- Change listing status (Active, Pending, Inactive, Expired)
- Mark listings as Featured (premium ranking)
- Delete any listing
- Filter by status

### User Dashboard
Users can:
- View their own statistics
- See all their listings with metrics
- Edit their listings
- Delete their listings

## Design Philosophy

- **Clean & Modern** - Professional design with attention to detail
- **User-Friendly** - Intuitive navigation and clear actions
- **Performance** - Optimized loading and rendering
- **Accessibility** - Semantic HTML and proper contrast ratios
- **Responsive** - Mobile-first approach

## Color Palette

- Primary: `#e91e63` (Pink)
- Secondary: `#ff4081` (Light Pink)
- Success: `#10b981` (Green)
- Error: `#ef4444` (Red)
- Warning: `#f59e0b` (Orange)

## Development

### Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Code Style
- ES6+ JavaScript
- Modular architecture
- Component-based pages
- Async/await for API calls

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is proprietary software. All rights reserved.

## Support

For issues or questions, please contact the development team.

---

Built with ❤️ using Vite, Supabase, and Vanilla JavaScript
