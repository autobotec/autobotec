import { i18n } from '../i18n.js';
import { supabase } from '../supabase.js';
import { router } from '../router.js';

export class UserDashboardPage {
  constructor() {
    this.listings = [];
    this.stats = {
      totalListings: 0,
      activeListings: 0,
      totalViews: 0,
      totalLikes: 0,
      totalShares: 0
    };
  }

  async loadData() {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      router.navigate('/auth');
      return;
    }

    const { data, error } = await supabase
      .from('listings')
      .select(`
        *,
        category:categories(name_en, name_es),
        location:locations(name_en, name_es)
      `)
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading listings:', error);
      this.listings = [];
    } else {
      this.listings = data || [];
      this.calculateStats();
    }
  }

  calculateStats() {
    this.stats.totalListings = this.listings.length;
    this.stats.activeListings = this.listings.filter(l => l.status === 'active').length;
    this.stats.totalViews = this.listings.reduce((sum, l) => sum + (l.views_count || 0), 0);
    this.stats.totalLikes = this.listings.reduce((sum, l) => sum + (l.likes_count || 0), 0);
    this.stats.totalShares = this.listings.reduce((sum, l) => sum + (l.shares_count || 0), 0);
  }

  render() {
    const t = i18n.t.bind(i18n);

    return `
      <div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: calc(var(--spacing) * 4);">
          <h1 class="section-title" style="margin: 0;">My Dashboard</h1>
          <a href="/post-ad" class="btn-primary">+ Create New Ad</a>
        </div>

        <div id="user-stats">
          <div class="loading">${t('common.loading')}</div>
        </div>

        <div style="margin-top: calc(var(--spacing) * 6);">
          <h2 style="font-size: 24px; font-weight: 600; margin-bottom: calc(var(--spacing) * 3);">My Ads</h2>
          <div id="user-message"></div>
          <div id="user-listings">
            <div class="loading">${t('common.loading')}</div>
          </div>
        </div>
      </div>
    `;
  }

  async afterRender() {
    await this.loadData();
    this.renderStats();
    this.renderListings();
    this.attachEvents();
  }

  renderStats() {
    const container = document.getElementById('user-stats');

    container.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: calc(var(--spacing) * 3);">
        ${this.createStatCard('Total Ads', this.stats.totalListings, '📝', 'var(--primary)')}
        ${this.createStatCard('Active Ads', this.stats.activeListings, '✅', 'var(--success)')}
        ${this.createStatCard('Total Views', this.stats.totalViews, '👁️', 'var(--accent)')}
        ${this.createStatCard('Total Likes', this.stats.totalLikes, '❤️', 'var(--error)')}
        ${this.createStatCard('Total Shares', this.stats.totalShares, '🔗', 'var(--secondary)')}
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
            <div style="font-size: 28px; font-weight: 700; color: var(--text-dark);">
              ${value}
            </div>
          </div>
          <div style="font-size: 40px; opacity: 0.2;">
            ${icon}
          </div>
        </div>
      </div>
    `;
  }

  renderListings() {
    const lang = i18n.getCurrentLanguage();
    const t = i18n.t.bind(i18n);
    const container = document.getElementById('user-listings');

    if (this.listings.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: calc(var(--spacing) * 8); background: var(--bg-card); border-radius: var(--radius);">
          <div style="font-size: 48px; margin-bottom: calc(var(--spacing) * 2);">📝</div>
          <h3 style="font-size: 20px; margin-bottom: calc(var(--spacing) * 2);">No ads yet</h3>
          <p style="color: var(--text-light); margin-bottom: calc(var(--spacing) * 3);">Create your first ad to get started</p>
          <a href="/post-ad" class="btn-primary">Create Ad</a>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div style="display: grid; gap: calc(var(--spacing) * 3);">
        ${this.listings.map(listing => {
          const title = lang === 'en' ? listing.title_en : listing.title_es;
          const locationName = listing.location ?
            (lang === 'en' ? listing.location.name_en : listing.location.name_es) :
            '';

          return `
            <div style="background: var(--bg-card); border-radius: var(--radius); overflow: hidden; box-shadow: var(--shadow-sm); border: 1px solid var(--border); display: grid; grid-template-columns: 200px 1fr; gap: 0;">
              <img
                src="https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=400"
                alt="${title}"
                style="width: 100%; height: 100%; object-fit: cover;"
              />
              <div style="padding: calc(var(--spacing) * 3); display: flex; flex-direction: column;">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: calc(var(--spacing) * 2);">
                  <div>
                    <h3 style="font-size: 20px; font-weight: 600; margin-bottom: calc(var(--spacing) * 1);">
                      ${title}
                    </h3>
                    <div style="font-size: 14px; color: var(--text-muted);">
                      📍 ${locationName} | Created ${new Date(listing.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <span style="padding: calc(var(--spacing) * 0.5) calc(var(--spacing) * 1.5); border-radius: 20px; font-size: 12px; font-weight: 600; background: ${listing.status === 'active' ? 'var(--success)' : listing.status === 'pending' ? 'var(--warning)' : 'var(--text-muted)'}; color: white;">
                    ${listing.status}
                  </span>
                </div>

                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: calc(var(--spacing) * 3); padding: calc(var(--spacing) * 2); background: var(--bg-light); border-radius: var(--radius); margin-bottom: calc(var(--spacing) * 2);">
                  <div style="text-align: center;">
                    <div style="font-size: 20px; font-weight: 700; color: var(--primary);">
                      ${listing.views_count || 0}
                    </div>
                    <div style="font-size: 12px; color: var(--text-muted);">Views</div>
                  </div>
                  <div style="text-align: center;">
                    <div style="font-size: 20px; font-weight: 700; color: var(--error);">
                      ${listing.likes_count || 0}
                    </div>
                    <div style="font-size: 12px; color: var(--text-muted);">Likes</div>
                  </div>
                  <div style="text-align: center;">
                    <div style="font-size: 20px; font-weight: 700; color: var(--accent);">
                      ${listing.shares_count || 0}
                    </div>
                    <div style="font-size: 12px; color: var(--text-muted);">Shares</div>
                  </div>
                  <div style="text-align: center;">
                    <div style="font-size: 20px; font-weight: 700; color: ${listing.featured ? 'var(--warning)' : 'var(--text-muted)'};">
                      ${listing.featured ? '⭐' : '-'}
                    </div>
                    <div style="font-size: 12px; color: var(--text-muted);">Featured</div>
                  </div>
                </div>

                <div style="display: flex; gap: calc(var(--spacing) * 2); margin-top: auto;">
                  <button class="btn-secondary" data-view="${listing.id}" style="flex: 1;">
                    ${t('listing.viewDetails')}
                  </button>
                  <button class="btn-primary" data-edit="${listing.id}" style="flex: 1;">
                    ${t('common.edit')}
                  </button>
                  <button class="btn-primary" data-delete="${listing.id}" style="flex: 1; background: var(--error);">
                    ${t('common.delete')}
                  </button>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  attachEvents() {
    const t = i18n.t.bind(i18n);
    const message = document.getElementById('user-message');

    const viewButtons = document.querySelectorAll('[data-view]');
    viewButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.view;
        router.navigate(`/listing/${id}`);
      });
    });

    const editButtons = document.querySelectorAll('[data-edit]');
    editButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.edit;
        router.navigate(`/edit-ad/${id}`);
      });
    });

    const deleteButtons = document.querySelectorAll('[data-delete]');
    deleteButtons.forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('Are you sure you want to delete this ad?')) {
          return;
        }

        const id = btn.dataset.delete;

        const { error } = await supabase
          .from('listings')
          .delete()
          .eq('id', id);

        if (error) {
          message.innerHTML = `<div class="error">Error deleting ad: ${error.message}</div>`;
        } else {
          message.innerHTML = '<div class="success">Ad deleted successfully</div>';
          await this.loadData();
          this.renderStats();
          this.renderListings();
          this.attachEvents();
          setTimeout(() => message.innerHTML = '', 3000);
        }
      });
    });
  }
}
