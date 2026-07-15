---
'@adyen/adyen-platform-experience-web': patch
---

In the Capital Overview component, we resolved an issue where a closed grant could be incorrectly hidden from the grant list if it was later renewed. Only active grants that are renewed are now filtered out of the list.
