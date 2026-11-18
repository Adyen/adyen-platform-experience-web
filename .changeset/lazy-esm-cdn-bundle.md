---
'@adyen/adyen-platform-experience-web': major
---

- Replaced the UMD bundle served from the CDN with an ES module bundle. Load `adyen-platform-experience-web.js` with `<script type="module">` (or `import` it from a module script) instead of a classic `<script>` tag; the `AdyenPlatformExperienceWeb` global is no longer defined.
- Components in the CDN bundle are now loaded on demand: the entry only contains the Core runtime, and each component's code is downloaded the first time it is mounted.
- The CDN entry embeds the Subresource Integrity hashes of every lazily loaded chunk and verifies each chunk with `<link rel="modulepreload" integrity>` before importing it, so pinning the entry with `<script type="module" src integrity crossorigin>` covers the whole bundle without an import map.
