---
"@adyen/adyen-platform-experience-web": patch
---

- Fixed components repeatedly refreshing the session and retrying requests when an endpoint kept responding with `401 Unauthorized`. Each request now retries at most once with a refreshed session. Otherwise, it fails with the original error, or with the session refresh error if the refresh itself failed.
