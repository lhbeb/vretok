import 'server-only';
import { supabaseAdmin } from './server';
import type { Seller } from '@/types/seller';
import type { Review } from '@/types/product';
import { transformProduct } from './products';

const VRETOK_PUBLIC_REVIEW_COUNT = 122;

function parseReviews(value: unknown): Review[] {
  let parsed = value;

  if (typeof value === 'string') {
    try {
      parsed = JSON.parse(value);
    } catch {
      return [];
    }
  }

  if (!Array.isArray(parsed)) return [];

  return parsed.filter((review): review is Review => {
    if (!review || typeof review !== 'object') return false;
    const candidate = review as Partial<Review>;
    return Boolean(
      typeof candidate.id === 'string' && candidate.id.trim() &&
      typeof candidate.author === 'string' && candidate.author.trim() &&
      typeof candidate.content === 'string' && candidate.content.trim() &&
      typeof candidate.rating === 'number' && Number.isFinite(candidate.rating) &&
      candidate.rating >= 1 && candidate.rating <= 5 &&
      typeof candidate.date === 'string' && !Number.isNaN(Date.parse(candidate.date))
    );
  });
}

function attachSellerReviews(seller: Seller, productReviews: Review[]): Seller {
  const uniqueReviews = Array.from(
    new Map(
      [...(seller.nativeReviews || []), ...productReviews]
        .filter((review) => parseReviews([review]).length > 0)
        .map((review) => [review.id, review])
    ).values()
  ).sort((a, b) => Date.parse(b.date) - Date.parse(a.date));

  const visibleReviews = seller.username === 'vretok'
    ? uniqueReviews.slice(0, VRETOK_PUBLIC_REVIEW_COUNT)
    : uniqueReviews;
  const averageRating = visibleReviews.length > 0
    ? Math.round((visibleReviews.reduce((sum, review) => sum + review.rating, 0) / visibleReviews.length) * 10) / 10
    : 0;
  const totalReviews = seller.username === 'vretok' && visibleReviews.length > 0
    ? VRETOK_PUBLIC_REVIEW_COUNT
    : visibleReviews.length;

  return {
    ...seller,
    reviews: visibleReviews,
    averageRating,
    totalReviews,
  };
}

// Transform Supabase row to Seller type
function transformSeller(row: any): Seller {
  return {
    id: row.id,
    name: row.name,
    username: row.username,
    bio: row.bio || '',
    avatarUrl: row.avatar_url || '',
    location: row.location || '',
    memberSince: row.member_since || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    nativeReviews: parseReviews(row.reviews),
  };
}

/**
 * Fetch all reviews from a seller's products and compute aggregate stats.
 * Returns reviews array, averageRating, and totalReviews.
 */
export async function getSellerReviews(sellerId: string): Promise<{
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
  sellerName?: string;
  sellerUsername?: string;
}> {
  try {
    // 1. Fetch seller row to include native seller reviews
    const { data: sellerRow } = await supabaseAdmin
      .from('sellers')
      .select('name, username, reviews')
      .eq('id', sellerId)
      .single();

    const nativeReviews = sellerRow ? parseReviews(sellerRow.reviews) : [];

    // 2. Fetch any product reviews for this seller
    const { data: productsData } = await supabaseAdmin
      .from('products')
      .select('reviews, rating, review_count')
      .eq('seller_id', sellerId);

    const allReviews: Review[] = [...nativeReviews];
    if (productsData) {
      for (const product of productsData) {
        const productReviews = parseReviews(product.reviews);
        allReviews.push(...productReviews);
      }
    }

    // Deduplicate by ID and sort by date (newest first)
    const uniqueReviews = Array.from(
      new Map(allReviews.map((r) => [r.id, r])).values()
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Compute average rating and count
    const totalReviews = sellerRow?.username === 'vretok' && uniqueReviews.length > 0
      ? VRETOK_PUBLIC_REVIEW_COUNT
      : uniqueReviews.length;

    const averageRating = uniqueReviews.length > 0
      ? Math.round((uniqueReviews.reduce((sum, r) => sum + r.rating, 0) / uniqueReviews.length) * 10) / 10
      : 0;

    return {
      reviews: uniqueReviews,
      averageRating,
      totalReviews,
      sellerName: sellerRow?.name,
      sellerUsername: sellerRow?.username,
    };
  } catch {
    return { reviews: [], averageRating: 0, totalReviews: 0 };
  }
}

function shuffleReviews(reviews: Review[]): Review[] {
  if (reviews.length <= 1) {
    return reviews;
  }

  const shuffled = [...reviews];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
}

export async function getHomeReviewsFeed(limit: number = 6): Promise<{
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
}> {
  try {
    const seller = await getSellerByUsername('vretok');

    if (!seller) {
      return { reviews: [], averageRating: 0, totalReviews: 0 };
    }

    return {
      reviews: shuffleReviews(seller.reviews || []).slice(0, limit),
      averageRating: seller.averageRating || 0,
      totalReviews: seller.totalReviews || 0,
    };
  } catch (error) {
    console.error('Error loading home reviews feed:', error);
    return { reviews: [], averageRating: 0, totalReviews: 0 };
  }
}


/**
 * Get all sellers
 */
export async function getSellers(): Promise<Seller[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('sellers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching sellers:', error);
      return [];
    }

    return (data || []).map(transformSeller);
  } catch (error) {
    console.error('Error loading sellers:', error);
    return [];
  }
}

/**
 * Get a single seller by ID
 */
export async function getSellerById(id: string): Promise<Seller | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('sellers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code !== 'PGRST116') {
        console.error(`Error fetching seller ${id}:`, error);
      }
      return null;
    }

    if (!data) return null;
    const seller = transformSeller(data);
    const reviewData = await getSellerReviews(seller.id);
    
    return attachSellerReviews(seller, reviewData.reviews);
  } catch (error) {
    console.error(`Error loading seller ${id}:`, error);
    return null;
  }
}

/**
 * Get a single seller by username (for public profile pages)
 */
export async function getSellerByUsername(username: string): Promise<Seller | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('sellers')
      .select('*')
      .eq('username', username)
      .single();

    if (error) {
      if (error.code !== 'PGRST116') {
        console.error(`Error fetching seller by username ${username}:`, error);
      }
      return null;
    }

    if (!data) return null;
    const seller = transformSeller(data);
    const reviewData = await getSellerReviews(seller.id);

    return attachSellerReviews(seller, reviewData.reviews);
  } catch (error) {
    console.error(`Error loading seller by username ${username}:`, error);
    return null;
  }
}


/**
 * Get published products for a seller
 */
export async function getProductsBySeller(sellerId: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('seller_id', sellerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products by seller:', error);
      return [];
    }

    // Only return published products, mapped to proper Product interfaces
    return (data || [])
      .map((row: any) => transformProduct(row))
      .filter((p: any) => p.published !== false);
  } catch (error) {
    console.error('Error loading products by seller:', error);
    return [];
  }
}

/**
 * Create a new seller
 */
export async function createSeller(sellerData: {
  name: string;
  username: string;
  bio?: string;
  avatar_url?: string;
  location?: string;
  member_since?: string;
  nativeReviews?: Review[];
}): Promise<Seller | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('sellers')
      .insert({
        name: sellerData.name,
        username: sellerData.username.toLowerCase().trim(),
        bio: sellerData.bio || '',
        avatar_url: sellerData.avatar_url || '',
        location: sellerData.location || '',
        member_since: sellerData.member_since || '',
        reviews: sellerData.nativeReviews || [],
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating seller:', error);
      return null;
    }

    return transformSeller(data);
  } catch (error) {
    console.error('Error creating seller:', error);
    return null;
  }
}

/**
 * Update a seller by ID
 */
export async function updateSeller(
  id: string,
  updates: {
    name?: string;
    username?: string;
    bio?: string;
    avatar_url?: string;
    location?: string;
    member_since?: string;
    nativeReviews?: Review[];
  }
): Promise<Seller | null> {
  try {
    const updateData: any = { updated_at: new Date().toISOString() };

    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.username !== undefined) updateData.username = updates.username.toLowerCase().trim();
    if (updates.bio !== undefined) updateData.bio = updates.bio;
    if (updates.avatar_url !== undefined) updateData.avatar_url = updates.avatar_url;
    if (updates.location !== undefined) updateData.location = updates.location;
    if (updates.member_since !== undefined) updateData.member_since = updates.member_since;
    if (updates.nativeReviews !== undefined) updateData.reviews = updates.nativeReviews;

    const { data, error } = await supabaseAdmin
      .from('sellers')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating seller:', error);
      return null;
    }

    return transformSeller(data);
  } catch (error) {
    console.error('Error updating seller:', error);
    return null;
  }
}

/**
 * Delete a seller by ID
 */
export async function deleteSeller(id: string): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from('sellers')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting seller:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting seller:', error);
    return false;
  }
}
