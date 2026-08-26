<script>
  /**
   * The words from the watchmaker.
   *
   * The app's dashboard shows one at a time and rotates through the published
   * set by the day, so this screen is a running order rather than a feed: the
   * position of a tip decides which day it comes up, and unpublishing takes it
   * out of the rotation without losing the copy.
   */
  import AdminShell from '$lib/components/AdminShell.svelte';
  import Button from '$lib/components/Button.svelte';
  import Callout from '$lib/components/Callout.svelte';
  import Field from '$lib/components/Field.svelte';
  import Loader from '$lib/components/Loader.svelte';
  import Panel from '$lib/components/Panel.svelte';
  import { errorMessage } from '$lib/supabase/client.js';
  import { createTip, deleteTip, fetchTips, reorderTips, updateTip } from '$lib/admin/tips.js';

  /** Matches the app's card, which has room for a sentence and not a paragraph. */
  const MAX_BODY_LENGTH = 180;

  const BLANK = { body: '', link_label: 'Watch Care guide', link_path: '/tools', published: true };

  let status = $state(/** @type {'loading' | 'ready' | 'error'} */ ('loading'));
  let error = $state('');
  let notice = $state('');

  /** @type {import('$lib/admin/tips.js').WatchmakerTip[]} */
  let tips = $state([]);

  let composing = $state(false);
  let draft = $state({ ...BLANK });
  let draftError = $state('');
  let saving = $state(false);

  /** The tip open for editing, and the copy being edited. */
  let editingId = $state('');
  let editDraft = $state({ ...BLANK });

  /** Two-step delete: the first click arms it, the second carries it out. */
  let confirmingId = $state('');

  const publishedCount = $derived(tips.filter((tip) => tip.published).length);

  $effect(() => {
    load();
  });

  async function load() {
    status = 'loading';
    error = '';

    try {
      tips = await fetchTips();
      status = 'ready';
    } catch (cause) {
      error = errorMessage(cause);
      status = 'error';
    }
  }

  /** @param {{ body: string, link_path: string }} values */
  function validate(values) {
    const body = values.body.trim();

    if (!body) return 'A tip needs something to say.';
    if (body.length > MAX_BODY_LENGTH) {
      return `Keep it under ${MAX_BODY_LENGTH} characters — the card shows one sentence.`;
    }
    if (!values.link_path.trim().startsWith('/')) {
      return 'The link is an in-app route, so it has to start with “/”.';
    }

    return '';
  }

  async function saveNew(event) {
    event.preventDefault();

    draftError = validate(draft);
    if (draftError || saving) return;

    saving = true;
    error = '';

    try {
      // New tips join the end of the rotation rather than jumping it.
      const created = await createTip({
        ...draft,
        sort_order: tips.length ? Math.max(...tips.map((tip) => tip.sort_order)) + 1 : 0,
      });

      tips = [...tips, created];
      draft = { ...BLANK };
      composing = false;
      notice = 'Tip added.';
    } catch (cause) {
      error = errorMessage(cause);
    } finally {
      saving = false;
    }
  }

  /** @param {import('$lib/admin/tips.js').WatchmakerTip} tip */
  function startEdit(tip) {
    editingId = tip.id;
    confirmingId = '';
    draftError = '';
    editDraft = {
      body: tip.body,
      link_label: tip.link_label,
      link_path: tip.link_path,
      published: tip.published,
    };
  }

  async function saveEdit(event) {
    event.preventDefault();

    draftError = validate(editDraft);
    if (draftError || saving) return;

    saving = true;
    error = '';

    try {
      const updated = await updateTip(editingId, editDraft);
      tips = tips.map((tip) => (tip.id === updated.id ? updated : tip));
      editingId = '';
      notice = 'Tip updated.';
    } catch (cause) {
      error = errorMessage(cause);
    } finally {
      saving = false;
    }
  }

  /** @param {import('$lib/admin/tips.js').WatchmakerTip} tip */
  async function togglePublished(tip) {
    error = '';

    try {
      const updated = await updateTip(tip.id, { published: !tip.published });
      tips = tips.map((row) => (row.id === updated.id ? updated : row));
    } catch (cause) {
      error = errorMessage(cause);
    }
  }

  /** @param {string} id */
  async function remove(id) {
    error = '';

    try {
      await deleteTip(id);
      tips = tips.filter((tip) => tip.id !== id);
      confirmingId = '';
      notice = 'Tip deleted.';
    } catch (cause) {
      error = errorMessage(cause);
    }
  }

  /**
   * @param {number} index
   * @param {-1 | 1} direction
   */
  async function move(index, direction) {
    const target = index + direction;
    if (target < 0 || target >= tips.length) return;

    const next = [...tips];
    [next[index], next[target]] = [next[target], next[index]];

    // Renumbered from zero so a list that has been shuffled for a while does
    // not drift into gaps and ties.
    const ordered = next.map((tip, position) => ({ ...tip, sort_order: position }));
    const previous = tips;
    tips = ordered;
    error = '';

    try {
      await reorderTips(ordered.map(({ id, sort_order }) => ({ id, sort_order })));
    } catch (cause) {
      tips = previous;
      error = errorMessage(cause);
    }
  }
</script>

<AdminShell
  title="Watchmaker tips"
  subtitle="The advice on the app's dashboard. One shows per day, rotating through the published set."
>
  {#snippet actions()}
    <Button
      variant="primary"
      onclick={() => {
        composing = !composing;
        draftError = '';
      }}
    >
      {composing ? 'Cancel' : 'New tip'}
    </Button>
  {/snippet}

  {#if composing}
    <div class="composer">
      <Panel title="New tip" hint="Added to the end of the rotation.">
        <form onsubmit={saveNew}>
          <Field
            label="Tip"
            id="new-tip-body"
            required
            error={draftError}
            hint="{draft.body.trim().length}/{MAX_BODY_LENGTH} characters"
          >
            <textarea
              id="new-tip-body"
              bind:value={draft.body}
              maxlength={MAX_BODY_LENGTH}
              placeholder="Never set the date between 9pm and 3am on a mechanical."
            ></textarea>
          </Field>

          <div class="row">
            <Field label="Link label" id="new-tip-label">
              <input id="new-tip-label" type="text" bind:value={draft.link_label} />
            </Field>

            <Field
              label="Link route"
              id="new-tip-path"
              hint="An in-app path, such as /tools or /vault."
            >
              <input id="new-tip-path" type="text" bind:value={draft.link_path} />
            </Field>
          </div>

          <label class="toggle">
            <input type="checkbox" bind:checked={draft.published} />
            Publish straight away
          </label>

          <div class="form-actions">
            <Button variant="primary" type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Add tip'}
            </Button>
            <Button onclick={() => (composing = false)} disabled={saving}>Cancel</Button>
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

  {#if status === 'loading' && tips.length === 0}
    <Loader label="Loading tips" />
  {:else if status === 'error' && tips.length === 0}
    <Callout tone="error" message={error} />
  {:else}
    <Panel
      title="Rotation"
      hint="{publishedCount} published of {tips.length}. The app picks by the day, so the order fixes which tip lands when."
    >
      {#if tips.length === 0}
        <Callout
          message="No tips yet. The app's dashboard hides the card entirely until there is one."
        />
      {:else}
        <ol class="tips">
          {#each tips as tip, index (tip.id)}
            <li class="tip" class:unpublished={!tip.published}>
              {#if editingId === tip.id}
                <form class="edit" onsubmit={saveEdit}>
                  <Field label="Tip" id="edit-body-{tip.id}" required error={draftError}>
                    <textarea
                      id="edit-body-{tip.id}"
                      bind:value={editDraft.body}
                      maxlength={MAX_BODY_LENGTH}
                    ></textarea>
                  </Field>

                  <div class="row">
                    <Field label="Link label" id="edit-label-{tip.id}">
                      <input id="edit-label-{tip.id}" type="text" bind:value={editDraft.link_label} />
                    </Field>
                    <Field label="Link route" id="edit-path-{tip.id}">
                      <input id="edit-path-{tip.id}" type="text" bind:value={editDraft.link_path} />
                    </Field>
                  </div>

                  <div class="form-actions">
                    <Button variant="primary" type="submit" size="sm" disabled={saving}>
                      {saving ? 'Saving…' : 'Save'}
                    </Button>
                    <Button size="sm" onclick={() => (editingId = '')} disabled={saving}>
                      Cancel
                    </Button>
                  </div>
                </form>
              {:else}
                <div class="order">
                  <button
                    type="button"
                    aria-label="Move up"
                    disabled={index === 0}
                    onclick={() => move(index, -1)}
                  >
                    ↑
                  </button>
                  <span class="position">{index + 1}</span>
                  <button
                    type="button"
                    aria-label="Move down"
                    disabled={index === tips.length - 1}
                    onclick={() => move(index, 1)}
                  >
                    ↓
                  </button>
                </div>

                <div class="body">
                  <p class="copy">{tip.body}</p>
                  <p class="meta">
                    {tip.link_label} → <code>{tip.link_path}</code>
                    {#if !tip.published}<span class="draft">Unpublished</span>{/if}
                  </p>
                </div>

                <div class="tip-actions">
                  <Button size="sm" onclick={() => togglePublished(tip)}>
                    {tip.published ? 'Unpublish' : 'Publish'}
                  </Button>
                  <Button size="sm" onclick={() => startEdit(tip)}>Edit</Button>
                  {#if confirmingId === tip.id}
                    <Button size="sm" variant="danger" onclick={() => remove(tip.id)}>
                      Confirm
                    </Button>
                    <Button size="sm" variant="ghost" onclick={() => (confirmingId = '')}>
                      Keep
                    </Button>
                  {:else}
                    <Button size="sm" variant="ghost" onclick={() => (confirmingId = tip.id)}>
                      Delete
                    </Button>
                  {/if}
                </div>
              {/if}
            </li>
          {/each}
        </ol>
      {/if}
    </Panel>
  {/if}
</AdminShell>

<style>
  .composer,
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
    grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
    gap: var(--space-md);
  }

  .toggle {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    font-size: 0.875rem;
    color: var(--color-text);
  }

  .toggle input {
    width: 1rem;
    height: 1rem;
    accent-color: var(--color-primary);
  }

  .form-actions {
    display: flex;
    gap: var(--space-sm);
  }

  .tips {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .tip {
    display: flex;
    align-items: flex-start;
    gap: var(--space-md);
    padding: var(--space-md);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-background);
  }

  .tip.unpublished {
    background: color-mix(in srgb, var(--color-surface) 30%, var(--color-background));
  }

  .order {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 0 0 auto;
    gap: 2px;
  }

  .order button {
    width: 1.5rem;
    height: 1.25rem;
    padding: 0;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    background: var(--color-background);
    color: var(--color-text-muted);
    font-size: 0.75rem;
    line-height: 1;
    cursor: pointer;
  }

  .order button:hover:not(:disabled) {
    border-color: var(--color-primary);
    color: var(--color-primary);
  }

  .order button:disabled {
    opacity: 0.35;
    cursor: default;
  }

  .position {
    font-size: 0.6875rem;
    font-weight: 600;
    color: var(--color-text-muted);
    font-variant-numeric: tabular-nums;
  }

  .body {
    flex: 1;
    min-width: 0;
  }

  .copy {
    margin: 0;
    font-size: 0.9375rem;
    font-weight: 500;
    line-height: 1.45;
    color: var(--color-ink);
  }

  .meta {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    flex-wrap: wrap;
    margin: var(--space-xs) 0 0;
    font-size: 0.75rem;
    color: var(--color-text-muted);
  }

  code {
    padding: 0.1em 0.3em;
    border-radius: var(--radius-sm);
    background: var(--color-surface);
  }

  .draft {
    padding: 0.125rem var(--space-xs);
    border-radius: var(--radius-sm);
    background: color-mix(in srgb, var(--color-text-muted) 14%, var(--color-background));
    font-size: 0.625rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .tip-actions {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    flex: 0 0 auto;
    flex-wrap: wrap;
  }

  .edit {
    flex: 1;
    min-width: 0;
  }
</style>
