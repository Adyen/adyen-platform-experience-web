# External Documentation Template

> This template defines the exact structure, tone, and code conventions to follow when generating external documentation for Adyen Platform Experience components.
> All placeholders are written as `[PLACEHOLDER]`. Sections marked as `<!-- OPTIONAL -->` should only be included when relevant.

---

## Tone & Writing Rules

- Address the developer directly: "You must...", "You can...", "Ensure that you..."
- Describe component features from the user perspective: "Users can view...", "Users can filter..."
- Use **bold** for: UI element names, component names, parameter values, role names
- Use `code` for: parameter names, API paths, code values, package names
- Use imperative voice for steps: "Install the...", "Make a POST request...", "Create a DOM element..."
- Never use "I" or "we" — use "Adyen" when referring to the platform
- Keep sentences direct and technical. Avoid filler phrases

---

## Document Structure

```
# [Page Title — descriptive, e.g. "Add [Component Name] to your dashboard"]

[One or two sentence intro: what the component enables and for whom]

## Requirements

## [Component Name] component

### [Sub-feature or filter section, if applicable]

<!-- OPTIONAL ## [Additional component name] component -->

<!-- OPTIONAL ## [Notable capability, e.g. "Processing refunds through components"] -->

## How it works

### Integration steps

## 1. Create an authentication session from your server

## 2. Install the component library

## 3. Initialize the component

<!-- OPTIONAL ## 4. Optional: Localize the component -->

<!-- OPTIONAL ## 5. Optional: Customize component appearance -->

## Supported languages

## See also
```

---

## Section-by-Section Guide

### `# [Page Title]`

Use a descriptive action-oriented title. Example: "Add Cashout to your dashboard".
Follow with 1–2 sentences of high-level context: what the component does and who benefits.

---

### `## Requirements`

Always the first section — before any component description or code. Use a table with two columns: **Requirement** and **Description**.

| Requirement          | Description                                                                                        |
| -------------------- | -------------------------------------------------------------------------------------------------- |
| **Integration type** | [What Adyen integration type is needed, e.g. "You must have the Adyen for Platforms integration."] |
| **API credentials**  | [What API key is needed and what roles must be assigned to it]                                     |
| **Limitations**      | [Any known constraints, e.g. export limits, amount caps, unsupported features]                     |
| **Setup steps**      | [Pre-flight checklist before starting the integration, e.g. language/browser support checks]       |

---

### `## [Component Name] component`

Open with one sentence describing what the component shows or does.
If the component is organized into tabs or sections, describe each with a nested bold-label bullet list.

Example pattern:

> The **[Component Name]** component shows [what it shows] for [scope]. [Any notable customization options.]
>
> This component organizes [data] into [N] tabs:
>
> - **[Tab name]**: [what it shows]. Key features include:
>     - **[Feature]**: [description]

Follow with a "enables users to complete the following tasks:" bullet list of user-facing capabilities.

Optional sub-sections:

- `### Available filters` → `#### [Filter name]` with a table of filter values and descriptions

---

### `## How it works`

One sentence: "The integration involves both server-side and client-side processes."

#### `### Integration steps`

A numbered TOC list where each item links to the corresponding `##` section below:

```
1. [Create an authentication session from your server](#create-token)
2. [Install the component library](#install-library)
3. [Initialize the component](#initialize)
4. [Optional: Localize the component](#localize)
5. [Optional: Customize component appearance](#customize-appearance)
```

---

### `## 1. Create an authentication session from your server`

Explain that the server must create a session token via a POST to `/sessions`.

Show a parameters table: `Parameter | Required | Description`
— Required: use ✅, Optional: leave blank.

Then show a labeled `bash` (curl) code block for the request, and a separate labeled `json` block for the response.

```bash
# Create a session token
curl https://test.adyen.com/authe/api/v1/sessions \
   -H 'content-type: application/json' \
   -H 'x-api-key: YOUR_API_KEY' \
   -d '{
      "allowOrigin": "YOUR_DOMAIN",
      "product": "platform",
      "policy": {
         "resources": [{ "type": "accountHolder", "accountHolderId": "AH00000000000000000000001" }],
         "roles": ["[ComponentName] Component: View"]
      }
   }'
```

```json
{
    "id": "EC1234-1234-1234-1234",
    "token": "xxxxx.yyyyy.zzzzzz"
}
```

---

### `## 2. Install the component library`

Show two steps: npm install, then the import statement (package + CSS). Always use the correct package name.

```bash
npm install @adyen/adyen-platform-experience-web
```

```javascript
import { AdyenPlatformExperience, [ComponentName] } from '@adyen/adyen-platform-experience-web';
import "@adyen/adyen-platform-experience-web/adyen-platform-experience-web.css";
```

---

### `## 3. Initialize the component`

Show four numbered sub-steps:

1. A parameters table for the library initializer (`onSessionCreate` ✅, `environment`, `locale`, `availableTranslations`)
2. A parameters table for the component (`core` ✅, plus component-specific params)
3. Create a DOM element (HTML block):

```html
<div id="[component-name]-container"></div>
```

4. Define the session handler and initialize — plain JavaScript only, no framework wrappers:

```javascript
async function handleSessionCreate() {
    const response = await fetch('YOUR_SESSION_ENDPOINT');
    return response.json();
}

const core = await AdyenPlatformExperience({
    onSessionCreate: handleSessionCreate,
});

const [componentName] = new [ComponentName]({ core });
[componentName].mount('#[component-name]-container');
```

> **Note on frameworks:** If you use a JavaScript framework such as React or Vue, use a ref instead of a selector and ensure the DOM element is not re-rendered.

---

### `## 4. Optional: Localize the component` <!-- OPTIONAL -->

Show the localization parameters and a code example using `availableTranslations` and `locale`.

---

### `## 5. Optional: Customize component appearance` <!-- OPTIONAL -->

Explain CSS variable overrides and class setting updates. Show a `css` code block.

---

### `## Supported languages`

Table with columns: **Language | Locale code | Locale file**

| Language                   | Locale code | Locale file |
| -------------------------- | ----------- | ----------- |
| English                    | **en-US**   | **en_US**   |
| [Add others as applicable] |             |             |

---

### `## See also`

A plain bullet list of relevant links only. No descriptions needed.

- [Adyen Platform Experience Docs](https://docs.adyen.com/platforms/build-user-dashboards)
- [Component libraries overview](https://docs.adyen.com/platforms/components-overview)
