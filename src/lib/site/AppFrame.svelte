<script>
  /**
   * The phone chassis the app screens are shown inside.
   *
   * Deliberately not a photograph of a device: a CSS chassis costs a few
   * hundred bytes instead of a few hundred kilobytes, stays sharp at any
   * density, and — because the screen is a real scroll container holding real
   * markup — the screens inside it can animate, and a screen reader can be told
   * to skip the whole thing rather than read a decorative image's alt text.
   *
   * Sizing belongs to the host. The frame fills the width it is given and
   * derives its own height from the phone aspect ratio, so a hero and a feature
   * column can show the same component at different scales without either one
   * reaching inside it.
   *
   * @type {{
   *   children: import('svelte').Snippet,
   *   glow?: boolean,
   *   label?: string,
   * }}
   */
  let { children, glow = false, label = 'The Innerdial app' } = $props();
</script>

<div class="frame" class:glow role="img" aria-label={label}>
  <div class="chassis">
    <span class="pill-speaker" aria-hidden="true"></span>
    <div class="screen" aria-hidden="true">
      {@render children()}
    </div>
    <!-- The specular highlight that sells the glass. Skipped on coarse
         pointers, where it costs a compositor layer for a subtlety nobody is
         close enough to see. -->
    <span class="sheen" aria-hidden="true"></span>
  </div>
</div>

<style>
  .frame {
    position: relative;
    width: 100%;
    /* iPhone-ish. The screens are laid out against this ratio, so changing it
       reflows every mockup. */
    aspect-ratio: 393 / 830;
    transform: perspective(1800px) rotateX(var(--tilt-x, 0deg)) rotateY(var(--tilt-y, 0deg));
    transform-style: preserve-3d;
    transition: transform 400ms var(--ease-out);
  }

  /* The brass bloom behind the device on ink sections. */
  .frame.glow::before {
    content: '';
    position: absolute;
    inset: -14% -22%;
    z-index: 0;
    border-radius: 50%;
    background: radial-gradient(
      55% 45% at 50% 45%,
      rgb(184 147 90 / 30%) 0%,
      rgb(184 147 90 / 10%) 42%,
      transparent 72%
    );
    filter: blur(24px);
    pointer-events: none;
  }

  .chassis {
    position: relative;
    z-index: 1;
    width: 100%;
    height: 100%;
    padding: 0.55rem;
    border-radius: 2.75rem;
    /* Two stops, not a flat fill: a bezel that does not turn with the light
       reads as a rectangle rather than a device. */
    background: linear-gradient(150deg, #2c3a4c 0%, var(--ink-800) 34%, var(--ink-900) 100%);
    box-shadow:
      inset 0 0 0 1px rgb(255 255 255 / 10%),
      var(--shadow-device);
  }

  .screen {
    position: relative;
    overflow: hidden;
    width: 100%;
    height: 100%;
    border-radius: 2.25rem;
    /*
      The screens inside size themselves in container units against this box,
      so one set of mockups reads correctly whether the frame is 240px wide in a
      feature column or 380px wide in the hero. Nothing inside may use rem: the
      page's root font size has nothing to do with the device's.
    */
    container-type: inline-size;
    background: var(--color-background);
    /* The app's own body stack, so the mockups render in the same type as the
       product does. */
    font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
    color: var(--color-text);
    /* Anything the screens animate is clipped to the glass. */
    isolation: isolate;
  }

  .pill-speaker {
    position: absolute;
    top: 1.15rem;
    left: 50%;
    z-index: 3;
    width: 5.5rem;
    height: 1.15rem;
    border-radius: 9999px;
    background: var(--ink-900);
    transform: translateX(-50%);
  }

  .sheen {
    position: absolute;
    inset: 0;
    z-index: 2;
    border-radius: 2.75rem;
    background: linear-gradient(
      108deg,
      rgb(255 255 255 / 16%) 0%,
      rgb(255 255 255 / 4%) 18%,
      transparent 38%,
      transparent 100%
    );
    pointer-events: none;
  }

  @media (hover: none) {
    .sheen {
      display: none;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .frame {
      transform: none;
      transition: none;
    }
  }
</style>
