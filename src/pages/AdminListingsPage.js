import { i18n } from '../i18n.js';
import { supabase } from '../supabase.js';
import { router } from '../router.js';

export class AdminListingsPage {
  constructor() {
    this.listings = [];
    this.filter = 'all';
  }

  async checkAdminAccess() {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      router.navigate('/auth');
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

  async loadListings() {
    let query = supabase
      .from('listings')
      .select(`
        *,
        category:categories(name_en, name_es),
        location:locations(name_en, name_es),
        user:profiles(username, email)
      `)
      .order('created_at', { ascending: false });

    if (this.filter !== 'all') {
      query = query.eq('status', this.filter);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error loading listings:', error);
      this.listings = [];
    } else {
      this.listings = data || [];
    }
  }

  render() {
    return `
      <div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: calc(var(--spacing) * 4);">
          <h1 class="section-title" style="margin: 0;">Manage Listings</h1>
          <nav style="display: flex; gap: calc(var(--spacing) * 2);">
            <a href="/admin" class="btn-secondary">Dashboard</a>
            <a href="/admin/listings" class="btn-primary">Listings</a>
            <a href="/admin/categories" class="btn-secondary">Categories</a>
            <a href="/admin/locations" class="btn-secondary">Locations</a>
            <a href="/admin/users" class="btn-secondary">Users</a>
          </nav>
        </div>

        <div style="background: var(--bg-card); padding: calc(var(--spacing) * 3); border-radius: var(--radius); margin-bottom: calc(var(--spacing) * 4); display: flex; gap: calc(var(--spacing) * 2);">
          <button class="btn-secondary filter-btn" data-filter="all">All</button>
          <button class="btn-secondary filter-btn" data-filter="active">Active</button>
          <button class="btn-secondary filter-btn" data-filter="pending">Pending</button>
          <button class="btn-secondary filter-btn" data-filter="inactive">Inactive</button>
          <button class="btn-secondary filter-btn" data-filter="expired">Expired</button>
        </div>

        <div id="admin-message"></div>

        <div id="listings-table">
          <div class="loading">Loading listings...</div>
        </div>
      </div>
    `;
  }

  async afterRender() {
    const hasAccess = await this.checkAdminAccess();
    if (!hasAccess) return;

    await this.loadListings();
    this.renderListings();
    this.attachEvents();
  }

  renderListings() {
    const lang = i18n.getCurrentLanguage();
    const container = document.getElementById('listings-table');

    if (this.listings.length === 0) {
      container.innerHTML = '<p>No listings found</p>';
      return;
    }

    container.innerHTML = `
      <div style="background: var(--bg-card); border-radius: var(--radius); box-shadow: var(--shadow-sm); overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse;">
          <thead style="background: var(--bg-light);">
            <tr>
              <th style="padding: calc(var(--spacing) * 2); text-align: left; font-weight: 600; font-size: 14px;">Title</th>
              <th style="padding: calc(var(--spacing) * 2); text-align: left; font-weight: 600; font-size: 14px;">User</th>
              <th style="padding: calc(var(--spacing) * 2); text-align: left; font-weight: 600; font-size: 14px;">Category</th>
              <th style="padding: calc(var(--spacing) * 2); text-align: center; font-weight: 600; font-size: 14px;">Status</th>
              <th style="padding: calc(var(--spacing) * 2); text-align: center; font-weight: 600; font-size: 14px;">Views</th>
              <th style="padding: calc(var(--spacing) * 2); text-align: center; font-weight: 600; font-size: 14px;">Likes</th>
              <th style="padding: calc(var(--spacing) * 2); text-align: center; font-weight: 600; font-size: 14px;">Featured</th>
              <th style="padding: calc(var(--spacing) * 2); text-align: center; font-weight: 600; font-size: 14px;">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${this.listings.map(listing => {
              const title = lang === 'en' ? listing.title_en : listing.title_es;
              const categoryName = listing.category ?
                (lang === 'en' ? listing.category.name_en : listing.category.name_es) :
                'N/A';

              return `
                <tr style="border-bottom: 1px solid var(--border);">
                  <td style="padding: calc(var(--spacing) * 2);">
                    <div style="font-weight: 500; max-width: 300px;">
                      ${title}
                    </div>
                    <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">
                      ${new Date(listing.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td style="padding: calc(var(--spacing) * 2);">
                    <div>${listing.user?.username || 'Unknown'}</div>
                    <div style="font-size: 12px; color: var(--text-muted);">${listing.user?.email || ''}</div>
                  </td>
                  <td style="padding: calc(var(--spacing) * 2);">${categoryName}</td>
                  <td style="padding: calc(var(--spacing) * 2); text-align: center;">
                    <select class="filter-select" data-status-change="${listing.id}" style="padding: calc(var(--spacing) * 0.5) calc(var(--spacing) * 1); font-size: 13px;">
                      <option value="active" ${listing.status === 'active' ? 'selected' : ''}>Active</option>
                      <option value="pending" ${listing.status === 'pending' ? 'selected' : ''}>Pending</option>
                      <option value="inactive" ${listing.status === 'inactive' ? 'selected' : ''}>Inactive</option>
                      <option value="expired" ${listing.status === 'expired' ? 'selected' : ''}>Expired</option>
                    </select>
                  </td>
                  <td style="padding: calc(var(--spacing) * 2); text-align: center;">${listing.views_count || 0}</td>
                  <td style="padding: calc(var(--spacing) * 2); text-align: center;">${listing.likes_count || 0}</td>
                  <td style="padding: calc(var(--spacing) * 2); text-align: center;">
                    <input type="checkbox" data-featured="${listing.id}" ${listing.featured ? 'checked' : ''} style="cursor: pointer; width: 20px; height: 20px;" />
                  </td>
                  <td style="padding: calc(var(--spacing) * 2); text-align: center;">
                    <div style="display: flex; gap: calc(var(--spacing) * 1); justify-content: center;">
                      <button class="btn-secondary" data-view="${listing.id}" style="padding: calc(var(--spacing) * 0.5) calc(var(--spacing) * 1.5); font-size: 13px;">
                        View
                      </button>
                      <button class="btn-primary" data-delete="${listing.id}" style="padding: calc(var(--spacing) * 0.5) calc(var(--spacing) * 1.5); font-size: 13px; background: var(--error);">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  attachEvents() {
    const message = document.getElementById('admin-message');

    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
      btn.addEventListener('click', async () => {
        this.filter = btn.dataset.filter;
        document.querySelectorAll('.filter-btn').forEach(b => {
          b.style.background = 'white';
          b.style.color = 'var(--primary)';
        });
        btn.style.background = 'var(--primary)';
        btn.style.color = 'white';

        await this.loadListings();
        this.renderListings();
        this.attachEvents();
      });
    });

    const statusSelects = document.querySelectorAll('[data-status-change]');
    statusSelects.forEach(select => {
      select.addEventListener('change', async () => {
        const listingId = select.dataset.statusChange;
        const newStatus = select.value;

        const { error } = await supabase
          .from('listings')
          .update({ status: newStatus })
          .eq('id', listingId);

        if (error) {
          message.innerHTML = `<div class="error">Error updating status: ${error.message}</div>`;
        } else {
          message.innerHTML = '<div class="success">Status updated successfully</div>';
          setTimeout(() => message.innerHTML = '', 3000);
        }
      });
    });

    const featuredCheckboxes = document.querySelectorAll('[data-featured]');
    featuredCheckboxes.forEach(checkbox => {
      checkbox.addEventListener('change', async () => {
        const listingId = checkbox.dataset.featured;
        const featured = checkbox.checked;

        const { error } = await supabase
          .from('listings')
          .update({ featured })
          .eq('id', listingId);

        if (error) {
          message.innerHTML = `<div class="error">Error updating featured status: ${error.message}</div>`;
          checkbox.checked = !featured;
        } else {
          message.innerHTML = '<div class="success">Featured status updated</div>';
          setTimeout(() => message.innerHTML = '', 3000);
        }
      });
    });

    const viewButtons = document.querySelectorAll('[data-view]');
    viewButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.view;
        router.navigate(`/listing/${id}`);
      });
    });

    const deleteButtons = document.querySelectorAll('[data-delete]');
    deleteButtons.forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('Are you sure you want to delete this listing?')) {
          return;
        }

        const id = btn.dataset.delete;

        const { error } = await supabase
          .from('listings')
          .delete()
          .eq('id', id);

        if (error) {
          message.innerHTML = `<div class="error">Error deleting listing: ${error.message}</div>`;
        } else {
          message.innerHTML = '<div class="success">Listing deleted successfully</div>';
          await this.loadListings();
          this.renderListings();
          this.attachEvents();
        }
      });
    });
  }
}
