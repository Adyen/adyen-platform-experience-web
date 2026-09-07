---
'@adyen/adyen-platform-experience-web': patch
---

- Across overview components, changing filters or balance accounts now resets pagination before loading results.
- In Dispute Management, visibility settings now correctly hide the corresponding standard dispute fields.
- In Disputes Overview, expired response deadlines now show the deadline date instead of incorrectly displaying "Respond today".
- In Payout Details, `dataCustomization` now applies custom fields and actions in the details modal.
- In Transaction Details, refund amount input now consistently handles localized decimal values.
