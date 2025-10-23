import { supabase } from './supabase.js';

const cache = {
  countries: null,
  categories: null,
  states: {},
  cities: {}
};

export async function resolveRoute(segments) {
  if (segments.length === 0) {
    return { type: 'home' };
  }

  if (!cache.countries) {
    const { data } = await supabase.from('countries').select('id, code, slug');
    cache.countries = data || [];
  }

  if (!cache.categories) {
    const { data } = await supabase.from('categories').select('id, slug');
    cache.categories = data || [];
  }

  const [seg1, seg2, seg3, seg4] = segments;

  const country = cache.countries.find(c =>
    c.code.toLowerCase() === seg1.toLowerCase() || c.slug === seg1.toLowerCase()
  );

  if (!country) {
    return { type: 'not-found' };
  }

  if (segments.length === 1) {
    return { type: 'country', countryCode: seg1 };
  }

  const isCategory = cache.categories.some(cat => cat.slug === seg2);

  if (isCategory) {
    if (segments.length === 2) {
      return { type: 'category-country', countryCode: seg1, categorySlug: seg2 };
    }

    if (!cache.states[country.id]) {
      const { data } = await supabase
        .from('states')
        .select('id, slug')
        .eq('country_id', country.id);
      cache.states[country.id] = data || [];
    }

    const state = cache.states[country.id].find(s => s.slug === seg3);

    if (!state) {
      return { type: 'not-found' };
    }

    if (segments.length === 3) {
      return {
        type: 'category-state',
        countryCode: seg1,
        categorySlug: seg2,
        stateSlug: seg3
      };
    }

    if (segments.length === 4) {
      if (!cache.cities[state.id]) {
        const { data } = await supabase
          .from('cities')
          .select('id, slug')
          .eq('state_id', state.id);
        cache.cities[state.id] = data || [];
      }

      const city = cache.cities[state.id].find(c => c.slug === seg4);

      if (!city) {
        return { type: 'not-found' };
      }

      return {
        type: 'category-city',
        countryCode: seg1,
        categorySlug: seg2,
        stateSlug: seg3,
        citySlug: seg4
      };
    }
  } else {
    if (!cache.states[country.id]) {
      const { data } = await supabase
        .from('states')
        .select('id, slug')
        .eq('country_id', country.id);
      cache.states[country.id] = data || [];
    }

    const state = cache.states[country.id].find(s => s.slug === seg2);

    if (!state) {
      return { type: 'not-found' };
    }

    if (segments.length === 2) {
      return { type: 'state', countryCode: seg1, stateSlug: seg2 };
    }

    if (segments.length === 3) {
      if (!cache.cities[state.id]) {
        const { data } = await supabase
          .from('cities')
          .select('id, slug')
          .eq('state_id', state.id);
        cache.cities[state.id] = data || [];
      }

      const city = cache.cities[state.id].find(c => c.slug === seg3);

      if (!city) {
        return { type: 'not-found' };
      }

      return {
        type: 'city',
        countryCode: seg1,
        stateSlug: seg2,
        citySlug: seg3
      };
    }
  }

  return { type: 'not-found' };
}
