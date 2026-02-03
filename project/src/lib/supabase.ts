import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * Returns a Supabase client if env vars are present, otherwise `null`.
 * We avoid throwing at module-load time so the app can run with mock data.
 */
export function getSupabase(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseAnonKey) {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.warn('[supabase] Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY, running in mock mode.');
    }
    return null;
  }
  return createClient(supabaseUrl, supabaseAnonKey);
}

// Types
export interface Category {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface Content {
  id: string;
  title: string;
  description: string;
  type: 'movie' | 'series';
  release_year: number;
  rating: string;
  duration_minutes?: number;
  thumbnail_url: string;
  backdrop_url: string;
  video_url?: string;
  is_featured: boolean;
  created_at: string;
}

export interface ContentWithCategories extends Content {
  categories: Category[];
}
