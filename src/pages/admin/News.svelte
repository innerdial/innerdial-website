<script>
  /**
   * The feed behind the app's /news screen.
   *
   * A story is a draft until it is published, so an editor can write ahead of
   * time — collectors only ever see rows where `published` is true, and that is
   * an RLS policy rather than a filter this screen is trusted to apply.
   */
  import AdminShell from '$lib/components/AdminShell.svelte';
  import Button from '$lib/components/Button.svelte';
  import Callout from '$lib/components/Callout.svelte';
  import Field from '$lib/components/Field.svelte';
  import Loader from '$lib/components/Loader.svelte';
  import Panel from '$lib/components/Panel.svelte';
  import { errorMessage } from '$lib/supabase/client.js';
  import {
    NEWS_ICONS,
    createArticle,
    deleteArticle,
    fetchArticles,
    setPublished,
    updateArticle,
    uploadArticleImage,
  } from '$lib/admin/news.js';
  import { formatRelative, fromDateTimeLocal, toDateTimeLocal } from '$lib/utils/format.js';

  /** The app's card shows the summary in full; past this it is being cut off on a phone. */
  const MAX_SUMMARY_LENGTH = 320;

  const BLANK = {
    category: 'Releases',
    icon: 'release',
    title: '',
    summary: '',
    source: '',
    image_url: '',
    published: false,
    published_at: '',
  };

  let status = $state(/** @type {'loading' | 'ready' | 'error'} */ ('loading'));
  let error = $state('');
  let notice = $state('');

  /** @type {import('$lib/admin/news.js').NewsArticle[]} */
  let articles = $state([]);

  /** The story open in the editor: an id, the string 'new', or nothing. */
  let editing = $state('');
  let draft = $state({ ...BLANK });
  let fieldError = $state('');
  let saving = $state(false);
  let uploading = $state(false);
  let confirmingId = $state('');

  const publishedCount = $derived(articles.filter((article) => article.published).length);

  $effect(() => {
    load();
  });

  async function load() {
    status = 'loading';
    error = '';

    try {
      articles = await fetchArticles();
      status = 'ready';
    } catch (cause) {
      error = errorMessage(cause);
      status = 'error';
    }
  }

  function startNew() {
    editing = 'new';
    draft = { ...BLANK };
    fieldError = '';
    confirmingId = '';
  }

  /** @param {import('$lib/admin/news.js').NewsArticle} article */
  function startEdit(article) {
    editing = article.id;
    fieldError = '';
    confirmingId = '';
    draft = {
      category: article.category,
      icon: article.icon,
      title: article.title,
      summary: article.summary,
      source: article.source,
      image_url: article.image_url ?? '',
      published: article.published,
      published_at: toDateTimeLocal(article.published_at),
    };
  }

  function closeEditor() {
    editing = '';
    fieldError = '';
  }

  function validate() {
    if (!draft.title.trim()) return 'A story needs a headline.';
    if (!draft.summary.trim()) return 'A story needs a summary — the card is mostly summary.';
    if (draft.summary.trim().length > MAX_SUMMARY_LENGTH) {
      return `Keep the summary under ${MAX_SUMMARY_LENGTH} characters.`;
    }
    if (!draft.category.trim()) return 'A story needs a category.';
    return '';
  }

  async function save(event) {
    event.preventDefault();

    fieldError = validate();
    if (fieldError || saving) return;

    saving = true;
    error = '';

    const payload = {
      category: draft.category,
      icon: draft.icon,
      title: draft.title,
      summary: draft.summary,
      source: draft.source,
      image_url: draft.image_url,
      published: draft.published,
      // Left null on a new story so the table's trigger stamps the moment it
      // goes live; an explicit value is an editor deliberately backdating it.
      published_at: fromDateTimeLocal(draft.published_at),
    };

    try {
      if (editing === 'new') {
        const created = await createArticle(payload);
        articles = [created, ...articles];
        notice = created.published ? 'Story published.' : 'Draft saved.';
      } else {
        const updated = await updateArticle(editing, payload);
        articles = articles.map((article) => (article.id === updated.id ? updated : article));
        notice = 'Story updated.';
      }

      closeEditor();
    } catch (cause) {
      error = errorMessage(cause);
    } finally {
      saving = false;
    }
  }

  async function handleUpload(event) {
    // Held onto now: `currentTarget` is only set while the event is dispatching
    // and is null by the time the upload below resolves.
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;

    uploading = true;
    fieldError = '';

    try {
      draft.image_url = await uploadArticleImage(file);
    } catch (cause) {
      fieldError = errorMessage(cause);
    } finally {
      uploading = false;
      // Cleared so choosing the same file again still fires a change event.
      input.value = '';
    }
  }

  /** @param {import('$lib/admin/news.js').NewsArticle} article */
  async function togglePublished(article) {
    error = '';

    try {
      const updated = await setPublished(article.id, !article.published);
      articles = articles.map((row) => (row.id === updated.id ? updated : row));
    } catch (cause) {
      error = errorMessage(cause);
    }
  }

  /** @param {string} id */
  async function remove(id) {
    error = '';

    try {
      await deleteArticle(id);
      articles = articles.filter((article) => article.id !== id);
      confirmingId = '';
      notice = 'Story deleted.';
      if (editing === id) closeEditor();
    } catch (cause) {
      error = errorMessage(cause);
    }
  }
</script>

<AdminShell title="News" subtitle="The feed collectors read on the app's News screen.">
  {#snippet actions()}
    {#if editing}
      <Button onclick={closeEditor}>Close editor</Button>
    {:else}
      <Button variant="primary" onclick={startNew}>New story</Button>
    {/if}
  {/snippet}

  {#if editing}
    <div class="editor">
      <Panel title={editing === 'new' ? 'New story' : 'Edit story'}>
        <form onsubmit={save}>
          <Field label="Headline" id="news-title" required error={fieldError}>
            <input id="news-title" type="text" bind:value={draft.title} />
          </Field>

          <Field
            label="Summary"
            id="news-summary"
            required
            hint="{draft.summary.trim().length}/{MAX_SUMMARY_LENGTH} characters"
          >
            <textarea
              id="news-summary"
              bind:value={draft.summary}
              maxlength={MAX_SUMMARY_LENGTH}
            ></textarea>
          </Field>

          <div class="row">
            <Field label="Category" id="news-category" required hint="Shown above the headline.">
              <input id="news-category" type="text" bind:value={draft.category} />
            </Field>

            <Field label="Glyph" id="news-icon" hint="Used when there is no image.">
              <select id="news-icon" bind:value={draft.icon}>
                {#each NEWS_ICONS as option (option.value)}
                  <option value={option.value}>{option.label}</option>
                {/each}
              </select>
            </Field>

            <Field label="Source" id="news-source" hint="The publication credited on the card.">
              <input id="news-source" type="text" bind:value={draft.source} />
            </Field>
          </div>

          <div class="row">
            <Field
              label="Image URL"
              id="news-image"
              hint="Upload below, or paste a URL from elsewhere."
            >
              <input id="news-image" type="url" bind:value={draft.image_url} />
            </Field>

            <Field label="Upload image" id="news-upload" hint="JPEG, PNG, WebP or AVIF, under 5MB.">
              <input
                id="news-upload"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                disabled={uploading}
                onchange={handleUpload}
              />
            </Field>
          </div>

          {#if uploading}
            <Loader inline label="Uploading" />
          {:else if draft.image_url}
            <div class="preview">
              <img src={draft.image_url} alt="" />
              <Button size="sm" variant="ghost" onclick={() => (draft.image_url = '')}>
                Remove image
              </Button>
            </div>
          {/if}

          <div class="row">
            <Field
              label="Publish date"
              id="news-date"
              hint="Leave empty to stamp the moment it goes live."
            >
              <input id="news-date" type="datetime-local" bind:value={draft.published_at} />
            </Field>

            <label class="toggle">
              <input type="checkbox" bind:checked={draft.published} />
              Published — visible in the app
            </label>
          </div>

          <div class="form-actions">
            <Button variant="primary" type="submit" disabled={saving || uploading}>
              {saving ? 'Saving…' : editing === 'new' ? 'Create story' : 'Save changes'}
            </Button>
            <Button onclick={closeEditor} disabled={saving}>Cancel</Button>
          </div>
        </form>
      </Panel>
    </div>
  {/if}

  {#if notice}
    <div class="message"><Callout tone="success" message={notice} /></div>
  {/if}
  {#if error}
    <div class="message"><Callout tone="error" message={error} /></div>
  {/if}

  {#if status === 'loading' && articles.length === 0}
    <Loader label="Loading stories" />
  {:else if status === 'error' && articles.length === 0}
    <Callout tone="error" message={error} />
  {:else}
    <Panel title="Stories" hint="{publishedCount} published of {articles.length}.">
      {#if articles.length === 0}
        <Callout message="Nothing written yet. The app's News screen stays empty until there is." />
      {:else}
        <ul class="stories">
          {#each articles as article (article.id)}
            <li class="story" class:draft={!article.published}>
              <div class="thumb">
                {#if article.image_url}
                  <img src={article.image_url} alt="" loading="lazy" />
                {:else}
                  <span class="thumb-empty">{article.icon}</span>
                {/if}
              </div>

              <div class="story-body">
                <p class="story-meta">
                  <span class="category">{article.category}</span>
                  {#if article.source}<span>{article.source}</span>{/if}
                  <span>
                    {article.published
                      ? formatRelative(article.published_at)
                      : `Draft · saved ${formatRelative(article.updated_at)}`}
                  </span>
                </p>
                <h3>{article.title}</h3>
                <p class="summary">{article.summary}</p>
              </div>

              <div class="story-actions">
                <Button size="sm" onclick={() => togglePublished(article)}>
                  {article.published ? 'Unpublish' : 'Publish'}
                </Button>
                <Button size="sm" onclick={() => startEdit(article)}>Edit</Button>
                {#if confirmingId === article.id}
                  <Button size="sm" variant="danger" onclick={() => remove(article.id)}>
                    Confirm
                  </Button>
                  <Button size="sm" variant="ghost" onclick={() => (confirmingId = '')}>
                    Keep
                  </Button>
                {:else}
                  <Button size="sm" variant="ghost" onclick={() => (confirmingId = article.id)}>
                    Delete
                  </Button>
                {/if}
              </div>
            </li>
          {/each}
        </ul>
      {/if}
    </Panel>
  {/if}
</AdminShell>

<style>
  .editor,
  .message {
    margin-bottom: var(--space-md);
  }

  form {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  .row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr));
    align-items: end;
    gap: var(--space-md);
  }

  .toggle {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    padding-bottom: var(--space-sm);
    font-size: 0.875rem;
  }

  .toggle input {
    width: 1rem;
    height: 1rem;
    accent-color: var(--color-primary);
  }

  .preview {
    display: flex;
    align-items: center;
    gap: var(--space-md);
  }

  .preview img {
    width: 10rem;
    height: 6rem;
    object-fit: cover;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
  }

  .form-actions {
    display: flex;
    gap: var(--space-sm);
  }

  .stories {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .story {
    display: flex;
    align-items: flex-start;
    gap: var(--space-md);
    padding: var(--space-md);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
  }

  .story.draft {
    background: color-mix(in srgb, var(--color-surface) 30%, var(--color-background));
  }

  .thumb {
    display: grid;
    place-items: center;
    flex: 0 0 auto;
    width: 5.5rem;
    height: 4rem;
    overflow: hidden;
    border-radius: var(--radius-sm);
    background: color-mix(in srgb, var(--color-primary) 10%, var(--color-background));
  }

  .thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .thumb-empty {
    font-size: 0.625rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: color-mix(in srgb, var(--color-primary) 70%, var(--color-text-muted));
  }

  .story-body {
    flex: 1;
    min-width: 0;
  }

  .story-meta {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    flex-wrap: wrap;
    margin: 0 0 var(--space-xs);
    font-size: 0.75rem;
    color: var(--color-text-muted);
  }

  .category {
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-primary);
  }

  h3 {
    margin: 0;
    font-size: 0.9375rem;
    font-weight: 600;
    line-height: 1.35;
    color: var(--color-ink);
  }

  .summary {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    overflow: hidden;
    margin: var(--space-xs) 0 0;
    font-size: 0.8125rem;
    line-height: 1.5;
    color: var(--color-text-muted);
  }

  .story-actions {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    flex: 0 0 auto;
    flex-wrap: wrap;
  }
</style>
