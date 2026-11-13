---
"@adyen/adyen-platform-experience-web": major
---

- Replaced the UMD bundle served from the CDN with an ES module bundle. Load `adyen-platform-experience-web.js` with `<script type="module">` (or `import` it from a module script) instead of a classic `<script>` tag; the `AdyenPlatformExperienceWeb` global is no longer defined.
- Components in the CDN bundle are now loaded on demand: the entry only contains the Core runtime, and each component's code is downloaded the first time it is mounted.
