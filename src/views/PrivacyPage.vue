<script setup lang="ts">
import FooterSection from '../components/FooterSection.vue'
import NavBar from '../components/NavBar.vue'
</script>

<template>
  <NavBar />
  <main id="main" class="privacy-page">
    <div class="container">
      <header class="privacy-page__header">
        <h1>Privacy policy</h1>
        <p class="privacy-page__intro">Plain-English details on what the Wavlin app and this website collect, why it’s needed, and how you stay in control.</p>
        <p class="privacy-page__date">Draft: this policy has not been reviewed yet and may change before it is final.</p>
      </header>

      <article class="privacy-page__document">
        <section>
          <h2>The short version</h2>
          <p>Wavlin is an open-source project built by volunteers. We don’t run ads, we don’t track you across the web, and we never sell or rent your data.</p>
        </section>

        <section>
          <h2>Data stored on your device</h2>
          <p>Your settings, listening history, library, downloads, and account credentials stay on your own device. Wavlin’s maintainers never see that local data.</p>
          <p>When you use an online feature, the app talks directly to the service powering it. For instance, YouTube and Google handle your searches, playback streams, and account sync. Optional integrations like Last.fm, Discord, lyrics providers, music recognition, or Listen Together only receive data when you turn them on or use them, under their own privacy policies.</p>
        </section>

        <section>
          <h2>Website hosting</h2>
          <p>This website is a static site hosted on Cloudflare. It sets no cookies and loads no tracking, ad, or analytics scripts. Cloudflare receives standard connection details needed to serve pages (such as your IP address, browser info, requested URL, and timestamp) under <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener noreferrer">Cloudflare’s privacy policy</a>.</p>
          <p>To show the latest download and star count, your browser fetches public release and repo info from GitHub, which receives standard connection details under <a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement" target="_blank" rel="noopener noreferrer">GitHub’s privacy statement</a>.</p>
        </section>

        <section>
          <h2>Your choices and rights</h2>
          <p>Depending on where you live, you may have the right to access, correct, delete, restrict, or object to processing of your personal data, withdraw consent, or contact a data-protection authority. Because Wavlin doesn’t have its own user accounts, we generally can’t link data held by third-party services back to you.</p>
        </section>

        <section>
          <h2>Children</h2>
          <p>Wavlin isn’t aimed at children under 13, and we don’t knowingly collect personal data from them. If you think a child has shared personal data with us, reach out and we’ll review and delete it wherever we can.</p>
        </section>

        <section>
          <h2>Updates and contact</h2>
          <p>If our data practices or service providers change, we’ll update this page.</p>
          <p>Questions or privacy requests? Open an issue on <a href="https://github.com/WavlinGroup/Wavlin/issues">GitHub</a>. Please don’t include passwords, cookies, or auth tokens in it.</p>
        </section>
      </article>
    </div>
  </main>
  <FooterSection />
</template>

<style scoped>
.privacy-page {
  padding: clamp(56px, 8vw, 104px) 0 120px;
  background: transparent;
}

.privacy-page__header,
.privacy-page__document {
  width: min(100%, 760px);
  margin-inline: auto;
}

.privacy-page__header {
  margin-bottom: 72px;
}

.privacy-page h1 {
  margin-bottom: 20px;
  font: var(--md-sys-typescale-display-small);
  letter-spacing: var(--md-sys-typescale-display-small-tracking);
}

.privacy-page__intro {
  color: var(--md-sys-color-on-surface-variant);
  font: var(--md-sys-typescale-body-large);
  letter-spacing: var(--md-sys-typescale-body-large-tracking);
}

.privacy-page__date {
  margin-top: 24px;
  color: var(--md-sys-color-on-surface-variant);
  font: var(--md-sys-typescale-body-medium);
  letter-spacing: var(--md-sys-typescale-body-medium-tracking);
}

.privacy-page__document section {
  scroll-margin-top: 110px;
}

.privacy-page__document section + section {
  margin-top: 72px;
}

.privacy-page__document h2 {
  margin-bottom: 18px;
  font: var(--md-sys-typescale-headline-large);
  letter-spacing: var(--md-sys-typescale-headline-large-tracking);
}

.privacy-page__document h3 {
  margin: 32px 0 10px;
  font: var(--md-sys-typescale-title-large);
  letter-spacing: var(--md-sys-typescale-title-large-tracking);
}

.privacy-page__document p,
.privacy-page__document li {
  color: var(--md-sys-color-on-surface-variant);
  font: var(--md-sys-typescale-body-large);
  letter-spacing: var(--md-sys-typescale-body-large-tracking);
  line-height: 1.7;
}

.privacy-page__document p + p {
  margin-top: 18px;
}

.privacy-page__document ul {
  display: grid;
  gap: 10px;
  padding-left: 20px;
}

.privacy-page a {
  color: var(--md-sys-color-primary);
  text-underline-offset: 3px;
}

@media (max-width: 600px) {
  .privacy-page {
    padding-top: 44px;
  }

  .privacy-page__document section + section {
    margin-top: 56px;
  }
}
</style>
