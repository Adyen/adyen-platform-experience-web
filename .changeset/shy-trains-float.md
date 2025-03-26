---
'@adyen/adyen-platform-experience-web': patch
---

### Fixed

Browser Fix: Removed unsupported regex lookbehind to prevent crashes in older browsers.

Timezone Correction: Adjusted regex and logic to properly format DST timezone offsets.

Impact: Eliminates crashes for users on older browsers and ensures correct timezone offset display.
