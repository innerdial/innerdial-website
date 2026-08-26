import { getSupabase } from '$lib/supabase/client.js';

/**
 * The feed behind the app's /news screen.
 *
 * @typedef {{
 *   id: string,
 *   category: string,
 *   icon: string,
 *   title: string,
 *   summary: string,
 *   source: string,
 *   image_url: string | null,
 *   published: boolean,
 *   published_at: string | null,
 *   created_at: string,
 *   updated_at: string,
 * }} NewsArticle
 */

const COLUMNS =
  'id, category, icon, title, summary, source, image_url, published, published_at, created_at, updated_at';

/** Chooses the glyph a card falls back to with no image. Matches the table's check constraint. */
export const NEWS_ICONS = [
  { value: 'release', label: 'Release' },
  { value: 'market', label: 'Market' },
  { value: 'auction', label: 'Auction' },
  { value: 'service', label: 'Service' },
  { value: 'community', label: 'Community' },
];

const IMAGE_BUCKET = 'news-images';

/** Story art is decoration, not an archive — anything heavier belongs on a CDN. */
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

/**
 * Drafts and published stories together, newest first, so an editor sees the
 * queue rather than only what is already live.
 *
 * @returns {Promise<NewsArticle[]>}
 */
export async function fetchArticles() {
  const { data, error } = await getSupabase()
    .from('news_articles')
    .select(COLUMNS)
    .order('published_at', { ascending: false, nullsFirst: true })
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

/** @param {Partial<NewsArticle>} article */
export async function createArticle(article) {
  const { data, error } = await getSupabase()
    .from('news_articles')
    .insert(toRow(article))
    .select(COLUMNS)
    .single();

  if (error) throw error;
  return data;
}

/**
 * @param {string} id
 * @param {Partial<NewsArticle>} article
 */
export async function updateArticle(id, article) {
  const { data, error } = await getSupabase()
    .from('news_articles')
    .update(toRow(article))
    .eq('id', id)
    .select(COLUMNS)
    .single();

  if (error) throw error;
  return data;
}

/** @param {string} id */
export async function deleteArticle(id) {
  const { error } = await getSupabase().from('news_articles').delete().eq('id', id);
  if (error) throw error;
}

/**
 * Publishing with no date set lets the table's trigger stamp `now()`;
 * unpublishing leaves the date alone so re-publishing keeps the original moment.
 *
 * @param {string} id
 * @param {boolean} published
 */
export async function setPublished(id, published) {
  return updateArticle(id, { published });
}

/**
 * Uploads story art to the public bucket and hands back the URL the card reads.
 *
 * @param {File} file
 * @returns {Promise<string>}
 */
export async function uploadArticleImage(file) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error('Story art must be a JPEG, PNG, WebP or AVIF image.');
  }

  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error('Story art must be under 5MB.');
  }

  const extension = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
  const path = `${crypto.randomUUID()}.${extension}`;

  const supabase = getSupabase();
  const { error } = await supabase.storage.from(IMAGE_BUCKET).upload(path, file, {
    contentType: file.type,
    cacheControl: '31536000',
  });

  if (error) throw error;

  const { data } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Only the columns an editor owns. `created_at`, `updated_at` and the publish
 * stamp are the database's to set, and sending them back would fight the triggers.
 *
 * @param {Partial<NewsArticle>} article
 */
function toRow(article) {
  /** @type {Record<string, unknown>} */
  const row = {};

  if (article.category !== undefined) row.category = article.category.trim();
  if (article.icon !== undefined) row.icon = article.icon;
  if (article.title !== undefined) row.title = article.title.trim();
  if (article.summary !== undefined) row.summary = article.summary.trim();
  if (article.source !== undefined) row.source = article.source.trim();
  if (article.image_url !== undefined) row.image_url = article.image_url?.trim() || null;
  if (article.published !== undefined) row.published = article.published;
  if (article.published_at !== undefined) row.published_at = article.published_at;

  return row;
}
