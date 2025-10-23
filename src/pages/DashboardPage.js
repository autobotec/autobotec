import { auth } from '../lib/auth.js';
import { supabase } from '../lib/supabase.js';
import { i18n } from '../lib/i18n.js';

export async function DashboardPage() {
  const t = (key) => i18n.t(key);

  let user = null;
  let profile = null;
  let listings = [];
  let stats = {
    totalViews: 0,
    totalFavorites: 0,
    activeAds: 0
  };

  async function init() {
    try {
      user = await auth.getCurrentUser();
      if (!user) {
        window.location.href = '/auth';
        return;
      }

      profile = await auth.getProfile(user.id);
      await loadListings();
      render();
    } catch (error) {
      console.error('Dashboard init error:', error);
      window.location.href = '/auth';
    }
  }

  async function loadListings() {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      listings = data || [];

      stats.totalViews = listings.reduce((sum, listing) => sum + (listing.views_count || 0), 0);
      stats.totalFavorites = listings.reduce((sum, listing) => sum + (listing.favorites_count || 0), 0);
      stats.activeAds = listings.filter(listing => listing.status === 'active').length;
    } catch (error) {
      console.error('Error loading listings:', error);
    }
  }

  async function handleDeleteListing(listingId) {
    if (!confirm(t('dashboard.confirmDelete') || 'Are you sure you want to delete this listing?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', listingId);

      if (error) throw error;

      await loadListings();
      render();
    } catch (error) {
      console.error('Error deleting listing:', error);
      alert(t('common.error'));
    }
  }

  async function handleToggleStatus(listingId, currentStatus) {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';

    try {
      const { error } = await supabase
        .from('listings')
        .update({ status: newStatus })
        .eq('id', listingId);

      if (error) throw error;

      await loadListings();
      render();
    } catch (error) {
      console.error('Error updating listing status:', error);
      alert(t('common.error'));
    }
  }

  function getStatusBadge(status) {
    const badges = {
      active: '<span class="badge badge-success">Active</span>',
      inactive: '<span class="badge badge-secondary">Inactive</span>',
      pending: '<span class="badge badge-warning">Pending</span>',
      expired: '<span class="badge badge-error">Expired</span>',
      rejected: '<span class="badge badge-error">Rejected</span>'
    };
    return badges[status] || status;
  }

  function render() {
    const container = document.getElementById('app');
    container.innerHTML = `
      <div class="dashboard-page">
        <div class="dashboard-container">
          <div class="dashboard-header">
            <h1>${t('dashboard.title')}</h1>
            <p>${t('dashboard.welcome')}, ${profile?.username || user?.email || 'User'}</p>
          </div>

          <div class="dashboard-stats">
            <div class="stat-card">
              <div class="stat-value">${stats.activeAds}</div>
              <div class="stat-label">${t('dashboard.active_ads')}</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${stats.totalViews}</div>
              <div class="stat-label">${t('dashboard.total_views')}</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${stats.totalFavorites}</div>
              <div class="stat-label">${t('dashboard.total_favorites')}</div>
            </div>
          </div>

          <div class="dashboard-content">
            <div class="dashboard-section">
              <div class="section-header">
                <h2>${t('dashboard.my_ads')}</h2>
                <a href="/post-ad" class="btn-primary">${t('post_ad.title')}</a>
              </div>

              ${listings.length === 0 ? `
                <div class="empty-state">
                  <p>No tienes anuncios publicados todavía</p>
                  <a href="/post-ad" class="btn-primary">${t('post_ad.title')}</a>
                </div>
              ` : `
                <div class="listings-grid">
                  ${listings.map(listing => `
                    <div class="listing-card">
                      <div class="listing-card-header">
                        <h3>${listing.title}</h3>
                        ${getStatusBadge(listing.status)}
                      </div>

                      <div class="listing-card-body">
                        <p class="listing-description">${listing.description?.substring(0, 100)}${listing.description?.length > 100 ? '...' : ''}</p>

                        <div class="listing-meta">
                          <span><strong>${listing.views_count || 0}</strong> ${t('listing.views')}</span>
                          <span><strong>${listing.favorites_count || 0}</strong> ${t('listing.favorite')}</span>
                        </div>
                      </div>

                      <div class="listing-card-actions">
                        <button class="btn-secondary btn-toggle-status" data-id="${listing.id}" data-status="${listing.status}">
                          ${listing.status === 'active' ? 'Desactivar' : 'Activar'}
                        </button>
                        <a href="/edit-ad/${listing.id}" class="btn-secondary">${t('common.edit')}</a>
                        <button class="btn-danger btn-delete" data-id="${listing.id}">${t('common.delete')}</button>
                      </div>
                    </div>
                  `).join('')}
                </div>
              `}
            </div>
          </div>
        </div>
      </div>
    `;

    document.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const listingId = e.target.getAttribute('data-id');
        handleDeleteListing(listingId);
      });
    });

    document.querySelectorAll('.btn-toggle-status').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const listingId = e.target.getAttribute('data-id');
        const currentStatus = e.target.getAttribute('data-status');
        handleToggleStatus(listingId, currentStatus);
      });
    });
  }

  await init();
}
