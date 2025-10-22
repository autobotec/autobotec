import { i18n } from '../i18n.js';
import { supabase } from '../supabase.js';
import { router } from '../router.js';

export class AdminDashboardPage {
  constructor() {
    this.stats = {
      totalListings: 0,
      activeListings: 0,
      pendingListings: 0,
      totalUsers: 0,
      totalViews: 0,
      totalLikes: 0,
      totalShares: 0,
      recentListings: [],
      mostViewedListings: [],
      mostLikedListings: []
    };
  }

  async checkAdminAccess() {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      router.navigate('/');
      return false;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .maybeSingle();

    if (!profile || profile.role !== 'admin') {
      router.navigate('/');
      return false;
    }

    return true;
  }

  async loadStats() {
    const [listingsRes, usersRes, recentRes, mostViewedRes, mostLikedRes] = await Promise.all([
      supabase.from('listings').select('status, views_count, likes_count, shares_count'),
      supabase.from('profiles').select('id'),
      supabase.from('listings')
        .select(`
          *,
          category:categories(name_en, name_es),
          location:locations(name_en, name_es),
          user:profiles(username)
        `)
        .order('created_at', { ascending: false })
        .limit(10),
      supabase.from('listings')
        .select(`
          *,
          category:categories(name_en, name_es),
          location:locations(name_en, name_es),
          user:profiles(username)
        `)
        .eq('status', 'active')
        .order('views_count', { ascending: false })
        .limit(10),
      supabase.from('listings')
        .select(`
          *,
          category:categories(name_en, name_es),
          location:locations(name_en, name_es),
          user:profiles(username)
        `)
        .eq('status', 'active')
        .order('likes_count', { ascending: false })
        .limit(10)
    ]);

    const listings = listingsRes.data || [];
    this.stats.totalListings = listings.length;
    this.stats.activeListings = listings.filter(l => l.status === 'active').length;
    this.stats.pendingListings = listings.filter(l => l.status === 'pending').length;
    this.stats.totalViews = listings.reduce((sum, l) => sum + (l.views_count || 0), 0);
    this.stats.totalLikes = listings.reduce((sum, l) => sum + (l.likes_count || 0), 0);
    this.stats.totalShares = listings.reduce((sum, l) => sum + (l.shares_count || 0), 0);
    this.stats.totalUsers = (usersRes.data || []).length;
    this.stats.recentListings = recentRes.data || [];
    this.stats.mostViewedListings = mostViewedRes.data || [];
    this.stats.mostLikedListings = mostLikedRes.data || [];
  }

  render() {
    return `
      <div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: calc(var(--spacing) * 4);">
          <h1 class="section-title" style="margin: 0;">Admin Dashboard</h1>
          <nav style="display: flex; gap: calc(var(--spacing) * 2);">
            <a href="/admin" class="btn-primary">Dashboard</a>
            <a href="/admin/listings" class="btn-secondary">Manage All Listings</a>
          </nav>
        </div>

        <div id="admin-stats">
          <div class="loading">Loading statistics...</div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: calc(var(--spacing) * 4); margin-top: calc(var(--spacing) * 6);">
          <div>
            <h2 style="font-size: 24px; font-weight: 600; margin-bottom: calc(var(--spacing) * 3);">
              📊 Most Viewed Ads
            </h2>
            <div id="most-viewed-listings">
              <div class="loading">Loading...</div>
            </div>
          </div>

          <div>
            <h2 style="font-size: 24px; font-weight: 600; margin-bottom: calc(var(--spacing) * 3);">
              ❤️ Most Liked Ads
            </h2>
            <div id="most-liked-listings">
              <div class="loading">Loading...</div>
            </div>
          </div>
        </div>

        <div style="margin-top: calc(var(--spacing) * 6);">
          <h2 style="font-size: 24px; font-weight: 600; margin-bottom: calc(var(--spacing) * 3);">
            🕐 Recent Listings
          </h2>
          <div id="recent-listings">
            <div class="loading">Loading...</div>
          </div>
        </div>
      </div>
    `;
  }

  async afterRender() {
    const hasAccess = await this.checkAdminAccess();
    if (!hasAccess) return;

    await this.loadStats();
    this.renderStats();
    this.renderMostViewed();
    this.renderMostLiked();
    this.renderRecentListings();
    this.attachEvents();
  }

  renderStats() {
    const container = document.getElementById('admin-stats');

    container.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: calc(var(--spacing) * 3);">
        ${this.createStatCard('Total Listings', this.stats.totalListings, '📝', 'var(--primary)')}
        ${this.createStatCard('Active Listings', this.stats.activeListings, '✅', 'var(--success)')}
        ${this.createStatCard('Pending Review', this.stats.pendingListings, '⏳', 'var(--warning)')}
        ${this.createStatCard('Total Users', this.stats.totalUsers, '👥', 'var(--secondary)')}
        ${this.createStatCard('Total Views', this.stats.totalViews, '👁️', 'var(--primary)')}
        ${this.createStatCard('Total Likes', this.stats.totalLikes, '❤️', 'var(--error)')}
        ${this.createStatCard('Total Shares', this.stats.totalShares, '🔗', 'var(--accent)')}
      </div>
    `;
  }

  createStatCard(label, value, icon, color) {
    return `
      <div style="background: var(--bg-card); padding: calc(var(--spacing) * 4); border-radius: var(--radius); box-shadow: var(--shadow-md); border-left: 4px solid ${color};">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-size: 14px; color: var(--text-light); margin-bottom: calc(var(--spacing) * 1);">
              ${label}
            </div>
            <div style="font-size: 32px; font-weight: 700; color: var(--text-dark);">
              ${value}
            </div>
          </div>
          <div style="font-size: 48px; opacity: 0.2;">
            ${icon}
          </div>
        </div>
      </div>
    `;
  }

  renderMostViewed() {
    const lang = i18n.getCurrentLanguage();
    const container = document.getElementById('most-viewed-listings');

    if (this.stats.mostViewedListings.length === 0) {
      container.innerHTML = '<p style="text-align: center; padding: calc(var(--spacing) * 4); color: var(--text-muted);">No listings yet</p>';
      return;
    }

    container.innerHTML = `
      <div style="background: var(--bg-card); border-radius: var(--radius); box-shadow: var(--shadow-sm); overflow: hidden;">
        ${this.stats.mostViewedListings.map((listing, index) => {
          const title = lang === 'en' ? listing.title_en : listing.title_es;
          const categoryName = listing.category ?
            (lang === 'en' ? listing.category.name_en : listing.category.name_es) :
            'N/A';

          return `
            <div style="padding: calc(var(--spacing) * 3); border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: calc(var(--spacing) * 2); transition: var(--transition); cursor: pointer;" data-view="${listing.id}" class="hover-row">
              <div style="font-size: 24px; font-weight: 700; color: var(--primary); min-width: 40px;">
                #${index + 1}
              </div>
              <div style="flex: 1;">
                <div style="font-weight: 600; margin-bottom: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                  ${title}
                </div>
                <div style="font-size: 13px; color: var(--text-muted);">
                  ${categoryName} • ${listing.user?.username || 'Unknown'}
                </div>
              </div>
              <div style="text-align: right;">
                <div style="font-size: 20px; font-weight: 700; color: var(--primary);">
                  ${listing.views_count || 0}
                </div>
                <div style="font-size: 12px; color: var(--text-muted);">views</div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  renderMostLiked() {
    const lang = i18n.getCurrentLanguage();
    const container = document.getElementById('most-liked-listings');

    if (this.stats.mostLikedListings.length === 0) {
      container.innerHTML = '<p style="text-align: center; padding: calc(var(--spacing) * 4); color: var(--text-muted);">No listings yet</p>';
      return;
    }

    container.innerHTML = `
      <div style="background: var(--bg-card); border-radius: var(--radius); box-shadow: var(--shadow-sm); overflow: hidden;">
        ${this.stats.mostLikedListings.map((listing, index) => {
          const title = lang === 'en' ? listing.title_en : listing.title_es;
          const categoryName = listing.category ?
            (lang === 'en' ? listing.category.name_en : listing.category.name_es) :
            'N/A';

          return `
            <div style="padding: calc(var(--spacing) * 3); border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: calc(var(--spacing) * 2); transition: var(--transition); cursor: pointer;" data-view="${listing.id}" class="hover-row">
              <div style="font-size: 24px; font-weight: 700; color: var(--error); min-width: 40px;">
                #${index + 1}
              </div>
              <div style="flex: 1;">
                <div style="font-weight: 600; margin-bottom: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                  ${title}
                </div>
                <div style="font-size: 13px; color: var(--text-muted);">
                  ${categoryName} • ${listing.user?.username || 'Unknown'}
                </div>
              </div>
              <div style="text-align: right;">
                <div style="font-size: 20px; font-weight: 700; color: var(--error);">
                  ${listing.likes_count || 0}
                </div>
                <div style="font-size: 12px; color: var(--text-muted);">likes</div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  renderRecentListings() {
    const lang = i18n.getCurrentLanguage();
    const container = document.getElementById('recent-listings');

    if (this.stats.recentListings.length === 0) {
      container.innerHTML = '<p>No recent listings</p>';
      return;
    }

    container.innerHTML = `
      <div style="background: var(--bg-card); border-radius: var(--radius); box-shadow: var(--shadow-sm); overflow: hidden;">
        <table style="width: 100%; border-collapse: collapse;">
          <thead style="background: var(--bg-light);">
            <tr>
              <th style="padding: calc(var(--spacing) * 2); text-align: left; font-weight: 600; font-size: 14px;">Title</th>
              <th style="padding: calc(var(--spacing) * 2); text-align: left; font-weight: 600; font-size: 14px;">Category</th>
              <th style="padding: calc(var(--spacing) * 2); text-align: left; font-weight: 600; font-size: 14px;">User</th>
              <th style="padding: calc(var(--spacing) * 2); text-align: center; font-weight: 600; font-size: 14px;">Status</th>
              <th style="padding: calc(var(--spacing) * 2); text-align: center; font-weight: 600; font-size: 14px;">Views</th>
              <th style="padding: calc(var(--spacing) * 2); text-align: center; font-weight: 600; font-size: 14px;">Likes</th>
              <th style="padding: calc(var(--spacing) * 2); text-align: center; font-weight: 600; font-size: 14px;">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${this.stats.recentListings.map(listing => {
              const title = lang === 'en' ? listing.title_en : listing.title_es;
              const categoryName = listing.category ?
                (lang === 'en' ? listing.category.name_en : listing.category.name_es) :
                'N/A';

              return `
                <tr style="border-bottom: 1px solid var(--border);">
                  <td style="padding: calc(var(--spacing) * 2);">
                    <div style="font-weight: 500; max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                      ${title}
                    </div>
                  </td>
                  <td style="padding: calc(var(--spacing) * 2);">${categoryName}</td>
                  <td style="padding: calc(var(--spacing) * 2);">${listing.user?.username || 'Unknown'}</td>
                  <td style="padding: calc(var(--spacing) * 2); text-align: center;">
                    <span style="padding: calc(var(--spacing) * 0.5) calc(var(--spacing) * 1.5); border-radius: 20px; font-size: 12px; font-weight: 600; background: ${listing.status === 'active' ? 'var(--success)' : 'var(--warning)'}; color: white;">
                      ${listing.status}
                    </span>
                  </td>
                  <td style="padding: calc(var(--spacing) * 2); text-align: center;">${listing.views_count || 0}</td>
                  <td style="padding: calc(var(--spacing) * 2); text-align: center;">${listing.likes_count || 0}</td>
                  <td style="padding: calc(var(--spacing) * 2); text-align: center;">
                    <button class="btn-secondary" data-manage="${listing.id}" style="padding: calc(var(--spacing) * 0.5) calc(var(--spacing) * 1.5); font-size: 13px;">
                      Manage
                    </button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <style>
        .hover-row:hover {
          background: var(--bg-light);
        }
      </style>
    `;
  }

  attachEvents() {
    const viewButtons = document.querySelectorAll('[data-view]');
    viewButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        router.navigate('/admin/listings');
      });
    });

    const manageButtons = document.querySelectorAll('[data-manage]');
    manageButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        router.navigate('/admin/listings');
      });
    });
  }
}
