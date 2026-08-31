<script>
  /**
   * Product licenses and the app features each one unlocks.
   *
   * Founder is a fixed system license at the top with every feature. Other
   * licenses are created here and their feature sets are edited with checkboxes
   * grouped the same way the collector app surfaces them.
   */
  import AdminShell from '$lib/components/AdminShell.svelte';
  import Button from '$lib/components/Button.svelte';
  import Callout from '$lib/components/Callout.svelte';
  import Field from '$lib/components/Field.svelte';
  import Loader from '$lib/components/Loader.svelte';
  import Panel from '$lib/components/Panel.svelte';
  import { FEATURE_GROUPS, APP_FEATURES, featureLabel, featuresInGroup } from '$lib/admin/features.js';
  import {
    createLicense,
    deleteLicense,
    fetchLicenses,
    setLicenseFeatures,
    updateLicense,
    validateSlug,
  } from '$lib/admin/licenses.js';
  import { errorMessage } from '$lib/supabase/client.js';

  const BLANK = { name: '', slug: '', description: '', features: /** @type {string[]} */ ([]) };

  let status = $state(/** @type {'loading' | 'ready' | 'error'} */ ('loading'));
  let error = $state('');
  let notice = $state('');

  /** @type {import('$lib/admin/licenses.js').License[]} */
  let licenses = $state([]);

  let composing = $state(false);
  let draft = $state({ ...BLANK, features: [...BLANK.features] });
  let draftError = $state('');
  let saving = $state(false);

  /** The license open for editing, and the copy being edited. */
  let editingId = $state('');
  let editDraft = $state({ name: '', description: '', features: /** @type {string[]} */ ([]) });

  let confirmingId = $state('');

  const founder = $derived(licenses.find((license) => license.is_system) ?? null);
  const customLicenses = $derived(licenses.filter((license) => !license.is_system));

  $effect(() => {
    load();
  });

  async function load() {
    status = 'loading';
    error = '';

    try {
      licenses = await fetchLicenses();
      status = 'ready';
    } catch (cause) {
      error = errorMessage(cause);
      status = 'error';
    }
  }

  /** @param {string} name */
  function slugFromName(name) {
    return name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .replace(/_+/g, '_');
  }

  /** @param {{ name: string, slug: string }} values */
  function validateDraft(values) {
    if (!values.name.trim()) return 'A license needs a name.';
    try {
      validateSlug(values.slug.trim().toLowerCase());
    } catch (cause) {
      return errorMessage(cause);
    }
    return '';
  }

  /** @param {string[]} selected @param {string} key */
  function toggleFeature(selected, key) {
    return selected.includes(key) ? selected.filter((item) => item !== key) : [...selected, key];
  }

  async function saveNew(event) {
    event.preventDefault();

    draftError = validateDraft(draft);
    if (draftError || saving) return;

    saving = true;
    error = '';

    try {
      const created = await createLicense(draft);
      licenses = [...licenses, created].sort(sortLicenses);
      draft = { ...BLANK, features: [] };
      composing = false;
      notice = 'License created.';
    } catch (cause) {
      error = errorMessage(cause);
    } finally {
      saving = false;
    }
  }

  /** @param {import('$lib/admin/licenses.js').License} license */
  function startEdit(license) {
    editingId = license.id;
    confirmingId = '';
    draftError = '';
    editDraft = {
      name: license.name,
      description: license.description,
      features: [...license.features],
    };
  }

  async function saveEdit(event) {
    event.preventDefault();
    if (!editingId || saving) return;

    if (!editDraft.name.trim()) {
      draftError = 'A license needs a name.';
      return;
    }

    saving = true;
    error = '';
    draftError = '';

    try {
      await updateLicense(editingId, {
        name: editDraft.name,
        description: editDraft.description,
      });
      await setLicenseFeatures(editingId, editDraft.features);

      licenses = licenses
        .map((license) =>
          license.id === editingId
            ? {
                ...license,
                name: editDraft.name.trim(),
                description: editDraft.description.trim(),
                features: [...editDraft.features].sort(),
              }
            : license,
        )
        .sort(sortLicenses);

      editingId = '';
      notice = 'License updated.';
    } catch (cause) {
      error = errorMessage(cause);
    } finally {
      saving = false;
    }
  }

  /** @param {string} id */
  async function remove(id) {
    error = '';

    try {
      await deleteLicense(id);
      licenses = licenses.filter((license) => license.id !== id);
      confirmingId = '';
      if (editingId === id) editingId = '';
      notice = 'License deleted.';
    } catch (cause) {
      error = errorMessage(cause);
    }
  }

  /** @param {import('$lib/admin/licenses.js').License} a @param {import('$lib/admin/licenses.js').License} b */
  function sortLicenses(a, b) {
    if (a.is_system !== b.is_system) return a.is_system ? -1 : 1;
    if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
    return a.created_at.localeCompare(b.created_at);
  }
</script>

{#snippet featurePicker(selected, idPrefix)}
  <div class="feature-groups">
    {#each FEATURE_GROUPS as group (group)}
      {@const items = featuresInGroup(group)}
      {#if items.length > 0}
        <fieldset class="feature-group">
          <legend>{group}</legend>
          <ul class="feature-list">
            {#each items as feature (feature.key)}
              <li>
                <label class="feature-option">
                  <input
                    type="checkbox"
                    checked={selected.includes(feature.key)}
                    onchange={() => {
                      if (idPrefix === 'new') {
                        draft.features = toggleFeature(draft.features, feature.key);
                      } else {
                        editDraft.features = toggleFeature(editDraft.features, feature.key);
                      }
                    }}
                  />
                  <span class="feature-copy">
                    <span class="feature-name">{feature.label}</span>
                    {#if feature.hint}
                      <span class="feature-hint">{feature.hint}</span>
                    {/if}
                  </span>
                </label>
              </li>
            {/each}
          </ul>
        </fieldset>
      {/if}
    {/each}
  </div>
{/snippet}

{#snippet featureTags(keys)}
  <ul class="feature-tags" aria-label="Included features">
    {#each keys as key (key)}
      <li>{featureLabel(key)}</li>
    {/each}
  </ul>
{/snippet}

<AdminShell
  title="Licenses"
  subtitle="Define product tiers and choose which app features each license unlocks."
>
  {#snippet actions()}
    <Button
      variant="primary"
      onclick={() => {
        composing = !composing;
        draftError = '';
      }}
    >
      {composing ? 'Cancel' : 'New license'}
    </Button>
  {/snippet}

  {#if composing}
    <div class="composer">
      <Panel title="New license" hint="Pick the features this tier should include.">
        <form onsubmit={saveNew}>
          <div class="row">
            <Field label="Name" id="new-license-name" required error={draftError}>
              <input
                id="new-license-name"
                type="text"
                bind:value={draft.name}
                placeholder="Collector"
                oninput={() => {
                  if (!draft.slug || draft.slug === slugFromName(draft.name.slice(0, -1))) {
                    draft.slug = slugFromName(draft.name);
                  }
                }}
              />
            </Field>

            <Field
              label="Slug"
              id="new-license-slug"
              hint="Lowercase identifier stored in the database."
            >
              <input id="new-license-slug" type="text" bind:value={draft.slug} placeholder="collector" />
            </Field>
          </div>

          <Field label="Description" id="new-license-description">
            <textarea
              id="new-license-description"
              bind:value={draft.description}
              placeholder="A short note for other admins."
              rows="2"
            ></textarea>
          </Field>

          {@render featurePicker(draft.features, 'new')}

          <div class="form-actions">
            <Button variant="primary" type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Create license'}
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

  {#if status === 'loading' && licenses.length === 0}
    <Loader label="Loading licenses" />
  {:else if status === 'error' && licenses.length === 0}
    <Callout tone="error" message={error} />
  {:else}
  <Panel
    title="App features"
    hint="Every surface in the collector app. Founder includes all of them; other licenses pick a subset."
  >
    <div class="catalog">
      {#each FEATURE_GROUPS as group (group)}
        <section class="catalog-group">
          <h3>{group}</h3>
          <ul>
            {#each featuresInGroup(group) as feature (feature.key)}
              <li>
                <span class="catalog-label">{feature.label}</span>
                {#if feature.hint}<span class="catalog-hint">{feature.hint}</span>{/if}
              </li>
            {/each}
          </ul>
        </section>
      {/each}
    </div>
  </Panel>

  {#if founder}
    <div class="license-card system">
      <div class="license-head">
        <div>
          <p class="license-kicker">System license</p>
          <h3>{founder.name}</h3>
          <p class="license-slug"><code>{founder.slug}</code></p>
          {#if founder.description}
            <p class="license-description">{founder.description}</p>
          {/if}
        </div>
        <span class="badge">All features</span>
      </div>
      {@render featureTags(founder.features)}
    </div>
  {/if}

  <Panel
    title="Custom licenses"
    hint="{customLicenses.length} defined. Assign features per tier; collectors will be matched to a license later."
  >
    {#if customLicenses.length === 0}
      <Callout message="No custom licenses yet. Create one to define a feature set below Founder." />
    {:else}
      <ul class="licenses">
        {#each customLicenses as license (license.id)}
          <li class="license-card">
            {#if editingId === license.id}
              <form class="edit" onsubmit={saveEdit}>
                <Field label="Name" id="edit-name-{license.id}" required error={draftError}>
                  <input id="edit-name-{license.id}" type="text" bind:value={editDraft.name} />
                </Field>

                <Field label="Description" id="edit-description-{license.id}">
                  <textarea
                    id="edit-description-{license.id}"
                    bind:value={editDraft.description}
                    rows="2"
                  ></textarea>
                </Field>

                <p class="edit-slug">Slug: <code>{license.slug}</code></p>

                {@render featurePicker(editDraft.features, license.id)}

                <div class="form-actions">
                  <Button variant="primary" type="submit" size="sm" disabled={saving}>
                    {saving ? 'Saving…' : 'Save'}
                  </Button>
                  <Button size="sm" onclick={() => (editingId = '')} disabled={saving}>Cancel</Button>
                </div>
              </form>
            {:else}
              <div class="license-head">
                <div>
                  <h3>{license.name}</h3>
                  <p class="license-slug"><code>{license.slug}</code></p>
                  {#if license.description}
                    <p class="license-description">{license.description}</p>
                  {/if}
                </div>
                <div class="license-actions">
                  <Button size="sm" onclick={() => startEdit(license)}>Edit features</Button>
                  {#if confirmingId === license.id}
                    <Button size="sm" variant="danger" onclick={() => remove(license.id)}>Confirm</Button>
                    <Button size="sm" variant="ghost" onclick={() => (confirmingId = '')}>Keep</Button>
                  {:else}
                    <Button size="sm" variant="ghost" onclick={() => (confirmingId = license.id)}>
                      Delete
                    </Button>
                  {/if}
                </div>
              </div>

              {#if license.features.length > 0}
                {@render featureTags(license.features)}
              {:else}
                <p class="empty-features">No features selected yet.</p>
              {/if}

              <p class="feature-count">
                {license.features.length} of {APP_FEATURES.length} features
              </p>
            {/if}
          </li>
        {/each}
      </ul>
    {/if}
  </Panel>
  {/if}
</AdminShell>

<style>
  .composer,
  .message,
  .license-card.system {
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

  .form-actions {
    display: flex;
    gap: var(--space-sm);
  }

  .catalog {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
    gap: var(--space-md);
  }

  .catalog-group h3 {
    margin: 0 0 var(--space-xs);
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-text-muted);
  }

  .catalog-group ul {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .catalog-group li {
    padding: var(--space-xs) 0;
    border-bottom: 1px solid color-mix(in srgb, var(--color-border) 70%, transparent);
  }

  .catalog-label {
    display: block;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--color-ink);
  }

  .catalog-hint {
    display: block;
    margin-top: 2px;
    font-size: 0.75rem;
    color: var(--color-text-muted);
  }

  .license-card {
    padding: var(--space-md);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-background);
    margin-top: var(--space-md);
  }

  .license-card.system {
    border-color: color-mix(in srgb, var(--color-primary) 35%, var(--color-border));
    background: color-mix(in srgb, var(--color-primary) 6%, var(--color-background));
  }

  .license-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--space-md);
    flex-wrap: wrap;
  }

  .license-kicker {
    margin: 0 0 var(--space-xs);
    font-size: 0.6875rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--color-primary);
  }

  .license-head h3 {
    margin: 0;
    font-size: 1.0625rem;
    font-weight: 600;
    color: var(--color-ink);
  }

  .license-slug {
    margin: var(--space-xs) 0 0;
    font-size: 0.75rem;
    color: var(--color-text-muted);
  }

  .license-description {
    margin: var(--space-sm) 0 0;
    font-size: 0.875rem;
    line-height: 1.5;
    color: var(--color-text);
  }

  code {
    padding: 0.1em 0.35em;
    border-radius: var(--radius-sm);
    background: var(--color-surface);
    font-size: 0.875em;
  }

  .badge {
    padding: 0.2rem 0.55rem;
    border-radius: var(--radius-sm);
    background: color-mix(in srgb, var(--color-primary) 16%, var(--color-background));
    color: var(--color-primary);
    font-size: 0.6875rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    white-space: nowrap;
  }

  .feature-tags {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-xs);
    margin: var(--space-md) 0 0;
    padding: 0;
    list-style: none;
  }

  .feature-tags li {
    padding: 0.2rem 0.5rem;
    border-radius: var(--radius-sm);
    background: var(--color-surface);
    font-size: 0.75rem;
    color: var(--color-text);
  }

  .licenses {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .license-actions {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    flex-wrap: wrap;
  }

  .empty-features {
    margin: var(--space-md) 0 0;
    font-size: 0.875rem;
    color: var(--color-text-muted);
  }

  .feature-count {
    margin: var(--space-sm) 0 0;
    font-size: 0.75rem;
    color: var(--color-text-muted);
  }

  .edit-slug {
    margin: 0;
    font-size: 0.8125rem;
    color: var(--color-text-muted);
  }

  .feature-groups {
    display: grid;
    gap: var(--space-md);
  }

  .feature-group {
    margin: 0;
    padding: var(--space-md);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
  }

  .feature-group legend {
    padding: 0 var(--space-xs);
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-text-muted);
  }

  .feature-list {
    display: grid;
    gap: var(--space-sm);
    margin: var(--space-sm) 0 0;
    padding: 0;
    list-style: none;
  }

  .feature-option {
    display: flex;
    align-items: flex-start;
    gap: var(--space-sm);
    cursor: pointer;
  }

  .feature-option input {
    width: 1rem;
    height: 1rem;
    margin-top: 0.15rem;
    accent-color: var(--color-primary);
  }

  .feature-copy {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .feature-name {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--color-ink);
  }

  .feature-hint {
    font-size: 0.75rem;
    color: var(--color-text-muted);
  }
</style>
